/* One additive per-book world record. Views and board cards reference its stable IDs. */
(function(root){
const presets={parent:'Parent of',child:'Child of',sibling:'Sibling of',partner:'Spouse / Partner of',master:'Master of',disciple:'Disciple of',friend:'Friend of',ally:'Ally of',enemy:'Enemy of',member:'Member of',leader:'Leader of',custom:'Custom'};
const symmetric=new Set(['sibling','partner','friend','ally','enemy']);
const W={presets,symmetric,
 get(book){return {version:1,characters:[],organizations:[],memberships:[],relationships:[],mapSettings:{},...(book.world||{})}},
 ref(kind,id){return (kind==='organization'?'o:':'c:')+id},
 entity(world,ref){return (ref?.startsWith('o:')?world.organizations:world.characters).find(x=>x.id===ref?.slice(2))},
 name(world,ref){return W.entity(world,ref)?.name||'Unavailable'},
 edit(book,fn){const world=structuredClone(W.get(book));fn(world);W.validate(world);return {...book,world}},
 character(book,data,id){return W.edit(book,w=>{const old=w.characters.find(c=>c.id===id);if(!data.name?.trim())throw new Error('A character name is required.');const value={...old,...data,id:old?.id||crypto.randomUUID(),name:data.name.trim(),aliases:data.aliases||[],createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};w.characters=old?w.characters.map(c=>c.id===id?value:c):[...w.characters,value]})},
 organization(book,data,id){return W.edit(book,w=>{const old=w.organizations.find(c=>c.id===id);if(!data.name?.trim())throw new Error('An organization name is required.');const used=new Set(),ranks=(data.rankNames||old?.ranks?.map(r=>r.name)||[]).filter(n=>n.trim()).map((name,i)=>{const match=old?.ranks?.find(r=>r.name===name&&!used.has(r.id))||old?.ranks?.find(r=>!used.has(r.id));const rank={...match,id:match?.id||crypto.randomUUID(),name:name.trim()};used.add(rank.id);return rank});const value={...old,...data,id:old?.id||crypto.randomUUID(),name:data.name.trim(),ranks,createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};delete value.rankNames;if(value.parentId===value.id)throw new Error('An organization cannot be its own parent.');let parent=value.parentId,seen=new Set([value.id]);while(parent){if(seen.has(parent))throw new Error('Parent organizations cannot form a cycle.');seen.add(parent);parent=w.organizations.find(o=>o.id===parent)?.parentId}w.organizations=old?w.organizations.map(o=>o.id===id?value:o):[...w.organizations,value];w.memberships=w.memberships.map(m=>m.organizationId===value.id&&!ranks.some(r=>r.id===m.rankId)?{...m,rankId:null}:m)})},
 membership(book,data,id){return W.edit(book,w=>{const prior=id?w.memberships.find(m=>m.id===id):w.memberships.find(m=>m.characterId===data.characterId&&m.organizationId===data.organizationId);if(w.memberships.some(m=>m.id!==prior?.id&&m.characterId===data.characterId&&m.organizationId===data.organizationId))throw new Error('This character already has a membership in that organization.');const value={...prior,...data,id:prior?.id||crypto.randomUUID(),updatedAt:Date.now()};w.memberships=prior?w.memberships.map(m=>m.id===prior.id?value:m):[...w.memberships,value];if(value.relationshipId)w.relationships=w.relationships.map(r=>r.id===value.relationshipId?{...r,from:'c:'+value.characterId,to:'o:'+value.organizationId}:r)})},
 key(r){let {from,to,type}=r;if(type==='child'){[from,to]=[to,from];type='parent'}if(type==='disciple'){[from,to]=[to,from];type='master'}if(symmetric.has(type)&&from>to)[from,to]=[to,from];return JSON.stringify([from,to,type,type==='custom'?(r.label||'').trim().toLowerCase():''])},
 relationship(book,data,id){return W.edit(book,w=>{if(data.from===data.to)throw new Error('Choose two different entities.');if(!presets[data.type])throw new Error('Choose a relationship type.');const prior=w.relationships.find(r=>r.id===id),value={...prior,...data,id:prior?.id||crypto.randomUUID(),label:data.label?.trim()||presets[data.type],createdAt:prior?.createdAt||Date.now(),updatedAt:Date.now()};const duplicate=w.relationships.find(r=>r.id!==id&&W.key(r)===W.key(value));if(duplicate){if(id)throw new Error('That relationship already exists.');return}if(['member','leader'].includes(value.type)&&(!value.from.startsWith('c:')||!value.to.startsWith('o:')))throw new Error('Membership relationships go from a character to an organization.');if(prior)w.memberships=w.memberships.filter(m=>m.relationshipId!==prior.id||(['member','leader'].includes(value.type)&&m.characterId===value.from.slice(2)&&m.organizationId===value.to.slice(2)));w.relationships=prior?w.relationships.map(r=>r.id===id?value:r):[...w.relationships,value];if(['member','leader'].includes(value.type)){const m=w.memberships.find(m=>m.characterId===value.from.slice(2)&&m.organizationId===value.to.slice(2));if(m)Object.assign(m,{relationshipId:value.id,role:value.type==='leader'?'Leader':m.role});else w.memberships.push({id:crypto.randomUUID(),characterId:value.from.slice(2),organizationId:value.to.slice(2),rankId:null,role:value.type==='leader'?'Leader':'',relationshipId:value.id})}})},
 removeRelationship(book,id){return W.edit(book,w=>{w.relationships=w.relationships.filter(r=>r.id!==id);w.memberships=w.memberships.filter(m=>m.relationshipId!==id)})},
 removeMembership(book,id){return W.edit(book,w=>{const m=w.memberships.find(m=>m.id===id);w.memberships=w.memberships.filter(m=>m.id!==id);if(m)w.relationships=w.relationships.filter(r=>!(r.from==='c:'+m.characterId&&r.to==='o:'+m.organizationId&&['member','leader'].includes(r.type)))})},
 removeEntity(book,ref){let next=W.edit(book,w=>{const id=ref.slice(2);if(ref.startsWith('c:'))w.characters=w.characters.filter(c=>c.id!==id);else{w.organizations=w.organizations.filter(o=>o.id!==id).map(o=>o.parentId===id?{...o,parentId:null}:o)}w.memberships=w.memberships.filter(m=>ref.startsWith('c:')?m.characterId!==id:m.organizationId!==id);w.relationships=w.relationships.filter(r=>r.from!==ref&&r.to!==ref)});if(ref.startsWith('c:')&&book.board){const entity=W.entity(W.get(book),ref);next={...next,board:{...book.board,cards:book.board.cards.map(c=>c.characterId===ref.slice(2)?{...c,characterId:null,characterSnapshot:entity}:c)}}}return next},
 validate(w){for(const key of ['characters','organizations','memberships','relationships']){if(!Array.isArray(w[key]))throw new Error('Invalid world '+key);const ids=new Set();for(const item of w[key]){if(!item||typeof item.id!=='string'||!/^[-\w.:]+$/.test(item.id)||ids.has(item.id))throw new Error('Invalid or duplicate world ID.');ids.add(item.id)}}for(const e of [...w.characters,...w.organizations])if(typeof e.name!=='string'||!e.name.trim())throw new Error('Invalid world entity name.');for(const c of w.characters)if(c.aliases&&!Array.isArray(c.aliases))throw new Error('Invalid character aliases.');for(const o of w.organizations){if(o.parentId&&!w.organizations.some(p=>p.id===o.parentId))throw new Error('Unknown parent organization.');if(o.ranks&&!Array.isArray(o.ranks))throw new Error('Invalid rank definitions.')}for(const m of w.memberships){const org=w.organizations.find(o=>o.id===m.organizationId);if(!org||!w.characters.some(c=>c.id===m.characterId)||m.rankId&&!org.ranks?.some(r=>r.id===m.rankId))throw new Error('Unknown membership or rank.')}for(const r of w.relationships)if(!W.entity(w,r.from)||!W.entity(w,r.to)||typeof r.label!=='string')throw new Error('Unknown relationship endpoint.');return w},
 edges(w){const edges=[...w.relationships];for(const m of w.memberships)if(!edges.some(r=>r.from==='c:'+m.characterId&&r.to==='o:'+m.organizationId&&['member','leader'].includes(r.type)))edges.push({id:'membership:'+m.id,from:'c:'+m.characterId,to:'o:'+m.organizationId,type:'member',label:m.role||w.organizations.find(o=>o.id===m.organizationId)?.ranks?.find(r=>r.id===m.rankId)?.name||'Member of',membershipId:m.id});return edges},
 layout(w,mode='network',org='',type='',query=''){
  let nodes=[...w.characters.map(c=>({...c,ref:'c:'+c.id,kind:'character'})),...w.organizations.map(o=>({...o,ref:'o:'+o.id,kind:'organization'}))],edges=W.edges(w),headings=[];
  if(mode==='family'){nodes=nodes.filter(n=>n.kind==='character');edges=edges.filter(r=>['parent','child','partner','sibling'].includes(r.type))}
  if(org){const members=new Set(w.memberships.filter(m=>m.organizationId===org).map(m=>'c:'+m.characterId));nodes=nodes.filter(n=>n.ref==='o:'+org||members.has(n.ref))}
  if(type)edges=edges.filter(r=>r.type===type);
  let refs=new Set(nodes.map(n=>n.ref));edges=edges.filter(r=>refs.has(r.from)&&refs.has(r.to));
  if(mode==='hierarchy'){
    const chosen=w.organizations.find(o=>o.id===org)||w.organizations[0];
    if(chosen){
      nodes=nodes.filter(n=>n.ref==='o:'+chosen.id||w.memberships.some(m=>m.organizationId===chosen.id&&'c:'+m.characterId===n.ref));
      const levels=[...(chosen.ranks||[]).map(r=>({id:r.id,name:r.name})),{id:'',name:'Unranked'}];
      const max=Math.max(1,...levels.map(rank=>nodes.filter(n=>w.memberships.some(m=>m.organizationId===chosen.id&&m.characterId===n.id&&(m.rankId||'')===rank.id)).length));
      const root=nodes.find(n=>n.ref==='o:'+chosen.id);if(root)Object.assign(root,{x:40+(max-1)*100,y:20});
      let level=0;for(const rank of levels){const members=nodes.filter(n=>n.kind==='character'&&w.memberships.some(m=>m.organizationId===chosen.id&&m.characterId===n.id&&(m.rankId||'')===rank.id));if(!members.length)continue;const y=220+level++*200;headings.push({x:40,y:y-28,label:rank.name});members.forEach((n,i)=>Object.assign(n,{x:40+i*200,y}))}
      refs=new Set(nodes.map(n=>n.ref));edges=W.edges(w).filter(r=>['member','leader'].includes(r.type)&&(!type||r.type===type)&&refs.has(r.from)&&refs.has(r.to));
    }else nodes.forEach((n,i)=>Object.assign(n,{x:40+i*200,y:120}));
  }else if(mode==='family'){
    // Partner/sibling constraints share a generation unless explicit ancestry contradicts it.
    const parents=edges.filter(e=>['parent','child'].includes(e.type)).map(e=>({from:e.type==='child'?e.to:e.from,to:e.type==='child'?e.from:e.to}));
    const adjacency=new Map(nodes.map(n=>[n.ref,[]]));parents.forEach(e=>adjacency.get(e.from)?.push(e.to));
    const reaches=(from,to,seen=new Set())=>{if(from===to)return true;if(seen.has(from))return false;seen.add(from);return (adjacency.get(from)||[]).some(next=>reaches(next,to,seen))};
    const union=new Map(nodes.map(n=>[n.ref,n.ref])),find=x=>union.get(x)===x?x:(union.set(x,find(union.get(x))),union.get(x));
    for(const e of edges.filter(e=>['partner','sibling'].includes(e.type)))if(!reaches(e.from,e.to)&&!reaches(e.to,e.from))union.set(find(e.to),find(e.from));
    const groups=new Map();for(const n of nodes){const key=find(n.ref);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(n)}
    const graph=new Map([...groups.keys()].map(k=>[k,new Set()]));for(const e of parents)if(find(e.from)!==find(e.to))graph.get(find(e.from))?.add(find(e.to));
    // Condense cycles so fictional or incomplete genealogies remain finite.
    let counter=0,stack=[],on=new Set(),indices=new Map(),low=new Map(),components=[];
    function visit(v){indices.set(v,counter);low.set(v,counter++);stack.push(v);on.add(v);for(const t of graph.get(v)||[]){if(!indices.has(t)){visit(t);low.set(v,Math.min(low.get(v),low.get(t)))}else if(on.has(t))low.set(v,Math.min(low.get(v),indices.get(t)))}if(low.get(v)===indices.get(v)){const group=[];let t;do{t=stack.pop();on.delete(t);group.push(t)}while(t!==v);components.push(group)}}
    for(const k of groups.keys())if(!indices.has(k))visit(k);const component=new Map();components.forEach((g,i)=>g.forEach(k=>component.set(k,i)));const levels=components.map(()=>0);
    for(let round=0;round<components.length;round++)for(const [a,children] of graph)for(const b of children)if(component.get(a)!==component.get(b))levels[component.get(b)]=Math.max(levels[component.get(b)],levels[component.get(a)]+1);
    for(const level of [...new Set(levels)].sort((a,b)=>a-b)){
      const row=nodes.filter(n=>levels[component.get(find(n.ref))]===level);
      const desired=n=>{const ps=parents.filter(e=>e.to===n.ref).map(e=>nodes.find(p=>p.ref===e.from)).filter(p=>Number.isFinite(p?.x));return ps.length?ps.reduce((sum,p)=>sum+p.x,0)/ps.length:40+nodes.indexOf(n)*180};
      const sameGeneration=[...new Set(row.map(n=>find(n.ref)))].map(key=>row.filter(n=>find(n.ref)===key)).sort((a,b)=>desired(a[0])-desired(b[0]));let last=-180;
      for(const group of sameGeneration){const aim=group.reduce((sum,n)=>sum+desired(n),0)/group.length-(group.length-1)*90;for(const [i,n] of group.entries()){const x=Math.max(last+180,aim+i*180);Object.assign(n,{x,y:40+level*220});last=x}}
      headings.push({x:row.length?Math.min(...row.map(n=>n.x)):40,y:15+level*220,label:'Generation '+(level+1)});
    }
  }else{
    // Deterministic spring/repulsion layout. Saved manual positions are applied afterward.
    const count=nodes.length,k=190,positions=nodes.map((n,i)=>{let hash=0;for(const c of n.ref)hash=(hash*31+c.charCodeAt(0))>>>0;const angle=i/Math.max(1,count)*Math.PI*2,radius=Math.max(160,Math.sqrt(count)*110);return {x:Math.cos(angle)*radius+(hash%31),y:Math.sin(angle)*radius+(hash%23)}}),index=new Map(nodes.map((n,i)=>[n.ref,i]));
    const rounds=count>150?60:160;
    for(let step=0;step<rounds;step++){
      const delta=positions.map(()=>({x:0,y:0}));
      for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){if(count>150&&(j-i)%Math.ceil(count/150))continue;let dx=positions[i].x-positions[j].x,dy=positions[i].y-positions[j].y,d=Math.max(1,Math.hypot(dx,dy)),force=k*k/d;delta[i].x+=dx/d*force;delta[i].y+=dy/d*force;delta[j].x-=dx/d*force;delta[j].y-=dy/d*force}
      for(const e of edges){const a=index.get(e.from),b=index.get(e.to);if(a===undefined||b===undefined)continue;const dx=positions[b].x-positions[a].x,dy=positions[b].y-positions[a].y,d=Math.max(1,Math.hypot(dx,dy)),force=(d-230)*.7;delta[a].x+=dx/d*force;delta[a].y+=dy/d*force;delta[b].x-=dx/d*force;delta[b].y-=dy/d*force}
      const temperature=65*(1-step/rounds)+1;positions.forEach((p,i)=>{delta[i].x-=p.x*.015;delta[i].y-=p.y*.015;const length=Math.max(1,Math.hypot(delta[i].x,delta[i].y));p.x+=delta[i].x/length*Math.min(length,temperature);p.y+=delta[i].y/length*Math.min(length,temperature)});
    }
    const minX=Math.min(0,...positions.map(p=>p.x)),minY=Math.min(0,...positions.map(p=>p.y));nodes.forEach((n,i)=>Object.assign(n,{x:Math.round(positions[i].x-minX+40),y:Math.round(positions[i].y-minY+40)}));
  }
  const saved=w.mapSettings?.positions?.[mode]||{};for(const n of nodes){const p=saved[n.ref];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))Object.assign(n,{x:p.x,...(mode==='network'?{y:p.y}:{})});n.w=144;n.h=132}
  if(query){const q=query.trim().toLowerCase();nodes=nodes.filter(n=>(n.name+' '+(n.aliases||[]).join(' ')+' '+(n.role||'')).toLowerCase().includes(q))}refs=new Set(nodes.map(n=>n.ref));edges=edges.filter(r=>refs.has(r.from)&&refs.has(r.to));
  return {nodes,edges,headings};
 }
};root.WorldModel=W;if(typeof module!=='undefined')module.exports=W;
})(globalThis);
