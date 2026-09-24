-- Additive only. Birthday ledgers, policies, functions and fitness data are untouched.
begin;
create function public.wrc_easter_sunday(y integer) returns date
language plpgsql immutable strict set search_path = pg_catalog as $$
declare a integer; b integer; c integer; d integer; e integer; f integer;
  g integer; h integer; i integer; k integer; l integer; m integer; n integer;
begin
  a:=y%19; b:=y/100; c:=y%100; d:=b/4; e:=b%4; f:=(b+8)/25; g:=(b-f+1)/3;
  h:=(19*a+b-d-g+15)%30; i:=c/4; k:=c%4; l:=(32+2*e+2*i-h-k)%7;
  m:=(a+11*h+22*l)/451; n:=h+l-7*m+114;
  return make_date(y,n/31,n%31+1);
end $$;
create function public.wrc_holiday_on(d date) returns text
language sql immutable strict set search_path = pg_catalog as $$
  select case
    when d between public.wrc_easter_sunday(extract(year from d)::integer)
      and public.wrc_easter_sunday(extract(year from d)::integer)+1 then 'easter'
    when to_char(d,'MM-DD')='10-31' then 'halloween'
    when to_char(d,'MM-DD')='12-06' then 'nikolaus'
    when to_char(d,'MM-DD') between '12-24' and '12-26' then 'christmas'
    when to_char(d,'MM-DD')='12-31' then 'newyear'
    else null end;
$$;
create table public.wrc_holiday_events (
  event_type text not null check(event_type in ('easter','halloween','nikolaus','christmas','newyear')),
  event_year integer not null check(event_year >= 2026),
  player text not null check(player in ('Thorsten','Fabi','Marian','Basti')),
  event_date date not null,
  points smallint not null,
  choice smallint,
  result smallint,
  created_at timestamptz not null default now(),
  primary key(event_type,event_year,player),
  check(event_year=extract(year from event_date)::integer),
  check(public.wrc_holiday_on(event_date) is not null and public.wrc_holiday_on(event_date)=event_type),
  check(points=case when event_type in ('easter','christmas') then 5 else 0 end),
  check((event_type='halloween' and choice is not null and result is not null and choice in (0,1) and result between 0 and 5 and result/3=choice)
    or (event_type<>'halloween' and choice is null and result is null))
);
alter table public.wrc_holiday_events enable row level security;
revoke all on public.wrc_holiday_events from anon,authenticated;
grant select on public.wrc_holiday_events to anon,authenticated;
create policy holiday_receipts_read on public.wrc_holiday_events for select to anon,authenticated using(true);

-- The client supplies neither points nor date/year/result. All are server-derived.
-- Player identity uses the existing chosen-player trust model, as for birthdays.
create function public.claim_wrc_holiday(p_event text,p_player text,p_choice integer default null,p_egg_slot integer default null)
returns setof public.wrc_holiday_events language plpgsql security definer
set search_path=pg_catalog,public as $$
declare
  d date := (current_timestamp at time zone 'Europe/Berlin')::date;
  y integer := extract(year from d)::integer;
  names text[] := array['Thorsten','Fabi','Marian','Basti'];
  reward smallint;
  reveal smallint;
begin
  if p_player is null or not p_player=any(names) then raise exception 'Unbekannter Spieler'; end if;
  if public.wrc_holiday_on(d) is distinct from p_event or p_event is null then raise exception 'Event nicht aktiv'; end if;
  if p_event='easter' then
    if p_egg_slot is null or p_egg_slot<0 or p_egg_slot>3 or names[(y+p_egg_slot)%4+1]<>p_player then
      raise exception 'Nicht dein Ei';
    end if;
  elsif p_egg_slot is not null then raise exception 'Unerwartetes Ei';
  end if;
  if p_event='halloween' then
    if p_choice is null or p_choice not in (0,1) then raise exception 'Tuer fehlt'; end if;
    reveal := p_choice*3 + floor(random()*3)::integer;
  elsif p_choice is not null then raise exception 'Unerwartete Auswahl';
  end if;
  reward := case when p_event in ('easter','christmas') then 5 else 0 end;
  insert into public.wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result)
    values(p_event,y,p_player,d,reward,p_choice,reveal)
    on conflict(event_type,event_year,player) do nothing;
  return query select r.* from public.wrc_holiday_events r
    where r.event_type=p_event and r.event_year=y and r.player=p_player;
end $$;
revoke all on function public.claim_wrc_holiday(text,text,integer,integer) from public;
grant execute on function public.claim_wrc_holiday(text,text,integer,integer) to anon,authenticated;
commit;
