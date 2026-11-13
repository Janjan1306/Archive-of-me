/* Application fullscreen: resize mounted panels, never recreate their content or fit cameras. */
const Immersive={
  active:false,viewport:null,transitioning:false,
  supported(){return ['split','board','map'].includes(workspaceTab)&&!$('#workspace').hidden},
  cameraState(width,height){
    const map=workspaceTab==='map',canvas=$(map?'#worldCanvas':'#boardCanvas'),owner=map?World:Board,camera=owner.camera;
    if(!canvas||!camera)return null;
    return {owner,canvas,zoom:camera.zoom,x:((width??canvas.clientWidth)/2-camera.x)/camera.zoom,y:((height??canvas.clientHeight)/2-camera.y)/camera.zoom};
  },
  restoreCamera(state){if(!state)return;const {owner,canvas,x,y,zoom}=state;owner.camera={...owner.camera,x:canvas.clientWidth/2-x*zoom,y:canvas.clientHeight/2-y*zoom,zoom};if(owner===World){World.transform();World.saveSettings()}else{Board.draw();Board.cameraSave()}this.viewport={width:canvas.clientWidth,height:canvas.clientHeight}},
  sync(){const button=$('#expandWorkspace');button.hidden=!this.supported();button.setAttribute('aria-pressed',String(this.active));$('#immersiveTitle').textContent=books.find(b=>b.id===activeBookId)?.title||'';$('#immersiveMode').textContent=({split:'Split View',board:'Story Board',map:'Relationship Map'})[workspaceTab]||''},
  toggle(){this.active?this.exit():this.enter()},
  enter(){if(this.active||!this.supported())return;this.pageScroll=scrollY;this.change(true);$('#exitWorkspace').focus({preventScroll:true})},
  exit({focus=true,modeChange=false}={}){if(!this.active)return;this.change(false,modeChange);scrollTo(0,this.pageScroll||0);if(focus)$('#expandWorkspace').focus({preventScroll:true})},
  change(active,modeChange=false){
    const camera=this.cameraState(),position=workspaceTab==='split'?Reader.locationForLayout?.():null,mode=workspaceTab;
    this.active=active;this.transitioning=true;Reader.suspendPosition=true;
    document.body.classList.toggle('workspace-immersive',active);$('#immersiveBar').hidden=!active;this.sync();
    if(!active)sizeWorkspace();
    this.restoreCamera(camera);
    this.settle(camera,position,mode,modeChange);
  },
  settle(camera,position,mode,modeChange=false){
    const generation=this.generation=(this.generation||0)+1;
    const apply=()=>{if(generation!==this.generation)return;if(!modeChange&&workspaceTab===mode){this.restoreCamera(camera);if(position)Reader.restoreLocation(position);Reader.measure?.();Reader.placeDrawer?.();Reader.placeOptions?.()}this.transitioning=false;Reader.suspendPosition=false};
    // Wait for scrollbar removal and panel reflow, then restore the same world-space center.
    if(modeChange){this.restoreCamera(camera);this.transitioning=false;Reader.suspendPosition=false;return}
    requestAnimationFrame(()=>requestAnimationFrame(apply));
  },
  resize(){
    if(!this.active||this.transitioning)return;
    const camera=this.cameraState(this.viewport?.width,this.viewport?.height),position=workspaceTab==='split'?Reader.locationForLayout?.():null;
    this.transitioning=true;Reader.suspendPosition=true;this.settle(camera,position,workspaceTab);
  },
  escape(e){
    if(!this.active||e.key!=='Escape'||e.defaultPrevented||e.isComposing)return;
    // Native modal/select Escape belongs to the nested control first.
    if(document.querySelector('dialog[open]'))return;
    if(e.target.tagName==='SELECT'){e.target.blur();$('#exitWorkspace').focus({preventScroll:true})}
    else if($('.board-edit-menu[open]'))$('.board-edit-menu[open]').open=false;
    else if($('#selectionTools')&&!$('#selectionTools').hidden)Reader.dismiss();
    else if($('#readerOptions')&&!$('#readerOptions').hidden){$('#readerOptions').hidden=true;$('#readerSettingsToggle').setAttribute('aria-expanded','false')}
    else if($('#readerDrawer')&&!$('#readerDrawer').hidden)Reader.closeDrawer();
    else if(workspaceTab==='map'&&World.selected){World.selected=null;World.inspect()}
    else if(workspaceTab!=='map'&&(Board.selected.size||Board.connectionId)){Board.selected.clear();Board.connectionId=null;Board.refresh()}
    else this.exit();
    e.preventDefault();e.stopImmediatePropagation();
  },
  bindReader(){const frame=$('#epubFrame');if(!frame)return;const bind=()=>{try{const doc=frame.contentDocument;if(doc&&!doc.immersiveEscape){doc.immersiveEscape=true;doc.addEventListener('keydown',e=>this.escape(e),true)}}catch{}};if(!frame.dataset.immersiveBound){frame.dataset.immersiveBound='true';frame.addEventListener('load',bind)}bind()}
};
$('.workspace-tabs').insertAdjacentHTML('afterend','<div class="workspace-expand"><button id="expandWorkspace" aria-label="Expand workspace" aria-controls="workspacePanels" aria-pressed="false" hidden>⛶ Fullscreen</button></div>');
document.body.insertAdjacentHTML('beforeend','<div id="immersiveBar" hidden><span id="immersiveTitle"></span><span id="immersiveMode"></span><button id="exitWorkspace" aria-label="Exit Fullscreen">Exit Fullscreen <span aria-hidden="true">⤢</span></button></div>');
$('#expandWorkspace').onclick=()=>Immersive.enter();$('#exitWorkspace').onclick=()=>Immersive.exit();
const immersiveWorkspaceTab=setWorkspaceTab;setWorkspaceTab=function(tab){if(Immersive.active)Immersive.exit({focus:false,modeChange:true});immersiveWorkspaceTab(tab);Immersive.sync()};
const immersiveBack=backToLibrary;backToLibrary=function(...args){Immersive.exit({focus:false,modeChange:true});immersiveBack(...args);Immersive.sync()};
document.addEventListener('keydown',e=>Immersive.escape(e),true);
window.addEventListener('resize',()=>Immersive.resize());
new MutationObserver(()=>Immersive.bindReader()).observe($('#readerContent'),{childList:true});
Immersive.sync();Immersive.bindReader();
