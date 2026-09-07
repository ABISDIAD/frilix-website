import {getProducts} from '../../../db/products';
import {bagDb} from '../../../db/bag';
import {demoSizes} from '../../../public/catalog.mjs';
function identity(request:Request){const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('frilix_bag='))?.slice(11);return token&&/^[a-f0-9-]{36}$/.test(token)?token:crypto.randomUUID();}
function headers(id:string){return {'Cache-Control':'no-store','Set-Cookie':`frilix_bag=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`};}
async function read(id:string){const products=await getProducts();const db=bagDb();const {results}=await db.prepare('SELECT product_id, size, quantity FROM bag_items WHERE bag_id = ? ORDER BY product_id, size').bind(id).all();const items=results.flatMap((row:any)=>{const p=products.find(p=>p.id===row.product_id);return p?[{id:p.id,name:p.name,image:p.image,size:row.size,quantity:row.quantity,price:p.price,stockStatus:p.stockStatus,available:p.stockStatus==='in_stock'?p.sizes[row.size]||0:0}]:[];});const subtotalCents=items.reduce((n,p)=>n+Math.round(p.price*100)*p.quantity,0);const coupon=await db.prepare('SELECT b.code FROM bag_discounts b JOIN welcome_emails w ON b.code = w.code WHERE b.bag_id = ?').bind(id).first();const discountCents=coupon?Math.round(subtotalCents*.1):0;return {items,count:items.reduce((n,p)=>n+p.quantity,0),subtotal:subtotalCents/100,discount:discountCents/100,total:(subtotalCents-discountCents)/100,discountCode:coupon?.code||null,currency:'USD'};}
export async function GET(request:Request){const id=identity(request);try{return Response.json(await read(id),{headers:headers(id)});}catch{return Response.json({error:'Your bag is unavailable. Please try again.'},{status:503});}}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Please use the Frilix website.'},{status:403});const id=identity(request);
 try{const raw=await request.text();if(raw.length>2048)return Response.json({error:'Invalid request.'},{status:400});const data=JSON.parse(raw);const db=bagDb();
 if(data?.action==='coupon'||data?.action==='remove_coupon'){
  if(data.action==='remove_coupon')await db.prepare('DELETE FROM bag_discounts WHERE bag_id = ?').bind(id).run();
  else{const code=typeof data.code==='string'?data.code.trim().toUpperCase():'';if(!/^FRLX-[A-F0-9]{16}$/.test(code))return Response.json({error:'Enter a valid personal Frilix code.'},{status:400});const coupon=await db.prepare('SELECT code FROM welcome_emails WHERE code = ?').bind(code).first();if(!coupon)return Response.json({error:'That code was not found.'},{status:400});await db.prepare('INSERT INTO bag_discounts (bag_id, code) VALUES (?, ?) ON CONFLICT(bag_id) DO UPDATE SET code = excluded.code').bind(id,code).run();}
  return Response.json(await read(id),{headers:headers(id)});
 }
 const p=(await getProducts()).find(p=>p.id===data?.id);if(!p||!demoSizes.includes(data.size)||!['add','set','remove'].includes(data.action))return Response.json({error:'Choose a valid piece and size.'},{status:400});
 const available=p.stockStatus==='in_stock'?p.sizes[data.size]||0:0;
 if(data.action!=='remove'&&(!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>20||data.quantity>available))return Response.json({error:available===0?'This size is sold out or not yet available.':`Choose a quantity from 1 to ${Math.min(20,available)} for this size.`},{status:400});
 if(data.action==='remove')await db.prepare('DELETE FROM bag_items WHERE bag_id = ? AND product_id = ? AND size = ?').bind(id,p.id,data.size).run();
 else if(data.action==='add'){const result=await db.prepare('INSERT INTO bag_items (bag_id, product_id, size, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(bag_id, product_id, size) DO UPDATE SET quantity = bag_items.quantity + excluded.quantity WHERE bag_items.quantity + excluded.quantity <= ?').bind(id,p.id,data.size,data.quantity,Math.min(20,available)).run();if(result.meta.changes===0)return Response.json({error:'Your bag already contains the available quantity for this size.'},{status:409});}
 else await db.prepare('UPDATE bag_items SET quantity = ? WHERE bag_id = ? AND product_id = ? AND size = ?').bind(data.quantity,id,p.id,data.size).run();
 return Response.json(await read(id),{headers:headers(id)});
 }catch(error){if(error instanceof SyntaxError)return Response.json({error:'Invalid request.'},{status:400});return Response.json({error:'Couldn’t update your bag. Please try again.'},{status:503});}
}
