/* Optional content colors never replace source metadata, IDs or global appearance. */
(function(root){const V={
 hex:v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v),
 card(card){const c=card.colors||{};return {background:V.hex(c.background)?c.background:'var(--app-surface)',text:V.hex(c.text)?c.text:'var(--app-text)',accent:V.hex(c.accent)?c.accent:V.hex(card.color)?card.color:'#9655ff'}},
 node(entity){const c=entity.colors||{};return {fill:V.hex(c.fill)?c.fill:'#314659',text:V.hex(c.text)?c.text:'#f5f5f5'}},
 cardCSS(card){const c=V.card(card);return '--card-background:'+c.background+';--card-text:'+c.text+';--card-accent:'+c.accent+';'},
 nodeCSS(entity){const c=entity.colors||{},A=root.AppearanceModel||(typeof require==='function'?require('./appearance-model.js'):null),fill=V.node(entity).fill,text=V.node(entity).text;let t=.08;while(A&&t>.005&&A.contrast(A.mix(fill,'#ffffff',t),text)<4.5)t-=.005;return (V.hex(c.fill)?'--node-fill:'+c.fill+';':'')+(V.hex(c.text)?'--node-text:'+c.text+';--node-label-background:'+fill+';':'')+(V.hex(c.fill)&&A?'--node-hover-fill:'+A.mix(fill,'#ffffff',Math.max(0,t))+';':'')},
 bookFont(book,part){const f=book.design?.[part]?.font;if(typeof f==='string'&&/^font-[-\w]+$/.test(f))return '"'+f+'",Arial,sans-serif';if(['Arial','Georgia','Helvetica','Times New Roman','Courier New'].includes(f))return '"'+f+'",'+(['Georgia','Times New Roman'].includes(f)?'serif':'sans-serif');return book.appearance?.typography==='serif'||book.appearance?.typography==='italic'||book.type==='serif'||book.type==='italic'?'Georgia,"Times New Roman",serif':'"Space Grotesk",Arial,sans-serif'},
};root.VisualModel=V;if(typeof module!=='undefined')module.exports=V})(typeof globalThis!=='undefined'?globalThis:this);
