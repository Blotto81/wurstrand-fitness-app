create or replace function public.wrc_goal_should_rotate(age_hours numeric, idle_hours numeric, progress numeric, eta numeric, alternative_active boolean) returns boolean language sql immutable set search_path='' as $$ select age_hours >= 240 or (alternative_active and ((idle_hours >= 72 and progress < 0.8) or (idle_hours >= 120) or (age_hours >= 120 and eta > 5 and progress < 0.8))) $$;
revoke all on function public.wrc_goal_should_rotate(numeric,numeric,numeric,numeric,boolean) from public;
alter table public.wrc_team_goal add column if not exists start_value numeric, add column if not exists last_value numeric, add column if not exists last_progress_at timestamptz;
CREATE OR REPLACE FUNCTION public.wrc_team_milestone(p_month text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 g public.wrc_team_goal%rowtype;
 c record;
 today date := (now() at time zone 'Europe/Berlin')::date;
 mk text := to_char(today,'YYYY-MM');
 days_left integer := (date_trunc('month',today)+interval '1 month')::date-today;
 m jsonb; a jsonb; recent jsonb; v numeric; rate numeric; progress numeric; eta numeric; idle_hours numeric; age_hours numeric; alternative_active boolean; h jsonb := public.wrc_historical_totals()->'team';
begin
 if p_month is distinct from mk then return null; end if;
 perform pg_advisory_xact_lock(hashtext('wrc-team-goal'));
 select jsonb_build_object('steps',coalesce(sum(steps) filter(where date like mk||'-%'),0),'bike',coalesce(sum(bike) filter(where date like mk||'-%'),0),'squats',coalesce(sum(squats) filter(where date like mk||'-%'),0),'pushups',coalesce(sum(pushups) filter(where date like mk||'-%'),0)),
 jsonb_build_object('steps',coalesce(sum(steps),0),'bike',coalesce(sum(bike),0),'squats',coalesce(sum(squats),0),'pushups',coalesce(sum(pushups),0)),
 jsonb_build_object('steps',coalesce(sum(steps) filter(where date >= (today-6)::text),0),'bike',coalesce(sum(bike) filter(where date >= (today-6)::text),0),'squats',coalesce(sum(squats) filter(where date >= (today-6)::text),0),'pushups',coalesce(sum(pushups) filter(where date >= (today-6)::text),0))
 into m,a,recent from (select date,person,max(coalesce(steps,0)) steps,max(coalesce(bike,0)) bike,max(coalesce(squats,0)) squats,max(coalesce(pushups,0)) pushups from public.entries where date<=today::text and person in ('Thorsten','Basti','Fabi','Marian') group by date,person) cleaned;
 a := jsonb_build_object('steps',(a->>'steps')::numeric+(h->>'steps')::numeric,'bike',(a->>'bike')::numeric+(h->>'bike')::numeric,'squats',(a->>'squats')::numeric+(h->>'squats')::numeric,'pushups',(a->>'pushups')::numeric+(h->>'pushups')::numeric);
 select * into g from public.wrc_team_goal where closed_at is null;
 if found then
   if g.scope='month' and g.month<>mk then
     update public.wrc_team_goal set closed_at=now() where id=g.id;
   else
     v := ((case when g.scope='month' then m else a end)->>g.type)::numeric;
     if g.start_value is null then
       update public.wrc_team_goal set start_value=v,last_value=v,last_progress_at=now() where id=g.id returning * into g;
     elsif v is distinct from g.last_value then
       update public.wrc_team_goal set last_value=v,last_progress_at=case when v>g.last_value then now() else g.last_progress_at end where id=g.id returning * into g;
     end if;
     rate := (recent->>g.type)::numeric/7;
     progress := greatest(0,least(1,(v-g.start_value)/greatest(g.target-g.start_value,0.01)));
     eta := (g.target-v)/greatest(rate,0.01);
     idle_hours := extract(epoch from (now()-coalesce(g.last_progress_at,g.created_at)))/3600;
     age_hours := extract(epoch from (now()-g.created_at))/3600;
     select exists(select 1 from jsonb_each_text(recent) x where x.key<>g.type and x.value::numeric>0) into alternative_active;
     if v<g.target and public.wrc_goal_should_rotate(age_hours,idle_hours,progress,eta,alternative_active) then
       update public.wrc_team_goal set closed_at=now() where id=g.id;
     elsif v<g.target then
       if g.reached_at is not null then update public.wrc_team_goal set reached_at=null where id=g.id returning * into g; end if;
       return to_jsonb(g)||jsonb_build_object('value',v);
     else
     if g.reached_at is null then update public.wrc_team_goal set reached_at=now() where id=g.id returning * into g; end if;
     if now()<g.reached_at+interval '6 hours' then return to_jsonb(g)||jsonb_build_object('value',v); end if;
     update public.wrc_team_goal set closed_at=now() where id=g.id;
     end if;
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
 ) q order by (q.eta>5),abs(q.eta-3)+case when q.type=g.type then 4 else 0 end+case when q.scope=g.scope then 0.6 else 0 end,q.type,q.scope limit 1;
 if not found then return null; end if;
 insert into public.wrc_team_goal(scope,month,type,target,start_value,last_value,last_progress_at) values(c.scope,mk,c.type,c.target,c.val,c.val,now()) returning * into g;
 return to_jsonb(g)||jsonb_build_object('value',c.val);
end $function$
;
