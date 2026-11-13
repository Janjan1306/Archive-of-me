/* One shell, one mounted instance of each workspace. Split preferences are additive per book. */
const WorkspaceShell={
  labels:{reader:'Reader',split:'Split View',board:'Story Board',map:'Relationship Map'},sizes:new Map(),bookId:null,generation:0,layingOut:false,
  book(){return books.find(b=>b.id===activeBookId)},
  pair(){return ArchiveModel.splitWorkspace(this.book())},
  visible(type){return !$('#workspace').hidden&&!$(type==='map'?'#worldPanel':'#'+type+'Panel').hidden},
  key(type){return activeBookId+':'+type+(type==='board'?':'+(Board.cameraMode||'full'):type==='map'?':'+World.settings.view:'')},
  cameras(){return [['board',Board,$('#boardCanvas')],['map',World,$('#worldCanvas')]].filter(([type,,canvas])=>canvas&&this.visible(type))},
  capture(){const states=new Map();for(const [type,owner,canvas] of this.cameras()){const key=this.key(type),size=this.sizes.get(key)||(owner.camera.viewportWidth>0?{w:owner.camera.viewportWidth,h:owner.camera.viewportHeight}:{w:canvas.clientWidth,h:canvas.clientHeight});states.set(key,{x:(size.w/2-owner.camera.x)/owner.camera.zoom,y:(size.h/2-owner.camera.y)/owner.camera.zoom,zoom:owner.camera.zoom})}return states},
  restore(states){for(const [type,owner,canvas] of this.cameras()){const key=this.key(type),old=this.sizes.get(key)||(owner.camera.viewportWidth>0?{w:owner.camera.viewportWidth,h:owner.camera.viewportHeight}:null),state=states.get(key)||(old?{x:(old.w/2-owner.camera.x)/owner.camera.zoom,y:(old.h/2-owner.camera.y)/owner.camera.zoom,zoom:owner.camera.zoom}:null);if(state){owner.camera={...owner.camera,x:canvas.clientWidth/2-state.x*state.zoom,y:canvas.clientHeight/2-state.y*state.zoom,zoom:state.zoom,viewportWidth:canvas.clientWidth,viewportHeight:canvas.clientHeight};if(type==='board'){Board.draw();Board.cameraSave()}else{World.transform();World.saveSettings()}}else if(type==='board')Board.draw();else World.transform();this.sizes.set(key,{w:canvas.clientWidth,h:canvas.clientHeight})}},
  reflow(change=()=>{}){
    const states=this.capture(),position=Reader.locationForLayout?.(),generation=++this.generation;
    this.layingOut=true;Reader.suspendPosition=true;
    change(states);this.size();this.restore(states);Reader.layout?.(workspaceTab,position);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(generation!==this.generation)return;this.size();this.restore(states);if(this.visible('reader')&&position)Reader.restoreLocation(position);this.layingOut=false;Reader.suspendPosition=false}));
  },
  activate(tab){
    if(!Object.hasOwn(this.labels,tab))tab='reader';if(tab==='split'&&matchMedia('(max-width:700px)').matches)tab='reader';
    if(this.bookId!==activeBookId){this.bookId=activeBookId;this.sizes.clear()}
    Reader.savePosition?.();
    this.reflow(states=>{
      const previous=workspaceTab;workspaceTab=tab;document.body.classList.add('workspace-open');const panels=$('#workspacePanels');panels.dataset.mode=tab;panels.classList.toggle('split',tab==='split');
      const pair=this.pair();for(const type of ['reader','board','map']){const panel=$(type==='map'?'#worldPanel':'#'+type+'Panel');panel.hidden=!(tab===type||tab==='split'&&Object.values(pair).includes(type));panel.style.gridColumn=tab==='split'?(pair.left===type?'1':'3'):'';panel.style.gridRow=tab==='split'?'2':''}
      if(this.visible('map')&&(World.mapBookId!==activeBookId||!$('#worldCanvas')))World.open(this.book());
      if(this.visible('board')){const oldKey=this.key('board'),prior=Board.cameraMode,mode=tab==='split'?'split':'full',has=!!(Board.viewCameras?.[mode]||Board.data().viewports?.[mode]||(mode==='full'&&Board.data().viewport));Board.setView(mode);if(prior!==mode&&!has&&states.has(oldKey))states.set(this.key('board'),states.get(oldKey))}
      for(const el of document.querySelectorAll('[data-workspace-mode]')){el.setAttribute('aria-selected',String(el.dataset.workspaceMode===tab));el.tabIndex=el.dataset.workspaceMode===tab?0:-1}
      $('#splitLeft').value=pair.left;$('#splitRight').value=pair.right;applySplitRatio(this.book()?.splitRatio??55);
      if(previous!==tab&&tab!=='reader')scrollTo(0,0);if(activeBookId)setRoute();if(typeof Immersive!=='undefined')Immersive.sync();
    });
  },
  async configure(side,type){const pair=this.pair();if(!['reader','board','map'].includes(type))return;const other=side==='left'?'right':'left',next={...pair,[side]:type};if(pair[other]===type)next[other]=pair[side];try{await updateBook(activeBookId,b=>({...b,splitWorkspace:next}));this.activate('split')}catch(e){serious(e)}},
  async swap(){const pair=this.pair();try{await updateBook(activeBookId,b=>({...b,splitWorkspace:{left:pair.right,right:pair.left}}));this.activate('split')}catch(e){serious(e)}},
  size(){const panels=$('#workspacePanels');if(!panels||$('#workspace').hidden)return;const immersive=typeof Immersive!=='undefined'&&Immersive.active;if(!immersive){const width=document.documentElement.clientWidth,shell=$('#workspace'),gutter=Math.min(24,Math.max(16,innerWidth*.0125));panels.style.setProperty('--workspace-width',width+'px');panels.style.setProperty('--workspace-offset',(gutter-shell.getBoundingClientRect().left-parseFloat(getComputedStyle(shell).paddingLeft))+'px');panels.style.setProperty('--workspace-height',Math.max(300,innerHeight-(panels.getBoundingClientRect().top+scrollY)-16)+'px')}Reader.measure?.();Reader.placeDrawer?.();Reader.placeOptions?.()},
  resize(){if(!this.layingOut&&!$('#workspace').hidden)this.reflow()},
  keyboard(e,root){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||!e.target.matches('[role=tab]'))return;e.preventDefault();e.stopImmediatePropagation();const tabs=[...root.querySelectorAll('[role=tab]')].filter(b=>getComputedStyle(b).display!=='none'),i=tabs.indexOf(e.target),next=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];setWorkspaceTab(next.dataset.workspaceMode);next.focus()}
};
for(const type of ['reader','split','board','map'])$('#'+type+'Tab').dataset.workspaceMode=type;
const panelChoices=Object.entries(WorkspaceShell.labels).filter(([type])=>type!=='split').map(([type,label])=>'<option value="'+type+'">'+label+'</option>').join('');
$('#workspacePanels').insertAdjacentHTML('afterbegin','<div class="split-panel-choice" id="splitLeftControls"><label>Left Panel <select id="splitLeft" aria-label="Left Panel">'+panelChoices+'</select></label><button id="swapPanels" aria-label="Swap Panels">⇄ Swap</button></div><div class="split-panel-choice" id="splitRightControls"><label>Right Panel <select id="splitRight" aria-label="Right Panel">'+panelChoices+'</select></label></div>');
$('#splitLeft').onchange=e=>WorkspaceShell.configure('left',e.target.value);$('#splitRight').onchange=e=>WorkspaceShell.configure('right',e.target.value);$('#swapPanels').onclick=()=>WorkspaceShell.swap();
setWorkspaceTab=tab=>WorkspaceShell.activate(tab);
window.addEventListener('resize',()=>WorkspaceShell.resize());
