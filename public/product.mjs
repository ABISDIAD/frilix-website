import {saveButton} from '/wishlist-common.mjs';
import {loadCatalog,pieces,productPrice} from '/catalog.mjs';
import {createViews} from '/viewer.mjs';
import {bagRequest} from '/bag-common.mjs';
await loadCatalog().catch(error=>{const main=document.querySelector('main');main.replaceChildren();const message=document.createElement('p');message.className='bag-page';message.textContent=error.message+' Please refresh to retry.';main.append(message);throw error;});
function showAdded(piece,size,bag){
 const panel=document.createElement('dialog');panel.className='added-panel';panel.setAttribute('aria-labelledby','added-title');
 const close=document.createElement('button');close.type='button';close.className='close';close.textContent='×';close.setAttribute('aria-label','Close added-to-bag panel');close.addEventListener('click',()=>panel.close());
 const heading=document.createElement('h2');heading.id='added-title';heading.textContent='Added to your bag.';
 const image=document.createElement('img');image.src=piece.image;image.alt=piece.name;
 const name=document.createElement('h3');name.textContent=piece.name;const detail=document.createElement('p');detail.textContent=`Size ${size} · ${productPrice(piece)}`;
 const subtotal=document.createElement('p');subtotal.textContent=`${bag.count} item${bag.count===1?'':'s'} in your bag · Subtotal ${new Intl.NumberFormat('en',{style:'currency',currency:'USD'}).format(bag.subtotal)}`;
 const link=document.createElement('a');link.href='/bag';link.className='button red';link.textContent='VIEW BAG';const keep=document.createElement('button');keep.type='button';keep.className='button dark';keep.textContent='CONTINUE SHOPPING';keep.addEventListener('click',()=>panel.close());
 panel.append(close,heading,image,name,detail,subtotal,link,keep);document.body.append(panel);panel.addEventListener('close',()=>panel.remove());panel.showModal();
}
const piece=pieces.find(p=>p.id===document.querySelector('[data-product]')?.dataset.product);
if(piece){document.querySelector('.pdp-copy').append(saveButton(piece));document.getElementById('piece-viewer').append(createViews(piece));const form=document.getElementById('add-to-bag');for(const radio of form.querySelectorAll('input[name=size]'))radio.disabled=piece.stockStatus!=='in_stock'||!piece.sizes[radio.value];form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]');const feedback=document.getElementById('product-feedback');const size=new FormData(form).get('size');button.disabled=true;button.textContent='ADDING…';try{const bag=await bagRequest({action:'add',id:piece.id,size,quantity:1});feedback.textContent='Added to your bag.';showAdded(piece,size,bag);}catch(error){feedback.textContent=error.message;}finally{button.disabled=piece.stockStatus!=='in_stock';button.textContent=piece.stockStatus==='in_stock'?'ADD TO BAG':'UNAVAILABLE';}});}
