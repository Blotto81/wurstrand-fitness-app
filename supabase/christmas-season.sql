-- Requires holiday-events.sql and halloween-labyrinth.sql. No existing rows are rewritten.
begin;
alter table public.wrc_holiday_events add column if not exists nikolaus_version smallint not null default 1 check(nikolaus_version in (1,2));
alter table public.wrc_holiday_events drop constraint holiday_reward_check;
alter table public.wrc_holiday_events drop constraint holiday_result_check;
alter table public.wrc_holiday_events add constraint holiday_reward_check check(
  points=case when event_type in ('easter','christmas') then 5
    when event_type='nikolaus' and nikolaus_version=2 then case when choice=0 then -1 else 1 end
    when event_type='halloween' and halloween_version=2 and result=2 then 1 else 0 end);
alter table public.wrc_holiday_events add constraint holiday_result_check check(
  (event_type='halloween' and choice is not null and result is not null and
    ((halloween_version=1 and choice in (0,1) and result between 0 and 5 and result/3=choice)
    or (halloween_version=2 and choice between 0 and 3 and result between 1 and 3)))
  or (event_type='nikolaus' and nikolaus_version=2 and choice is not null and choice in (0,1) and result is null)
  or (event_type<>'halloween' and nikolaus_version=1 and choice is null and result is null));
alter table public.wrc_holiday_events add constraint holiday_nikolaus_version_check
  check(event_type='nikolaus' or nikolaus_version=1);
-- Retain the existing birthday-style chosen-player trust model and read-only table grants.
-- No client date, year, points or result parameter. Berlin server date is authoritative.
create or replace function public.claim_wrc_holiday(p_event text,p_player text,p_choice integer default null,p_egg_slot integer default null)
returns setof public.wrc_holiday_events language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  d date := (current_timestamp at time zone 'Europe/Berlin')::date;
  y integer := extract(year from d)::integer;
begin
  if p_event='halloween' then raise exception 'Bitte die WRC aktualisieren und das Labyrinth öffnen'; end if;
  if p_event='nikolaus' then
    if y<2026 or to_char(d,'MM-DD')<>'12-06' then raise exception 'Der Nikolausschuh öffnet am 6. Dezember'; end if;
    if p_player is null or p_player not in ('Thorsten','Fabi','Marian','Basti') then raise exception 'Unbekannter Spieler'; end if;
    if p_choice is null or p_choice not in (0,1) or p_egg_slot is not null then raise exception 'Bitte Keks oder Mandarine auswählen'; end if;
    -- The existing primary key serializes concurrent inserts; first choice wins forever.
    insert into public.wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result,nikolaus_version)
      values('nikolaus',y,p_player,d,case when p_choice=0 then -1 else 1 end,p_choice,null,2)
      on conflict(event_type,event_year,player) do nothing;
    return query select r.* from public.wrc_holiday_events r
      where r.event_type='nikolaus' and r.event_year=y and r.player=p_player;
    return;
  end if;
  -- Christmas +5, Easter and New Year use precisely their existing award path.
  return query select * from public.claim_wrc_holiday_legacy(p_event,p_player,p_choice,p_egg_slot);
end $$;
revoke all on function public.claim_wrc_holiday(text,text,integer,integer) from public;
grant execute on function public.claim_wrc_holiday(text,text,integer,integer) to anon,authenticated;
commit;
