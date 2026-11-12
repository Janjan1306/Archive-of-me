const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/app.js', 'utf8');
const context = vm.createContext({});
vm.runInContext(source.slice(0,source.indexOf('function render()')) + `
this.api={pages,appearanceOf,defaultAppearance,bookMarkup,shelfMarkup,setBooks:value=>books=value};`,context);
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
