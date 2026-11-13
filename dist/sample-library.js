/* Explicit, private six-book import and portable per-Library seeds. Never runs on refresh. */
const SampleLibrary={
 identity:'archive-of-me.six-books.v2',busy:false,
 async install(data,id){
  if(!/^[-\w.:]{1,180}$/.test(id||''))throw new Error('Invalid seed installation identity.');
  ArchiveModel.validate(data);if(data.libraries.length!==1||data.settings.length||data.books.some(b=>b.libraryId!==data.libraries[0].id)||data.books.filter(b=>!b.deletedAt).length>16)throw new Error('Invalid Library seed membership or capacity.');
  // Fonts belong to the shared store. Give imported fonts new IDs and rewrite only
  // exact font references inside incoming records; existing font choices are untouched.
  const fonts=new Map(data.fonts.map(f=>[f.id,crypto.randomUUID()]));
  const rewrite=value=>{if(value instanceof Blob||['[object Blob]','[object File]'].includes(Object.prototype.toString.call(value)))return value;if(Array.isArray(value))return value.map(rewrite);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v)]));return typeof value==='string'&&value.startsWith('font-')&&fonts.has(value.slice(5))?'font-'+fonts.get(value.slice(5)):value};
  const incoming={...data,books:data.books.map(rewrite),libraries:data.libraries.map(rewrite),fonts:data.fonts.map(f=>({...f,id:fonts.get(f.id)}))};
  const result=await ArchiveDB.installSeed(db,incoming,id);await reloadArchive();await loadFonts();if(archive.libraries.some(l=>l.id===result.libraryId)){currentLibraryId=result.libraryId;await setting('activeLibrary',currentLibraryId)}render();if($('#seedLibrary')){$('#seedLibrary').replaceChildren();for(const l of archive.libraries){const o=document.createElement('option');o.value=l.id;o.textContent=l.name;o.selected=l.id===currentLibraryId;$('#seedLibrary').append(o)}}return result;
 },
 async package(libraryId){
  const latest=await ArchiveDB.read(db),library=latest.libraries.find(l=>l.id===libraryId);if(!library)throw new Error('Select a Library.');
  const selected=latest.books.filter(b=>b.libraryId===libraryId);if(!selected.length)throw new Error('This Library is empty.');
  const missing=selected.filter(b=>!(b.file instanceof Blob));if(missing.length)throw new Error('Attach EPUBs before exporting a reusable seed: '+missing.map(b=>b.title).join(', '));
  // Follow exact references throughout book/card/node preferences, without exporting
  // unrelated fonts or global settings.
  const required=new Set();function scan(v){if(v instanceof Blob)return;if(typeof v==='string'&&v.startsWith('font-'))required.add(v.slice(5));else if(v&&typeof v==='object')Object.values(v).forEach(scan)}scan(selected);scan(library);
  const data={books:selected,libraries:[library],fonts:latest.fonts.filter(f=>required.has(f.id)),settings:[]};
  return encodeArchive(data,{kind:'library-seed',seed:{version:1,id:library.seedIdentity||'library.'+library.id,name:library.name}});
 },
 async importPackage(file){const parsed=await decodeBackup(file,true);if(parsed.kind!=='library-seed'||parsed.seed?.version!==1)throw new Error('Choose a Library seed exported with Export Library seed. Use Storage & backup for a complete archive ZIP.');return this.install(parsed.data,parsed.seed.id)},
 async importEPUBs(files){
  if(files.length!==6)throw new Error('Select the six original EPUB files together.');
  const attachments=[];for(const file of files)attachments.push(await parseEPUB(file));
  const plan=SamplePlan.books,ordered=plan.map(p=>{const matches=attachments.filter(a=>a.title.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().includes(p.match));if(matches.length!==1)throw new Error('Could not uniquely identify '+p.title+' in the selected EPUBs.');return matches[0]});
  if(new Set(ordered).size!==6)throw new Error('Six distinct EPUBs are required.');
  for(const [i,a]of ordered.entries()){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await a.file.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');if(digest!==plan[i].epubSHA256)throw new Error('The selected edition of '+plan[i].title+' differs from the verified sample EPUB. Choose the original file.')}
  const data=await this.build(ordered);return this.install(data,this.identity);
 },
 async build(attachments){
  const library={id:'sample-v2-library',name:'Sample Library',background:'#0a0a0a',line:'#77776c',order:0,archived:false,seedIdentity:this.identity},records=[];
  for(const [index,p]of SamplePlan.books.entries()){
   const a=attachments[index],id='sample-v2-'+p.id,stable=key=>id+'-'+key,base=newBookRecord(p.title,p.author,index),book={...base,...a,id,title:p.title,author:p.author,libraryId:library.id,order:index,color:p.color,type:'serif',sampleNumber:String(index+1).padStart(2,'0'),sampleProvenance:SamplePlan.provenance,samplePlanRevision:SamplePlan.revision,genre:p.genre,language:p.language,sampleRights:p.rights};
   book.appearance={...base.appearance,color:p.color,typography:'serif',orientation:index>3?'horizontal':'upright'};book.appearanceDefaults={...book.appearance};
   const characters=p.characters.map(([key,name,role],i)=>({id:stable(key),name,role,description:p.characterDetails[i].description||role,colors:{fill:p.characterDetails[i].node_fill||p.color,text:p.characterDetails[i].node_text||ink(p.color)},aliases:[],createdAt:Date.now()}));
   const relationships=p.relationships.map(([from,type,to,label],i)=>({id:stable(p.relationshipDetails[i].id||'relation-'+i),editorialReference:p.relationshipDetails[i].source||{href:p.relationshipDetails[i].source_href},notes:p.relationshipDetails[i].note||'',from:'c:'+stable(from),to:'c:'+stable(to),type,label}));
   const trees=(p.trees||[]).map((t,i)=>({id:stable(t.id||'tree-'+i),description:t.description,bookId:id,name:t.name,template:t.template,memberIds:t.members.map(stable),ranks:(t.ranks||[]).map((name,j)=>({id:stable('rank-'+i+'-'+j),name})),assignments:Object.fromEntries(Object.entries(t.assignments||{}).map(([key,j])=>[stable(key),stable('rank-'+i+'-'+j)])),connections:[],positions:{},camera:{x:30,y:30,zoom:.8}}));
   book.world={version:1,characters,relationships,organizations:[],memberships:[],trees,mapSettings:{}};
   const zip=await JSZip.loadAsync(a.file),opf=xml(await zip.file(a.packagePath).async('string')),items=[...opf.getElementsByTagName('*')].filter(n=>n.localName==='item'),spine=[...opf.getElementsByTagName('*')].filter(n=>n.localName==='itemref'&&n.getAttribute('linear')!=='no').map(n=>items.find(x=>x.getAttribute('id')===n.getAttribute('idref'))).filter(Boolean).map(n=>resolvePath(a.packagePath,n.getAttribute('href')));
   const reports=[],cards=[];for(const [i,c]of p.cards.entries()){
    const [title,kind,body,reference,search]=c,detail=p.cardDetails[i],href=reference?.split('#')[0],fragment=reference?.split('#')[1];let doc,valid=false,found=false;
    if(href&&zip.file(href)&&spine.includes(href)){doc=EPUBDocument.parse(await zip.file(href).async('string'));valid=!fragment||[...doc.querySelectorAll('[id]')].some(n=>n.id===fragment);found=!search||doc.body.textContent.toLowerCase().includes(search.toLowerCase())}
    reports.push({title,reference,chapterFound:valid,searchFound:found,exactAnchor:false});
    const type=kind==='theory'?'clue':['quote_placeholder','image_placeholder'].includes(kind)?'note':kind;
    cards.push({id:stable(detail.id||'card-'+i),colors:Object.fromEntries(Object.entries(detail.style||{}).filter(([,v])=>/^#[0-9a-f]{6}$/i.test(v))),type,title:kind==='theory'?'Theory — '+title:title,body:body+(reference?'\n\nEditorial reference: '+reference+(search?' · Search: '+search:'')+(valid?'':' · Reference needs review')+(search&&!found?' · Search text not found':'')+'. This note is not an exact source-linked quotation.':''),color:detail.style?.accent||p.color,x:40+(detail.position_hint?.column??i%3)*340,y:40+(detail.position_hint?.row??Math.floor(i/3))*300,w:300,h:250,sampleKind:kind,editorialReference:reference||null});
   }
   // Resolve a short paragraph containing the supplied editorial search cue.
   // Resolve its literal spelling against the same sanitized DOM as Reader; keep
   // the descriptive placeholder as a note when it is absent or ambiguous.
   const highlights=[];
   if(p.id==='thien-quan'){
    const href='Text/C1.html',entry=zip.file(href),needle='cứu vớt chúng sinh';
    if(entry){const doc=EPUBDocument.parse(await entry.async('string')),text=doc.body.textContent,paragraph=[...doc.querySelectorAll('p')].find(n=>n.textContent.includes(needle)&&n.textContent.length<160),quote=paragraph?.textContent,start=quote?text.indexOf(quote):-1;
     if(start>=0&&text.indexOf(quote,start+quote.length)<0){const source={href,chapter:'Chương 1 — Quan Trời Ban Phúc',start,end:start+quote.length,text:text.slice(start,start+quote.length)},highlight={...source,id:stable('highlight-0'),color:'#c4a3ff',note:'First short paragraph containing the editorial search cue, verified against the supplied EPUB.'};highlights.push(highlight);
      const card=cards.find(c=>c.sampleKind==='quote_placeholder');if(card){Object.assign(card,{type:'quote',body:source.text,source,highlightId:highlight.id});reports.find(r=>r.title===card.title).exactAnchor=true}
     }
    }
   }
   // Character cards share the registry rather than copying character records.
   characters.forEach((ch,i)=>cards.push({id:stable('character-card-'+i),type:'character',characterId:ch.id,title:ch.name,body:ch.role,color:p.color,x:40+i%3*340,y:40+Math.ceil(p.cards.length/3)*300+Math.floor(i/3)*240,w:280,h:200}));
   book.board={cards,connections:(p.connections||[]).map(([from,to,label],i)=>({id:stable('connection-'+i),from:stable(p.cardDetails[from].id||'card-'+from),to:stable(p.cardDetails[to].id||'card-'+to),label,bend:30})),viewport:{x:30,y:30,zoom:.65}};
   for(const r of p.relationshipDetails){const ref=r.source?.href||r.source_href,href=ref?.split('#')[0],fragment=ref?.split('#')[1],hint=r.source?.search_hint,entry=zip.file(href||'');let chapterFound=false,searchFound=false;if(entry&&spine.includes(href)){const doc=EPUBDocument.parse(await entry.async('string'));chapterFound=!fragment||[...doc.querySelectorAll('[id]')].some(n=>n.id===fragment);searchFound=!hint||doc.body.textContent.toLowerCase().includes(hint.toLowerCase())}reports.push({title:r.type,kind:'relationship',reference:ref,chapterFound,searchFound,exactAnchor:false})}
   const first=p.cardDetails[0]?.source||{href:p.cards[0]?.[3]};if(first.href)book.readerPosition={href:first.href.split('#')[0],chapter:first.label||'Opening chapter',start:0,offset:0,progress:0};
   book.sampleReferenceReport=reports;book.highlights=highlights;book.splitWorkspace={left:'reader',right:'board'};
   records.push(book);
  }
  return ArchiveModel.validate({books:ArchiveModel.autoStack(records),libraries:[library],fonts:[],settings:[]});
 },
 mount(){
  if($('#sampleLibrarySettings'))return;const section=document.createElement('section');section.id='sampleLibrarySettings';section.innerHTML='<h3>Sample Library</h3><p>Install an editable collection from a Library seed, or build the development collection using your six EPUBs. Existing Libraries are preserved.</p><label>Add Sample Library<input id="sampleSeedFile" type="file" accept=".zip"></label><details><summary>Development collection</summary><p>Choose Alice, Pride and Prejudice, Dracula, Tru Tiên, Thiên Quan Tứ Phúc and Guilt together. Files stay in this browser; no EPUB is uploaded or bundled with the website.</p><label>Import six EPUBs<input id="sampleEPUBs" type="file" multiple accept=".epub"></label></details><label>Library to export<select id="seedLibrary"></select></label><button id="exportLibrarySeed">Export Library seed</button><p>Includes EPUBs, artwork, annotations, cards, relationships, trees and fonts. Keep packages private until redistribution permissions are confirmed.</p><p id="sampleResult" role="status"></p>';
  $('#settingsBody').append(section);for(const l of archive.libraries){const option=document.createElement('option');option.value=l.id;option.textContent=l.name;option.selected=l.id===currentLibraryId;$('#seedLibrary').append(option)}
  const run=async task=>{if(this.busy)return;this.busy=true;section.querySelectorAll('input,button').forEach(n=>n.disabled=true);$('#sampleResult').textContent='Preparing and validating…';try{const result=await task();$('#sampleResult').textContent=result||'Done.'}catch(e){$('#sampleResult').textContent=e.message}finally{this.busy=false;section.querySelectorAll('input,button').forEach(n=>n.disabled=false)}};
  $('#sampleSeedFile').onchange=e=>{const file=e.target.files[0];if(file)run(async()=>{const r=await this.importPackage(file);return r.installed?'Sample Library added. Close Settings to explore it.':'This collection was already installed. Your edits were preserved.'})};
  $('#sampleEPUBs').onchange=e=>{const files=[...e.target.files];if(files.length)run(async()=>{const r=await this.importEPUBs(files);return r.installed?'Six-book Sample Library added. Close Settings to explore it.':'This collection was already installed. Your edits were preserved.'})};
  $('#exportLibrarySeed').onclick=()=>run(async()=>{downloadArchive(await this.package($('#seedLibrary').value),'archive-of-me-library-seed.zip');return 'Self-contained Library seed exported.'});
 }
};
const sampleOpenSettings=openSettings;openSettings=function(...args){sampleOpenSettings(...args);if(args[0]!=='libraries')SampleLibrary.mount()};$('#aboutNav').onclick=()=>openSettings();
