create table if not exists public.wrc_team_goal (
 id bigint generated always as identity primary key,
 scope text not null check(scope in ('month','all')),
 month text not null,
 type text not null check(type in ('steps','bike','squats','pushups')),
 target numeric not null check(target>0),
 created_at timestamptz not null default now(),
 reached_at timestamptz,
 closed_at timestamptz
);
alter table public.wrc_team_goal enable row level security;
revoke all on public.wrc_team_goal from public,anon,authenticated;
create unique index if not exists wrc_one_active_goal on public.wrc_team_goal ((1)) where closed_at is null;
insert into public.wrc_team_goal(scope,month,type,target,reached_at)
select 'month','2026-11','pushups',250,now()
where not exists(select 1 from public.wrc_team_goal)
and (select coalesce(sum(pushups),0) from public.entries where date like '2026-11-%')>=250;
create or replace function public.wrc_team_milestone(p_month text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 g public.wrc_team_goal%rowtype;
 c record;
 today date := (now() at time zone 'Europe/Berlin')::date;
 mk text := to_char(today,'YYYY-MM');
 days_left integer := (date_trunc('month',today)+interval '1 month')::date-today;
 m jsonb; a jsonb; recent jsonb; v numeric;
begin
 if p_month is distinct from mk then return null; end if;
 perform pg_advisory_xact_lock(hashtext('wrc-team-goal'));
 select jsonb_build_object('steps',coalesce(sum(steps) filter(where date like mk||'-%'),0),'bike',coalesce(sum(bike) filter(where date like mk||'-%'),0),'squats',coalesce(sum(squats) filter(where date like mk||'-%'),0),'pushups',coalesce(sum(pushups) filter(where date like mk||'-%'),0)),
 jsonb_build_object('steps',coalesce(sum(steps),0),'bike',coalesce(sum(bike),0),'squats',coalesce(sum(squats),0),'pushups',coalesce(sum(pushups),0)),
 jsonb_build_object('steps',coalesce(sum(steps) filter(where date >= (today-6)::text),0),'bike',coalesce(sum(bike) filter(where date >= (today-6)::text),0),'squats',coalesce(sum(squats) filter(where date >= (today-6)::text),0),'pushups',coalesce(sum(pushups) filter(where date >= (today-6)::text),0))
 into m,a,recent from public.entries where date<=today::text and person in ('Thorsten','Basti','Fabi','Marian');
 select * into g from public.wrc_team_goal where closed_at is null;
 if found then
   if g.scope='month' and g.month<>mk then
     update public.wrc_team_goal set closed_at=now() where id=g.id;
   else
     v := ((case when g.scope='month' then m else a end)->>g.type)::numeric;
     if v<g.target then
       if g.reached_at is not null then update public.wrc_team_goal set reached_at=null where id=g.id returning * into g; end if;
       return to_jsonb(g)||jsonb_build_object('value',v);
     end if;
     if g.reached_at is null then update public.wrc_team_goal set reached_at=now() where id=g.id returning * into g; end if;
     if now()<g.reached_at+interval '24 hours' then return to_jsonb(g)||jsonb_build_object('value',v); end if;
     update public.wrc_team_goal set closed_at=now() where id=g.id;
   end if;
 end if;
 select q.* into c from (
 select s.scope,t.type, z.val, (floor(z.val/t.step)+k.n)*t.step as target,
 ((floor(z.val/t.step)+k.n)*t.step-z.val)/greatest(z.rate,0.01) as eta
 from (values ('month'),('all')) s(scope)
 cross join (values ('steps',10000),('bike',10),('squats',50),('pushups',25)) t(type,step)
 cross join generate_series(1,20) k(n)
 cross join lateral (select ((case when s.scope='month' then m else a end)->>t.type)::numeric as val,(recent->>t.type)::numeric/7 as rate) z
 where z.rate>0 and (s.scope='all' or ((floor(z.val/t.step)+k.n)*t.step-z.val)/z.rate<=days_left)
 ) q order by (q.eta>5),abs(q.eta-3)+case when q.type=g.type then 1.5 else 0 end+case when q.scope=g.scope then 0.6 else 0 end,q.type,q.scope limit 1;
 if not found then return null; end if;
 insert into public.wrc_team_goal(scope,month,type,target) values(c.scope,mk,c.type,c.target) returning * into g;
 return to_jsonb(g)||jsonb_build_object('value',c.val);
end $$;
revoke all on function public.wrc_team_milestone(text) from public;
grant execute on function public.wrc_team_milestone(text) to anon,authenticated;
