/* Version upgrades and archive restores commit atomically. No destructive re-creation. */
const ArchiveDB={
  stores:['books','libraries','fonts','settings'],
  open(name='personal-reading-workspace'){return new Promise((resolve,reject)=>{let migrationError;const request=indexedDB.open(name,3);request.onblocked=()=>reject(new Error('Close other tabs of Archive of Me, then reload to finish the safe database upgrade.'));
    request.onupgradeneeded=event=>{const db=request.result,tx=request.transaction;for(const name of this.stores)if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:'id'});
      if(event.oldVersion===1){const store=tx.objectStore('books'),read=store.getAll();read.onsuccess=()=>{try{const migrated=ArchiveModel.migrate(read.result);ArchiveModel.validate({...migrated,fonts:[],settings:[]});for(const b of ArchiveModel.migrateStacks(migrated.books))store.put(b);for(const l of migrated.libraries)tx.objectStore('libraries').put(l);tx.objectStore('settings').put({id:'initialized',value:true});}catch(e){migrationError=e;tx.abort()}};}
      if(event.oldVersion===2){const store=tx.objectStore('books'),read=store.getAll();read.onsuccess=()=>{try{for(const b of ArchiveModel.migrateStacks(read.result))store.put(b)}catch(e){migrationError=e;tx.abort()}};}
    };request.onerror=()=>reject(migrationError||request.error);request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result)};
  })},
  read(db){return new Promise((resolve,reject)=>{const tx=db.transaction(this.stores,'readonly'),data={};for(const name of this.stores){const r=tx.objectStore(name).getAll();r.onsuccess=()=>data[name]=r.result}tx.oncomplete=()=>resolve(data);tx.onerror=()=>reject(tx.error)})},
  patch(db,next,baseline){return new Promise((resolve,reject)=>{const tx=db.transaction(this.stores,'readwrite'),live={};let remaining=this.stores.length,error;
    for(const store of this.stores){const r=tx.objectStore(store).getAll();r.onsuccess=()=>{live[store]=r.result;if(--remaining)return;try{for(const name of this.stores){const old=new Map(baseline[name].map(x=>[x.id,x])),desired=new Map(next[name].map(x=>[x.id,x])),map=new Map(live[name].map(x=>[x.id,x]));for(const id of old.keys())if(!desired.has(id))map.delete(id);for(const [id,value] of desired){const prior=old.get(id);if(!prior){if(map.has(id))throw new Error('Concurrent duplicate ID; please reload.');map.set(id,value)}else{const merged={...(map.get(id)||value)};for(const [key,item] of Object.entries(value))if(item!==prior[key])merged[key]=item;map.set(id,merged)}}live[name]=[...map.values()]}ArchiveModel.validate(live);for(const name of this.stores){const s=tx.objectStore(name);s.clear();live[name].forEach(x=>s.put(x))}}catch(e){error=e;tx.abort()}}}
    tx.oncomplete=()=>resolve(live);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||new Error('Archive transaction aborted.'));
  })},
  write(db,data){ArchiveModel.validate(data);return new Promise((resolve,reject)=>{const tx=db.transaction(this.stores,'readwrite');let error;
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||new Error('Archive transaction aborted.'));
    try{for(const name of this.stores){const store=tx.objectStore(name);store.clear();for(const record of data[name])store.put(record)}}catch(e){error=e;tx.abort()}
  })}
};
