-- Apply after christmas-season.sql. Existing fitness and holiday receipts are untouched.
begin;
create function public.wrc_easter_egg_owner(y integer,egg integer) returns text
language sql immutable strict set search_path=pg_catalog as $$
 select case when y>=2027 and egg between 0 and 7 then
 (array['Thorsten','Fabi','Marian','Basti'])[(((egg*(array[1,3,5,7])[((y-2027)/4)%4+1]+y-2027)%8)/2)+1] else null end;
$$;
create table public.wrc_easter_finds(
 event_year integer not null check(event_year>=2027),
 egg_id smallint not null check(egg_id between 0 and 7),
 player text not null check(player in ('Thorsten','Fabi','Marian','Basti')),
 found_date date not null,
 points smallint not null default 1 check(points=1),
 created_at timestamptz not null default now(),
 primary key(event_year,egg_id),
 check(player=public.wrc_easter_egg_owner(event_year,egg_id)),
 check(extract(year from found_date)::integer=event_year),
 check(found_date between public.wrc_easter_sunday(event_year) and public.wrc_easter_sunday(event_year)+1)
);
alter table public.wrc_easter_finds enable row level security;
revoke all on public.wrc_easter_finds from anon,authenticated;
grant select on public.wrc_easter_finds to anon,authenticated;
create policy easter_finds_read on public.wrc_easter_finds for select to anon,authenticated using(true);
create function public.find_wrc_easter_egg(p_player text,p_egg integer)
returns setof public.wrc_easter_finds language plpgsql security definer set search_path=pg_catalog,public as $$
declare d date:=(current_timestamp at time zone 'Europe/Berlin')::date; y integer:=extract(year from d)::integer;
begin
 if y<2027 or d not between public.wrc_easter_sunday(y) and public.wrc_easter_sunday(y)+1 then raise exception 'Die Eiersuche ist vorbei';end if;
 if p_player is null or public.wrc_easter_egg_owner(y,p_egg) is distinct from p_player then raise exception 'Nicht dein Ei';end if;
 perform pg_advisory_xact_lock(y,hashtext('easter:'||p_player));
 if exists(select 1 from public.wrc_holiday_events where event_type='easter' and event_year=y and player=p_player) then raise exception 'Osteraktion bereits abgerechnet';end if;
 insert into public.wrc_easter_finds(event_year,egg_id,player,found_date) values(y,p_egg,p_player,d) on conflict(event_year,egg_id) do nothing;
 return query select f.* from public.wrc_easter_finds f where f.event_year=y and f.egg_id=p_egg and f.player=p_player;
end $$;
revoke all on function public.find_wrc_easter_egg(text,integer) from public;
grant execute on function public.find_wrc_easter_egg(text,integer) to anon,authenticated;
-- Keep the old +5 procedure private; no old client can claim it for future Easter.
alter function public.claim_wrc_holiday(text,text,integer,integer) rename to claim_wrc_holiday_pre_spring;
revoke all on function public.claim_wrc_holiday_pre_spring(text,text,integer,integer) from public,anon,authenticated;
create function public.claim_wrc_holiday(p_event text,p_player text,p_choice integer default null,p_egg_slot integer default null)
returns setof public.wrc_holiday_events language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_event='easter' and extract(year from current_timestamp at time zone 'Europe/Berlin')>=2027 then raise exception 'Bitte die neue Eiersuche öffnen';end if;
 return query select * from public.claim_wrc_holiday_pre_spring(p_event,p_player,p_choice,p_egg_slot);
end $$;
revoke all on function public.claim_wrc_holiday(text,text,integer,integer) from public;
grant execute on function public.claim_wrc_holiday(text,text,integer,integer) to anon,authenticated;
create table public.wrc_carnival_views(event_year integer not null check(event_year>=2027),player text not null check(player in ('Thorsten','Fabi','Marian','Basti')),seen_at timestamptz not null default now(),primary key(event_year,player));
alter table public.wrc_carnival_views enable row level security;
revoke all on public.wrc_carnival_views from anon,authenticated;
create function public.see_wrc_carnival(p_player text) returns boolean
language plpgsql security definer set search_path=pg_catalog,public as $$
declare d date:=(current_timestamp at time zone 'Europe/Berlin')::date;y integer:=extract(year from d)::integer;n integer;
begin
 if y<2027 or d<>public.wrc_easter_sunday(y)-48 then raise exception 'Heute ist kein Rosenmontag';end if;
 if p_player is null or p_player not in ('Thorsten','Fabi','Marian','Basti') then raise exception 'Unbekannter Spieler';end if;
 insert into public.wrc_carnival_views(event_year,player) values(y,p_player) on conflict do nothing;
 get diagnostics n=row_count;return n=1;
end $$;
revoke all on function public.see_wrc_carnival(text) from public;
grant execute on function public.see_wrc_carnival(text) to anon,authenticated;
commit;
