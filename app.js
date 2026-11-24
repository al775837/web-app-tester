'use strict';
const VERSION='1.3.55 TEST';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const shapes={
 chart:'M3 14h4v8H3zm7-7h4v15h-4zm7-5h4v20h-4z',list:'M8 5h14M8 12h14M8 19h14M2 5h1m-1 7h1m-1 7h1',book:'M12 5Q5 1 2 4v16q5-3 10 1 5-4 10-1V4q-5-3-10 1v16',expand:'M8 2H2v6m14-6h6v6M2 16v6h6m14-6v6h-6M2 2l7 7m13-7-7 7M2 22l7-7m13 7-7-7',rotate:'M20 7a8 8 0 1 0 1 10M21 2v6h-6',
 screens:'M2 4h10v9H2zm14 0h6v9h-6zM8 16h14v6H8z',
 undo:'M9 14 4 9l5-5M4 9h10a7 7 0 0 1 0 14',redo:'m15 14 5-5-5-5m5 5H10a7 7 0 0 0 0 14',
 folder:'M2 5h8l3 3h9v13H2z',reload:'M21 9a9 9 0 1 0-1 9M21 3v6h-6',
 compare:'M12 2v20M7 4h10M5 5 1 13h8L5 5zm14 0-4 8h8l-4-8zM7 22h10',
 play:'m6 3 15 9-15 9z',layers:'m12 2 10 5-10 5L2 7zm10 10-10 5L2 12m20 5-10 5L2 17',
 desktop:'M2 3h20v14H2zm10 14v4m-5 0h10',tablet:'M4 2h16v20H4zm7 17h2',phone:'M6 2h12v20H6zm5 17h2',
 focus:'M12 1v5m0 12v5M1 12h5m12 0h5M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
 clip:'M8 5H4v17h16V5h-4m-8-3h8v6H8zm0 10h8m-8 5h8',
 image:'M2 3h20v18H2zm0 14 6-6 5 4 3-3 6 6M15 7h1',
 help:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9 8a3 3 0 1 1 5 2l-2 2v1m0 4v.1',
 gear:'m9 2 6 0 1 4 4 1 2 4-3 3v4l-4 3-3-2-4 2-4-3 1-4-3-3 2-4 4-1zm3 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 check:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM6 12l4 4 8-9',
 clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2',
 left:'m15 3-9 9 9 9',right:'m9 3 9 9-9 9',megaphone:'M3 9h6l11-6v18L9 15H3zm3 6 2 7h4l-2-7M20 8l3-1m-3 9 3 1',
 bell:'M4 17h16l-3-4V9a5 5 0 0 0-10 0v4zm6 3a2 2 0 0 0 4 0'
};
function icon(name){return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+shapes[name]+'"/></svg>';}
$$('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));
const guideSteps=[
 ['Load an application','Choose an HTML, ZIP, or PWA file and confirm that the application loads.','[data-menu="load"]','Application loads'],
 ['Check the desktop layout','Inspect the desktop preview at its selected resolution.','[data-device="desktop"]','Desktop Layout'],
 ['Check the tablet layout','Inspect the tablet layout and its navigation.','[data-device="tablet"]','Tablet Layout'],
 ['Check the mobile layout','Inspect mobile content, text, and touch targets.','[data-device="phone"]','Mobile Layout'],
 ['Try buttons and navigation','Use the loaded application’s menus, links, and buttons.','#previewArea','Buttons & Navigation'],
 ['Test form entry','Enter sample data and check validation and submission.','#previewArea','Forms & Entry'],
 ['Test saving and restoring','Save data in the application, reload it, and confirm restoration.','[data-action="reload"]','Saving & Restoring'],
 ['Check scrolling','Scroll the previews and check Sync Scroll.','.sync','Scrolling'],
 ['Inspect different resolutions','Use Settings to select each device’s viewport size.','[data-action="settings"]','Resolutions'],
 ['Capture evidence','Capture the workspace or attach an image to your test.','[data-menu="evidence"]','Evidence'],
 ['Review results and notes','Record observations and review your manual test results.','.right','Results & Notes'],
 ['Save the testing session','Save this project and download a backup for recovery.','[data-menu="sessions"]','Session Backup'],
 ['Check live animations','Observe CSS, JavaScript, SVG, canvas and GIF animations on each intended device. Change zoom, full screen and view; confirm visible animations resume without reloading. Use SKIP for unsupported devices or absent effects.','#previewArea','Live Animation Compatibility']
];
const defaultTests=()=>[];
const defaultSettings=()=>({view:'all',zoom:100,sync:false,guide:false,minimized:false,panelCollapsed:false,deviceZoom:{desktop:100,tablet:100,phone:100},rotations:{desktop:false,tablet:false,phone:false},step:0,resolutions:{desktop:{width:1440,height:900},tablet:{width:768,height:1024},phone:{width:390,height:844}},cloudDatabaseEnabled:false,userAccountsEnabled:false,cloudSyncEnabled:false,applicationMode:"local",hostedAppURL:""});
let state={schema:1,tests:defaultTests(),notes:'',settings:defaultSettings(),sessions:[],apps:{},currentApp:null,versionB:null,history:[],evidence:[],automatedReports:[],selectedSession:null};
let tab='test',mood='welcome',activeMenu=null,importTarget='A',bridgeFrames=new Map(),resizeObserver,saveTimer,toastTimer,highlightTimer,db,compare=false,previewEpoch=0,selectedHistory=null;
const dbReady=new Promise((resolve,reject)=>{
 const request=indexedDB.open('mc2-testing-studio',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('state');
 request.onsuccess=()=>{db=request.result;resolve(db);};
 request.onerror=()=>reject(request.error);
});
function readState(){return new Promise((resolve,reject)=>{const tx=db.transaction('state');const request=tx.objectStore('state').get('workspace');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
let writeQueue=Promise.resolve();
function persist(){
 clearTimeout(saveTimer);
 writeQueue=writeQueue.catch(()=>{}).then(async()=>{
 await dbReady;
 await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(state,'workspace');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage write aborted'));});
 }).catch(error=>{notify('Storage could not be saved: '+error.message);throw error;});
 return writeQueue;
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);}
function notify(text,duration=4500){$('.toast').textContent=text;$('.toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').hidden=true,duration);}
function record(type,detail){
 state.history.unshift({id:uid(),date:new Date().toISOString(),type,detail,tests:state.tests.map(test=>({...test})),notes:state.notes});
 if(state.history.length>1000)state.history.length=1000;
 if(tab==='history')renderRight();scheduleSave();
}
function react(next){
 mood=next;
 const figure=$('#sidebarBot');figure.innerHTML=fullBot(mood);figure.className='botReact'+(mood==='pass'?' botPass':mood==='fail'?' botFail':'');
 $('#botReaction').textContent=({welcome:'Ready when you are',pass:'Test passed!',fail:'Needs attention',skip:'Test skipped',thinking:'Thinking…',locate:'Locating control…',found:'Here it is!',confirmed:'Action confirmed',complete:'Step complete!'})[mood]||'Ready to help';
 setTimeout(()=>figure.classList.remove('botReact'),700);
 $('.guideBot').innerHTML=bot(mood);
 $('.guideBot').className='guideBot botReact'+(mood==='pass'?' botPass':mood==='fail'?' botFail':'');
 setTimeout(()=>$('.guideBot').classList.remove('botReact'),700);
}
function renderGuide(){
 const index=state.settings.step;
 $('#stepBadge').textContent='Step '+(index+1)+' of '+guideSteps.length;
 $('#guideTitle').textContent=(index+1)+'. '+guideSteps[index][0];
 $('#guideText').textContent=guideSteps[index][1];
 $('[data-action="previous"]').disabled=index===0;
 $('[data-action="next"]').disabled=index===guideSteps.length-1;
 const test=state.tests.find(item=>item.id==='guide-'+index);
 $$('[data-guide-status]').forEach(el=>el.className=test?.status===el.dataset.guideStatus?'status-'+test.status:'');
 $('#guide').classList.toggle('minimized',state.settings.minimized);
 document.body.classList.toggle('guideHidden',!state.settings.guide);
 $('[data-action="minimize"]').textContent=state.settings.minimized?'+':'−';
 $('[data-action="minimize"]').setAttribute('aria-label',state.settings.minimized?'Expand guide':'Minimize guide');
 react(mood);
}
function renderPanelCollapse(){
 const collapsed=!!state.settings.panelCollapsed;document.body.classList.toggle('panelCollapsed',collapsed);
 const toggle=$('[data-action="togglePanel"]');toggle.textContent=collapsed?'‹':'›';toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'Expand testing panel':'Collapse testing panel');toggle.title=collapsed?'Expand testing panel':'Collapse testing panel';
}
const testCategories=['Core Functionality','User Interface','Responsiveness','Data & Storage','Print / Export','Settings & Tools'];
function testCategory(test){if(test.category&&testCategories.includes(test.category))return test.category;const name=test.name.toLowerCase();if(/desktop|tablet|mobile|resolu|responsive/.test(name))return 'Responsiveness';if(/sav|restor|stor|backup/.test(name))return 'Data & Storage';if(/export|print|evidence/.test(name))return 'Print / Export';if(/setting|tool/.test(name))return 'Settings & Tools';if(/button|navigation|form|scroll|interface/.test(name))return 'User Interface';return 'Core Functionality';}
function selectedTests(){return (state.settings.selectedTests||[]).filter(id=>state.tests.some(test=>test.id===id));}
function renderStatus(){const total=state.tests.length,done=state.tests.filter(test=>test.status!=='TEST').length,percent=total?Math.round(done/total*100):0;$('#testState').textContent=done?(done===total?'Completed':'In Progress'):'Not Started';$('#progressPercent').textContent=percent+'%';$('#progressBar').value=percent;$('#totalCount').textContent=total;for(const status of ['PASS','FAIL','SKIP'])$('#'+status.toLowerCase()+'Count').textContent=state.tests.filter(test=>test.status===status).length;}
function renderRight(){
 renderPanelCollapse();renderStatus();
 $$('[data-tab]').forEach(el=>el.classList.toggle('primary',el.dataset.tab===tab));
 const panel=$('#rightInner');
 if(tab==='history'){panel.innerHTML='<div class="checkHeading"><strong>'+state.history.length+' Records</strong></div>'+(state.history.length?state.history.map(entry=>'<button class="historyRecord'+(entry.id===selectedHistory?' selected':'')+'" data-history="'+entry.id+'">'+escapeHTML(entry.type)+'<small>'+escapeHTML(new Date(entry.date).toLocaleString())+'</small><small>'+escapeHTML(entry.detail)+'</small></button>').join(''):'<p class="muted">Your testing activity will appear here.</p>');return;}
 const done=state.tests.filter(test=>test.status!=='TEST').length,selected=selectedTests(),test=state.tests.find(test=>selected.includes(test.id));
 panel.innerHTML='<div class="checkHeading"><strong aria-label="Testing progress">'+done+' / '+state.tests.length+' Tests</strong></div>'+testCategories.map((category,index)=>{const tests=state.tests.filter(test=>testCategory(test)===category),open=state.settings.openCategory===category;return '<section class="testCategory"><div class="categoryHead"><input type="checkbox" data-category-select="'+index+'" aria-label="Select '+category+' tests" '+(tests.length&&tests.every(test=>selected.includes(test.id))?'checked':'')+'><button class="categoryToggle" data-category="'+index+'" aria-expanded="'+open+'"><span>'+category+' ('+tests.length+')</span><span>'+(open?'⌃':'⌄')+'</span></button></div>'+(open?'<div class="categoryTests">'+(tests.length?tests.map(item=>'<button class="testSelect '+(selected.includes(item.id)?'selected':'')+'" data-select-test="'+item.id+'"><span>'+escapeHTML(item.name)+'</span><small class="'+(item.status==='PASS'?'green':item.status==='FAIL'?'red':item.status==='SKIP'?'amber':'')+'">'+item.status+'</small></button>').join(''):'<p class="emptyCategory">No tests in this category.</p>')+'</div>':'')+'</section>';}).join('')+'<section class="resultArea"><h3>Test Result</h3><div class="statusRow">'+[['PASS','✓','pass'],['FAIL','✕','fail'],['SKIP','▷▷','skip']].map(([status,sign,cls])=>'<button class="'+cls+' '+(test?.status===status?'status-'+status:'')+'" data-selected-status="'+status+'"><b>'+sign+'</b>'+status+'</button>').join('')+'</div><div class="resetRow"><button data-selected-status="Reset">'+icon('reload')+'Reset</button><button class="primary" data-action="addTest">＋ Add Test</button></div></section><label class="notesLabel" for="notes">Notes / Observations</label><textarea id="notes" placeholder="Add notes, steps, or observations...">'+escapeHTML(state.notes)+'</textarea>';
}
const DEFAULT_DEVICE_RESOLUTIONS={desktop:{width:1440,height:900},tablet:{width:768,height:1024},phone:{width:390,height:844}};
const undoHistory=[];const redoHistory=[];const UNDO_LIMIT=80;
function editSnapshot(){return {tests:structuredClone(state.tests),notes:state.notes,evidence:state.evidence.map(item=>({...item})),resolutions:structuredClone(state.settings.resolutions)};}
function refreshUndoButtons(){for(const [name,stack] of [['undo',undoHistory],['redo',redoHistory]]){const button=document.querySelector('[data-action="'+name+'"]');if(button)button.disabled=!stack.length;}}
function checkpointEdit(){undoHistory.push(editSnapshot());if(undoHistory.length>UNDO_LIMIT)undoHistory.shift();redoHistory.length=0;refreshUndoButtons();}
function restoreEditSnapshot(snapshot){state.tests=structuredClone(snapshot.tests);state.notes=snapshot.notes;state.evidence=snapshot.evidence.map(item=>({...item}));if(snapshot.resolutions){state.settings.resolutions=structuredClone(snapshot.resolutions);fitFrames();}renderRight();renderGuide();const notes=document.querySelector('#notes');if(notes)notes.value=state.notes;const gallery=document.querySelector('dialog[open]');if(gallery&&gallery.textContent.includes('Evidence gallery'))showGallery();persist();}
function applyUndoRedo(direction){const source=direction==='undo'?undoHistory:redoHistory;const destination=direction==='undo'?redoHistory:undoHistory;if(!source.length)return;destination.push(editSnapshot());const snapshot=source.pop();restoreEditSnapshot(snapshot);refreshUndoButtons();notify(direction==='undo'?'Undo complete':'Redo complete');}
let notesEditTimer=null;let notesEditPending=false;
function commitNotesEdit(){clearTimeout(notesEditTimer);notesEditTimer=null;notesEditPending=false;}
function setStatus(testId,status){
 let test=state.tests.find(item=>item.id===testId);const existed=!!test;
 if(!test&&testId.startsWith('guide-')){
 checkpointEdit();const index=Number(testId.slice(6));test={id:testId,name:guideSteps[index][3],status:'TEST',notes:''};state.tests.push(test);
 }
 if(!test)return;
 if(test.status===(status==='Reset'?'TEST':status))return;if(existed)checkpointEdit();test.status=status==='Reset'?'TEST':status;
 record('Manual test',test.name+' · '+test.status);
 renderRight();renderGuide();react(test.status==='TEST'?'welcome':test.status.toLowerCase());persist();
}
function closeMenu(){$('#menu').hidden=true;activeMenu=null;$$('[data-menu]').forEach(el=>el.setAttribute('aria-expanded','false'));}
const menus={
 load:[['local','Local HTML / ZIP / PWA'],['urlDialog','Website URL'],['savedApps','Previously loaded apps']],
 compare:[['loadB','Load Version B'],['toggleCompare','Show / hide A–B comparison'],['clearB','Remove Version B']],
 tests:[['run','Run manual tests'],['addTest','Add test'],['allGuideTests','Add all guide checks'],['resetAll','Reset test statuses']],
 sessions:[['saveSession','Save session'],['restoreSession','Restore session'],['backup','Download backup'],['restoreBackup','Restore backup'],['newSession','New session']],
 results:[['results','View results'],['exportJSON','Export JSON'],['exportCSV','Export CSV'],['print','Print / Save PDF'],['copyResults','Copy results']],
 evidence:[['capture','Capture workspace'],['attachEvidence','Attach screenshot'],['gallery','Evidence gallery']]
};
function openMenu(name,anchor){
 if(activeMenu===name){closeMenu();return;}
 activeMenu=name;
 $('#menu').innerHTML=menus[name].map(([action,label])=>'<button data-action="'+action+'">'+label+'</button>').join('');
 $('#menu').hidden=false;
 const rect=anchor.getBoundingClientRect();const menu=$('#menu');
 menu.style.left=Math.min(rect.left,innerWidth-menu.offsetWidth-10)+'px';menu.style.top=rect.bottom+7+'px';
 anchor.setAttribute('aria-expanded','true');
}
function showDialog(title,html){closeMenu();$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();}
const actionButton=(action,label,primary=false)=>'<button data-action="'+action+'" class="'+(primary?'primary':'')+'">'+label+'</button>';
function mime(path){
 const ext=path.split('.').pop().toLowerCase();
 return ({html:'text/html',htm:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',wasm:'application/wasm',txt:'text/plain',mp4:'video/mp4',pdf:'application/pdf'})[ext]||'application/octet-stream';
}
function normalizePath(path){
 const parts=path.replace(/\\/g,'/').split('/');const out=[];
 for(const bit of parts){if(!bit||bit==='.')continue;if(bit==='..'){if(!out.length)throw Error('Archive contains a path outside its root.');out.pop();}else out.push(bit);}
 return out.join('/');
}
async function importFile(file,target){
 react('thinking');notify('Opening '+file.name+'…');
 let files=[],entries=[];
 if(/\.html?$/i.test(file.name)){
 files=[{path:'index.html',blob:new Blob([await file.arrayBuffer()],{type:'text/html'})}];entries=['index.html'];
 }else if(/\.zip$/i.test(file.name)){
 const archive=await JSZip.loadAsync(file,{checkCRC32:true});
 for(const item of Object.values(archive.files)){
 if(item.dir||item.name.startsWith('__MACOSX/')||item.name.split('/').pop().startsWith('.'))continue;
 const path=normalizePath(item.name);
 if(files.some(existing=>existing.path===path))throw Error('ZIP contains duplicate file path: '+path);
 files.push({path,blob:new Blob([await item.async('uint8array')],{type:mime(path)})});
 }
 entries=files.filter(item=>/\.html?$/i.test(item.path)).map(item=>item.path).sort((a,b)=>{
 const ai=/^index\.html?$/i.test(a.split('/').pop()),bi=/^index\.html?$/i.test(b.split('/').pop());
 return Number(bi)-Number(ai)||a.split('/').length-b.split('/').length||a.localeCompare(b);
 });
 if(!entries.length)throw Error('This ZIP has no runnable HTML entry point. Upload a built PWA or HTML export.');
 }else throw Error('Choose an HTML or ZIP file.');
 const app={id:uid(),name:file.name,files,entry:entries[0],entries,created:new Date().toISOString(),kind:'local'};
 state.apps[app.id]=app;
 if(target==='B')state.versionB=app.id;else state.currentApp=app.id;
 await persist();
 // Do not block imports indefinitely when the offline worker is missing or inactive.
 // Hosted builds without an active worker use the same local preview fallback as file://.
 record('Application loaded',file.name+' · Version '+target);
 compare=target==='B';renderPreviews();react('confirmed');notify(file.name+' loaded.');
 if(entries.length>1)showDialog('Choose application entry point','<p>Detected '+entries.length+' HTML pages. The preferred entry is selected.</p><label>Entry page<select id="entryChoice">'+entries.map(path=>'<option '+(path===app.entry?'selected':'')+'>'+escapeHTML(path)+'</option>').join('')+'</select></label><div class="dialogActions">'+actionButton('confirmEntry','Open selected page',true)+'</div><input type="hidden" id="entryAppId" value="'+app.id+'">');
}
function appForDevice(name){return state.apps[compare&&name==='phone'&&state.versionB?state.versionB:state.currentApp];}
let expandedDevice=null;
function setPreviewFullscreen(name){
 const current=expandedDevice;
 if(current){
  const previous=document.querySelector('[data-device="'+current+'"]');
  previous?.classList.remove('previewFullscreen');
  document.body.classList.remove('previewFullscreenActive');
  const previousButton=previous?.querySelector('[data-device-command="fullscreen"]');
  if(previousButton){previousButton.title='Full Screen';previousButton.setAttribute('aria-label','Full Screen '+current);previousButton.setAttribute('aria-pressed','false');}
  expandedDevice=null;
 }
 if(name&&name!==current){
  if(document.querySelector('[data-device="'+name+'"]')?.hidden)switchView(name);
  const device=document.querySelector('[data-device="'+name+'"]');
  if(!device)return;
  expandedDevice=name;device.classList.add('previewFullscreen');
  document.body.classList.add('previewFullscreenActive');
  const button=device.querySelector('[data-device-command="fullscreen"]');
  if(button){button.title='Exit Full Screen';button.setAttribute('aria-label','Exit Full Screen '+name);button.setAttribute('aria-pressed','true');}
 }
 requestAnimationFrame(fitFrames);
}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&expandedDevice){event.preventDefault();setPreviewFullscreen(null);}});
function fitFrames(){
 const area=$('#previewArea'),stageHeight=Math.max(380,$('.left').clientHeight-$('.panelHead').offsetHeight-2);
 area.style.setProperty('--preview-stage-height',stageHeight+'px');
 const style=getComputedStyle(area),devices=$$('[data-device]').filter(el=>!el.hidden),gap=parseFloat(style.columnGap)||10;
 const availableWidth=Math.max(300,area.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-gap*Math.max(0,devices.length-1));
 const height=stageHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
 const weights={desktop:.49,tablet:.30,phone:.21};
 devices.forEach(el=>{
  const name=el.dataset.device;
  const allocated=devices.length===1?availableWidth*(name==='desktop'?.95:name==='tablet'?.72:.55):availableWidth*weights[name];
  const chrome=el.querySelector('.deviceTitle').offsetHeight+el.querySelector('.deviceActions').offsetHeight+12+6;
  el.style.width=Math.floor(allocated)+'px';
  el.style.height=Math.max(180,Math.floor(height))+'px';
  el.style.setProperty('--device-controls-width',Math.floor(allocated)+'px');
 });
 for(const name of ['desktop','tablet','phone']){
  const r=state.settings.resolutions[name];const title=$('[data-device="'+name+'"] .deviceTitle');
  title.title=r.width+' × '+r.height+' · Change resolution';
  $('[data-device-zoom-select="'+name+'"]').value=state.settings.deviceZoom?.[name]||100;
 }
 for(const [name,frame] of bridgeFrames){
  const glass=frame.closest('.glass');const resolution=state.settings.resolutions[name];
  frame.style.width=resolution.width+'px';frame.style.height=resolution.height+'px';
  if(glass.clientWidth===0||glass.clientHeight===0)continue;
  const baseScale=expandedDevice===name?Math.min(glass.clientWidth/resolution.width,glass.clientHeight/resolution.height):glass.clientWidth/resolution.width;
  const scale=baseScale*state.settings.zoom/100*(state.settings.deviceZoom?.[name]||100)/100;
  const canvas=frame.parentElement;
  canvas.style.width=Math.round(resolution.width*scale)+'px';canvas.style.height=Math.round(resolution.height*scale)+'px';
  frame.style.width=resolution.width+'px';frame.style.height=resolution.height+'px';
  frame.style.transform='scale('+scale+')';
  canvas.style.marginLeft=Math.max(0,(glass.clientWidth-resolution.width*scale)/2)+'px';canvas.style.marginTop=expandedDevice===name?Math.max(0,(glass.clientHeight-resolution.height*scale)/2)+'px':'0px';frame.style.left='0px';frame.style.top='0px';
 }
}
function renderPreviews(){
 if(expandedDevice)setPreviewFullscreen(null);
 previewEpoch++;bridgeFrames.clear();
 const view=state.settings.view;
 $('#previewArea').classList.toggle('single',view!=='all');
 $$('[data-device]').forEach(el=>el.hidden=view!=='all'&&el.dataset.device!==view);
 $$('[data-view]').forEach(el=>el.classList.toggle('primary',el.dataset.view===view));
 $('#zoom').value=state.settings.zoom+'%';$('#sync').checked=state.settings.sync;
 $('#appName').textContent=state.apps[state.currentApp]?.name||'';
 for(const name of ['desktop','tablet','phone']){
 const glass=$('#'+name+'Glass');glass.replaceChildren();
 const app=appForDevice(name);if(!app)continue;
 const iframe=document.createElement('iframe');iframe.title=name+' application preview';
 const viewport=state.settings.resolutions[name];iframe.style.width=viewport.width+'px';iframe.style.height=viewport.height+'px';
 iframe.setAttribute('allow','fullscreen');
 if(app.kind==='url'){iframe.src=app.url;iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-popups');}
 else {
 iframe.dataset.appId=app.id;
 iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-popups');
 if(location.protocol==='file:'||!navigator.serviceWorker?.controller){
 loadStandaloneFrame(iframe,app).catch(error=>{notify('Preview could not load: '+error.message);record('Preview error',name+' · '+error.message);});
 }else{
 iframe.src=new URL('__apps/'+encodeURIComponent(app.id)+'/'+app.entry.split('/').map(encodeURIComponent).join('/'),location.href).href;
 }
}
 const canvas=document.createElement('div');canvas.className='viewportCanvas';canvas.append(iframe);glass.append(canvas);bridgeFrames.set(name,iframe);iframe.addEventListener('load',()=>attachPreviewScrollSync(name,iframe));
 }
 requestAnimationFrame(fitFrames);
}
window.addEventListener('message',event=>{
 const pair=[...bridgeFrames].find(([,frame])=>frame.contentWindow===event.source);if(!pair)return;
 const [device]=pair;const data=event.data;
 if(data?.type==='app-error'){notify(device+' preview: '+data.message);record('Preview error',device+' · '+data.message);}
 if(data?.type==='app-scroll'&&state.settings.sync){
 for(const [other,otherFrame] of bridgeFrames)if(other!==device&&otherFrame.dataset.appId)otherFrame.contentWindow.postMessage({type:'studio-scroll',ratio:data.ratio},'*');
 }
});
/* v1.3.28 TEST — isolated Sync Scroll implementation. No preview/UI changes. */
const syncFrameListeners=new WeakSet();
const syncSuppressed=new WeakMap();
function scrollableElements(doc){
  const root=doc.scrollingElement;
  const nested=[...doc.querySelectorAll('*')].filter(el=>
    el!==root&&el.scrollHeight>el.clientHeight+2&&
    /^(auto|scroll|overlay)$/.test(getComputedStyle(el).overflowY));
  return [root,...nested].filter(Boolean);
}
function attachPreviewScrollSync(device,frame){
  if(syncFrameListeners.has(frame))return;
  let doc;
  try{doc=frame.contentDocument;if(!doc?.documentElement)return;}catch{return;}
  syncFrameListeners.add(frame);
  let pending=null,scheduled=false;
  doc.addEventListener('scroll',event=>{
    if(!state.settings.sync||bridgeFrames.get(device)!==frame)return;
    const source=event.target===doc?doc.scrollingElement:event.target;
    if(!source||!('scrollTop' in source)||syncSuppressed.get(source))return;
    const extent=source.scrollHeight-source.clientHeight;
    if(extent<=2)return;
    pending={source,ratio:source.scrollTop/extent};
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      if(!pending||!state.settings.sync||bridgeFrames.get(device)!==frame)return;
      const {source,ratio}=pending;pending=null;
      const sourceCandidates=scrollableElements(doc);
      const index=sourceCandidates.indexOf(source);
      for(const [other,otherFrame] of bridgeFrames){
        if(other===device)continue;
        try{
          const otherDoc=otherFrame.contentDocument;
          if(!otherDoc?.documentElement)continue;
          const candidates=scrollableElements(otherDoc);
          // Match nested application scrollers by ordinal; otherwise use the primary scroll container.
          const destination=candidates[index]||candidates[0];
          if(!destination)continue;
          const max=destination.scrollHeight-destination.clientHeight;
          if(max<=2)continue;
          const next=ratio*max;
          if(Math.abs(destination.scrollTop-next)<1)continue;
          syncSuppressed.set(destination,true);
          destination.scrollTop=next;
          requestAnimationFrame(()=>syncSuppressed.delete(destination));
        }catch{/* Cross-origin content cannot be inspected by the parent page. */}
      }
    });
  },{capture:true,passive:true});
}
function switchView(view){if(expandedDevice)setPreviewFullscreen(null);state.settings.view=view;$('#previewArea').classList.toggle('single',view!=='all');$$('[data-device]').forEach(el=>el.hidden=view!=='all'&&el.dataset.device!==view);$$('[data-view]').forEach(el=>el.classList.toggle('primary',el.dataset.view===view));requestAnimationFrame(fitFrames);scheduleSave();}
// Run Tests progress is confined to the automated test workflow.
let automaticRunActive=false;
function showAutomaticProgress(){
 const overlay=document.createElement('div');overlay.id='automaticRunProgress';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
 overlay.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(3,21,44,.22);pointer-events:auto';
 overlay.innerHTML='<div style="width:min(360px,calc(100vw - 40px));padding:20px;background:#fff;border:1px solid #b7c8da;border-radius:11px;box-shadow:0 8px 28px #142e4c40;font:14px Arial,Helvetica,sans-serif;color:#050e2c"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong>Running automated tests</strong><strong id="automaticRunPercent">0%</strong></div><div role="progressbar" aria-label="Automated test progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="automaticRunBar" style="height:12px;background:#e8eef4;border-radius:7px;overflow:hidden"><div id="automaticRunFill" style="height:100%;width:0%;background:#006ee9;transition:width .12s linear"></div></div><div id="automaticRunStep" style="margin-top:10px;color:#40516a;font-size:12px">Preparing checks…</div></div>';
 document.body.appendChild(overlay);return overlay;
}
function updateAutomaticProgress(overlay,done,total,label){
 const percent=Math.min(100,Math.round(done/total*100));
 overlay.querySelector('#automaticRunPercent').textContent=percent+'%';
 overlay.querySelector('#automaticRunFill').style.width=percent+'%';
 overlay.querySelector('#automaticRunBar').setAttribute('aria-valuenow',String(percent));
 overlay.querySelector('#automaticRunStep').textContent=label;
}
const yieldAutomaticPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
// Automated report management is separate from manual test results.
let currentAutomatedReport=null;
function automaticReportText(report){
 return ['WEB APP TESTER — AUTOMATED TEST RESULTS','Application: '+report.appName,'Run: '+report.date,'Results: '+report.counts.PASS+' PASS / '+report.counts.FAIL+' FAIL / '+report.counts['NOT TESTED']+' NOT TESTED','',...report.checks.map(c=>c.device+' | '+c.name+' | '+c.status+'\n'+c.detail)].join('\n');
}
function automaticReportCSV(report){
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const lines=[['Application','Run date','Device','Check','Status','Details'],...report.checks.map(c=>[report.appName,report.date,c.device,c.name,c.status,c.detail])];
 return '\uFEFF'+lines.map(row=>row.map(q).join(',')).join('\r\n');
}
function automaticReportActions(){return '<div class="dialogActions">'+actionButton('autoCopy','Copy')+actionButton('autoSave','Save')+actionButton('autoExportJSON','Export JSON')+actionButton('autoExportCSV','Export CSV')+actionButton('autoExportTXT','Export TXT')+actionButton('autoPrint','Print / PDF')+actionButton('autoSaved','Saved reports')+'</div>';}
function showAutomatedReport(report){
 currentAutomatedReport=report;
 const esc=value=>escapeHTML(String(value));
 const rows=report.checks.map(c=>'<tr><td>'+esc(c.device)+'</td><td>'+esc(c.name)+'</td><td>'+esc(c.status)+'</td><td>'+esc(c.detail)+'</td></tr>').join('');
 showDialog('Automated test results','<p>Read-only checks: '+report.counts.PASS+' PASS · '+report.counts.FAIL+' FAIL · '+report.counts['NOT TESTED']+' NOT TESTED. These are automated observations, not manual checklist results.</p><div style="overflow:auto;max-height:55vh"><table class="resultTable"><thead><tr><th>Device</th><th>Check</th><th>Status</th><th>Details</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+automaticReportActions());
}
function showSavedAutomatedReports(){
 const reports=state.automatedReports||[];
 showDialog('Saved automated reports',reports.length?reports.slice().reverse().map(report=>'<div class="sessionItem"><span><b>'+escapeHTML(report.appName)+'</b><br><small>'+escapeHTML(new Date(report.date).toLocaleString())+' · '+report.counts.PASS+' PASS / '+report.counts.FAIL+' FAIL / '+report.counts['NOT TESTED']+' NOT TESTED</small></span><button data-auto-report="'+escapeHTML(report.id)+'">View</button></div>').join(''):'<p>No automated reports saved yet.</p>');
}
// Automated checks are read-only and never change the tested application's state.
async function runAutomaticChecks(){
 const app=state.apps[state.currentApp];
 if(!app){showDialog('Automated test results','<p>NOT TESTED — Load an application before running automated checks.</p>');return;}
 if(automaticRunActive)return;
 automaticRunActive=true;
 const progress=showAutomaticProgress();
 try{
 const checks=[];
 const add=(device,name,status,detail)=>checks.push({device,name,status,detail});
 const names=state.settings.view==='all'?['desktop','tablet','phone']:[state.settings.view];
 const total=names.length*9;let done=0;
 const step=async label=>{updateAutomaticProgress(progress,++done,total,label);await yieldAutomaticPaint();};
 await yieldAutomaticPaint();
 for(const device of names){
  const frame=bridgeFrames.get(device);
  if(!frame){add(device,'Preview availability','NOT TESTED','No active preview frame.');for(let i=0;i<9;i++)await step(device+' — preview unavailable');continue;}
  let doc;
  try{doc=frame.contentDocument;if(!doc||!doc.documentElement)throw Error('Document inaccessible');void doc.documentElement.scrollWidth;}
  catch{add(device,'Document inspection','NOT TESTED','Browser security prevents inspecting this preview.');for(let i=0;i<9;i++)await step(device+' — inspection unavailable');continue;}
  const root=doc.documentElement;
  add(device,'Document loaded',doc.readyState==='complete'?'PASS':'NOT TESTED',doc.readyState==='complete'?'Document load completed.':'Document is still loading.');
  await step(device+' — Document loaded');
  const broken=[...doc.images].filter(img=>img.complete&&img.naturalWidth===0&&Boolean(img.currentSrc||img.getAttribute('src')));
  const pending=[...doc.images].filter(img=>!img.complete);
  add(device,'Loaded image assets',broken.length?'FAIL':pending.length?'NOT TESTED':'PASS',broken.length?broken.length+' broken image(s) detected.':pending.length?pending.length+' image(s) still loading.':'No broken loaded images detected.');
  await step(device+' — Image assets');
  const viewport=doc.defaultView?.innerWidth||root.clientWidth;
  const overflow=root.scrollWidth>viewport+3;
  add(device,'Horizontal document overflow',overflow?'FAIL':'PASS',overflow?'Document width '+root.scrollWidth+'px exceeds viewport '+viewport+'px.':'No document-level horizontal overflow detected; nested panels are not assessed.');
  await step(device+' — Layout overflow');
  const forms=[...doc.forms];
  add(device,'Form validation',forms.length?'NOT TESTED':'NOT TESTED',forms.length?forms.length+' form(s) found; submitting forms or asserting business rules requires separate tests.':'No forms found; validation not applicable.');
  await step(device+' — Form validation');
  add(device,'Button behavior','NOT TESTED','Click behavior cannot be inferred without executing application-specific actions.');
  await step(device+' — Button behavior');
  add(device,'JavaScript runtime errors','NOT TESTED','Historical runtime errors cannot be reliably determined by a read-only inspection.');
  await step(device+' — Runtime errors');
  const ids=[...doc.querySelectorAll('[id]')].map(el=>el.id).filter(Boolean);
  const seen=new Set(),duplicates=new Set();
  for(const id of ids){if(seen.has(id))duplicates.add(id);else seen.add(id);}
  add(device,'Duplicate element IDs',duplicates.size?'FAIL':'PASS',duplicates.size?duplicates.size+' duplicate ID value(s): '+[...duplicates].slice(0,5).join(', ')+(duplicates.size>5?'…':''):'No duplicate nonempty element IDs detected.');
  await step(device+' — Duplicate IDs');
  // v1.3.27: audit scope is explicit; no application DOM mutations.
  const allControls=[...doc.querySelectorAll('input,select,textarea')];
  const excludedTypes=new Set(['hidden','submit','button','reset','image']);
  const excluded=allControls.filter(el=>el.tagName==='INPUT'&&excludedTypes.has((el.getAttribute('type')||'text').toLowerCase()));
  const inputs=allControls.filter(el=>!excluded.includes(el));
  const short=(value,max=80)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);
  const cssSelector=el=>{
   if(el.id)return '#'+(window.CSS?.escape?CSS.escape(el.id):el.id.replace(/[^a-zA-Z0-9_-]/g,'_'));
   const parts=[];let node=el;
   while(node&&node.nodeType===1&&parts.length<5){
    let part=node.tagName.toLowerCase();
    if(node.getAttribute('name'))part+='[name="'+node.getAttribute('name').replace(/"/g,'\\"')+'"]';
    else if(node.parentElement){const siblings=[...node.parentElement.children].filter(e=>e.tagName===node.tagName);if(siblings.length>1)part+=':nth-of-type('+([...node.parentElement.children].filter(e=>e.tagName===node.tagName).indexOf(node)+1)+')';}
    parts.unshift(part);node=node.parentElement;
   }
   return parts.join(' > ');
  };
  const controlName=el=>{
   const aria=short(el.getAttribute('aria-label'));if(aria)return {name:aria,source:'aria-label'};
   const refIds=(el.getAttribute('aria-labelledby')||'').trim().split(/\s+/).filter(Boolean);
   const refs=refIds.map(id=>doc.getElementById(id)).filter(Boolean);
   const refText=short(refs.map(e=>e.textContent).join(' '));if(refText)return {name:refText,source:'aria-labelledby'};
   const labels=el.labels?[...el.labels]:[];
   const labelText=short(labels.map(label=>label.textContent).join(' '));if(labelText)return {name:labelText,source:'HTML label'};
   const wrapping=short(el.closest('label')?.textContent);if(wrapping)return {name:wrapping,source:'wrapping label'};
   const title=short(el.getAttribute('title'));if(title)return {name:title,source:'title'};
   return null;
  };
  const describeControl=el=>{
   const section=el.closest('.card,.settings-block,.modal,.section,fieldset,[role="group"]');
   const heading=short(section?.querySelector('h1,h2,h3,h4,legend,.section-title,.setting-name')?.textContent,55);
   const previous=el.previousElementSibling;
   const nearby=short(previous?.matches('label')?previous.textContent:el.parentElement?.querySelector('label')?.textContent,55);
   const attrs=['id','name','type','placeholder'].map(a=>el.getAttribute(a)?a+'='+short(el.getAttribute(a),45):'').filter(Boolean).join(', ');
   const context=heading?'section: '+heading:nearby?'nearby text (not associated): '+nearby:'no nearby label detected';
   return cssSelector(el)+' ('+el.tagName.toLowerCase()+(attrs?', '+attrs:'')+') — '+context+' — reason: no associated label or accessible name; fix: use label[for] matching a unique id, wrap in label, or add aria-label/aria-labelledby';
  };
  const unlabeled=inputs.filter(el=>!controlName(el));
  const details=unlabeled.map((el,i)=>(i+1)+'. '+describeControl(el)).join(' | ');
  const scope='Scope: '+allControls.length+' total input/select/textarea elements; '+inputs.length+' inspected; '+excluded.length+' excluded by type ('+([...new Set(excluded.map(el=>(el.getAttribute('type')||'text').toLowerCase()))].join(', ')||'none')+'). Hidden-by-CSS controls remain included; this is a DOM audit, not a visible-only audit.';
  add(device,'Input accessible labels',unlabeled.length?'FAIL':inputs.length?'PASS':'NOT TESTED',scope+' '+(unlabeled.length?unlabeled.length+' missing accessible name(s). Affected controls: '+details:inputs.length?'All inspected controls have detectable accessible names.':'No applicable controls.'));
  await step(device+' — Input labels');
  const links=[...doc.querySelectorAll('a[href]')];
  const emptyLinks=links.filter(el=>!el.textContent?.trim()&&!el.getAttribute('aria-label')?.trim()&&!el.getAttribute('aria-labelledby')?.trim()&&!el.getAttribute('title')?.trim()&&!el.querySelector('img[alt]:not([alt=""])'));
  add(device,'Link accessible names',emptyLinks.length?'FAIL':links.length?'PASS':'NOT TESTED',emptyLinks.length?emptyLinks.length+' of '+links.length+' links have no detectable accessible name.':links.length?'All '+links.length+' links have detectable names.':'No links to inspect.');
  await step(device+' — Link names');
 }
 const counts={PASS:0,FAIL:0,'NOT TESTED':0};checks.forEach(c=>counts[c.status]++);
 const report={id:uid(),appName:app.name||'Unnamed application',appId:state.currentApp,date:new Date().toISOString(),counts,checks};
 updateAutomaticProgress(progress,total,total,'Complete');
 await yieldAutomaticPaint();
 progress.remove();
 showAutomatedReport(report);
 }finally{progress.remove();automaticRunActive=false;}
}
function resultsTable(tests=state.tests,notes=state.notes){
 return '<table class="resultTable"><thead><tr><th>Manual test</th><th>Status</th></tr></thead><tbody>'+tests.map(test=>'<tr><td>'+escapeHTML(test.name)+'</td><td>'+test.status+'</td></tr>').join('')+'</tbody></table><h3>Notes / Reproduction Steps</h3><p style="white-space:pre-wrap">'+escapeHTML(notes||'No notes recorded.')+'</p>';
}
function download(name,data,type='application/json'){
 const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function sessionSnapshot(name,id){
 return {id:id||uid(),name,date:new Date().toISOString(),tests:structuredClone(state.tests),notes:state.notes,settings:structuredClone(state.settings),currentApp:state.currentApp,versionB:state.versionB};
}
function restoreSession(session){
 undoHistory.length=0;redoHistory.length=0;refreshUndoButtons();state.tests=structuredClone(session.tests);state.notes=session.notes;state.settings={...defaultSettings(),...session.settings,resolutions:{...defaultSettings().resolutions,...session.settings.resolutions}};state.currentApp=session.currentApp;state.versionB=session.versionB;state.selectedSession=session.id;
 tab='test';compare=false;renderAll();record('Session restored',session.name);persist();
}
function updateProjectPicker(){
 $('#project').innerHTML='<option value="">Select or Create Project</option>'+state.sessions.map(session=>'<option value="'+session.id+'">'+escapeHTML(session.name)+'</option>').join('')+'<option value="__new">＋ Create New Project</option>';
 $('#project').value=state.selectedSession||'';
}
function renderAll(){updateProjectPicker();renderRight();renderGuide();renderPreviews();}
async function exportBackup(){
 await persist();const copy=structuredClone(state);copy.apps={};
 for(const app of Object.values(state.apps)){
 copy.apps[app.id]={...app,files:[]};
 for(const file of app.files||[]){
 const bytes=new Uint8Array(await file.blob.arrayBuffer());let binary='';
 for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
 copy.apps[app.id].files.push({path:file.path,type:file.blob.type,base64:btoa(binary)});
 }
 }
 copy.evidence=[];
 for(const evidence of state.evidence){copy.evidence.push({...evidence,data:await blobDataURL(evidence.blob),blob:undefined});}
 download('Testing_Studio_Backup_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({format:'mc2-studio-backup',version:1,state:copy}));
 record('Backup exported','Complete workspace, sessions and application assets');
 notify('Backup downloaded.');
}
function blobDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
async function restoreBackup(file){
 const parsed=JSON.parse(await file.text());
 if(parsed.format!=='mc2-studio-backup'||parsed.version!==1||!parsed.state||!Array.isArray(parsed.state.tests)||!parsed.state.apps||!Array.isArray(parsed.state.sessions))throw Error('This is not a valid Testing Studio MC II backup.');
 const incoming=parsed.state;
 for(const app of Object.values(incoming.apps)){
 app.files=(app.files||[]).map(file=>{
 if(!file.path||typeof file.base64!=='string')throw Error('Backup asset data is incomplete.');
 const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
 return {path:normalizePath(file.path),blob:new Blob([bytes],{type:file.type||mime(file.path)})};
 });
 }
 incoming.evidence=await Promise.all((incoming.evidence||[]).map(async evidence=>({...evidence,blob:await (await fetch(evidence.data)).blob(),data:undefined})));
 for(const test of incoming.tests)if(!test.id||!test.name||!['PASS','FAIL','SKIP','TEST'].includes(test.status))throw Error('Backup test records are invalid.');
 const old=state;
 state={...state,...incoming,settings:{...defaultSettings(),...incoming.settings,resolutions:{...defaultSettings().resolutions,...incoming.settings?.resolutions}}};
 try{await persist();renderAll();record('Backup restored',file.name);notify('Restoration Completed Successfully — Your workspace data has been restored.',2000);}catch(error){state=old;throw error;}
}
async function captureWorkspace(){
 if(!navigator.mediaDevices?.getDisplayMedia)throw Error('Screen capture is unavailable in this browser. Use Evidence → Attach screenshot.');
 const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
 try{
 const video=document.createElement('video');video.srcObject=stream;await video.play();
 const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
 canvas.getContext('2d').drawImage(video,0,0);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('The screenshot could not be created.');
 checkpointEdit();state.evidence.push({id:uid(),name:'Workspace '+new Date().toLocaleString(),date:new Date().toISOString(),blob});
 await persist();record('Evidence captured','Workspace screenshot');showGallery();
 }finally{stream.getTracks().forEach(track=>track.stop());}
}
const evidenceURLs=[];
function clearEvidenceURLs(){for(const url of evidenceURLs)URL.revokeObjectURL(url);evidenceURLs.length=0;}
function showGallery(){
 clearEvidenceURLs();
 showDialog('Evidence gallery',state.evidence.length?state.evidence.map(item=>{
 const url=URL.createObjectURL(item.blob);evidenceURLs.push(url);
 return '<section><h3>'+escapeHTML(item.name)+'</h3><img class="evidenceImg" src="'+url+'" alt="'+escapeHTML(item.name)+'"><div class="dialogActions"><button data-evidence-download="'+item.id+'">Download image</button><button data-evidence-remove="'+item.id+'">Remove</button></div></section>';
 }).join(''):'<p>No evidence yet. Capture the workspace or attach a screenshot.</p>');
}
async function handleAction(action){
 closeMenu();
 if(action==='local'||action==='loadB'){importTarget=action==='loadB'?'B':'A';$('#appFile').value='';$('#appFile').click();return;}
 switch(action){
 case 'workspace':$$('.sideNav').forEach(el=>el.classList.toggle('active',el.dataset.action==='workspace'));tab='test';renderRight();break;
 case 'historyPanel':$$('.sideNav').forEach(el=>el.classList.toggle('active',el.dataset.action==='historyPanel'));tab='history';renderRight();break;
 case 'projects':$$('.sideNav').forEach(el=>el.classList.toggle('active',el.dataset.action==='projects'));handleAction('restoreSession');break;
 case 'testPlan':showDialog('Test Plan','<p>Choose a manual check to begin. Results are recorded only from your observations.</p>'+guideSteps.map((step,i)=>'<div class="sessionItem"><span>'+escapeHTML(step[3])+'</span><button data-run-step="'+i+'">Start</button></div>').join(''));break;
 case 'reload':renderPreviews();record('Previews reloaded',state.apps[state.currentApp]?.name||'No application');react('confirmed');notify('Previews reloaded.');break;
 case 'urlDialog':showDialog('Load website URL','<p>The website must permit embedding. Browser security can prevent some websites from appearing in a frame.</p><label>Website URL<input id="websiteURL" type="url" placeholder="https://example.com"></label><div class="dialogActions">'+actionButton('confirmURL','Load URL',true)+'</div>');break;
 case 'confirmURL':{
 const input=$('#websiteURL');let url;try{url=new URL(input.value);if(!['http:','https:'].includes(url.protocol))throw Error();if(location.protocol==='https:'&&url.protocol==='http:')throw Error();}catch{input.setCustomValidity('Enter a valid HTTPS URL.');input.reportValidity();return;}
 const app={id:uid(),kind:'url',url:url.href,name:url.hostname,files:[],created:new Date().toISOString()};state.apps[app.id]=app;state.currentApp=app.id;$('dialog').close();renderPreviews();record('Website loaded',url.href);persist();break;
 }
 case 'savedApps':showDialog('Previously loaded applications',Object.values(state.apps).length?Object.values(state.apps).map(app=>'<div class="sessionItem"><span>'+escapeHTML(app.name)+'</span><button data-load-app="'+app.id+'">Open</button></div>').join(''):'<p>No imported applications yet.</p>');break;
 case 'confirmEntry':{const app=state.apps[$('#entryAppId').value];app.entry=$('#entryChoice').value;$('dialog').close();renderPreviews();persist();break;}
 case 'toggleCompare':if(!state.versionB){notify('Load Version B from Compare first.');return;}compare=!compare;state.settings.view='all';renderPreviews();notify(compare?'A on desktop/tablet · B on mobile':'All previews show Version A');break;
 case 'clearB':state.versionB=null;compare=false;renderPreviews();persist();notify('Version B removed from comparison.');break;
 case 'togglePanel':state.settings.panelCollapsed=!state.settings.panelCollapsed;renderPanelCollapse();persist();requestAnimationFrame(fitFrames);break;
 case 'focus':document.body.classList.toggle('focus');requestAnimationFrame(fitFrames);break;
 case 'run':await runAutomaticChecks();break;
 case 'addTest':showDialog('Add manual test','<form id="addTestForm"><label>Test name<input id="testName" required maxlength="120"></label><label>Category<select id="testCategory">'+testCategories.map(category=>'<option>'+category+'</option>').join('')+'</select></label><div class="dialogActions"><button class="primary" type="submit">Add Test</button></div></form>');break;
 case 'allGuideTests':checkpointEdit();guideSteps.forEach((step,i)=>{if(!state.tests.some(test=>test.id==='guide-'+i))state.tests.push({id:'guide-'+i,name:step[3],status:'TEST',notes:''});});renderRight();persist();break;
 case 'resetAll':showDialog('Reset test statuses','<p>Reset all manual statuses to TEST? Your notes and history are retained.</p><div class="dialogActions">'+actionButton('confirmReset','Reset statuses',true)+'</div>');break;
 case 'confirmReset':checkpointEdit();state.tests.forEach(test=>test.status='TEST');$('dialog').close();record('Tests reset','All statuses set to TEST');renderRight();renderGuide();persist();break;
 case 'saveSession':showDialog('Save session','<form id="saveSessionForm"><label>Session name<input id="sessionName" required maxlength="100" value="'+escapeHTML(state.sessions.find(session=>session.id===state.selectedSession)?.name||state.apps[state.currentApp]?.name||'Testing session')+'"></label><p class="muted">Saving the selected session updates that record.</p><div class="dialogActions"><button type="submit" class="primary">Save Session</button></div></form>');break;
 case 'restoreSession':showDialog('Saved sessions',state.sessions.length?state.sessions.map(session=>'<div class="sessionItem"><span><b>'+escapeHTML(session.name)+'</b><br><small>'+new Date(session.date).toLocaleString()+'</small></span><button data-restore-session="'+session.id+'">Restore</button><button data-delete-session="'+session.id+'">Delete</button></div>').join(''):'<p>No named sessions saved. Use Sessions → Save session.</p>');break;
 case 'backup':await exportBackup();break;
 case 'restoreBackup':$('#backupFile').value='';$('#backupFile').click();break;
 case 'newSession':showDialog('New testing session','<p>Start a new checklist and clear current notes? Named saved sessions remain available.</p><div class="dialogActions">'+actionButton('confirmNew','Start new session',true)+'</div>');break;
 case 'confirmNew':undoHistory.length=0;redoHistory.length=0;refreshUndoButtons();state.tests=defaultTests();state.notes='';state.currentApp=null;state.versionB=null;state.selectedSession=null;state.settings.step=0;compare=false;$('dialog').close();renderAll();persist();break;
 case 'undo':applyUndoRedo('undo');break;
 case 'redo':applyUndoRedo('redo');break;
 case 'autoCopy':{
 if(!currentAutomatedReport)break;
 const content=automaticReportText(currentAutomatedReport);
 try{await navigator.clipboard.writeText(content);notify('Automated report copied.');}
 catch{showDialog('Copy automated report','<textarea readonly>'+escapeHTML(content)+'</textarea>');}break;
 }
 case 'autoSave':{
 if(!currentAutomatedReport)break;
 state.automatedReports=state.automatedReports||[];
 if(!state.automatedReports.some(report=>report.id===currentAutomatedReport.id))state.automatedReports.push(structuredClone(currentAutomatedReport));
 await persist();notify('Automated report saved.');break;
 }
 case 'autoSaved':showSavedAutomatedReports();break;
 case 'autoExportJSON':case 'autoExportCSV':case 'autoExportTXT':{
 if(!currentAutomatedReport)break;
 const ext=action==='autoExportJSON'?'json':action==='autoExportCSV'?'csv':'txt';
 const content=ext==='json'?JSON.stringify(currentAutomatedReport,null,2):ext==='csv'?automaticReportCSV(currentAutomatedReport):automaticReportText(currentAutomatedReport);
 download('Automated_Test_Results_'+currentAutomatedReport.date.replace(/[:.]/g,'-')+'.'+ext,content,ext==='json'?'application/json':ext==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8');break;
 }
 case 'autoPrint':{
 if(!currentAutomatedReport)break;
 // Print the current automated results, not the manual results screen.
 showAutomatedReport(currentAutomatedReport);
 requestAnimationFrame(()=>window.print());break;
 }
 case 'results':showDialog('Manual test results',resultsTable()+'<div class="dialogActions">'+actionButton('copyResults','Copy results')+actionButton('print','Print / Save PDF',true)+'</div>');break;
 case 'exportJSON':download('Testing_Results.json',JSON.stringify({app:state.apps[state.currentApp]?.name||'',date:new Date().toISOString(),tests:state.tests,notes:state.notes},null,2));record('Results exported','JSON');break;
 case 'exportCSV':{
 const q=value=>'"'+String(value).replace(/"/g,'""')+'"';
 const rows=[['Test','Status'],...state.tests.map(test=>[test.name,test.status]),['Notes',state.notes]];
 download('Testing_Results.csv','\uFEFF'+rows.map(row=>row.map(q).join(',')).join('\r\n'),'text/csv;charset=utf-8');record('Results exported','CSV');break;
 }
 case 'copyResults':{
 const text=state.tests.map(test=>test.name+': '+test.status).join('\n')+'\n\nNotes\n'+state.notes;
 try{await navigator.clipboard.writeText(text);notify('Results copied.');}catch{showDialog('Copy results','<textarea readonly>'+escapeHTML(text)+'</textarea>');}break;
 }
 case 'print':showDialog('Manual test results',resultsTable());requestAnimationFrame(()=>window.print());break;
 case 'capture':await captureWorkspace();break;
 case 'attachEvidence':$('#evidenceFile').value='';$('#evidenceFile').click();break;
 case 'gallery':showGallery();break;
 case 'previous':case 'next':state.settings.step=Math.max(0,Math.min(11,state.settings.step+(action==='next'?1:-1)));renderGuide();react(action==='next'?'complete':'welcome');persist();break;
 case 'take':{
 const index=state.settings.step;
 if(index===1)switchView('desktop');if(index===2)switchView('tablet');if(index===3)switchView('phone');
 if(index===10){tab='test';renderRight();}
 const target=$(guideSteps[index][2]);if(!target)break;target.classList.add('highlight');target.focus?.();react('locate');clearTimeout(highlightTimer);highlightTimer=setTimeout(()=>{target.classList.remove('highlight');react('found');},1800);break;
 }
 case 'assistant':state.settings.guide=!state.settings.guide;renderGuide();persist();requestAnimationFrame(fitFrames);break;
 case 'minimize':state.settings.minimized=!state.settings.minimized;renderGuide();persist();requestAnimationFrame(fitFrames);break;
 case 'plus':case 'minus':{
 const values=[50,75,100,125,150,200],index=values.indexOf(state.settings.zoom);state.settings.zoom=values[Math.max(0,Math.min(values.length-1,index+(action==='plus'?1:-1)))];$('#zoom').value=state.settings.zoom+'%';fitFrames();persist();break;
 }
 case 'settings':showDialog('Settings','<form id="settingsForm"><div class="settingsWorkspace"><nav class="settingsSideNav" aria-label="Settings sections">'+settingsNavMarkup()+'</nav><div class="settingsContent"><section class="settingsSection" data-settings-section="display"><header class="settingsSectionHeader"><strong>Display / Screen Resolutions</strong><span>Set the device, resolution, and viewport size for testing.</span></header>'+'<div class="settingsDevicePicker" role="tablist" aria-label="Resolution device">'+['desktop','tablet','phone'].map((name,index)=>'<button type="button" role="tab" class="settingsDeviceChoice'+(index===0?' active':'')+'" aria-selected="'+(index===0?'true':'false')+'" data-settings-device="'+name+'"><img class="settingsDevicePicture" src="'+({desktop:'data:image/png;base64,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',tablet:'data:image/png;base64,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',phone:'data:image/png;base64,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'})[name]+'" alt=""><span>'+(name==='phone'?'Mobile':name[0].toUpperCase()+name.slice(1))+'</span></button>').join('')+'</div><div class="settingsResolutionPanels">'+['desktop','tablet','phone'].map((name,index)=>'<section class="settingsResolutionPanel" data-resolution-group data-settings-panel="'+name+'" '+(index?'hidden':'')+'><div class="settingsResolutionTitle"><strong>'+(name==='phone'?'Mobile':name[0].toUpperCase()+name.slice(1))+' Resolution</strong><span>Selected: <b data-selected-resolution></b></span></div>'+settingsModelPicker(name)+'<div class="settingsResolutionContent"><div class="settingsPresetList" role="radiogroup" aria-label="'+name+' resolution presets">'+settingsResolutionPresets(name,state.settings.resolutions[name].width,state.settings.resolutions[name].height)+'</div><div class="settingsCustomResolution"><strong>Custom Resolution</strong><div class="settingsDimensions"><label>Width<input data-resolution-width name="'+name+'Width" type="number" min="240" max="7680" required value="'+state.settings.resolutions[name].width+'"></label><span>×</span><label>Height<input data-resolution-height name="'+name+'Height" type="number" min="240" max="7680" required value="'+state.settings.resolutions[name].height+'"></label></div><button type="button" data-settings-custom="'+name+'">Apply Custom</button><button type="button" data-reset-device="'+name+'">Reset to Default</button></div></div></section>').join('')+'</div><label class="settingsViewRow">Device view<select name="view">'+[['all','3 Screens'],['desktop','Desktop'],['tablet','Tablet'],['phone','Mobile']].map(([value,label])=>'<option value="'+value+'" '+(state.settings.view===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label></section><section class="settingsSection" data-settings-section="mode" hidden><header class="settingsSectionHeader"><strong>Application Mode</strong><span>Choose local or hosted operation.</span></header><div class="settingsPanels"><fieldset><legend>Application Mode</legend><label>Run mode<select name="applicationMode"><option value="local" '+(state.settings.applicationMode!=='hosted'?'selected':'')+'>Local (offline workspace)</option><option value="hosted" '+(state.settings.applicationMode==='hosted'?'selected':'')+'>Hosted (online workspace)</option></select></label><label>Hosted application URL<input name="hostedAppURL" type="url" placeholder="https://your-app.example/" value="'+escapeHTML(state.settings.hostedAppURL||'')+'"></label><p class="muted">This preference does not move an installed PWA or copy browser storage. Local data stays on this installation. Use Backup/Restore to transfer data between installations.</p><button type="button" data-action="openHostedApp">Open Hosted App</button><button type="button" data-action="localUpdateInfo">Local Update Information</button></fieldset></div></section><section class="settingsSection" data-settings-section="cloud" hidden><header class="settingsSectionHeader"><strong>Cloud Services</strong><span>Configure independent cloud preferences.</span></header><div class="settingsPanels"><fieldset><legend>Cloud Services</legend><label class="settingsToggleRow"><span>Cloud Database</span><input class="settingsSwitch" type="checkbox" role="switch" aria-label="Cloud Database" name="cloudDatabaseEnabled" '+(state.settings.cloudDatabaseEnabled?'checked':'')+'></label><label class="settingsToggleRow"><span>User Accounts</span><input class="settingsSwitch" type="checkbox" role="switch" aria-label="User Accounts" name="userAccountsEnabled" '+(state.settings.userAccountsEnabled?'checked':'')+'></label><label class="settingsToggleRow"><span>Cloud Synchronization</span><input class="settingsSwitch" type="checkbox" role="switch" aria-label="Cloud Synchronization" name="cloudSyncEnabled" '+(state.settings.cloudSyncEnabled?'checked':'')+'></label><p class="muted">Preferences only. Cloud services are not connected until a provider is configured. Local storage and backups remain active.</p></fieldset></div></section><section class="settingsSection" data-settings-section="updates" hidden><header class="settingsSectionHeader"><strong>Application Updates</strong><span>Review available updates and local installation information.</span></header><div class="settingsUpdateControls"><button type="button" data-action="updates">Check for Updates</button><button type="button" data-action="localUpdateInfo">Local Update Information</button><button type="button" data-action="localUpdateBrowse">Browse Update ZIP</button><button type="button" data-action="pwaDeploymentStatus">PWA Deployment Status</button><button type="button" data-action="pwaCheckUpdate">Check PWA Update</button><button type="button" data-action="localUpdateBackup">Download Recovery Backup</button><button type="button" data-action="localUpdateRestore">Restore Recovery Backup</button></div><div id="localUpdateStatus" role="status" aria-live="polite">No local update package selected.</div><input type="file" id="localUpdateFile" accept=".zip,application/zip" hidden></section></div></div><div class="dialogActions"><button type="button" data-settings-cancel>Cancel</button><button type="submit" class="primary">Apply & Save</button></div></form>');document.querySelectorAll('#settingsForm [data-resolution-group]').forEach(bindSettingsResolutionFields);break;
 case 'help':showDialog('Using Web App Tester','<ol><li>Load App → choose standalone HTML, a built ZIP/PWA, or a website URL.</li><li>Inspect all three previews. Settings controls exact viewport sizes. The four preview buttons select 3 Preview, Desktop, Tablet, and Mobile.</li><li>Use the guide and checklist to mark real manual observations.</li><li>Add notes, capture evidence, and export results.</li><li>Save sessions and download backups to preserve imported app files and records.</li></ol><p>Local imports run in browser frames with app-specific local storage. Open applications you trust. Website embedding depends on that site’s policy. A source ZIP needs its compiled HTML build before it can run.</p><p>Single HTML that references companion files requires its complete ZIP. The studio can be installed as a PWA from supported browsers.</p>');break;
 case 'openHostedApp':{const input=document.querySelector('#settingsForm [name=hostedAppURL]');const value=(input?.value||state.settings.hostedAppURL||'').trim();try{const url=new URL(value);if(url.protocol!=='https:'&&!(url.hostname==='localhost'&&url.protocol==='http:'))throw Error('Use an HTTPS URL.');window.open(url.href,'_blank','noopener,noreferrer');}catch(error){notify('Enter a valid hosted HTTPS address first.');}break;}
 case 'pwaDeploymentStatus':await showPwaDeploymentStatus();break;
 case 'pwaCheckUpdate':await checkHostedPwaUpdate();break;
 case 'pwaActivateUpdate':await activateHostedPwaUpdate();break;
 case 'localUpdateBackup':await exportBackup();break;
 case 'localUpdateRestore':{const picker=$('#backupFile');picker.value='';picker.click();break;}
 case 'confirmLocalRecoveryRestore':{if(!pendingLocalRecoveryFile)break;const file=pendingLocalRecoveryFile;pendingLocalRecoveryFile=null;$('dialog').close();try{await restoreBackup(file);}catch(error){notify('Backup restore failed: '+error.message);}break;}
 case 'cancelLocalRecoveryRestore':{pendingLocalRecoveryFile=null;$('dialog').close();break;}
 case 'localUpdateBrowse':{const picker=document.querySelector('#localUpdateFile');if(picker){picker.value='';picker.click();}break;}
 case 'localUpdateInfo':showDialog('Manual Local Updates','<p>This PWA can run offline after a successful installation. Importing an update ZIP cannot overwrite a ChatGPT-hosted PWA or change its origin.</p><p>To update a locally controlled installation, publish the new PWA files to the same localhost origin and reload. Keep a backup before updating. A future signed package updater would require a dedicated service-worker installation architecture.</p><p>Your existing Check for Updates remains unchanged.</p>');break;
 case 'updates':await checkForUpdates();break;
 case 'updateHistory':showUpdateHistory();break;
 case 'updatesSource':configureUpdateSource();break;
 case 'saveUpdateSource':saveUpdateSource();break;
 case 'reloadStudio':await persist();location.reload();break;
 case 'whatsnew':showDialog("What's New",'<p>MC II '+VERSION+'</p><ul><li>Real local HTML and built ZIP/PWA loading.</li><li>Independent, resolution-accurate device previews.</li><li>Unified guide, manual test statuses, notes, and history.</li><li>Persistent named sessions and portable complete backups.</li><li>A/B app comparison, evidence attachment/capture, and JSON/CSV/print exports.</li></ul>');break;
 case 'notifications':showDialog('Notifications','<p>'+state.history.length+' activity records · '+state.sessions.length+' saved sessions · '+state.evidence.length+' evidence images.</p>'+state.history.slice(0,5).map(entry=>'<p><b>'+escapeHTML(entry.type)+'</b><br>'+escapeHTML(entry.detail)+'</p>').join(''));break;
 case 'about':showDialog('Web App Tester','<p>'+VERSION+'</p><p>Manual application testing workspace. Results reflect your recorded observations.</p><div class="dialogActions">'+actionButton('updateHistory','New Updates')+actionButton('updates','Check for Updates',true)+'</div>');break;
 case 'close':$('dialog').close();clearEvidenceURLs();break;
 }
}

// Resolution presets and linked custom dimensions; scoped to resolution forms only.
const RESOLUTION_PRESETS=[['854x480','480p (SD) — 854 × 480'],['1280x720','720p (HD) — 1280 × 720'],['1920x1080','1080p (FHD) — 1920 × 1080'],['2560x1440','1440p (QHD) — 2560 × 1440'],['3840x2160','4K UHD — 3840 × 2160'],['5120x2880','5K — 5120 × 2880'],['7680x4320','8K UHD — 7680 × 4320']];
// CSS viewport presets (portrait orientation); device-specific values are not physical screen pixels.
const SETTINGS_DEVICE_MODELS={
 tablet:[['','Choose a popular tablet'],['ipad-10','Apple iPad (10th gen) — 820 × 1180',820,1180],['ipad-air','Apple iPad Air 11-inch — 820 × 1180',820,1180],['ipad-pro','Apple iPad Pro 11-inch — 834 × 1194',834,1194],['ipad-mini','Apple iPad mini — 744 × 1133',744,1133],['galaxy-tab-s9','Samsung Galaxy Tab S9 — 800 × 1280',800,1280],['galaxy-tab-s9-plus','Samsung Galaxy Tab S9+ — 876 × 1400',876,1400],['pixel-tablet','Google Pixel Tablet — 800 × 1280',800,1280],['surface-pro','Microsoft Surface Pro (tablet viewport) — 960 × 1440',960,1440]],
 phone:[['','Choose a popular mobile'],['iphone-15','Apple iPhone 15 — 393 × 852',393,852],['iphone-15-pro-max','Apple iPhone 15 Pro Max — 430 × 932',430,932],['iphone-16','Apple iPhone 16 — 393 × 852',393,852],['iphone-16-pro','Apple iPhone 16 Pro — 402 × 874',402,874],['iphone-16-pro-max','Apple iPhone 16 Pro Max — 440 × 956',440,956],['iphone-se','Apple iPhone SE (3rd gen) — 375 × 667',375,667],['galaxy-s24','Samsung Galaxy S24 — 360 × 780',360,780],['galaxy-s24-ultra','Samsung Galaxy S24 Ultra — 384 × 824',384,824],['pixel-9','Google Pixel 9 — 412 × 915',412,915],['pixel-9-pro-xl','Google Pixel 9 Pro XL — 448 × 998',448,998]]
};
function settingsModelPicker(name){
 if(!SETTINGS_DEVICE_MODELS[name])return '';
 return '<label class="settingsModelPicker">Popular '+(name==='tablet'?'tablets':'mobile devices')+'<select data-settings-model="'+name+'">'+SETTINGS_DEVICE_MODELS[name].map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join('')+'</select></label><p class="settingsModelNote">CSS viewport dimensions (portrait); actual device viewport can vary with browser and display settings.</p>';
}
function settingsNavMarkup(){
 const svg=(paths)=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';
 const icons={
 display:svg('<rect x="2" y="3" width="20" height="15" rx="1"/><path d="M8 22h8M12 18v4"/>'),
 mode:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>'),
 cloud:svg('<path d="M20 17a4 4 0 0 0-2.6-7.5A6 6 0 0 0 6 10a3.5 3.5 0 0 0 .5 7H20Z"/>'),
 updates:svg('<path d="M3 11a9 9 0 1 1 2.4 6.1M3 4v7h7"/>')
 };
 return [['display','Display / Screen Resolutions'],['mode','Application Mode'],['cloud','Cloud Services'],['updates','Application Updates']].map(([key,label],i)=>'<button type="button" class="settingsNavItem'+(i===0?' active':'')+'" data-settings-nav="'+key+'" aria-current="'+(i===0?'page':'false')+'"><span class="settingsNavIcon" aria-hidden="true">'+icons[key]+'</span><span>'+label+'</span></button>').join('');
}
function settingsResolutionPresets(name,width,height){
 const current=width+'x'+height;
 const choices=name==='desktop'?[['1440x900','1440 × 900 (Default)'],['1920x1080','1920 × 1080'],['1366x768','1366 × 768'],['1280x800','1280 × 800'],['2560x1440','2560 × 1440'],['3840x2160','3840 × 2160']]:name==='tablet'?[['768x1024','768 × 1024 (Default)'],['1280x800','1280 × 800'],['1200x720','1200 × 720'],['1152x720','1152 × 720'],['1024x768','1024 × 768'],['1024x640','1024 × 640'],['800x600','800 × 600']]:[['390x844','390 × 844 (Default)'],['375x812','375 × 812'],['393x852','393 × 852'],['360x800','360 × 800'],['412x915','412 × 915'],['430x932','430 × 932']];
 return choices.map(([value,label])=>'<label class="settingsPresetOption"><input type="radio" name="settingsPreset_'+name+'" value="'+value+'" '+(current===value?'checked':'')+'><span>'+label+'</span></label>').join('');
}
function bindSettingsResolutionFields(group){
 const width=group.querySelector('[data-resolution-width]'),height=group.querySelector('[data-resolution-height]');
 const update=()=>{group.querySelector('[data-selected-resolution]').textContent=width.value+' × '+height.value;};
 const model=group.querySelector('[data-settings-model]');
 if(model)model.addEventListener('change',()=>{
  const choice=SETTINGS_DEVICE_MODELS[model.dataset.settingsModel].find(item=>item[0]===model.value);
  if(!choice||!choice[2])return;
  width.value=choice[2];height.value=choice[3];
  group.querySelectorAll('input[type=radio]').forEach(r=>r.checked=r.value===width.value+'x'+height.value);
  update();
 });
 group.querySelectorAll('input[type=radio]').forEach(radio=>radio.addEventListener('change',()=>{
  if(!radio.checked)return;
  const [w,h]=radio.value.split('x').map(Number);width.value=w;height.value=h;if(model)model.value='';update();
 }));
 for(const input of [width,height])input.addEventListener('input',()=>{
  group.querySelectorAll('input[type=radio]').forEach(r=>r.checked=r.value===width.value+'x'+height.value);
  if(model)model.value='';update();
 });
 update();
}
document.addEventListener('click',event=>{
 const settingsNav=event.target.closest('[data-settings-nav]');
 if(settingsNav&&settingsNav.closest('#settingsForm')){
  const form=settingsNav.closest('#settingsForm');
  const key=settingsNav.dataset.settingsNav;
  form.querySelectorAll('[data-settings-nav]').forEach(el=>{const active=el===settingsNav;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'page':'false');});
  form.querySelectorAll('[data-settings-section]').forEach(el=>{el.hidden=el.dataset.settingsSection!==key;});
 }
 const tab=event.target.closest('[data-settings-device]');
 if(tab&&tab.closest('#settingsForm')){
  const form=tab.closest('#settingsForm');
  form.querySelectorAll('[data-settings-device]').forEach(el=>{const active=el===tab;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));});
  form.querySelectorAll('[data-settings-panel]').forEach(el=>{el.hidden=el.dataset.settingsPanel!==tab.dataset.settingsDevice;});
 }
 const custom=event.target.closest('[data-settings-custom]');
 if(custom){const group=custom.closest('[data-resolution-group]');if(!group)return;
  const w=group.querySelector('[data-resolution-width]'),h=group.querySelector('[data-resolution-height]');
  if(!w.reportValidity()||!h.reportValidity())return;
  group.querySelectorAll('input[type=radio]').forEach(r=>r.checked=r.value===w.value+'x'+h.value);
  group.querySelector('[data-selected-resolution]').textContent=w.value+' × '+h.value;
  notify('Custom resolution ready. Choose Apply & Save to save changes.');
 }
 if(event.target.closest('[data-settings-cancel]'))document.querySelector('dialog')?.close();
});
function resolutionPresetMarkup(width,height){
 const current=width+'x'+height;
 return '<label>Resolution<select data-resolution-preset><option value="custom">Custom resolution</option>'+RESOLUTION_PRESETS.map(([value,label])=>'<option value="'+value+'" '+(current===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>';
}
function bindResolutionFields(container){
 if(!container)return;
 const select=container.querySelector('[data-resolution-preset]');
 const width=container.querySelector('[data-resolution-width]');
 const height=container.querySelector('[data-resolution-height]');
 if(!select||!width||!height)return;
 let ratio=16/9;
 const selected=RESOLUTION_PRESETS.find(([value])=>value===select.value);
 if(selected){const [w,h]=selected[0].split('x').map(Number);ratio=w/h;}
 else if(+width.value>0&&+height.value>0)ratio=(+width.value)/(+height.value);
 select.addEventListener('change',()=>{
  if(select.value==='custom')return;
  const [w,h]=select.value.split('x').map(Number);ratio=w/h;width.value=w;height.value=h;
 });
 for(const [input,other,isWidth] of [[width,height,true],[height,width,false]]){
  input.addEventListener('input',()=>{
   select.value='custom';
   const n=Number(input.value);
   if(!Number.isFinite(n)||n<=0)return;
   other.value=Math.max(240,Math.min(7680,Math.round(isWidth?n/ratio:n*ratio)));
  });
 }
}
document.addEventListener('change',event=>{
 if(event.target.matches('[data-resolution-preset]'))return;
});
function handleDeviceCommand(action,name){
 const label=name==='phone'?'Mobile':name[0].toUpperCase()+name.slice(1);
 const r=state.settings.resolutions[name];
 if(action==='fullscreen'){setPreviewFullscreen(name);return;}
 if(action==='focus'){switchView(state.settings.view===name?'all':name);return;}
 if(action==='rotate'){state.settings.rotations={...state.settings.rotations,[name]:!state.settings.rotations?.[name]};state.settings.resolutions[name]={width:r.height,height:r.width};fitFrames();persist();}
 if(action==='plus'||action==='minus'){const value=state.settings.deviceZoom?.[name]||100;state.settings.deviceZoom={...state.settings.deviceZoom,[name]:Math.min(200,Math.max(50,value+(action==='plus'?5:-5)))};fitFrames();persist();}
 if(action==='reload'){const frame=bridgeFrames.get(name);if(frame){if(frame.hasAttribute('srcdoc'))frame.srcdoc=frame.srcdoc;else frame.src=frame.src;notify(label+' reloaded.');}else notify('Load an application first.');}
 if(action==='resolution'){showDialog(label+' resolution','<form id="deviceResolutionForm"><input name="device" type="hidden" value="'+name+'">'+resolutionPresetMarkup(r.width,r.height)+'<label>Width<input data-resolution-width name="width" type="number" min="240" max="7680" required value="'+r.width+'"></label><label>Height<input data-resolution-height name="height" type="number" min="240" max="7680" required value="'+r.height+'"></label><div class="dialogActions"><button type="button" data-reset-device="'+name+'">Reset to default</button><button class="primary" type="submit">Apply resolution</button></div></form>');bindResolutionFields(document.getElementById('deviceResolutionForm'));}
}
document.addEventListener('click',event=>{const reset=event.target.closest('[data-reset-device]');if(!reset)return;const defaults=DEFAULT_DEVICE_RESOLUTIONS[reset.dataset.resetDevice];const group=reset.closest('[data-resolution-group]')||reset.closest('#deviceResolutionForm');if(!defaults||!group)return;group.querySelector('[data-resolution-width]').value=defaults.width;group.querySelector('[data-resolution-height]').value=defaults.height;const preset=group.querySelector('[data-resolution-preset]');if(preset)preset.value=RESOLUTION_PRESETS.some(([v])=>v===defaults.width+'x'+defaults.height)?defaults.width+'x'+defaults.height:'custom';const badge=group.querySelector('[data-selected-resolution]');if(badge)badge.textContent=defaults.width+' × '+defaults.height;group.querySelectorAll('input[type=radio]').forEach(r=>r.checked=r.value===defaults.width+'x'+defaults.height);});
document.addEventListener('click',event=>{
 const category=event.target.closest('[data-category]');if(category){const name=testCategories[Number(category.dataset.category)];state.settings.openCategory=state.settings.openCategory===name?null:name;renderRight();scheduleSave();return;}
 const selected=event.target.closest('[data-select-test]');if(selected){state.settings.selectedTests=[selected.dataset.selectTest];renderRight();scheduleSave();return;}
 const status=event.target.closest('[data-selected-status]');if(status){const ids=selectedTests();if(!ids.length){notify('Select a test or category first.');react('thinking');return;}for(const id of ids)setStatus(id,status.dataset.selectedStatus);return;}
 const control=event.target.closest('[data-device-command]');if(control){handleDeviceCommand(control.dataset.deviceCommand,control.dataset.target);return;}
 const menuButton=event.target.closest('[data-menu]');
 if(menuButton){openMenu(menuButton.dataset.menu,menuButton);return;}
 if(!event.target.closest('#menu'))closeMenu();
 const savedAuto=event.target.closest('[data-auto-report]');if(savedAuto){const report=(state.automatedReports||[]).find(r=>r.id===savedAuto.dataset.autoReport);if(report)showAutomatedReport(report);return;}
 const action=event.target.closest('[data-action]')?.dataset.action;
 if(action){handleAction(action).catch(error=>{react('fail');notify(error.message);record('Operation failed',error.message);});return;}
 const viewButton=event.target.closest('[data-view]');if(viewButton){const view=viewButton.dataset.view;switchView(view);return;}
 const statusButton=event.target.closest('[data-status]');if(statusButton){const value=statusButton.dataset.status;const split=value.lastIndexOf('-');setStatus(value.slice(0,split),value.slice(split+1));return;}
 const guideStatus=event.target.closest('[data-guide-status]');if(guideStatus){setStatus('guide-'+state.settings.step,guideStatus.dataset.guideStatus);return;}
 const run=event.target.closest('[data-run-step]');if(run){state.settings.step=Number(run.dataset.runStep);$('dialog').close();renderGuide();handleAction('take');persist();return;}
 const loadApp=event.target.closest('[data-load-app]');if(loadApp){state.currentApp=loadApp.dataset.loadApp;$('dialog').close();renderPreviews();persist();return;}
 const restore=event.target.closest('[data-restore-session]');if(restore){restoreSession(state.sessions.find(session=>session.id===restore.dataset.restoreSession));$('dialog').close();return;}
 const remove=event.target.closest('[data-delete-session]');if(remove){showDialog('Delete saved session','<p>Remove this named session? Imported applications and the active workspace stay available.</p><button data-confirm-delete-session="'+remove.dataset.deleteSession+'">Delete session</button>');return;}
 const confirm=event.target.closest('[data-confirm-delete-session]');if(confirm){state.sessions=state.sessions.filter(session=>session.id!==confirm.dataset.confirmDeleteSession);if(state.selectedSession===confirm.dataset.confirmDeleteSession)state.selectedSession=null;$('dialog').close();updateProjectPicker();persist();return;}
 const history=event.target.closest('[data-history]');if(history){selectedHistory=history.dataset.history;const entry=state.history.find(item=>item.id===selectedHistory);renderRight();showDialog(entry.type,'<p>'+escapeHTML(new Date(entry.date).toLocaleString())+'</p><p>'+escapeHTML(entry.detail)+'</p>'+resultsTable(entry.tests,entry.notes));return;}
 const evidenceDownload=event.target.closest('[data-evidence-download]');if(evidenceDownload){const evidence=state.evidence.find(item=>item.id===evidenceDownload.dataset.evidenceDownload);download('Testing_Evidence.png',evidence.blob);return;}
 const evidenceRemove=event.target.closest('[data-evidence-remove]');if(evidenceRemove){checkpointEdit();state.evidence=state.evidence.filter(item=>item.id!==evidenceRemove.dataset.evidenceRemove);showGallery();persist();}
});
document.addEventListener('submit',event=>{
 event.preventDefault();
 if(event.target.id==='deviceResolutionForm'){const form=new FormData(event.target),name=form.get('device');const next={width:Number(form.get('width')),height:Number(form.get('height'))};if(next.width!==state.settings.resolutions[name].width||next.height!==state.settings.resolutions[name].height)checkpointEdit();state.settings.resolutions[name]=next;$('dialog').close();fitFrames();persist();}
 if(event.target.id==='addTestForm'){
 const name=$('#testName').value.trim();if(!name)return;checkpointEdit();state.tests.push({id:uid(),name,status:'TEST',notes:'',category:$('#testCategory')?.value||testCategories[0]});$('dialog').close();record('Test added',name);tab='test';state.settings.openCategory=$('#testCategory')?.value||testCategories[0];state.settings.selectedTests=[state.tests.at(-1).id];renderRight();persist();
 }
 if(event.target.id==='saveSessionForm'){
 const name=$('#sessionName').value.trim();if(!name)return;
 const existing=state.sessions.find(session=>session.id===state.selectedSession);
 const session=sessionSnapshot(name,existing?.id);if(existing)state.sessions[state.sessions.indexOf(existing)]=session;else state.sessions.push(session);
 state.selectedSession=session.id;$('dialog').close();updateProjectPicker();record('Session saved',name);persist().then(()=>notify('Session saved.'));
 }
 if(event.target.id==='settingsForm'){
 const form=new FormData(event.target);
 if(['desktop','tablet','phone'].some(name=>state.settings.resolutions[name].width!==Number(form.get(name+'Width'))||state.settings.resolutions[name].height!==Number(form.get(name+'Height'))))checkpointEdit();
 for(const name of ['desktop','tablet','phone'])state.settings.resolutions[name]={width:Number(form.get(name+'Width')),height:Number(form.get(name+'Height'))};
 state.settings.view=form.get('view');state.settings.applicationMode=form.get('applicationMode')==='hosted'?'hosted':'local';state.settings.hostedAppURL=String(form.get('hostedAppURL')||'').trim();for(const name of ['cloudDatabaseEnabled','userAccountsEnabled','cloudSyncEnabled'])state.settings[name]=form.has(name);$('dialog').close();renderPreviews();persist();record('Settings saved','Device resolutions, application mode and cloud preferences updated');
 }
});

// Read-only deployment diagnostics: never change the service worker, cache or workspace.
async function showPwaDeploymentStatus(){
 const status=document.querySelector('#localUpdateStatus');if(!status)return;
 const report=[];
 const add=(label,value)=>report.push(label+': '+value);
 add('Running version',VERSION);
 add('Origin',location.protocol==='file:'?'Local standalone file':location.origin);
 if(location.protocol==='file:'){
  add('PWA service worker','Unavailable for file:// standalone mode');
  add('Deployment','Use Prepare Standalone Update for local HTML updates');
 }else if(!('serviceWorker' in navigator)){
  add('PWA service worker','Not supported in this browser');
 }else{
  try{
   const registration=await navigator.serviceWorker.getRegistration('./');
   add('Service worker registration',registration?'Found':'Not found');
   add('Page controlled by service worker',navigator.serviceWorker.controller?'Yes':'No');
   if(registration){
    add('Worker state',registration.active?.state||registration.waiting?.state||registration.installing?.state||'Not active');
    add('Worker update pending',registration.waiting?'Yes':'No');
   }
  }catch(error){add('Service worker inspection','Unavailable: '+error.message);}
  if('caches' in window){
   try{const names=await caches.keys();const appCaches=names.filter(name=>name.startsWith('web-app-tester-'));
    add('Offline cache',appCaches.length?appCaches.join(', '):'Not found');
   }catch(error){add('Offline cache inspection','Unavailable: '+error.message);}
  }else add('Offline cache inspection','Not supported');
  add('Deployment','Files must be published to this same hosting origin; this check does not install updates');
 }
 const heading=document.createElement('strong');heading.textContent='PWA Deployment Status';
 const details=document.createElement('pre');details.style.whiteSpace='pre-wrap';details.style.fontFamily='inherit';details.style.margin='8px 0 0';details.textContent=report.join('\n');
 status.replaceChildren(heading,details);
}

// Hosted PWA updates are checked only on request. Activation requires a separate user click.
let pendingPwaRegistration=null;
let requestedPwaActivation=false;
function pwaUpdateReport(message,ready=false){
 const status=document.querySelector('#localUpdateStatus');if(!status)return;
 const title=document.createElement('strong');title.textContent=ready?'PWA Update Available':'PWA Update Check';
 const details=document.createElement('p');details.textContent=message;
 status.replaceChildren(title,details);
 if(ready){
  const button=document.createElement('button');button.type='button';button.dataset.action='pwaActivateUpdate';button.textContent='Activate PWA Update';
  status.append(button);
  const caution=document.createElement('p');caution.textContent='Save your work and download a recovery backup first. Activation reloads this page after the new worker takes control. Hosted files must already be published.';
  status.append(caution);
 }
}
async function checkHostedPwaUpdate(){
 pendingPwaRegistration=null;
 if(location.protocol==='file:'){pwaUpdateReport('Local standalone mode: use Prepare Standalone Update. No service worker update is possible here.');return;}
 if(!('serviceWorker' in navigator)){pwaUpdateReport('Service workers are unavailable in this browser.');return;}
 try{
  const registration=await navigator.serviceWorker.getRegistration('./');
  if(!registration){pwaUpdateReport('No service worker is registered for this application.');return;}
  pwaUpdateReport('Checking the existing service worker registration for a published update…');
  await registration.update();
  // A newly discovered worker may still be installing.
  if(registration.installing){
   const worker=registration.installing;
   await Promise.race([new Promise(resolve=>{
    if(worker.state==='installed'||worker.state==='activated'||worker.state==='redundant'){resolve();return;}
    const listener=()=>{if(['installed','activated','redundant'].includes(worker.state)){worker.removeEventListener('statechange',listener);resolve();}};
    worker.addEventListener('statechange',listener);
   }),new Promise(resolve=>setTimeout(resolve,5000))]);
  }
  if(registration.waiting&&navigator.serviceWorker.controller){
   pendingPwaRegistration=registration;
   pwaUpdateReport('A newly published PWA service worker is ready. Activate only when your workspace is saved.',true);
  }else{
   pwaUpdateReport('No waiting PWA update was found. This does not prove that GitHub Pages has published a newer version; verify the deployed files if you expect one.');
  }
 }catch(error){pwaUpdateReport('Could not check the hosted PWA update: '+error.message);}
}
async function activateHostedPwaUpdate(){
 const registration=pendingPwaRegistration;
 if(!registration?.waiting||!navigator.serviceWorker?.controller){pwaUpdateReport('No pending service worker update is ready. Run Check PWA Update again.');return;}
 if(!confirm('Activate the waiting PWA update? Save your workspace and download a recovery backup before continuing. The app will reload when the new worker takes control.'))return;
 try{
  await persist();
  requestedPwaActivation=true;
  let reloaded=false;
  const reloadOnce=()=>{if(reloaded||!requestedPwaActivation)return;reloaded=true;location.reload();};
  navigator.serviceWorker.addEventListener('controllerchange',reloadOnce,{once:true});
  registration.waiting.postMessage({type:'WAT_ACTIVATE_WAITING_UPDATE'});
  pwaUpdateReport('Activation requested. Waiting for the updated service worker to take control…');
 }catch(error){requestedPwaActivation=false;pwaUpdateReport('Activation could not proceed: '+error.message);}
}

// Offline update-package inspection and safe standalone preparation. Never execute imported code or claim automatic deployment.
async function inspectLocalUpdatePackage(file){
 if(!file||!/\.zip$/i.test(file.name))throw Error('Choose a ZIP update package.');
 if(file.size>80*1024*1024)throw Error('Package exceeds the 80 MB inspection limit.');
 if(typeof JSZip==='undefined')throw Error('ZIP reader is unavailable.');
 const zip=await JSZip.loadAsync(file,{checkCRC32:true});
 const entries=Object.values(zip.files).filter(entry=>!entry.dir);
 if(entries.length>250)throw Error('Package has too many files.');
 const names=entries.map(entry=>entry.name);
 if(names.some(name=>name.startsWith('/')||name.includes('..')||name.includes('\\')))throw Error('Unsafe ZIP path detected.');
 const sourceZip=entries.find(entry=>/WEB_APP_TESTER_v[\d.]+_TEST_(Full_Source|PWA)\.zip$/i.test(entry.name));
 const direct=names.some(name=>/^(src\/)?app\.js$/.test(name))&&names.some(name=>/^(src\/)?index\.html$/.test(name));
 let contentZip=zip;
 if(sourceZip){const bytes=await sourceZip.async('uint8array');contentZip=await JSZip.loadAsync(bytes,{checkCRC32:true});}
 if(!direct&&!sourceZip)throw Error('Not a recognized WEB APP TESTER source/PWA package.');
 const appEntry=Object.values(contentZip.files).find(entry=>/^(src\/)?app\.js$/.test(entry.name));
 const htmlEntry=Object.values(contentZip.files).find(entry=>/^(src\/)?index\.html$/.test(entry.name));
 if(!appEntry||!htmlEntry)throw Error('Required app.js or index.html is missing.');
 const appSource=await appEntry.async('string');
 const version=appSource.match(/const VERSION='(\d+\.\d+\.\d+) TEST';/);
 if(!version)throw Error('Could not verify WEB APP TESTER version.');
 const current=VERSION.match(/\d+\.\d+\.\d+/)?.[0];
 const compare=(a,b)=>{const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++){if(aa[i]!==bb[i])return aa[i]-bb[i];}return 0;};
 if(compare(version[1],current)<=0)throw Error('Selected package is not newer than '+current+'.');
 const standaloneEntry=entries.find(entry=>/^WEB_APP_TESTER_v[\d.]+_TEST_Standalone\.html$/i.test(entry.name));
 let standalone=null;
 if(standaloneEntry){
  const text=await standaloneEntry.async('string');
  if(!text.includes('const VERSION=\''+version[1]+' TEST\''))throw Error('Standalone version does not match the update source.');
  standalone={name:standaloneEntry.name.split('/').pop(),text};
 }
 const pwaEntry=entries.find(entry=>/^WEB_APP_TESTER_v[\d.]+_TEST_PWA\.zip$/i.test(entry.name));
 let pwa=null;
 if(pwaEntry){
  const bytes=await pwaEntry.async('uint8array');
  const pwaZip=await JSZip.loadAsync(bytes,{checkCRC32:true});
  const files=Object.keys(pwaZip.files).filter(name=>!pwaZip.files[name].dir);
  if(!files.some(name=>/^(src\/)?sw\.js$/.test(name))||!files.some(name=>/^(src\/)?manifest\.webmanifest$/.test(name)))throw Error('PWA ZIP is missing required deployment files.');
  const pwaApp=Object.values(pwaZip.files).find(entry=>/^(src\/)?app\.js$/.test(entry.name));
  if(!pwaApp||(await pwaApp.async('string')).indexOf("const VERSION='"+version[1]+" TEST'")<0)throw Error('PWA package version does not match update source.');
  pwa={name:pwaEntry.name.split('/').pop(),bytes};
 }
 return {version:version[1],files:Object.keys(contentZip.files).filter(name=>!contentZip.files[name].dir).length,standalone,pwa};
}
document.addEventListener('change',async event=>{
 if(event.target.id!=='localUpdateFile')return;
 const file=event.target.files?.[0],status=document.querySelector('#localUpdateStatus');
 if(!file||!status)return;
 status.textContent='Validating ZIP package…';
 try{
  const result=await inspectLocalUpdatePackage(file);
  status.textContent='Validated WEB APP TESTER '+result.version+' TEST ('+result.files+' files). ';
  if(result.standalone){
   status.append(document.createTextNode('Download a recovery backup first. Then prepare the newer standalone HTML; open it separately and restore your backup there. Your existing app file will not be overwritten. '));
   const prepare=document.createElement('button');prepare.type='button';prepare.textContent='Prepare Standalone Update';
   prepare.addEventListener('click',()=>{
    download(result.standalone.name,result.standalone.text,'text/html');
    notify('Standalone update downloaded. Open the new HTML file, then restore your recovery backup.');
   });
   status.append(prepare);
  }else{
   status.append(document.createTextNode('This ZIP does not include a standalone HTML installer. Select the Full Package ZIP to prepare a standalone update. Hosted/PWA deployment must be updated at its hosting origin.'));
  }
  if(result.pwa){
   status.append(document.createTextNode(' PWA deployment package verified. '));
   const preparePwa=document.createElement('button');preparePwa.type='button';preparePwa.textContent='Download PWA Deployment ZIP';
   preparePwa.addEventListener('click',()=>{
    const blob=new Blob([result.pwa.bytes],{type:'application/zip'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=result.pwa.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    notify('PWA deployment ZIP downloaded. Publish files to your existing hosting origin; backup workspace data first.');
   });
   status.append(preparePwa);
   status.append(document.createTextNode(' To update an installed PWA, deploy the ZIP contents to the SAME hosting origin, then reopen/reload the PWA. This app cannot overwrite hosted files automatically.'));
  }
 }catch(error){status.textContent='Validation failed: '+error.message;}
});

document.addEventListener('input',event=>{if(event.target.id==='notes'){if(!notesEditPending){checkpointEdit();notesEditPending=true;}clearTimeout(notesEditTimer);notesEditTimer=setTimeout(()=>{notesEditPending=false;},850);state.notes=event.target.value;scheduleSave();}});
document.addEventListener('focusout',event=>{if(event.target.id==='notes')commitNotesEdit();});
document.addEventListener('change',event=>{
 if(event.target.dataset.deviceZoomSelect){state.settings.deviceZoom={...state.settings.deviceZoom,[event.target.dataset.deviceZoomSelect]:Number(event.target.value)};fitFrames();scheduleSave();}
 if(event.target.dataset.categorySelect!==undefined){const category=testCategories[Number(event.target.dataset.categorySelect)],ids=state.tests.filter(test=>testCategory(test)===category).map(test=>test.id);state.settings.selectedTests=event.target.checked?[...new Set([...selectedTests(),...ids])]:selectedTests().filter(id=>!ids.includes(id));state.settings.openCategory=category;renderRight();scheduleSave();}
 if(event.target.id==='zoom'){state.settings.zoom=Number.parseInt(event.target.value);fitFrames();scheduleSave();}
 if(event.target.id==='sync'){state.settings.sync=event.target.checked;scheduleSave();}
 if(event.target.id==='project'){if(event.target.value==='__new'){handleAction('saveSession');return;}const session=state.sessions.find(item=>item.id===event.target.value);if(session)restoreSession(session);}
});
$('#appFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{await importFile(file,importTarget);}catch(error){react('fail');notify(error.message);record('Import failed',error.message);}});
let pendingLocalRecoveryFile=null;
$('#backupFile').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 pendingLocalRecoveryFile=file;
 showDialog('Confirm Recovery Restore',
  '<p><strong>Restore backup from '+escapeHTML(file.name)+'?</strong></p>'+
  '<p>This will replace the current workspace, including projects, sessions, tests, notes, settings and saved evidence. This action cannot be undone automatically.</p>'+
  '<p>Download a recovery backup of your current work before continuing.</p>'+
  '<div class="dialogActions">'+actionButton('cancelLocalRecoveryRestore','Cancel')+actionButton('confirmLocalRecoveryRestore','Restore Backup',true)+'</div>');
});
$('#evidenceFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){notify('Choose an image file.');return;}checkpointEdit();state.evidence.push({id:uid(),name:file.name,date:new Date().toISOString(),blob:file});await persist();record('Evidence attached',file.name);showGallery();});
$$('[data-tab]').forEach(el=>el.addEventListener('click',()=>{tab=el.dataset.tab;renderRight();}));
$('.deviceControls').addEventListener('contextmenu',event=>{event.preventDefault();showDialog('Device view','<div class="dialogActions">'+[['all','3 Screens'],['desktop','Desktop'],['tablet','Tablet'],['phone','Mobile']].map(([view,label])=>'<button data-dialog-view="'+view+'">'+label+'</button>').join('')+'</div>');});
document.addEventListener('click',event=>{const el=event.target.closest('[data-dialog-view]');if(el){switchView(el.dataset.dialogView);$('dialog').close();}});
$('.deviceControls').addEventListener('dblclick',()=>handleAction('settings'));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
$('dialog').addEventListener('click',event=>{if(event.target!==$('dialog'))return;const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){$('dialog').close();clearEvidenceURLs();}});
window.addEventListener('resize',()=>{closeMenu();fitFrames();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});
window.addEventListener('pagehide',persist);
async function initialize(){
 try{await dbReady;const stored=await readState();if(stored)state={...state,...stored,settings:{...defaultSettings(),...stored.settings,resolutions:{...defaultSettings().resolutions,...stored.settings?.resolutions}}};}
 catch(error){notify('Browser storage is unavailable: '+error.message);}
 if(state.settings.uiVersion!==3){state.settings.guide=false;state.settings.uiVersion=3;}
 $('.botLauncher').innerHTML=bot('welcome');renderAll();
 resizeObserver=new ResizeObserver(fitFrames);$$('.glass').forEach(el=>resizeObserver.observe(el));
 if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(error=>notify('Offline cache unavailable: '+error.message));
}
initialize();
const standaloneURLs=[];
async function loadStandaloneFrame(frame,app){
 const urls=new Map();
 for(const file of app.files)urls.set(file.path,URL.createObjectURL(file.blob));
 for(const url of urls.values())standaloneURLs.push(url);
 function resolve(reference,base){
 if(/^(data:|blob:|https?:|#|mailto:|tel:)/i.test(reference))return reference;
 const clean=reference.split(/[?#]/)[0];
 const suffix=reference.slice(clean.length);
 const parent=base.split('/').slice(0,-1).join('/');
 const path=normalizePath(clean.startsWith('/')?clean:parent+'/'+clean);
 return urls.has(path)?urls.get(path)+suffix:reference;
 }
 for(const file of app.files.filter(file=>file.blob.type==='text/css')){
 const css=(await file.blob.text()).replace(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g,(all,quote,path)=>'url("'+resolve(path,file.path)+'")');
 const url=URL.createObjectURL(new Blob([css],{type:'text/css'}));standaloneURLs.push(url);urls.set(file.path,url);
 }
 const entry=app.files.find(file=>file.path===app.entry);
 if(!entry)throw Error('The selected HTML entry point is missing from this application.');
 let html=await entry.blob.text();
 const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('base').forEach(el=>el.remove());
 doc.querySelectorAll('[src],[href],[poster]').forEach(el=>{for(const attr of ['src','href','poster'])if(el.hasAttribute(attr))el.setAttribute(attr,resolve(el.getAttribute(attr),app.entry));});
 frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
}
