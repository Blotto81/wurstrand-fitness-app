const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');require('../modules/bob/bob-core.js');const C=global.WRCBobCore;
for(let i=1;i<=8;i++)assert.equal(C.presentation({exhibit_number:i}).frame_style,Object.keys(C.FRAMES)[(i-1)%4]);
for(const [nw,nh] of [[100,400],[400,100],[100,100]])for(const z of [1,1.5,3]){const g=C.geometry(280,368,nw,nh,z);assert.ok(g.width>=280&&g.height>=368);assert.ok(Math.abs(g.width/g.height-nw/nh)<1e-9);}
const handlers={},image={naturalWidth:800,naturalHeight:600,hidden:false,addEventListener(){}},stage={style:{},classList:{add(){},remove(){}},querySelector:()=>image,addEventListener:(n,f)=>handlers[n]=f,getBoundingClientRect:()=>({width:320,height:420,left:0,top:0}),setPointerCapture(){}},overlay={},container={querySelector:s=>s==='.bob-aperture'?stage:overlay},win={};
vm.runInNewContext(fs.readFileSync(require.resolve('../modules/bob/bob-crop.js'),'utf8'),{window:win,WRCBobCore:C});
let last;const crop=win.WRCBobCrop.mount(container,v=>last=v);
const event=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,button:0,preventDefault(){}});
crop.set({frame_style:'rococo',crop_x:.5,crop_y:.5,crop_zoom:1});handlers.pointerdown(event(1,100,200));handlers.pointermove(event(1,140,200));assert.ok(last.crop_x<.5);assert.equal(last.crop_y,.5);handlers.pointerup(event(1,140,200));
handlers.pointerdown(event(1,100,100));handlers.pointerdown(event(2,200,100));handlers.pointermove(event(2,250,100));assert.equal(last.crop_zoom,1.5);handlers.pointercancel(event(2,250,100));handlers.pointerup(event(1,100,100));
crop.update({crop_x:99,crop_y:-20,crop_zoom:20});assert.equal(last.crop_x,1);assert.equal(last.crop_y,0);assert.equal(last.crop_zoom,3);
crop.lock(true);handlers.pointerdown(event(1,50,50));handlers.pointermove(event(1,90,90));assert.equal(crop.get().crop_x,1);crop.lock(false);handlers.keydown({key:'ArrowLeft',preventDefault(){}});assert.ok(crop.get().crop_x<1);
const html=fs.readFileSync('index.html','utf8');assert.ok(html.indexOf("showTab('funfactsPanel',this)")<html.indexOf("showTab('bobPanel',this)"));assert.ok(html.indexOf("showTab('bobPanel',this)")<html.indexOf('🎮 Game Lounge'));assert.ok(!html.includes('class="bob-entry"'));
console.log('PASS stable frame variants, cover geometry without distortion or blank edges, drag, pinch, bounds, keyboard, busy lock and menu order');
