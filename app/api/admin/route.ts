import {validImage} from '../../../db/catalog-validation';
import {demoSizes} from '../../../public/catalog.mjs';
import {ownerAccess} from '../../owner';
import {getProducts,getCollections,getCollectionDetails} from '../../../db/products';
import {bagDb} from '../../../db/bag';
export async function GET(request:Request){
 const access=await ownerAccess();if(access!=='owner')return Response.json({error:access==='anonymous'?'Sign in to continue.':'Owner access required.'},{status:access==='anonymous'?401:403});
 try{const offset=Math.max(0,Math.min(1000000,Number(new URL(request.url).searchParams.get('offset'))||0));const db=bagDb();const {results}=await db.prepare('SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC, email LIMIT 50 OFFSET ?').bind(Math.floor(offset)).all();const count=await db.prepare('SELECT COUNT(*) AS total FROM subscribers').first();const welcomes=await db.prepare("SELECT email, code, status, created_at FROM welcome_emails ORDER BY created_at DESC LIMIT 50").all();return Response.json({collections:await getCollections(),collectionDetails:await getCollectionDetails(),welcomes:welcomes.results,pieces:await getProducts(true),subscribers:results,totalSubscribers:count?.total||0,offset:Math.floor(offset)},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Dashboard data is unavailable. Please try again.'},{status:503});}
}
export async function POST(request:Request){
 const access=await ownerAccess();if(access!=='owner')return Response.json({error:'Owner access required.'},{status:access==='anonymous'?401:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Submit changes from the dashboard.'},{status:403});
 try{const raw=await request.text();if(raw.length>6000)return Response.json({error:'Product details are too long.'},{status:400});const data=JSON.parse(raw);const db=bagDb();
 if(['create_collection','update_collection'].includes(data.action)){
 const name=typeof data.name==='string'?data.name.trim():'';
 if(!name||name.length>100||name.toLowerCase()==='all')return Response.json({error:'Enter a collection name of 1–100 characters other than All.'},{status:400});
 const entries=await getCollectionDetails();const old=entries.find((c:any)=>c.name===data.originalName);
 if(data.action==='update_collection'&&!old)return Response.json({error:'Collection not found. Reload the dashboard.'},{status:404});
 if(entries.some((c:any)=>c!==old&&c.name.toLowerCase()===name.toLowerCase()))return Response.json({error:'This collection already exists.'},{status:409});
 const cover=data.cover||'';if(cover&&!validImage(cover))return Response.json({error:'Choose a valid cover image.'},{status:400});
 const updated={name,cover,featured:data.featured===true};
 const next=old?entries.map((c:any)=>c===old?updated:({...c,featured:updated.featured?false:c.featured})): [...entries,updated];
 const db=bagDb();const statements=[];
 if(old&&old.name!==name){for(const p of await getProducts(true)){if(p.collection===old.name)statements.push(db.prepare('INSERT INTO store_info (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('catalog-product:'+p.id,JSON.stringify({...p,collection:name})));}}
 statements.push(db.prepare('INSERT INTO store_info (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('catalog-collections-v2',JSON.stringify(next)));
 await db.batch(statements);return Response.json({ok:true});
 }
 const products=await getProducts(true);const p=products.find(p=>p.id===data?.id);const name=typeof data.name==='string'?data.name.trim():'';const description=typeof data.description==='string'?data.description.trim():'';
 if(!data.sizes||!demoSizes.every(size=>Number.isInteger(data.sizes[size])&&data.sizes[size]>=0&&data.sizes[size]<=10000))return Response.json({error:'Enter a whole-number stock count from 0 to 10,000 for every size.'},{status:400});
 if((!p&&data.action!=='create_product')||!name||name.length>100||!description||description.length>1500||!Number.isInteger(data.priceCents)||data.priceCents<1||data.priceCents>1000000||!['in_stock','out_of_stock','coming_soon'].includes(data.stockStatus))return Response.json({error:'Check the name, description, USD price ($0.01–$10,000), and stock status.'},{status:400});
 const collections=await getCollections();
 const image=typeof data.image==='string'?data.image.trim():'';
 if(!collections.includes(data.collection)||!['Parkas','Hoodies','Sweatpants','Shirts','Fleece','Jackets','Shorts','Accessories'].includes(data.type)||typeof data.color!=='string'||data.color.length>100||!validImage(image)||(data.backImage&&!validImage(data.backImage)))return Response.json({error:'Choose a collection and clothing type, and provide a valid HTTPS image URL (or an existing /assets/ path).'},{status:400});
 const visibility=data.visibility||(p?.visibility||'draft');const sortOrder=Number(data.sortOrder||0);if(!['draft','published','archived'].includes(visibility)||!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>10000)return Response.json({error:'Choose a valid visibility and display order (0–10,000).'},{status:400});
 const id=p?.id||'piece-'+crypto.randomUUID();
 const metadata={visibility,sortOrder,id,name,description,price:data.priceCents/100,currency:'USD',stockStatus:data.stockStatus,type:data.type,collection:data.collection,color:data.color.trim(),image,backImage:data.backImage||'',keywords:''};
 await db.batch([db.prepare('INSERT INTO store_info (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('catalog-product:'+id,JSON.stringify(metadata)),db.prepare('INSERT INTO product_edits (id, name, description, price_cents, stock_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, price_cents = excluded.price_cents, stock_status = excluded.stock_status').bind(id,name,description,data.priceCents,data.stockStatus),...demoSizes.map(size=>db.prepare('INSERT INTO size_inventory (product_id, size, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, size) DO UPDATE SET quantity = excluded.quantity').bind(id,size,data.sizes[size]))]);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof SyntaxError?'Invalid request.':'Couldn’t save changes. Your edits are still in the form.'},{status:error instanceof SyntaxError?400:503});}
}
