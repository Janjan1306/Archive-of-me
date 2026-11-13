/* Presentation-only artwork geometry. Original Blobs and saved adjustments stay untouched. */
const SpineArtwork={
 release(root){for(const el of root?.querySelectorAll('.book')||[]){el._artObserver?.disconnect();el._artObserver=null}},
 apply(el,design,url){
  el.querySelector('.spine-art-plane')?.remove();el.querySelector('.spine-art')?.remove();
  const plane=document.createElement('span'),image=document.createElement('img');plane.className='spine-art-plane';image.className='spine-art';image.alt='';image.draggable=false;
  Object.assign(image.style,{objectFit:design.fit==='contain'?'contain':'cover',objectPosition:`${design.x}% ${design.y}%`,transform:`scale(${design.zoom})`,transformOrigin:`${design.x}% ${design.y}%`});plane.append(image);el.prepend(plane);
  const layout=()=>{
   if(!plane.isConnected||!image.naturalWidth)return;
   // Artwork is authored in the vertical spine coordinate system, regardless
   // of the source bitmap aspect ratio. Rotate that plane clockwise so
   // the top of that artwork becomes the right end, matching rotated spine text.
   const rotated=el.classList.contains('horizontal');
   plane.dataset.rotated=String(rotated);
   Object.assign(plane.style,rotated?{inset:'auto',left:'50%',top:'50%',width:el.clientHeight+'px',height:el.clientWidth+'px',transform:'translate(-50%,-50%) rotate(90deg)'}:{inset:'0',left:'0',top:'0',width:'100%',height:'100%',transform:'none'});
  };
  image.onload=layout;image.src=url;if(image.complete)layout();
  // Full-width Spines rows can change height after text reflow and resize.
  el._artObserver?.disconnect();el._artObserver=new ResizeObserver(layout);el._artObserver.observe(el);
 },
 clear(el){el._artObserver?.disconnect();el._artObserver=null;el.querySelector('.spine-art-plane')?.remove();el.querySelector('.spine-art')?.remove()}
};
