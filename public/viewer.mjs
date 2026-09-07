import {viewBounds} from '/catalog.mjs';
export function createViews(piece,{open=false}={}){
  const bounds=piece.image==='/assets/'+piece.id+'.png'&&!piece.backImage?viewBounds[piece.id]:null;
  const media=document.createElement('div');media.className='garment-viewer';
  const window=document.createElement(open?'button':'div');window.className='garment-window';
  if(open){window.type='button';window.addEventListener('click',()=>{location.href='/products/'+piece.id;});}
  const ns='http://www.w3.org/2000/svg';
  const image=document.createElementNS(ns,'svg');image.setAttribute('role','img');image.setAttribute('preserveAspectRatio','xMidYMid meet');
  const defs=document.createElementNS(ns,'defs');const clip=document.createElementNS(ns,'clipPath');const clipId='crop-'+crypto.randomUUID();clip.id=clipId;const rect=document.createElementNS(ns,'rect');clip.append(rect);defs.append(clip);
  const photo=document.createElementNS(ns,'image');photo.setAttribute('href',piece.image);photo.setAttribute('clip-path','url(#'+clipId+')');image.append(defs,photo);
  let dimensions=null;const preload=new Image();preload.onload=()=>{dimensions=[preload.naturalWidth,preload.naturalHeight];photo.setAttribute('width',dimensions[0]);photo.setAttribute('height',dimensions[1]);show(media.dataset.view||'front');};preload.src=piece.image;
  const controls=document.createElement('div');controls.className='view-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label',piece.name+' garment view');
  let selected='front';
  function show(view){const src=view==='back'&&piece.backImage?piece.backImage:piece.image;if(preload.src!==new URL(src,location.href).href){dimensions=null;photo.setAttribute('href',src);preload.src=src;}media.dataset.view=view;image.setAttribute('aria-label',piece.name+' — '+view+' view');
    if(dimensions){const [w,h]=dimensions;const [x,y,cw,ch]=(bounds?.[view]||[0,0,1,1]);const box=[x*w,y*h,cw*w,ch*h];image.setAttribute('viewBox',box.join(' '));['x','y','width','height'].forEach((key,i)=>rect.setAttribute(key,box[i]));}if(open)window.setAttribute('aria-label','Open '+piece.name+' details, '+view+' view');controls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));}
  for(const view of (bounds||piece.backImage?['front','back']:['front'])){const button=document.createElement('button');button.type='button';button.dataset.view=view;button.textContent=view==='front'?'Front':'Back';button.addEventListener('click',()=>{selected=view;show(view);});controls.append(button);}
  if(open){window.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&(bounds||piece.backImage))show('back');});window.addEventListener('pointerleave',()=>show(selected));}
  window.append(image);media.append(window,controls);show('front');return media;
}
