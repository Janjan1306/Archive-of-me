/* Reference-derived geometric identity. Brand typography never inherits the UI font. */
const Brand={
 polygon:'0,7 11,0 64,13 64,89 53,96 0,83',
 logo(){return `<svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 96" role="img" aria-label="Archive of Me"><polygon class="brand-polygon" points="${this.polygon}"/><text class="brand-internal" x="6" y="24"><tspan x="6" dy="0">Archive</tspan><tspan x="6" dy="14">of</tspan><tspan x="6" dy="14">Me</tspan></text><text class="brand-external" x="81" y="56">Archive of Me</text></svg>`},
 sync(){const c=AppearanceModel.colors(Appearance.current()),svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><polygon points="${this.polygon}" fill="${c.text}"/><text x="7" y="40" fill="${c.background}" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700">A</text></svg>`;$('#appFavicon').href='data:image/svg+xml,'+encodeURIComponent(svg)},
 preview(){const preview=$('#applicationAppearance .mini-brand');if(preview&&!preview.querySelector('svg'))preview.innerHTML=this.logo()},
};
$('.brand').innerHTML=Brand.logo();$('.brand').setAttribute('aria-label','Archive of Me — Return to Library');
const brandAppearance=Appearance.apply;Appearance.apply=function(){brandAppearance.call(this);Brand.sync()};Brand.sync();
new MutationObserver(()=>Brand.preview()).observe($('#applicationAppearance'),{subtree:true,childList:true});
