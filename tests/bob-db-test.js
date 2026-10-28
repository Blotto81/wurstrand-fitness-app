const {PGlite}=require(process.argv[2]||'@electric-sql/pglite');
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
(async()=>{
const db=new PGlite();await db.exec(`create role anon; create role authenticated; create schema storage; grant usage on schema storage to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated;
-- Simulate an old broad policy: restrictive B.o.B. guards must still win.
create policy old_broad on storage.objects for all to anon,authenticated using(true) with check(true);`);
await db.exec(fs.readFileSync('supabase/bob-museum.sql','utf8'));await db.exec(fs.readFileSync('supabase/bob-museum.sql','utf8'));console.log('PASS additive migration, rerun and empty gallery');
const id=()=>crypto.randomUUID(),rpc=async(name,args)=>{const qs=args.map((_,i)=>'$'+(i+1)).join(',');return(await db.query('select public.wrc_bob_'+name+'('+qs+') as result',args)).rows[0].result;};
const upload=async()=>{const asset=id(),path=await rpc('reserve',[asset,'image/png',10]);await db.query("insert into storage.objects(bucket_id,name,metadata) values('wrc-bob-originals',$1,$2)",[path,{size:10,mimetype:'image/png'}]);return path;};
await db.exec('set role anon');await assert.rejects(db.query("insert into wrc_bob_exhibits(id,player,title,photo_path) values($1,'Fabi','bad','bad')",[id()]));await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('wrc-bob-originals','unreserved.png')"));
await assert.rejects(rpc('reserve',[id(),'image/svg+xml',10]));await assert.rejects(rpc('reserve',[id(),'image/png',15728641]));
let a=await upload();await db.query("update storage.objects set metadata='{}' where name=$1",[a]);assert.equal((await db.query('select metadata from storage.objects where name=$1',[a])).rows[0].metadata.size,10);
const exhibit=id(),request=id(),args=[request,exhibit,0,a,'Marian','  Original  ',null,'Kommentar','Widmung'];let first=await rpc('save',args);assert.equal(first.exhibit_number,1);assert.deepEqual(await rpc('save',args),first);
assert.equal((await db.query('select * from wrc_bob_exhibits')).rows.length,1);let row=(await db.query('select * from wrc_bob_exhibits')).rows[0];assert.equal(row.photo_date,null);assert.equal(row.title,'Original');assert.equal(row.dedication,'Widmung');
await db.query("delete from storage.objects where name=$1",[a]);assert.equal((await db.query('select * from storage.objects where name=$1',[a])).rows.length,1);console.log('PASS no-login scoped RPC access; direct writes, overwrite and active-photo removal blocked');
const preserved=JSON.stringify((await db.query('select * from wrc_bob_exhibits')).rows);
const storageBefore=JSON.stringify((await db.query('select * from storage.objects')).rows);
await db.exec('reset role');await db.exec(fs.readFileSync('supabase/bob-museum-display.sql','utf8'));await db.exec(fs.readFileSync('supabase/bob-museum-display.sql','utf8'));await db.exec('set role anon');
const migrated=(await db.query('select * from wrc_bob_exhibits')).rows;
assert.equal(migrated[0].frame_style,'auto');assert.equal(migrated[0].crop_zoom,1);
assert.equal(JSON.stringify(migrated.map(({frame_style,crop_x,crop_y,crop_zoom,...r})=>r)),preserved);
assert.equal(JSON.stringify((await db.query('select * from storage.objects')).rows),storageBefore);
for(const invalid of [['invalid',.5,.5,1],['baroque',-1,.5,1],['baroque',.5,.5,4],['baroque',NaN,.5,1]])await assert.rejects(rpc('save_display',[id(),exhibit,1,a,'Marian','Original',null,'Kommentar','Widmung',...invalid]),/BOB_INVALID_DISPLAY/);
const displayArgs=[id(),exhibit,1,a,'Marian','Original',null,'Kommentar','Widmung','rococo',.23,.71,1.85];
const displayReceipt=await rpc('save_display',displayArgs);assert.equal(displayReceipt.revision,2);assert.deepEqual(await rpc('save_display',displayArgs),displayReceipt);
let displayRow=(await db.query('select * from wrc_bob_exhibits where id=$1',[exhibit])).rows[0];
assert.equal(displayRow.crop_x,.23);assert.equal(displayRow.crop_y,.71);assert.equal(displayRow.crop_zoom,1.85);assert.equal(displayRow.frame_style,'rococo');assert.equal(displayRow.exhibit_number,1);
await rpc('save',[id(),exhibit,2,a,'Marian','Original',null,'Kommentar','Widmung']);
await rpc('save_display',displayArgs);
assert.equal((await db.query('select * from wrc_bob_exhibits where id=$1',[exhibit])).rows[0].revision,3);
assert.equal((await db.query('select * from wrc_bob_exhibits where id=$1',[exhibit])).rows[0].crop_zoom,1.85);
console.log('PASS migration preserves all original fields and storage; display round trip, validation, retry and old-client compatibility');

const b=await upload();await rpc('save',[id(),exhibit,3,b,'Fabi','Neu','2020-02-29','','']);row=(await db.query('select * from wrc_bob_exhibits')).rows[0];assert.equal(row.exhibit_number,1);assert.equal(row.revision,4);assert.equal(row.photo_date.toISOString().slice(0,10),'2020-02-29');assert.equal(row.comment,'');assert.equal(row.photo_path,b);
await assert.rejects(rpc('save',[id(),exhibit,1,b,'Basti','Veraltet',null,'','']),/BOB_CONFLICT/);
assert.equal(await rpc('cleanup_done',[a]),false);await db.query('delete from storage.objects where name=$1',[a]);assert.equal(await rpc('cleanup_done',[a]),true);
console.log('PASS editing keeps number, optional fields clear, stale device protected, replacement cleans old file');
const unuploaded=await rpc('reserve',[id(),'image/jpeg',10]);await assert.rejects(rpc('save',[id(),id(),0,unuploaded,'Basti','Titel',null,'','']),/BOB_UPLOAD_INCOMPLETE/);
const c=await upload();await assert.rejects(rpc('save',[id(),id(),0,c,'Unknown','Titel',null,'','']));await assert.rejects(rpc('save',[id(),id(),0,c,'Basti',' ',null,'','']));
const attempts=await Promise.all(Array.from({length:4},async()=>{const path=await upload(),e=id(),r=id();return rpc('save',[r,e,0,path,'Basti','Bart',null,'','']);}));assert.equal(new Set(attempts.map(x=>x.exhibit_number)).size,4);
await assert.rejects(rpc('delete',[exhibit,1]),/BOB_CONFLICT/);await rpc('delete',[exhibit,4]);assert.ok(!(await db.query('select * from wrc_bob_exhibits')).rows.some(x=>x.id===exhibit));assert.equal(await rpc('cleanup_done',[b]),false);await db.query('delete from storage.objects where name=$1',[b]);assert.equal(await rpc('cleanup_done',[b]),true);await rpc('delete',[exhibit,2]);assert.equal(await rpc('cleanup_done',[b]),true);
console.log('PASS safe two-stage deletion, storage-before-row deletion, retries and concurrent unique numbers');
await db.exec('reset role');assert.equal((await db.query('select * from wrc_bob_exhibits where id=$1',[exhibit])).rows.length,0);await db.exec("update wrc_bob_assets set created_at=now()-interval '25 hours' where state='pending'");await db.exec('set role anon');const cleanup=(await db.query('select * from wrc_bob_cleanup_candidates()')).rows;assert.ok(cleanup.some(x=>x.path===unuploaded));await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('wrc-bob-originals',$1)",[unuploaded]));
// Unrelated buckets retain their original permissions.
await db.exec("insert into storage.objects(bucket_id,name) values('unrelated','other.png');update storage.objects set name='other2.png' where bucket_id='unrelated';delete from storage.objects where bucket_id='unrelated';");
console.log('PASS abandoned upload cleanup, expired reservation blocked, other buckets unaffected');await db.close();
})().catch(e=>{console.error(e);process.exit(1);});
