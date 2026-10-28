-- New archives include confirmed Halloween results; existing snapshots are immutable.
begin;
create or replace function public.get_wrc_wrapped(p_year integer,p_player text,p_mode text default 'personal')
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  today date := (current_timestamp at time zone 'Europe/Berlin')::date;
  names text[] := array['Thorsten','Basti','Marian','Fabi'];
  r public.wrc_wrapped_years%rowtype;
  days jsonb := '{}'::jsonb;
  name text;
  available boolean;
  personal_available boolean;
  team_available boolean;
  payload jsonb;
begin
  if p_year is null or p_year<2026 or p_year>extract(year from today)::integer then raise exception 'Jahr nicht verfügbar'; end if;
  if p_player is null or not p_player=any(names) then raise exception 'Unbekannter Spieler'; end if;
  if p_mode is null or p_mode not in ('personal','team') then raise exception 'Unbekannte Show'; end if;
  perform pg_advisory_xact_lock(8262026,p_year);
  select * into r from public.wrc_wrapped_years where year=p_year;
  if not found then
    foreach name in array names loop days:=days||jsonb_build_object(name,25+floor(random()*7)::integer);end loop;
    days:=days||jsonb_build_object('team',25+floor(random()*7)::integer);
    insert into public.wrc_wrapped_years(year,release_days,cutoff) values(p_year,days,make_date(p_year,12,23)) returning * into r;
  end if;
  personal_available:=today between make_date(p_year,12,greatest(25,(r.release_days->>p_player)::integer)) and make_date(p_year,12,31);
  team_available:=today between make_date(p_year,12,greatest(25,(r.release_days->>'team')::integer)) and make_date(p_year,12,31);
  available:=case when p_mode='team' then team_available else personal_available end;
  if available and r.snapshot is null then
    -- One MVCC statement captures all inputs together; the year lock prevents device races.
    select jsonb_build_object(
      'version',2,'year',p_year,'through',r.cutoff,'players',to_jsonb(names),
      'entries',coalesce((select jsonb_agg(jsonb_build_object('date',e.date,'person',e.person,'steps',e.steps,'bike',e.bike,'squats',e.squats,'pushups',e.pushups,'exercise',e.exercise) order by e.date,e.person,e.id) from public.entries e where e.date>='2026-05-01' and e.date<=r.cutoff::text and e.person=any(names)),'[]'::jsonb),
      'dailys',coalesce((select jsonb_agg(jsonb_build_object('player',d.player,'daily_id',d.daily_id,'completed_date',d.completed_date) order by d.completed_date,d.id) from public.daily_history d where d.completed_date<=r.cutoff and d.player=any(names)),'[]'::jsonb),
      'bonuses',coalesce((select jsonb_agg(b) from (select recipient,gift_date,points from public.wrc_birthday_gifts where gift_date<=r.cutoff union all select player,event_date,points from public.wrc_holiday_events where event_date<=r.cutoff) b),'[]'::jsonb),
      'games',coalesce((select jsonb_agg(g) from (select 'dart' as kind,g.id::text as id,g.game_date::date as date,x.player,x.place from public.dart_games g join public.dart_results x on x.game_id=g.id where g.game_date::date<=r.cutoff and x.player=any(names) union all select 'uno',g.id::text,g.game_date::date,x.player,x.place from public.uno_games g join public.uno_results x on x.game_id=g.id where g.game_date::date<=r.cutoff and x.player=any(names)) g),'[]'::jsonb),
      'halloween',coalesce((select jsonb_agg(h order by h.event_year,h.player) from public.wrc_halloween_runs h where h.status='complete' and h.completed_date<=r.cutoff),'[]'::jsonb),
      'history','{"team":{"points":4531.428333,"steps":2753969,"over10k":105,"bike":1332.1,"bonusPoints":116,"bonusDays":29,"exercises":53,"squats":555,"pushups":290,"maxSteps":26996,"maxBike":64.7},"players":{"Thorsten":{"points":1137.942,"steps":716673,"bike":270.74,"squats":555,"pushups":0,"exercises":8,"bonusCount":9,"bonusPoints":36},"Basti":{"points":935.884,"steps":850311,"bike":0,"squats":100,"pushups":30,"exercises":16,"bonusCount":0,"bonusPoints":0},"Marian":{"points":1387.455,"steps":443236,"bike":919.5,"squats":0,"pushups":38,"exercises":8,"bonusCount":8,"bonusPoints":32},"Fabi":{"points":1070.148,"steps":743749,"bike":141.9,"squats":0,"pushups":122,"exercises":21,"bonusCount":12,"bonusPoints":48}}}'::jsonb
    ) into payload;
    update public.wrc_wrapped_years set snapshot=payload,frozen_at=current_timestamp where year=p_year returning * into r;
  end if;
  return jsonb_build_object('year',p_year,'player',p_player,'mode',p_mode,'available',available,'personal_available',personal_available,'team_available',team_available,'server_date',today,'cutoff',r.cutoff,'frozen_at',case when available then r.frozen_at else null end,'snapshot',case when available then r.snapshot else null end);
end $$;
commit;
