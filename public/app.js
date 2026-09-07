import {saveButton} from '/wishlist-common.mjs';
import {loadCatalog,featuredCollection} from '/catalog.mjs';
await loadCatalog().catch(error=>{const main=document.querySelector('main');main.replaceChildren();const message=document.createElement('p');message.className='bag-page';message.textContent=error.message+' Please refresh to retry.';main.append(message);throw error;});
import {createViews} from '/viewer.mjs';
import {pieces,filterPieces,productPrice,productStock,viewBounds} from './catalog.mjs';
const input=document.getElementById('search-input');
const collectionSelect=document.getElementById('collection-select');
collectionSelect.replaceChildren(...['All',...new Set(pieces.map(p=>p.collection))].map(name=>{const option=document.createElement('option');option.value=name;option.textContent=name==='All'?'All collections':name;return option;}));
const types=document.querySelector('.type-filters');types.replaceChildren(...['All',...new Set(pieces.map(p=>p.type))].map(type=>{const b=document.createElement('button');b.type='button';b.dataset.type=type;b.textContent=type==='All'?'All pieces ('+pieces.length+')':type;return b;}));
const grid=document.getElementById('product-grid');
const clearButton=document.getElementById('clear-filters');
const state={query:'',type:'All',collection:featuredCollection?.name||'All'};
collectionSelect.value=state.collection;
if(featuredCollection){document.querySelector('.hero-content .eyebrow').textContent=featuredCollection.name;document.querySelector('.section-top .eyebrow').textContent=featuredCollection.name;
 const cover=document.getElementById('collection-cover');if(featuredCollection.cover){cover.src=featuredCollection.cover;cover.alt=featuredCollection.name+' collection';cover.hidden=false;}}else{document.querySelector('.hero-content .eyebrow').textContent='FRILIX / COLLECTIONS';document.querySelector('.section-top .eyebrow').textContent='EXPLORE THE COLLECTIONS';}

function openProduct(id){location.href='/products/'+id;}
function render(){
  const matches=filterPieces(state);
  grid.replaceChildren(...matches.map(piece=>{
    const card=document.createElement('article');card.className='product';
    const media=createViews(piece,{open:true});
    const tag=document.createElement('span');tag.className='tag';tag.textContent=piece.collection;media.querySelector('.garment-window').append(tag);
    const line=document.createElement('div');line.className='product-line';const title=document.createElement('h3');
    const link=document.createElement('a');link.className='product-title';link.href='/products/'+piece.id;link.textContent=piece.name;link.addEventListener('click',()=>openProduct(piece.id));title.append(link);line.append(title);
    const description=document.createElement('p');description.textContent=`${piece.type} / ${piece.color}`;
    const commerce=document.createElement('div');commerce.className='product-commerce';const price=document.createElement('strong');price.textContent=productPrice(piece);const stock=document.createElement('span');stock.className='stock-label';stock.dataset.stock=piece.stockStatus;stock.textContent=productStock(piece);commerce.append(price,stock);
    card.append(media,line,description,commerce,saveButton(piece));return card;
  }));
  document.getElementById('result-count').textContent=`${matches.length} of ${pieces.length} pieces`;
  document.getElementById('empty-state').hidden=matches.length!==0;
  clearButton.hidden=!state.query.trim()&&state.type==='All'&&state.collection==='All';
  document.querySelectorAll('[data-type]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.type===state.type)));
}
function reset(){state.query='';state.type='All';state.collection='All';input.value='';collectionSelect.value='All';render();input.focus();}
input.addEventListener('input',()=>{state.query=input.value;render();});
collectionSelect.addEventListener('change',()=>{state.collection=collectionSelect.value;render();});
document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>{state.type=button.dataset.type;render();}));
document.getElementById('catalog-search').addEventListener('submit',event=>{event.preventDefault();state.query=input.value;render();});
clearButton.addEventListener('click',reset);document.getElementById('reset-empty').addEventListener('click',reset);
document.getElementById('year').textContent=new Date().getFullYear();render();

const signup=document.getElementById('email-signup');
signup.addEventListener('submit',async event=>{
  event.preventDefault();if(!signup.reportValidity())return;
  const button=signup.querySelector('button[type=submit]');const feedback=document.getElementById('signup-feedback');button.disabled=true;button.textContent='SAVING…';feedback.textContent='';
  try{const response=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:signup.elements.email.value,consent:signup.elements.consent.checked,website:signup.elements.website.value})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to save your email. Please try again.');feedback.textContent="You’re on the list. Your email has been saved for Frilix updates.";signup.reset();}
  catch(error){feedback.textContent=error.message||'Unable to save your email. Please try again.';}
  finally{button.disabled=false;button.textContent='KEEP ME UPDATED';}
});
