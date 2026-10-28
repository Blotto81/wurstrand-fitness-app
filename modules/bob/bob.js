(function(){
  'use strict';
  const C=WRCBobCore, host=document.getElementById('bobPanel');
  if(!host)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=n=>String(n).padStart(3,'0');
  const date=d=>d.split('-').reverse().join('.');
  const $=s=>host.querySelector(s);
  let api,rows=[],sort='newest',loading=false,busy=false,selecting=false,draft=null,file=null,info=null,previewURL=null,fileVersion=0,detailRow=null,deleteRow=null,hasLoaded=false;
  const service=()=>api||(api=WRCBobData.create(supabaseClient));
  host.innerHTML=`
    <div class="bob-topbar"><button type="button" id="bobBack">← Zum Dashboard</button><span>WRC · Sammlung ohne Wertung</span></div>
    <section class="bob-museum" aria-labelledby="bobTitle">
      <header class="bob-hero"><span class="bob-eyebrow">DAS MUSEUM DER FRAGWÜRDIGEN GESICHTSKUNST</span><h2 id="bobTitle"><span aria-hidden="true">🥸</span> B.o.B.</h2><p class="bob-wordmark">BEST OF BÄRTE</p><p class="bob-motto">Vier Männer. Viele Bärte.<br>Nicht jede Entscheidung war gut.</p><span class="bob-seal" aria-hidden="true">ORIGINALE<br><b>WRC</b><br>FÜR DIE EWIGKEIT</span></header>
      <div class="bob-collection"><div class="bob-toolbar"><div><span class="bob-eyebrow">DIE SAMMLUNG</span><h3>Große Kunst. Kleine Hemmschwelle.</h3><p id="bobCount">Die Bartforschung katalogisiert …</p></div><button class="bob-primary" type="button" id="bobAdd">🥸 + Neues Bartkunstwerk</button></div>
      <p class="bob-intro">Willkommen in der bedeutendsten Sammlung zweifelhafter Gesichtskunst der WRC-Geschichte.</p>
      <div class="bob-tools"><label>Sortieren nach <select id="bobSort"><option value="newest">Neueste Exponate</option><option value="oldest">Älteste Exponate</option><option value="date">Aufnahmedatum</option></select></label><button type="button" id="bobRefresh">↻ Aktualisieren</button></div>
      <p id="bobStatus" role="status" aria-live="polite"></p>
      <div id="bobEmpty" class="bob-empty" hidden><span class="bob-empty-mark" aria-hidden="true">﹏</span><h3>Noch herrscht bartlose Stille.</h3><p>Das Museum wartet auf sein erstes Meisterwerk.<br>Die internationale Bartforschung ist bereits nervös.</p><button class="bob-primary" type="button" id="bobFirst">🥸 + Neues Bartkunstwerk</button></div>
      <div id="bobGrid" class="bob-grid"></div>
      <footer class="bob-footer"><span>ORIGINAL BLEIBT ORIGINAL.</span><p>Keine Filter. Keine Retusche. Nur echte Entscheidungen.</p><small>Eine gemeinsame Sammlung: Alle mit dem WRC-Link können Exponate hinzufügen, bearbeiten und entfernen.</small></footer></div>
    </section>`;
  function dialog(id,title,content){const el=document.createElement('dialog');el.id=id;el.className='bob-dialog';el.setAttribute('aria-labelledby',title);el.innerHTML=content;document.body.append(el);return el;}
  const formDialog=dialog('bobFormDialog','bobFormTitle',`<form id="bobForm"><header class="bob-dialog-header"><div><span class="bob-eyebrow">DIE BARTFORSCHUNG BITTET UM DETAILS</span><h2 id="bobFormTitle">Ein neues Meisterwerk</h2></div><button type="button" data-close aria-label="Formular schließen">✕</button></header><div class="bob-form-body"><div class="bob-upload"><div id="bobEditorFrame" class="bob-frame bob-editor-frame" hidden><div class="bob-aperture" tabindex="0" role="group" aria-label="Bildausschnitt verschieben: ziehen oder Pfeiltasten verwenden"><img id="bobPreview" alt="Vorschau des gewählten Bildausschnitts" draggable="false" hidden></div><img class="bob-ornament" src="modules/bob/frames/baroque.svg" alt="" aria-hidden="true"></div><div id="bobPhotoHint">Ein Original. Für die Nachwelt.</div><div class="bob-photo-buttons"><button type="button" id="bobPick">Foto auswählen oder aufnehmen</button><button type="button" id="bobCamera">📷 Kamera öffnen</button></div><input type="file" id="bobFile" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden><input type="file" id="bobCapture" accept="image/jpeg,image/png,image/webp" capture="environment" hidden><small>JPEG, PNG oder WebP · höchstens 15 MB · vollständig und unverändert</small></div><fieldset class="bob-crop-controls"><legend>Rahmen &amp; Bildausschnitt</legend><label>Museumsrahmen<select name="frame_style"><option value="baroque">Königlicher Barock</option><option value="rococo">Verspieltes Rokoko</option><option value="renaissance">Dunkle Renaissance</option><option value="antique">Antikes Museumsgold</option></select></label><p id="bobCropHelp">Foto im Rahmen mit dem Finger verschieben. Zwei Finger zoomen. Alternativ die Regler oder Pfeiltasten verwenden.</p><label>Zoom <output id="bobZoomValue">1,00×</output><input name="crop_zoom" type="range" min="1" max="3" step="0.01" value="1"></label><details><summary>Bildposition fein einstellen</summary><label>Horizontal<input name="crop_x" type="range" min="0" max="1" step="0.005" value="0.5"></label><label>Vertikal<input name="crop_y" type="range" min="0" max="1" step="0.005" value="0.5"></label></details><button type="button" id="bobCropReset">Ausschnitt zurücksetzen</button><small>Nur die Ansicht ändert sich. Dein Originalfoto bleibt vollständig erhalten.</small></fieldset><div class="bob-form-grid"><label>Wessen Meisterwerk ist das? <select name="player" required><option value="">Bitte auswählen</option>${C.PLAYERS.map(p=>`<option>${p}</option>`).join('')}</select></label><label>Wann entstand dieses Kunstwerk? <span class="bob-optional">Optional · unbekannt einfach leer lassen</span><input name="photo_date" type="date" min="1000-01-01" max="9999-12-31"></label></div><label>Wie heißt dieses Meisterwerk? <input name="title" required maxlength="120" placeholder="Ein Titel, der dem Werk gerecht wird"></label><label>Was sagt die internationale Bartforschung dazu? <span class="bob-optional">Optional · bis zu 1.000 Zeichen</span><textarea name="comment" maxlength="1000" rows="3"></textarea></label><label>Besondere Widmung <span class="bob-optional">Optional · eine persönliche Widmung</span><textarea name="dedication" maxlength="300" rows="2"></textarea></label><p id="bobFormError" role="alert"></p><p id="bobFormProgress" role="status" aria-live="polite"></p><div class="bob-form-actions"><button type="button" data-close>Abbrechen</button><button type="submit" class="bob-primary" id="bobSave">Im Bartmuseum verewigen</button></div></div></form>`);
  const detail=dialog('bobDetail','bobDetailTitle',`<header class="bob-dialog-header"><span class="bob-eyebrow">EIN ORIGINAL DER WRC-SAMMLUNG</span><button type="button" data-close>Schließen ✕</button></header><div id="bobDetailContent"></div>`);
  const confirmDelete=dialog('bobDeleteDialog','bobDeleteTitle',`<div class="bob-delete-body"><span class="bob-eyebrow">DIE BARTFORSCHUNG FRAGT NACH</span><h2 id="bobDeleteTitle">Dieses Meisterwerk wirklich entfernen?</h2><p id="bobDeleteName"></p><p>Ein schwerer Verlust für die internationale Bartforschung.</p><p id="bobDeleteError" role="alert"></p><div class="bob-form-actions"><button type="button" data-close>Abbrechen</button><button type="button" id="bobDeleteConfirm" class="bob-danger">Endgültig entfernen</button></div></div>`);
  const form=formDialog.querySelector('form'), field=n=>form.elements.namedItem(n);
  const editor=formDialog.querySelector('#bobEditorFrame');
  function syncCrop(value){for(const n of ['frame_style','crop_x','crop_y','crop_zoom'])field(n).value=value[n];formDialog.querySelector('#bobZoomValue').textContent=Number(value.crop_zoom).toFixed(2).replace('.',',')+'×';}
  const crop=WRCBobCrop.mount(editor,value=>{syncCrop(value);if(draft&&!busy)draft.request=C.uuid();});
  for(const n of ['frame_style','crop_x','crop_y','crop_zoom'])field(n).addEventListener('input',()=>{if(!busy)crop.update({[n]:field(n).value});});
  formDialog.querySelector('#bobCropReset').addEventListener('click',()=>crop.update({crop_x:.5,crop_y:.5,crop_zoom:1}));
  function lock(value){busy=value;crop.lock(value);form.querySelectorAll('button,input,select,textarea').forEach(e=>e.disabled=value);confirmDelete.querySelectorAll('button').forEach(e=>e.disabled=value);}
  function revoke(){if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;}
  function closeForm(){if(busy)return;formDialog.close();revoke();fileVersion++;draft=null;file=null;info=null;}
  for(const d of [formDialog,detail,confirmDelete]){
    d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d===formDialog?closeForm():!busy&&d.close()));
    d.addEventListener('cancel',e=>{if(busy)e.preventDefault();else if(d===formDialog){revoke();fileVersion++;draft=null;}});
    d.addEventListener('close',()=>{if(!document.querySelector('.bob-dialog[open]'))document.body.classList.remove('bob-dialog-open');});
  }
  function show(d){document.body.classList.add('bob-dialog-open');d.showModal();}
  function plaque(row,large=false){return `<div class="bob-plaque"><span class="bob-number">EXPONAT ${number(row.exhibit_number)}</span><${large?'h2 id="bobDetailTitle"':'h4'}>${esc(row.title)}</${large?'h2':'h4'}><p class="bob-person">Künstlerisches Gesicht: <strong>${esc(row.player==='Marian'?'Marian „Gomesch“':row.player)}</strong></p>${row.photo_date?`<p class="bob-date">Aufgenommen am ${date(row.photo_date)}</p>`:''}${row.comment?`<p class="bob-comment">${esc(row.comment)}</p>`:''}${row.dedication?`<p class="bob-dedication"><span>Persönliche Widmung</span>${esc(row.dedication)}</p>`:''}</div>`;}
  function photo(row,large=false){const display=C.presentation(row);return `<div class="bob-frame${large?' bob-frame-large':''}"><div class="bob-aperture" style="${WRCBobCrop.styles(display)}"><img src="${esc(service().url(row.photo_path))}" alt="${esc(row.title)} – ${esc(row.player)}, gerahmter Bildausschnitt" loading="${large?'eager':'lazy'}" decoding="async"><span class="bob-image-error" hidden>Das Foto konnte nicht geladen werden. Bitte aktualisieren.</span></div><img class="bob-ornament" src="modules/bob/frames/${display.frame_style}.svg" alt="" aria-hidden="true"></div>`;}
  function imageErrors(parent){parent.querySelectorAll('.bob-aperture img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;if(img.nextElementSibling)img.nextElementSibling.hidden=false;},{once:true}));}
  function render(){
    $('#bobCount').textContent=hasLoaded?`${rows.length} ${rows.length===1?'Original':'Originale'} · ohne Wertung, ohne Reue`:'Die Bartforschung katalogisiert …';
    $('#bobEmpty').hidden=!hasLoaded||!!rows.length;
    $('#bobSort').disabled=!rows.length;
    $('#bobAdd').hidden=hasLoaded&&!rows.length;
    $('#bobGrid').innerHTML=C.sorted(rows,sort).map(row=>`<article class="bob-exhibit"><button type="button" class="bob-photo-open" data-view="${row.id}" aria-label="Exponat ${number(row.exhibit_number)}: ${esc(row.title)} groß ansehen">${photo(row)}</button>${plaque(row)}<div class="bob-exhibit-actions"><button type="button" data-edit="${row.id}">✏️ Bearbeiten</button><button type="button" data-delete="${row.id}">Entfernen</button></div></article>`).join('');
    imageErrors($('#bobGrid'));
  }
  function errorText(error){const m=error?.message||String(error);if(m.includes('BOB_CONFLICT'))return 'Dieses Exponat wurde inzwischen auf einem anderen Gerät geändert. Bitte schließe das Formular, aktualisiere die Galerie und öffne es erneut.';if(m.includes('BOB_UPLOAD_INCOMPLETE'))return 'Das Foto ist noch nicht vollständig angekommen. Bitte versuche das Speichern erneut.';if(m.includes('BOB_UPLOAD_EXPIRED'))return 'Die Fotoauswahl ist abgelaufen. Bitte wähle das Foto erneut aus.';if(/schema cache|does not exist|Could not find/i.test(m))return 'Das Bartmuseum wird noch eingerichtet. Bitte später erneut versuchen.';return 'Das Kunstwerk konnte leider nicht archiviert werden. Bitte erneut versuchen. '+(/Bitte |Foto|Format|HEIC/.test(m)?m:'Prüfe bitte deine Internetverbindung.');}
  async function load({silent=false}={}){
    if(loading)return;loading=true;
    if(!silent)$('#bobStatus').textContent='Die Bartforschung katalogisiert …';
    try{rows=await service().list();hasLoaded=true;render();if(!silent)$('#bobStatus').textContent='';return true;}
    catch(e){$('#bobStatus').textContent=errorText(e);return false;}
    finally{loading=false;}
  }
  async function tidy(){try{await service().cleanup();return true;}catch(e){$('#bobStatus').textContent='Eine Bildbereinigung ist noch offen. Mit „Aktualisieren“ kannst du sie erneut versuchen.';return false;}}
  function openForm(existing=null){
    if(busy||loading)return;
    form.reset();revoke();file=null;info=null;fileVersion++;selecting=false;formDialog.querySelector('#bobSave').disabled=false;draft={id:existing?.id||C.uuid(),request:C.uuid(),existing,uploadId:null,path:null,uploaded:false};
    ['player','title','photo_date','comment','dedication'].forEach(n=>field(n).value=existing?.[n]||'');
    formDialog.querySelector('#bobFormTitle').textContent=existing?`Exponat ${number(existing.exhibit_number)} bearbeiten`:'Ein neues Meisterwerk';
    formDialog.querySelector('#bobSave').textContent=existing?'Änderungen bewahren':'Im Bartmuseum verewigen';
    formDialog.querySelector('#bobFormError').textContent='';formDialog.querySelector('#bobFormProgress').textContent='';
    const initial=C.presentation(existing||{exhibit_number:Math.max(0,...rows.map(r=>Number(r.exhibit_number)))+1});crop.set(initial);syncCrop(initial);editor.hidden=!existing;
    const img=formDialog.querySelector('#bobPreview');img.hidden=!existing;if(existing)img.src=service().url(existing.photo_path);else img.removeAttribute('src');
    formDialog.querySelector('#bobPhotoHint').hidden=!!existing;
    show(formDialog);
  }
  async function pick(selected){
    if(!selected||busy)return;selecting=true;formDialog.querySelector('#bobSave').disabled=true;const version=++fileVersion;const error=formDialog.querySelector('#bobFormError');error.textContent='';
    try{const checked=await C.inspect(selected);const url=URL.createObjectURL(selected),image=new Image();image.src=url;try{await image.decode();}catch{URL.revokeObjectURL(url);throw Error('Das Foto kann nicht gelesen werden. Bitte wähle eine gültige JPEG-, PNG- oder WebP-Datei.');}
      if(version!==fileVersion||!draft){URL.revokeObjectURL(url);return;}revoke();previewURL=url;file=selected;info=checked;draft.uploadId=null;draft.path=null;draft.uploaded=false;draft.request=C.uuid();
      const img=formDialog.querySelector('#bobPreview');img.src=url;img.hidden=false;editor.hidden=false;crop.update({crop_x:.5,crop_y:.5,crop_zoom:1});formDialog.querySelector('#bobPhotoHint').hidden=true;
    }catch(e){if(version===fileVersion)error.textContent=e.message;}
    finally{if(version===fileVersion){selecting=false;formDialog.querySelector('#bobSave').disabled=false;}}
  }
  formDialog.querySelector('#bobPick').addEventListener('click',()=>formDialog.querySelector('#bobFile').click());
  formDialog.querySelector('#bobCamera').addEventListener('click',()=>formDialog.querySelector('#bobCapture').click());
  ['bobFile','bobCapture'].forEach(id=>formDialog.querySelector('#'+id).addEventListener('change',e=>{pick(e.target.files[0]);e.target.value='';}));
  form.addEventListener('input',e=>{if(draft&&!busy&&e.target.type!=='file')draft.request=C.uuid();});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy||selecting||!draft)return;
    const error=formDialog.querySelector('#bobFormError'),progress=formDialog.querySelector('#bobFormProgress');error.textContent='';
    let values;try{values={...C.validate(Object.fromEntries(new FormData(form))),...crop.get()};if(!file&&!draft.existing)throw Error('Bitte wähle ein Foto aus.');}catch(e){error.textContent=e.message;return;}
    lock(true);progress.textContent=file?'Das Originalfoto wird unverändert archiviert …':'Die Museumsplakette wird aktualisiert …';
    try{await service().save(draft,values,file,info);lock(false);closeForm();lock(true);await load();$('#bobStatus').textContent='Ein weiteres Meisterwerk wurde der Nachwelt übergeben.';await tidy();}
    catch(e){error.textContent=errorText(e);progress.textContent='';}
    finally{lock(false);}
  });
  function openDetail(row){detailRow=row;detail.querySelector('#bobDetailContent').innerHTML=photo(row,true)+plaque(row,true)+`<button type="button" class="bob-original-toggle" aria-expanded="false">Vollständiges Originalfoto ansehen</button><div class="bob-original" hidden><img alt="${esc(row.title)} – vollständiges Original ohne Zuschnitt" data-original="${esc(service().url(row.photo_path))}"><p>Vollständiges Original · ohne Zuschnitt oder Bearbeitung</p></div>`;imageErrors(detail);show(detail);}
  detail.addEventListener('click',e=>{const button=e.target.closest('.bob-original-toggle');if(!button)return;const original=detail.querySelector('.bob-original');original.hidden=!original.hidden;button.setAttribute('aria-expanded',String(!original.hidden));button.textContent=original.hidden?'Vollständiges Originalfoto ansehen':'Originalfoto ausblenden';if(!original.hidden){const img=original.querySelector('img');if(!img.getAttribute('src'))img.src=img.dataset.original;original.scrollIntoView({block:'nearest'});}});
  $('#bobGrid').addEventListener('click',e=>{const b=e.target.closest('[data-view],[data-edit],[data-delete]');if(!b||busy||loading)return;const row=rows.find(r=>r.id===(b.dataset.view||b.dataset.edit||b.dataset.delete));if(!row)return;if(b.dataset.view)openDetail(row);else if(b.dataset.edit)openForm(row);else{deleteRow=row;confirmDelete.querySelector('#bobDeleteName').textContent=`Exponat ${number(row.exhibit_number)} · ${row.title}`;confirmDelete.querySelector('#bobDeleteError').textContent='';show(confirmDelete);}});
  confirmDelete.querySelector('#bobDeleteConfirm').addEventListener('click',async()=>{if(busy||!deleteRow)return;lock(true);const status=confirmDelete.querySelector('#bobDeleteError');status.textContent='Exponat und Originalfoto werden entfernt …';try{await service().remove(deleteRow);lock(false);confirmDelete.close();await load();$('#bobStatus').textContent='Das Exponat und seine Bilddatei wurden entfernt.';}catch(e){status.textContent=errorText(e).replace('archiviert','entfernt')+' Falls die Entfernung bereits begonnen hat: erneut versuchen oder die Galerie aktualisieren.';}finally{lock(false);}});
  $('#bobAdd').addEventListener('click',()=>openForm());$('#bobFirst').addEventListener('click',()=>openForm());
  $('#bobBack').addEventListener('click',()=>{showTab('dashboard',menuLinkForPanel('dashboard'));window.scrollTo(0,0);});
  $('#bobSort').addEventListener('change',e=>{sort=e.target.value;render();});
  $('#bobRefresh').addEventListener('click',async()=>{await tidy();await load();});
  const visible=()=>host.classList.contains('active')&&!document.hidden&&!document.querySelector('.bob-dialog[open]');
  setInterval(()=>{if(visible()&&!busy)load({silent:true});},30000);
  document.addEventListener('visibilitychange',()=>{if(visible())load({silent:true});});
  window.addEventListener('online',()=>{if(visible())load();});
  window.WRCBob=Object.freeze({async open(){if(await load())await tidy();},close(){for(const d of [formDialog,detail,confirmDelete])if(d.open&&!busy)d.close();}});
})();
