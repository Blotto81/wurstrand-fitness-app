(function(root){
  'use strict';
  const C=WRCBobCore;
  function styles(value){const p=C.presentation(value);return `--bob-x:${p.crop_x*100}%;--bob-y:${p.crop_y*100}%;--bob-zoom:${p.crop_zoom}`;}
  function mount(container,onChange){
    const stage=container.querySelector('.bob-aperture'),image=stage.querySelector('img'),overlay=container.querySelector('.bob-ornament'),pointers=new Map();
    let value=C.presentation(),previous=null,enabled=true;
    const metrics=()=>{const r=stage.getBoundingClientRect();return {r,...C.geometry(r.width,r.height,image.naturalWidth||r.width,image.naturalHeight||r.height,value.crop_zoom)};};
    function draw(){stage.style.cssText=styles(value);overlay.src='modules/bob/frames/'+value.frame_style+'.svg';}
    function update(next,notify=true){value=C.presentation({...value,...next});draw();if(notify)onChange({...value});}
    function sample(){const ps=[...pointers.values()];return {x:ps.reduce((s,p)=>s+p.x,0)/ps.length,y:ps.reduce((s,p)=>s+p.y,0)/ps.length,d:ps.length>1?Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y):0};}
    stage.addEventListener('pointerdown',e=>{if(!enabled||image.hidden||!image.naturalWidth||e.button>0)return;e.preventDefault();stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previous=sample();stage.classList.add('bob-dragging');});
    stage.addEventListener('pointermove',e=>{
      if(!enabled||!pointers.has(e.pointerId))return;e.preventDefault();
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=sample(),g=metrics();
      const zoom=C.clamp(value.crop_zoom*(previous.d&&next.d?next.d/previous.d:1),1,3),ratio=zoom/value.crop_zoom;
      const after=C.geometry(g.r.width,g.r.height,image.naturalWidth,image.naturalHeight,zoom);
      // Keep the image point under the gesture midpoint fixed while pinching.
      const x=after.overflowX?((previous.x-g.r.left+g.overflowX*value.crop_x)*ratio-(next.x-g.r.left))/after.overflowX:.5;
      const y=after.overflowY?((previous.y-g.r.top+g.overflowY*value.crop_y)*ratio-(next.y-g.r.top))/after.overflowY:.5;
      update({crop_x:x,crop_y:y,crop_zoom:zoom});previous=next;
    });
    const release=e=>{pointers.delete(e.pointerId);previous=pointers.size?sample():null;if(!pointers.size)stage.classList.remove('bob-dragging');};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,release);
    stage.addEventListener('keydown',e=>{if(!enabled)return;const steps={ArrowLeft:[-.025,0],ArrowRight:[.025,0],ArrowUp:[0,-.025],ArrowDown:[0,.025]};if(steps[e.key]){e.preventDefault();update({crop_x:value.crop_x+steps[e.key][0],crop_y:value.crop_y+steps[e.key][1]});}});
    image.addEventListener('dragstart',e=>e.preventDefault());
    return {set(next){pointers.clear();previous=null;update(next,false);},get:()=>({...value}),update,lock(v){enabled=!v;if(v){pointers.clear();previous=null;}},styles};
  }
  root.WRCBobCrop=Object.freeze({styles,mount});
})(window);
