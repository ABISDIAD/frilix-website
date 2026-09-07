import {pieces,demoSizes} from '../public/catalog.mjs';
import {bagDb} from './bag';
export async function getProducts(includeHidden=false){
 const db=bagDb();const custom=await db.prepare("SELECT value FROM store_info WHERE key LIKE 'catalog-product:%'").all();const records=custom.results.map((r:any)=>JSON.parse(String(r.value)));const catalog=[...pieces.map(p=>({...p,...records.find((r:any)=>r.id===p.id)})),...records.filter((r:any)=>!pieces.some(p=>p.id===r.id))];const {results}=await db.prepare('SELECT id, name, description, price_cents, stock_status FROM product_edits').all();const inventory=await db.prepare('SELECT product_id, size, quantity FROM size_inventory').all();
 return catalog.map(piece=>{const row=results.find((row:any)=>row.id===piece.id) as any;const p=row?{...piece,name:row.name,description:row.description,price:row.price_cents/100,stockStatus:row.stock_status}:piece;const initial=p.stockStatus==='in_stock'?[2,0,5,4,3,1]:[0,0,0,0,0,0];const sizes=Object.fromEntries(demoSizes.map((size,i)=>{const match=inventory.results.find((r:any)=>r.product_id===piece.id&&r.size===size) as any;return [size,match?match.quantity:initial[i]];}));return {...p,visibility:p.visibility||'published',sortOrder:p.sortOrder||0,sizes,stockStatus:p.stockStatus==='coming_soon'?'coming_soon':Object.values(sizes).some(q=>Number(q)>0)?'in_stock':'out_of_stock'};}).filter(p=>includeHidden||p.visibility==='published').sort((a,b)=>a.sortOrder-b.sortOrder);
}

export async function getCollectionDetails(){
 const db=bagDb();const config=await db.prepare("SELECT value FROM store_info WHERE key='catalog-collections-v2'").first();
 if(config)return JSON.parse(String(config.value));
 const rows=await db.prepare("SELECT value FROM store_info WHERE key LIKE 'catalog-collection:%' ORDER BY value").all();
 return [...new Set(['Adolla Flames Collection',...rows.results.map((r:any)=>String(r.value))])].map(name=>({name,cover:'',featured:name==='Adolla Flames Collection'}));
}
export async function getCollections(){return (await getCollectionDetails()).map((c:any)=>c.name);}
