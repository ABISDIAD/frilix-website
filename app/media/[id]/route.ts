import {env} from 'cloudflare:workers';
import {ownerAccess} from '../../owner';
import {getProducts,getCollectionDetails} from '../../../db/products';
export async function GET(request:Request){
 const id=new URL(request.url).pathname.split('/').pop()||'';if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 try{const path='/media/'+id;const products=await getProducts();const collections=await getCollectionDetails();
 const published=products.some(p=>p.image===path||p.backImage===path)||collections.some((c:any)=>c.cover===path&&products.some(p=>p.collection===c.name));
 if(!published&&await ownerAccess()!=='owner')return new Response('Not found',{status:404});
 const object=await env.BUCKET.get('catalog/'+id);if(!object)return new Response('Not found',{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Image unavailable',{status:503});}
}
