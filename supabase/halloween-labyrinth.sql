-- Additive migration. Existing holiday receipts and fitness entries are preserved.
begin;
alter table public.wrc_holiday_events add column if not exists halloween_version smallint not null default 1 check(halloween_version in (1,2));
do $$ declare c record; begin
  for c in select conname from pg_constraint where conrelid='public.wrc_holiday_events'::regclass and contype='c'
    and (pg_get_constraintdef(oid) like '%points%' or pg_get_constraintdef(oid) like '%choice%') loop
    execute format('alter table public.wrc_holiday_events drop constraint %I',c.conname);
  end loop;
end $$;
alter table public.wrc_holiday_events add constraint holiday_reward_check check(
  points=case when event_type in ('easter','christmas') then 5 when event_type='halloween' and halloween_version=2 and result=2 then 1 else 0 end);
alter table public.wrc_holiday_events add constraint holiday_result_check check(
  (event_type='halloween' and choice is not null and result is not null and
    ((halloween_version=1 and choice in (0,1) and result between 0 and 5 and result/3=choice)
    or (halloween_version=2 and choice between 0 and 3 and result between 1 and 3)))
  or (event_type<>'halloween' and choice is null and result is null));
create table if not exists public.wrc_halloween_runs (
  event_year integer not null check(event_year>=2026),
  player text not null check(player in ('Thorsten','Basti','Fabi','Marian')),
  status text not null default 'active' check(status in ('active','complete')),
  doors bigint not null default 0 check(doors>=0),
  outcome text check(outcome in ('continue','scare','gold','curse')),
  curse smallint check(curse between 0 and 14),
  last_owner text check(last_owner in ('Thorsten','Basti','Fabi','Marian')),
  door_order text[] not null,
  completed_date date,
  created_at timestamptz not null default now(),
  primary key(event_year,player),
  check(cardinality(door_order)=4 and door_order @> array['Thorsten','Basti','Fabi','Marian']::text[]),
  check((status='active' and completed_date is null and (outcome is null or outcome='continue'))
    or (status='complete' and completed_date=make_date(event_year,10,31) and outcome in ('scare','gold','curse'))),
  check((outcome='curse' and curse is not null) or (outcome is distinct from 'curse' and curse is null))
);
alter table public.wrc_halloween_runs enable row level security;
revoke all on public.wrc_halloween_runs from anon,authenticated;
grant select on public.wrc_halloween_runs to anon,authenticated;
drop policy if exists halloween_runs_read on public.wrc_halloween_runs;
create policy halloween_runs_read on public.wrc_halloween_runs for select to anon,authenticated using(true);
-- Sole production probability configuration: continue, scare, gold, curse.
create or replace function public.wrc_halloween_weights() returns integer[]
language sql immutable set search_path=pg_catalog as $$ select array[45,25,20,10]; $$;
revoke all on function public.wrc_halloween_weights() from public;
create or replace function public.open_wrc_halloween(p_player text,p_expected bigint,p_door text)
returns setof public.wrc_halloween_runs language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  d date := (current_timestamp at time zone 'Europe/Berlin')::date;
  y integer := extract(year from d)::integer;
  names text[] := array['Thorsten','Basti','Fabi','Marian'];
  r public.wrc_halloween_runs%rowtype;
  weights integer[] := public.wrc_halloween_weights();
  draw double precision; total integer; edge integer:=0; idx integer;
  fate text; shuffled text[];
begin
  if p_player is null or not p_player=any(names) or p_door is null or not p_door=any(names) then raise exception 'Unbekannte Auswahl'; end if;
  if to_char(d,'MM-DD')<>'10-31' then raise exception 'Das Labyrinth öffnet am 31. Oktober'; end if;
  if p_expected is null or p_expected<0 then raise exception 'Raum fehlt'; end if;
  perform pg_advisory_xact_lock(y,hashtext('halloween:'||p_player));
  select * into r from public.wrc_halloween_runs where event_year=y and player=p_player;
  if not found then
    if exists(select 1 from public.wrc_holiday_events where event_type='halloween' and event_year=y and player=p_player) then raise exception 'Halloween-Akte bereits abgeschlossen'; end if;
    if p_expected<>0 then raise exception 'Bitte den aktuellen Raum laden'; end if;
    select array_agg(n order by random()) into shuffled from unnest(names) n;
    insert into public.wrc_halloween_runs(event_year,player,door_order) values(y,p_player,shuffled) returning * into r;
  end if;
  if r.status='complete' or r.doors<>p_expected then return next r; return; end if;
  select sum(w) into total from unnest(weights) w;
  if cardinality(weights)<>4 or total<=0 or exists(select 1 from unnest(weights) w where w<0 or w is null) then raise exception 'Ungültige Ereigniskonfiguration'; end if;
  draw:=random()*total;
  for idx in 1..4 loop edge:=edge+weights[idx]; if draw<edge then fate:=(array['continue','scare','gold','curse'])[idx]; exit; end if; end loop;
  select array_agg(n order by random()) into shuffled from unnest(names) n;
  update public.wrc_halloween_runs set doors=doors+1,outcome=fate,last_owner=p_door,door_order=shuffled,
    status=case when fate='continue' then 'active' else 'complete' end,
    curse=case when fate='curse' then floor(random()*15)::integer else null end,
    completed_date=case when fate='continue' then null else d end
    where event_year=y and player=p_player returning * into r;
  if r.status='complete' then
    insert into public.wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result,halloween_version)
      values('halloween',y,p_player,d,case when fate='gold' then 1 else 0 end,array_position(names,p_door)-1,array_position(array['scare','gold','curse'],fate),2);
  end if;
  return next r;
end $$;
revoke all on function public.open_wrc_halloween(text,bigint,text) from public;
grant execute on function public.open_wrc_halloween(text,bigint,text) to anon,authenticated;
-- Retire only the old Halloween entry point. Other holiday behaviour stays identical.
alter function public.claim_wrc_holiday(text,text,integer,integer) rename to claim_wrc_holiday_legacy;
revoke all on function public.claim_wrc_holiday_legacy(text,text,integer,integer) from public,anon,authenticated;
create function public.claim_wrc_holiday(p_event text,p_player text,p_choice integer default null,p_egg_slot integer default null)
returns setof public.wrc_holiday_events language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if p_event='halloween' then raise exception 'Bitte die WRC aktualisieren und das Labyrinth öffnen'; end if;
  return query select * from public.claim_wrc_holiday_legacy(p_event,p_player,p_choice,p_egg_slot);
end $$;
revoke all on function public.claim_wrc_holiday(text,text,integer,integer) from public;
grant execute on function public.claim_wrc_holiday(text,text,integer,integer) to anon,authenticated;
commit;
