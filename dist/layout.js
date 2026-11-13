/* Route-local viewport locking and responsive measurement. No stored content is rewritten. */
const Layout={sync(){document.body.classList.toggle('library-route',!document.querySelector('#library').hidden);if(!document.querySelector('#library').hidden)requestAnimationFrame(scaleShelf)},compact(){for(const panel of document.querySelectorAll('#boardPanel,#worldPanel'))panel.classList.toggle('compact-panel',panel.clientWidth<650)}};
new MutationObserver(()=>Layout.sync()).observe(document.querySelector('#library'),{attributes:true,attributeFilter:['hidden']});
new ResizeObserver(()=>{Layout.compact();if(!document.querySelector('#library').hidden)scaleShelf()}).observe(document.querySelector('#books'));
for(const panel of document.querySelectorAll('#boardPanel,#worldPanel'))new ResizeObserver(()=>Layout.compact()).observe(panel);
Layout.sync();
