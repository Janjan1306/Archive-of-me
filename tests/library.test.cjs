const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/app.js', 'utf8');
const context = vm.createContext({crypto:require('node:crypto')});
vm.runInContext(source.slice(0,source.indexOf('function render()')) + `
this.api={pages,appearanceOf,defaultAppearance,bookMarkup,shelfMarkup,newBookRecord,workspaceOf,attachToBook,saveBookNote,deleteBookNote,setBooks:value=>books=value};`,context);
const {api} = context;
const legacy={id:'legacy',title:'Tiếng Việt <script>',author:'Author',width:91,height:265,type:'serif',color:'#ff427f',file:{marker:'original EPUB'}};
const before=JSON.stringify(legacy);
assert.equal(api.appearanceOf(legacy).thickness,91);
assert.equal(api.appearanceOf(legacy).typography,'serif');
assert.equal(api.appearanceOf(legacy).color,'#ff427f');
assert.equal(JSON.stringify(legacy),before,'Rendering old records must not mutate them');
for(const count of [0,3,16,17,32,33]){const books=Array.from({length:count},(_,i)=>({...legacy,id:String(i)}));api.setBooks(books);const pages=api.pages();assert.equal(pages.length,Math.max(1,Math.ceil(count/16)));assert.equal(pages.flat().length,count);assert.ok(pages.every(p=>p.length<=16));if(count===17)assert.equal(pages[1][0].id,'16');}
const horizontal={...legacy,appearance:{orientation:'horizontal',thickness:60,height:300}};
assert.match(api.bookMarkup(horizontal,0),/--width:300px;--height:60px/);
assert.match(api.bookMarkup(horizontal,0),/class="book serif horizontal\s*"/);
assert.ok(!api.bookMarkup(horizontal,0).includes('<script>'));
for(const orientation of ['left','right']){const markup=api.bookMarkup({...legacy,appearance:{orientation,tilt:12}},0);assert.match(markup,/--slot-width:145px/);assert.match(markup,/data-id="legacy"/);}
api.setBooks([horizontal,horizontal]);assert.match(api.shelfMarkup([horizontal,horizontal]),/book-stack/);
const bad=api.appearanceOf({...legacy,appearance:{color:'red;display:none',thickness:9999,orientation:'broken'}});assert.equal(bad.color,'#ff427f');assert.equal(bad.thickness,140);assert.equal(bad.orientation,'upright');
assert.ok(!fs.readFileSync('dist/index.html','utf8').includes('class="intro"'));
console.log('Passed: legacy compatibility, fixed pagination boundaries, landscape proportions, tilt bounds, stacks, escaping, validation and hero removal.');

// Optional files and workspace data must be independent of book identity.
const empty=api.newBookRecord('My chosen title','My author',3);
assert.ok(empty.id);
assert.equal(empty.file,undefined);
assert.equal(api.workspaceOf(empty).notes.length,0);
assert.notEqual(api.newBookRecord('Another','').id,empty.id);
const other=api.newBookRecord('Other book','Other author');
const withNote=api.saveBookNote(empty,{title:'Clue',body:'Tiếng Việt <tag>'});
assert.equal(api.workspaceOf(empty).notes.length,0,'Adding a note must not mutate the original record');
assert.equal(api.workspaceOf(other).notes.length,0,'Notes must be isolated by book');
const noteId=withNote.workspace.notes[0].id;
const edited=api.saveBookNote(withNote,{title:'Edited',body:'Updated note'},noteId);
assert.equal(edited.workspace.notes.length,1);
assert.equal(edited.workspace.notes[0].id,noteId);
assert.equal(edited.workspace.notes[0].body,'Updated note');
const future={...edited,workspace:{...edited.workspace,cards:[{id:'future-card'}]},readingProgress:'keep-me',unknownField:'also keep'};
const appearanceBefore=JSON.stringify(future.appearance);
const file={name:'real.epub',marker:'original bytes'};
const attached=api.attachToBook(future,{title:'EPUB title',author:'EPUB author',file,cover:null,packagePath:'OPS/package.opf'});
assert.equal(attached.id,empty.id);
assert.equal(attached.title,'My chosen title');
assert.equal(attached.author,'My author');
assert.equal(JSON.stringify(attached.appearance),appearanceBefore);
assert.equal(attached.workspace,future.workspace);
assert.equal(attached.readingProgress,'keep-me');
assert.equal(attached.unknownField,'also keep');
assert.equal(attached.file,file);
assert.equal(future.file,undefined,'Attachment must not mutate the old record');
assert.equal(attached.epubMetadata.title,'EPUB title');
const replaced=api.attachToBook(attached,{title:'Replacement',author:'Different author',file:{name:'replacement.epub'},cover:null,packagePath:'new.opf'});
assert.equal(replaced.id,empty.id);
assert.equal(replaced.workspace,attached.workspace);
assert.equal(replaced.title,'My chosen title');
const deleted=api.deleteBookNote(replaced,noteId);
assert.equal(deleted.workspace.notes.length,0);
assert.equal(deleted.workspace.cards[0].id,'future-card');
assert.equal(replaced.workspace.notes.length,1,'Deletion must not mutate prior state');
assert.throws(()=>api.saveBookNote(empty,{body:'x'},'missing'));
console.log('Passed: empty-book creation, stable IDs, note isolation/edit/delete, attachment/replacement preservation and future workspace fields.');

// Exercise the actual backup handler with JSZip, rather than copying its serialization.
(async()=>{
  const JSZip=require('../dist/vendor/jszip.min.js');let savedBlob,clicked=false;
  const backupContext=vm.createContext({
    JSZip,Blob,URL:{createObjectURL:blob=>(savedBlob=blob,'blob:test'),revokeObjectURL(){}},
    setTimeout(){},message(){},document:{createElement:()=>({click(){clicked=true}})},
    $:()=>backupControl,books:[{...attached,file:fs.readFileSync('tests/sample.epub')}]
  });
  const backupControl={};
  const start=source.indexOf("$('#backup').onclick=");
  vm.runInContext(source.slice(start,source.indexOf('function setAppearanceForm',start)),backupContext);
  await backupControl.onclick();assert.ok(clicked);assert.ok(savedBlob);
  const zip=await JSZip.loadAsync(await savedBlob.arrayBuffer());
  const metadata=JSON.parse(await zip.file('library.json').async('string'));
  assert.equal(metadata.books[0].workspace.notes[0].id,noteId);
  assert.equal(metadata.books[0].appearance.orientation,attached.appearance.orientation);
  assert.equal(metadata.books[0].id,empty.id);
  assert.equal(metadata.books[0].file,undefined);
  assert.ok(zip.file('books/'+empty.id+'.epub'));
  console.log('Passed: real ZIP backup retains notes, appearance, book identity and EPUB bytes.');
})().catch(e=>{console.error(e);process.exitCode=1});
