/* Fullscreen belongs to the book shell, so switching modes never exits it. */
const Immersive={active:false,
  supported(){return !$('#workspace').hidden},
  sync(){const button=$('#expandWorkspace');button.hidden=!this.supported();button.setAttribute('aria-pressed',String(this.active));$('#immersiveTitle').textContent=books.find(b=>b.id===activeBookId)?.title||'';document.body.classList.toggle('immersive-reader',this.active&&workspaceTab==='reader');for(const tab of $('#immersiveTabs').querySelectorAll('[data-workspace-mode]')){const selected=tab.dataset.workspaceMode===workspaceTab;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1}},
  enter(){if(this.active||!this.supported())return;WorkspaceShell.reflow(()=>{this.active=true;document.body.classList.add('workspace-immersive');$('#immersiveBar').hidden=false;this.sync()});$('#exitWorkspace').focus({preventScroll:true})},
  exit({focus=true}={}){if(!this.active)return;WorkspaceShell.reflow(()=>{this.active=false;document.body.classList.remove('workspace-immersive','immersive-reader');$('#immersiveBar').hidden=true;this.sync()});if(focus)$('#expandWorkspace').focus({preventScroll:true})},
  escape(e){if(!this.active||e.key!=='Escape'||e.defaultPrevented||e.isComposing||document.querySelector('dialog[open]'))return;
    const details=[...document.querySelectorAll('details[open]')].find(el=>el.getClientRects().length);
    if(WorkspaceShell.visible('map')&&$('#quickCharacter')&&!$('#quickCharacter').hidden)$('#quickCharacter').hidden=true;
    else if(e.target.tagName==='SELECT'){e.target.blur();$('#exitWorkspace').focus({preventScroll:true})}
    else if(details)details.open=false;
    else if(WorkspaceShell.visible('reader')&&$('#selectionTools')&&!$('#selectionTools').hidden)Reader.dismiss();
    else if(WorkspaceShell.visible('reader')&&$('#readerOptions')&&!$('#readerOptions').hidden){$('#readerOptions').hidden=true;$('#readerSettingsToggle').setAttribute('aria-expanded','false')}
    else if(WorkspaceShell.visible('reader')&&$('#readerDrawer')&&!$('#readerDrawer').hidden)Reader.closeDrawer();
    else if(WorkspaceShell.visible('map')&&World.selected){World.selected=null;World.inspect()}
    else if(WorkspaceShell.visible('board')&&(Board.selected.size||Board.connectionId)){Board.selected.clear();Board.connectionId=null;Board.refresh()}
    else this.exit();e.preventDefault();e.stopImmediatePropagation();
  },
  bindReader(){const frame=$('#epubFrame');if(!frame)return;const bind=()=>{try{const doc=frame.contentDocument;if(doc&&!doc.immersiveEscape){doc.immersiveEscape=true;doc.addEventListener('keydown',e=>this.escape(e),true)}}catch{}};if(!frame.dataset.immersiveBound){frame.dataset.immersiveBound='true';frame.addEventListener('load',bind)}bind()}
};
$('.workspace-tabs').insertAdjacentHTML('afterend','<div class="workspace-expand"><button id="expandWorkspace" aria-label="Expand workspace" aria-controls="workspacePanels" aria-pressed="false" hidden>⛶ Fullscreen</button></div>');
document.body.insertAdjacentHTML('beforeend','<div id="immersiveBar" hidden><span id="immersiveTitle"></span><nav id="immersiveTabs" role="tablist" aria-label="Fullscreen workspace views">'+Object.entries(WorkspaceShell.labels).map(([mode,label])=>'<button role="tab" data-workspace-mode="'+mode+'" aria-selected="false">'+label+'</button>').join('')+'</nav><button id="exitWorkspace" aria-label="Exit Fullscreen">Exit Fullscreen ⤢</button></div>');
$('#expandWorkspace').onclick=()=>Immersive.enter();$('#exitWorkspace').onclick=()=>Immersive.exit();$('#immersiveTabs').querySelectorAll('button').forEach(button=>button.onclick=()=>setWorkspaceTab(button.dataset.workspaceMode));$('#immersiveTabs').onkeydown=e=>WorkspaceShell.keyboard(e,$('#immersiveTabs'));
const immersiveBack=backToLibrary;backToLibrary=function(...args){Immersive.exit({focus:false});immersiveBack(...args);Immersive.sync()};
document.addEventListener('keydown',e=>Immersive.escape(e),true);new MutationObserver(()=>Immersive.bindReader()).observe($('#readerContent'),{childList:true});Immersive.sync();Immersive.bindReader();
