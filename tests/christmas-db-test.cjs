const {PGlite}=require(process.argv[2]||'@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{
const db=new PGlite();await db.exec('create role anon;create role authenticated;');await db.exec(read('supabase/holiday-events.sql'));await db.exec(read('supabase/halloween-labyrinth.sql'));
await db.exec("insert into wrc_holiday_events(event_type,event_year,player,event_date,points,choice,result) values('nikolaus',2026,'Fabi','2026-12-06',0,null,null),('christmas',2026,'Fabi','2026-12-24',5,null,null),('halloween',2026,'Fabi','2026-10-31',0,1,4)");
const original=(await db.query('select event_type,event_year,player,event_date,points,choice,result from wrc_holiday_events order by event_type')).rows;
await db.exec(read('supabase/christmas-season.sql'));assert.deepEqual((await db.query('select event_type,event_year,player,event_date,points,choice,result from wrc_holiday_events order by event_type')).rows,original);
// Clock substitution exists ONLY in this disposable test database, never in production SQL.
for(const name of ['claim_wrc_holiday','claim_wrc_holiday_legacy']){const src=(await db.query("select pg_get_functiondef('"+name+"(text,text,integer,integer)'::regprocedure) as s")).rows[0].s;await db.exec(src.replace("(current_timestamp at time zone 'Europe/Berlin')::date","current_setting('wrc.test_date')::date"));}
const date=d=>db.exec("set wrc.test_date='"+d+"'");const claim=async(type,p,choice=null)=>(await db.query('select * from claim_wrc_holiday($1,$2,$3,null)',[type,p,choice])).rows[0];
await db.exec('set role anon');
for(const day of ['2026-12-05','2026-12-07','2027-01-01']){await date(day);await assert.rejects(claim('nikolaus','Thorsten',0));}
await date('2026-12-06');for(const choice of [null,-1,2,100])await assert.rejects(claim('nikolaus','Thorsten',choice));await assert.rejects(claim('nikolaus','Unknown',0));
const raced=await Promise.all([claim('nikolaus','Thorsten',0),claim('nikolaus','Thorsten',1)]);assert.equal(raced[0].points,-1);assert.deepEqual(raced[1],raced[0]);assert.equal((await claim('nikolaus','Basti',1)).points,1);assert.equal((await claim('nikolaus','Fabi',1)).points,0);
assert.equal((await db.query("select count(*)::int n from wrc_holiday_events where player='Thorsten'")).rows[0].n,1);
await assert.rejects(db.exec("update wrc_holiday_events set points=100"));await assert.rejects(db.exec("delete from wrc_holiday_events"));await assert.rejects(db.query("select * from claim_wrc_holiday_legacy('nikolaus','Marian',null,null)"));
await assert.rejects(db.exec("insert into wrc_holiday_events(event_type,event_year,player,event_date,points,choice,nikolaus_version) values('nikolaus',2026,'Marian','2026-12-06',100,1,2)"));
await date('2027-12-06');assert.equal((await claim('nikolaus','Thorsten',1)).points,1);assert.equal((await db.query("select sum(points)::int n from wrc_holiday_events where player='Thorsten' and event_year=2026")).rows[0].n,-1);
for(const day of ['2026-12-24','2026-12-25','2026-12-26']){await date(day);assert.equal((await claim('christmas','Thorsten')).points,5);}await date('2026-12-27');await assert.rejects(claim('christmas','Thorsten'));await date('2027-12-24');assert.equal((await claim('christmas','Thorsten')).points,5);
await db.exec('reset role');
// Constraints reject contradictory signed receipts even from a privileged SQL client.
await assert.rejects(db.exec("insert into wrc_holiday_events(event_type,event_year,player,event_date,points,choice,nikolaus_version) values('nikolaus',2026,'Marian','2026-12-06',1,0,2)"));
await db.exec("create table wrc_wrapped_years(year integer primary key,release_days jsonb,cutoff date,snapshot jsonb,frozen_at timestamptz);create table entries(id integer,date text,person text,steps numeric,bike numeric,squats numeric,pushups numeric,exercise boolean);create table daily_history(id integer,player text,daily_id text,completed_date date);create table wrc_birthday_gifts(recipient text,gift_date date,points integer);create table dart_games(id integer,game_date date);create table dart_results(game_id integer,player text,place integer);create table uno_games(id integer,game_date date);create table uno_results(game_id integer,player text,place integer);");
await db.exec(read('supabase/halloween-wrapped-v2.sql'));let source=(await db.query("select pg_get_functiondef('get_wrc_wrapped(integer,text,text)'::regprocedure) as s")).rows[0].s;await db.exec(source.replace("(current_timestamp at time zone 'Europe/Berlin')::date","current_setting('wrc.test_date')::date"));await date('2026-12-31');const snapshot=(await db.query("select get_wrc_wrapped(2026,'Thorsten','personal') as a")).rows[0].a.snapshot;assert.equal(snapshot.bonuses.find(r=>r.recipient==='Thorsten'&&r.gift_date==='2026-12-06').points,-1);
console.log('PASS PostgreSQL: historical receipts untouched, Dec 6 server gate, first choice wins, signed constraints, anonymous writes blocked, yearly renewal, Christmas +5 unchanged, negative point in frozen Wrapped.');await db.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
