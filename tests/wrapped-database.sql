-- Run AFTER the migration body within a transaction; always ROLLBACK, never COMMIT.
do $$
declare a jsonb; b jsonb; definition text; n integer; day integer;
begin
  a:=public.get_wrc_wrapped(2026,'Marian','personal');
  if (a->>'server_date')::date < date '2026-12-25' and (a->>'available')::boolean then raise exception 'Premature release'; end if;
  if has_table_privilege('anon','public.wrc_wrapped_years','INSERT') or has_table_privilege('anon','public.wrc_wrapped_years','SELECT') then raise exception 'Unexpected client table access'; end if;
  select count(*) into n from public.wrc_wrapped_years r,jsonb_each_text(r.release_days) d where r.year=2026 and d.value::integer between 25 and 31;
  if n<>5 then raise exception 'Invalid shared schedules';end if;
  -- Simulate the future ONLY in this rollback transaction, never in deployed code.
  select pg_get_functiondef('public.get_wrc_wrapped(integer,text,text)'::regprocedure) into definition;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date','date ''2026-12-24''');
  if (public.get_wrc_wrapped(2026,'Marian','personal')->>'available')::boolean or (public.get_wrc_wrapped(2026,'Marian','team')->>'available')::boolean then raise exception 'Christmas Eve must stay hidden';end if;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date','date ''2026-12-31''');
  a:=public.get_wrc_wrapped(2026,'Marian','team');
  b:=public.get_wrc_wrapped(2026,'Thorsten','personal');
  if not (a->>'available')::boolean or not (b->>'available')::boolean then raise exception 'Release missing';end if;
  if a->'snapshot' is distinct from b->'snapshot' then raise exception 'Different device/player archives';end if;
  if a->>'frozen_at' is distinct from b->>'frozen_at' then raise exception 'Archive replaced';end if;
  if jsonb_array_length(a->'snapshot'->'entries')<1 then raise exception 'Source capture failed';end if;
  if exists(select 1 from jsonb_array_elements(a->'snapshot'->'entries') e where e->>'date'>'2026-12-23') then raise exception 'Cutoff leakage';end if;
  -- Exact individual boundary and shared team boundary on the server clock.
  select (release_days->>'Marian')::integer into day from public.wrc_wrapped_years where year=2026;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date',format('date %L',make_date(2026,12,day-1)));
  b:=public.get_wrc_wrapped(2026,'Marian','personal');
  if (b->>'available')::boolean then raise exception 'Personal day early';end if;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date',format('date %L',make_date(2026,12,day)));
  b:=public.get_wrc_wrapped(2026,'Marian','personal');
  if not (b->>'available')::boolean then raise exception 'Personal day late';end if;
  select (release_days->>'team')::integer into day from public.wrc_wrapped_years where year=2026;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date',format('date %L',make_date(2026,12,day)));
  if not (public.get_wrc_wrapped(2026,'Fabi','team')->>'available')::boolean or not (public.get_wrc_wrapped(2026,'Basti','team')->>'available')::boolean then raise exception 'Team boundary differs';end if;
  -- January hides both modes; stored source remains immutable.
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date','date ''2027-01-01''');
  b:=public.get_wrc_wrapped(2026,'Thorsten','personal');
  if (b->>'available')::boolean or b->'snapshot' <> 'null'::jsonb or (public.get_wrc_wrapped(2026,'Thorsten','team')->>'available')::boolean then raise exception 'January must hide old shows';end if;
  if (select snapshot from public.wrc_wrapped_years where year=2026) is distinct from a->'snapshot' then raise exception 'Frozen archive changed';end if;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date','date ''2027-12-31''');
  b:=public.get_wrc_wrapped(2027,'Thorsten','personal');
  if not (b->>'available')::boolean or b->'snapshot'->>'year'<>'2027' or b->'snapshot'->>'through'<>'2027-12-23' then raise exception 'Annual renewal missing';end if;
  if (public.get_wrc_wrapped(2026,'Thorsten','personal')->>'available')::boolean then raise exception 'Old season reappeared';end if;
  execute replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date','date ''2027-01-01''');
  if (public.get_wrc_wrapped(2027,'Thorsten','personal')->>'available')::boolean then raise exception 'New year early';end if;
  perform public.get_wrc_wrapped(2026,'Fabi','personal');
  if (select count(*) from public.wrc_wrapped_years where year=2026)<>1 then raise exception 'Duplicate archive';end if;
end $$;
select 'PASS: server release, shared schedule, immutable snapshot, cutoff, client isolation' as result;
rollback;
