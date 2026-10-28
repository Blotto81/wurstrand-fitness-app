/* No image processing: bytes selected by the user are the bytes uploaded. */
(function(root){
  'use strict';
  const MAX_BYTES=15*1024*1024, PLAYERS=['Thorsten','Basti','Fabi','Marian'];
  const uuid=()=>crypto.randomUUID();
  const dateOK=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&s>='1000-01-01'&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  function validate(values){
    const v={player:String(values.player||''),title:String(values.title||'').trim(),photo_date:values.photo_date||null,comment:String(values.comment||'').trim(),dedication:String(values.dedication||'').trim()};
    if(!PLAYERS.includes(v.player))throw Error('Bitte wähle einen Bartträger aus.');
    if(!v.title||v.title.length>120)throw Error('Bitte gib einen Titel mit höchstens 120 Zeichen ein.');
    if(v.photo_date&&!dateOK(v.photo_date))throw Error('Bitte prüfe das Aufnahmedatum oder lasse es leer.');
    if(v.comment.length>1000||v.dedication.length>300)throw Error('Bitte kürze den Kommentar auf 1.000 und die Widmung auf 300 Zeichen.');
    return v;
  }
  async function inspect(file){
    if(!file||file.size<1)throw Error('Bitte wähle ein Foto aus.');
    if(file.size>MAX_BYTES)throw Error('Das Foto ist größer als 15 MB. Bitte wähle eine kleinere Originaldatei.');
    const b=new Uint8Array(await file.slice(0,32).arrayBuffer());
    const ascii=(a,z)=>String.fromCharCode(...b.slice(a,z));
    let mime=b[0]===255&&b[1]===216&&b[2]===255?'image/jpeg':b[0]===137&&ascii(1,4)==='PNG'&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10?'image/png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':null;
    if(!mime){if(/hei[cf]/i.test(file.name)||ascii(4,8)==='ftyp')throw Error('HEIC/HEIF kann hier nicht zuverlässig angezeigt werden. Bitte wähle eine JPEG-, PNG- oder WebP-Datei. Dein Original wird nicht umgewandelt.');throw Error('Dieses Fotoformat wird nicht unterstützt. Bitte JPEG, PNG oder WebP auswählen.');}
    return {mime,size:file.size};
  }
  function sorted(rows,sort){return [...rows].sort((a,b)=>sort==='oldest'?a.exhibit_number-b.exhibit_number:sort==='date'?(a.photo_date&&b.photo_date?b.photo_date.localeCompare(a.photo_date):a.photo_date?-1:b.photo_date?1:0)||b.exhibit_number-a.exhibit_number:b.exhibit_number-a.exhibit_number);}

  const FRAMES=Object.freeze({baroque:'Königlicher Barock',rococo:'Verspieltes Rokoko',renaissance:'Dunkle Renaissance',antique:'Antikes Museumsgold'});
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  function presentation(row={}) {
    const fallback=Object.keys(FRAMES)[Math.max(0,(Number(row.exhibit_number)||1)-1)%4];
    const finite=(n,d)=>Number.isFinite(Number(n))&&n!==null&&n!==''?Number(n):d;
    return {frame_style:FRAMES[row.frame_style]?row.frame_style:fallback,crop_x:clamp(finite(row.crop_x,.5),0,1),crop_y:clamp(finite(row.crop_y,.5),0,1),crop_zoom:clamp(finite(row.crop_zoom,1),1,3)};
  }
  // Cover geometry: normalized offsets use only the overflow, so no gesture can expose blank margins.
  function geometry(width,height,naturalWidth,naturalHeight,zoom=1) {
    const scale=Math.max(width/naturalWidth,height/naturalHeight)*zoom;
    return {width:naturalWidth*scale,height:naturalHeight*scale,overflowX:Math.max(0,naturalWidth*scale-width),overflowY:Math.max(0,naturalHeight*scale-height)};
  }
  root.WRCBobCore=Object.freeze({MAX_BYTES,PLAYERS,uuid,validate,inspect,sorted,FRAMES,presentation,geometry,clamp});
})(typeof window==='undefined'?globalThis:window);
