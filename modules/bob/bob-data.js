(function(root){
  'use strict';
  const BUCKET='wrc-bob-originals';
  function create(client){
    const store=client.storage.from(BUCKET);
    async function rpc(name,args){const {data,error}=await client.rpc('wrc_bob_'+name,args);if(error)throw error;return data;}
    async function list(){const rows=[];for(let offset=0;;offset+=100){const {data,error}=await client.from('wrc_bob_exhibits').select('*').order('exhibit_number',{ascending:false}).range(offset,offset+99);if(error)throw error;rows.push(...data);if(data.length<100)return rows;}}
    async function cleanup(){const rows=await rpc('cleanup_candidates');for(const row of rows){const {error}=await store.remove([row.path]);if(error)throw error;const done=await rpc('cleanup_done',{p_path:row.path});if(!done)throw Error('Die Bilddatei wird noch entfernt. Bitte erneut versuchen.');}return rows.length;}
    async function upload(draft,file,info){
      draft.uploadId ||= WRCBobCore.uuid();
      draft.path=await rpc('reserve',{p_id:draft.uploadId,p_mime:info.mime,p_bytes:file.size});
      const {error}=await store.upload(draft.path,file,{contentType:info.mime,cacheControl:'60',upsert:false});
      // A lost success response is retried against the identical random path.
      // Never overwrite: the save RPC checks the stored object's MIME and byte size.
      if(error&&String(error.statusCode)!=='409'&&!/already exists|duplicate/i.test(error.message||''))throw error;
      draft.uploaded=true;
      return draft.path;
    }
    async function save(draft,values,file,info){
      const v=WRCBobCore.validate(values);
      if(file&&!draft.uploaded)await upload(draft,file,info);
      const path=draft.path||draft.existing?.photo_path;
      if(!path)throw Error('Bitte wähle ein Foto aus.');
      const display=WRCBobCore.presentation(values);
      return rpc('save_display',{p_frame_style:display.frame_style,p_crop_x:display.crop_x,p_crop_y:display.crop_y,p_crop_zoom:display.crop_zoom,p_request:draft.request,p_id:draft.id,p_revision:draft.existing?.revision||0,p_photo_path:path,p_player:v.player,p_title:v.title,p_photo_date:v.photo_date,p_comment:v.comment,p_dedication:v.dedication});
    }
    return Object.freeze({list,save,cleanup,url:path=>store.getPublicUrl(path).data.publicUrl,
      async remove(row){
        await rpc('delete',{p_id:row.id,p_revision:row.revision});
        const {error}=await store.remove([row.photo_path]);if(error)throw error;
        if(!await rpc('cleanup_done',{p_path:row.photo_path}))throw Error('Die Bilddatei wird noch entfernt. Bitte erneut versuchen.');
      }
    });
  }
  root.WRCBobData=Object.freeze({create,BUCKET});
})(typeof window==='undefined'?globalThis:window);
