/* Pure archive invariants, also loaded by the Node regression suite. */
(function(root){
const Model={
  horizontal(book){return (book.appearance?.orientation||({'demo-sherlock':'horizontal'})[book.id]||'upright')==='horizontal'},
  stackMembers(books,book){return books.filter(b=>!b.deletedAt&&b.libraryId===book.libraryId&&b.stackId===book.stackId&&Model.horizontal(b)).sort((a,b)=>(a.stackOrder??a.order??0)-(b.stackOrder??b.order??0))},
  // Legacy implicit stacks used consecutive shelf order, with the first book at the bottom.
  migrateStacks(records){
    const books=records.map(b=>({...b}));
    const libraries=[...new Set(books.map(b=>b.libraryId))];
    for(const library of libraries){const row=books.filter(b=>b.libraryId===library&&!b.deletedAt).sort((a,b)=>(a.order??a.createdAt??0)-(b.order??b.createdAt??0));let run=[];
      const flush=()=>{for(let i=0;i<run.length;i+=3){const group=run.slice(i,i+3);if(group.length>1)group.forEach((b,index)=>{b.stackId='legacy-stack-'+group[0].id;b.stackOrder=index})}run=[]};
      for(const b of row){if(!b.stackSchemaVersion&&b.stackId===undefined&&Model.horizontal(b))run.push(b);else flush()}flush();
    }
    const visited=new Set();for(const b of books){const key=JSON.stringify([b.libraryId,b.stackId]);if(b.stackId&&!visited.has(key)){visited.add(key);const members=Model.stackMembers(books,b);members.forEach((item,index)=>{if(item.stackOrder===undefined)item.stackOrder=index})}b.stackSchemaVersion=1}
    return books;
  },
  stackBooks(records,sourceId,targetId,above=true){
    const source=records.find(b=>b.id===sourceId),target=records.find(b=>b.id===targetId);
    if(!source||!target||source===target||source.deletedAt||target.deletedAt||source.libraryId!==target.libraryId||!Model.horizontal(source)||!Model.horizontal(target))throw new Error('Stacking requires horizontal books in the same Library.');
    const members=(target.stackId?Model.stackMembers(records,target):[target]).filter(b=>b.id!==sourceId);
    if(members.length>=3)throw new Error('Stacks hold at most three books.');
    members.splice(members.findIndex(b=>b.id===targetId)+(above?1:0),0,source);
    const id=target.stackId||crypto.randomUUID();
    return records.map(b=>{const index=members.findIndex(x=>x.id===b.id);return index>=0?{...b,stackId:id,stackOrder:index,stackSchemaVersion:1}:b});
  },
  unstackBook(records,id){return records.map(b=>b.id===id?{...b,stackId:null,stackOrder:null,stackSchemaVersion:1}:b)},
  board(book){return book.board||{cards:[],connections:[],viewport:{x:40,y:40,zoom:1}}},
  migrate(old){
    const libraries=[],books=[...old].sort((a,b)=>(a.order??a.createdAt??0)-(b.order??b.createdAt??0)).map((record,i)=>{
      if(!record||typeof record.id!=='string'||typeof record.title!=='string')throw new Error('Invalid legacy book. Migration stopped; original data preserved.');
      const libraryId='legacy-library-'+Math.floor(i/16);
      if(!libraries.some(l=>l.id===libraryId))libraries.push({id:libraryId,name:i<16?'My Library':'Library '+(Math.floor(i/16)+1),background:'#0a0a0a',line:'#77776c',order:libraries.length,archived:false});
      const board=structuredClone(Model.board(record));
      if(record.workspace?.notes&&!Array.isArray(record.workspace.notes))throw new Error('Invalid legacy notes; migration stopped.');
      for(const [j,n] of (record.workspace?.notes||[]).entries()){
        if(!n||typeof n.body!=='string')throw new Error('Invalid legacy note; migration stopped.');
        const id='legacy-note-'+(n.id||j);
        if(!board.cards.some(c=>c.id===id))board.cards.push({id,type:'note',title:n.title||'Note',body:n.body,color:'#f2ef24',x:(j%3)*280,y:Math.floor(j/3)*210,w:250,h:180,legacyNoteId:n.id});
      }
      return {...record,libraryId:record.libraryId||libraryId,order:record.order??i,board,migrationVersion:2};
    });
    if(!libraries.length)libraries.push({id:'legacy-library-0',name:'My Library',background:'#0a0a0a',line:'#77776c',order:0,archived:false});
    return {books,libraries};
  },
  validate(data){
    if(!Array.isArray(data.books)||!Array.isArray(data.libraries)||!Array.isArray(data.fonts)||!Array.isArray(data.settings))throw new Error('Incomplete archive.');
    for(const list of [data.books,data.libraries,data.fonts,data.settings]){const seen=new Set();for(const r of list){if(!r||typeof r.id!=='string'||!/^[-\w.:]+$/.test(r.id)||seen.has(r.id))throw new Error('Invalid or duplicate record ID.');seen.add(r.id)}}
    for(const l of data.libraries)if(typeof l.name!=='string'||!/^#[0-9a-f]{6}$/i.test(l.background)||!/^#[0-9a-f]{6}$/i.test(l.line)||!Number.isFinite(l.order))throw new Error('Invalid Library metadata.');
    for(const b of data.books){if(typeof b.title!=='string'||!data.libraries.some(l=>l.id===b.libraryId))throw new Error('Book has no valid Library.');if(b.board){if(!Array.isArray(b.board.cards)||!Array.isArray(b.board.connections))throw new Error('Invalid board.');const ids=new Set();for(const c of b.board.cards){if(typeof c.id!=='string'||ids.has(c.id)||!['character','event','clue','quote','note','image'].includes(c.type)||![c.x,c.y,c.w,c.h].every(Number.isFinite)||c.w<80||c.h<60)throw new Error('Invalid board card.');ids.add(c.id)}for(const e of b.board.connections){if(!e.id||!ids.has(e.from)||!ids.has(e.to))throw new Error('Invalid board connection.')}}}
    for(const l of data.libraries)if(data.books.filter(b=>b.libraryId===l.id&&!b.deletedAt).length>16)throw new Error('Library “'+l.name+'” exceeds 16 books.');
    return data;
  },
  canAdd(data,id){const l=data.libraries.find(l=>l.id===id);return !!l&&!l.archived&&data.books.filter(b=>!b.deletedAt&&b.libraryId===id).length<16},
  move(data,id,destination){if(!Model.canAdd(data,destination))throw new Error('Destination Library is full or archived.');return {...data,books:data.books.map(b=>b.id===id?{...b,libraryId:destination,stackId:null,order:Date.now()}:b)}},
  pin(book,source,color){const highlights=[...(book.highlights||[])];let h=highlights.find(h=>h.href===source.href&&h.start===source.start&&h.end===source.end&&h.text===source.text);if(!h){h={...source,id:crypto.randomUUID(),color};highlights.push(h)}const board=structuredClone(Model.board(book)),n=board.cards.length,card={id:crypto.randomUUID(),type:'quote',title:source.chapter||'Quote',body:source.text,source:{...source},highlightId:h.id,color:h.color,x:(n%4)*290,y:Math.floor(n/4)*230,w:260,h:200};board.cards.push(card);board.lastPinnedId=card.id;return {...book,highlights,board}},
  recolor(book,id,color){return {...book,highlights:(book.highlights||[]).map(h=>h.id===id?{...h,color}:h),board:{...Model.board(book),cards:Model.board(book).cards.map(c=>c.highlightId===id?{...c,color}:c)}}},
  deleteHighlight(book,id){return {...book,highlights:(book.highlights||[]).filter(h=>h.id!==id),board:{...Model.board(book),cards:Model.board(book).cards.map(c=>c.highlightId===id?{...c,highlightId:null}:c)}}},
  mergeBoard(current,before,after){
    const result={...current};
    for(const key of ['cards','connections']){const old=new Map(before[key].map(x=>[x.id,x])),next=new Map(after[key].map(x=>[x.id,x])),live=new Map(current[key].map(x=>[x.id,x]));for(const [id,value] of old)if(!next.has(id))live.delete(id);for(const [id,value] of next){const prior=old.get(id);if(!prior){live.set(id,value);continue}const merged={...(live.get(id)||value)};for(const [k,v] of Object.entries(value))if(JSON.stringify(v)!==JSON.stringify(prior[k]))merged[k]=v;live.set(id,merged)}result[key]=[...live.values()]}
    for(const [key,value] of Object.entries(after))if(!['cards','connections'].includes(key)&&JSON.stringify(value)!==JSON.stringify(before[key]))result[key]=value;
    return result;
  },
  replaceEPUB(book,attachment){const board=structuredClone(Model.board(book));board.cards=board.cards.map(c=>c.source?{...c,source:{...c.source,unresolved:true},highlightId:null}:c);return {...book,...attachment,board,readerPosition:null,highlights:(book.highlights||[]).map(h=>({...h,unresolved:true}))}}
};root.ArchiveModel=Model;if(typeof module!=='undefined')module.exports=Model;
})(globalThis);
