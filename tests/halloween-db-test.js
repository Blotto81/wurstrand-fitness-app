const {PGlite}=require(process.argv[2] || '@electric-sql/pglite');
const fs=require('fs'),assert=require('assert/strict');
const root=require('path').resolve(__dirname,'..');
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
(async()=>{
const db=new PGlite();await db.exec('create role anon; create role authenticated;');await db.exec(read('supabase/holiday-events.sql'));
await db.exec("insert into wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result) values('halloween',2026,'Fabi','2026-10-31',0,1,4),('christmas',2026,'Fabi','2026-12-24',5,null,null)");
await db.exec(read('supabase/halloween-labyrinth.sql'));console.log('PASS migration preserves old receipts');
// Modify only this disposable in-memory test database clock. Production SQL has no test override.
let source=(await db.query("select pg_get_functiondef('open_wrc_halloween(text,bigint,text)'::regprocedure) as s")).rows[0].s;
source=source.replace("(current_timestamp at time zone 'Europe/Berlin')::date","current_setting('wrc.test_date')::date");await db.exec(source);
const date=d=>db.exec("set wrc.test_date='"+d+"'");
const weights=w=>db.exec('create or replace function public.wrc_halloween_weights() returns integer[] language sql immutable as $$ select array['+w.join(',')+']; $$;');
const open=async(p,n,o='Thorsten')=>(await db.query('select * from open_wrc_halloween($1,$2,$3)',[p,n,o])).rows[0];
await date('2026-10-30');await assert.rejects(open('Thorsten',0));await date('2026-10-31');await assert.rejects(open('Fabi',0));
await weights([100,0,0,0]);let r=await open('Thorsten',0);assert.equal(r.outcome,'continue');assert.equal(r.doors,1);assert.equal((await open('Thorsten',0,'Marian')).doors,1);
for(let i=1;i<100;i++)r=await open('Thorsten',i,['Basti','Fabi','Marian'][i%3]);assert.equal(r.doors,100);assert.equal(r.status,'active');
await weights([0,0,100,0]);const raced=await Promise.all([open('Thorsten',100),open('Thorsten',100,'Basti')]);assert.equal(raced[0].doors,101);assert.deepEqual(raced[0],raced[1]);assert.equal((await open('Thorsten',101)).doors,101);
assert.equal((await db.query("select sum(points) as n,count(*)::int as c from wrc_holiday_events where player='Thorsten' and event_year=2026")).rows[0].n,1);
await weights([0,100,0,0]);r=await open('Basti',0);assert.equal(r.outcome,'scare');await weights([0,0,0,100]);r=await open('Marian',0);assert.equal(r.outcome,'curse');assert.ok(r.curse>=0&&r.curse<15);
await db.exec('set role anon');await assert.rejects(db.exec("update wrc_halloween_runs set doors=0"));await assert.rejects(db.exec("insert into wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result,halloween_version) values('halloween',2028,'Thorsten','2028-10-31',1,0,2,2)"));await assert.rejects(db.query("select * from claim_wrc_holiday_legacy('halloween','Thorsten',0,null)"));await assert.rejects(db.query("select * from claim_wrc_holiday('halloween','Thorsten',0,null)"));await db.exec('reset role');
await date('2027-10-31');await weights([0,0,100,0]);await open('Thorsten',0);assert.equal((await db.query("select count(*)::int as n from wrc_halloween_runs where player='Thorsten'")).rows[0].n,2);
assert.equal((await db.query("select points,result,halloween_version from wrc_holiday_events where player='Fabi' and event_type='halloween'")).rows[0].halloween_version,1);
await date('2027-11-01');await assert.rejects(open('Basti',0));
// Other holidays keep their original procedure and rewards.
let legacy=(await db.query("select pg_get_functiondef('claim_wrc_holiday_legacy(text,text,integer,integer)'::regprocedure) as s")).rows[0].s;await db.exec(legacy.replace("(current_timestamp at time zone 'Europe/Berlin')::date","current_setting('wrc.test_date')::date"));
await date('2027-12-24');assert.equal((await db.query("select * from claim_wrc_holiday('christmas','Basti')")).rows[0].points,5);
await date('2027-12-06');assert.equal((await db.query("select * from claim_wrc_holiday('nikolaus','Basti')")).rows[0].points,0);
await date('2027-03-28');assert.equal((await db.query("select * from claim_wrc_holiday('easter','Basti',null,0)")).rows[0].points,5);
await db.exec("create table wrc_wrapped_years(year integer primary key, release_days jsonb, cutoff date, snapshot jsonb, frozen_at timestamptz); create table entries(id integer,date text,person text,steps numeric,bike numeric,squats numeric,pushups numeric,exercise boolean); create table daily_history(id integer,player text,daily_id text,completed_date date); create table wrc_birthday_gifts(recipient text,gift_date date,points integer); create table dart_games(id integer,game_date date); create table dart_results(game_id integer,player text,place integer); create table uno_games(id integer,game_date date); create table uno_results(game_id integer,player text,place integer);");
await db.exec(read('supabase/halloween-wrapped-v2.sql'));
let wrapped=(await db.query("select pg_get_functiondef('get_wrc_wrapped(integer,text,text)'::regprocedure) as s")).rows[0].s;
await db.exec(wrapped.replace("(current_timestamp at time zone 'Europe/Berlin')::date","current_setting('wrc.test_date')::date"));
await date('2026-12-31');const archive=(await db.query("select get_wrc_wrapped(2026,'Thorsten','personal') as a")).rows[0].a;assert.equal(archive.snapshot.version,2);assert.equal(archive.snapshot.halloween.length,3);assert.equal(archive.snapshot.halloween.find(r=>r.player==='Thorsten').doors,101);
await db.exec("update wrc_wrapped_years set snapshot=jsonb_set(snapshot,'{version}','1') where year=2026");assert.equal((await db.query("select get_wrc_wrapped(2026,'Thorsten','team') as a")).rows[0].a.snapshot.version,1);
await date('2027-01-01');assert.equal((await db.query("select get_wrc_wrapped(2026,'Thorsten','personal') as a")).rows[0].a.available,false);
console.log('PASS archive v2 includes completed Halloween, frozen v1 unchanged, annual Wrapped visibility preserved');
console.log('PASS PostgreSQL: 100 rooms, retry/CAS, concurrent requests, terminal states, max +1, all outcomes, legacy preservation, yearly reset, date gate, permissions, Easter/Christmas/Nikolaus');await db.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
