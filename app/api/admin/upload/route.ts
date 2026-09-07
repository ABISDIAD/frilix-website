import {env} from 'cloudflare:workers';
import {ownerAccess} from '../../../owner';
export async function POST(request:Request){
 if(await ownerAccess()!=='owner')return Response.json({error:'Owner access required.'},{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Upload from the dashboard.'},{status:403});
 const max=5*1024*1024;
 if(Number(request.headers.get('content-length'))>max)return Response.json({error:'Choose an image smaller than 5 MB.'},{status:413});
 try{if(!env.BUCKET)throw new Error('Storage not available');
 const reader=request.body?.getReader();if(!reader)return Response.json({error:'Choose an image.'},{status:400});
 const chunks:Uint8Array[]=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();return Response.json({error:'Choose an image smaller than 5 MB.'},{status:413});}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const starts=(seq:number[])=>seq.every((v,i)=>bytes[i]===v);
 const type=starts([137,80,78,71,13,10,26,10])?'image/png':starts([255,216,255])?'image/jpeg':starts([82,73,70,70])&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'?'image/webp':null;
 if(!type)return Response.json({error:'Upload a PNG, JPG, or WebP image.'},{status:400});
 const id=crypto.randomUUID();await env.BUCKET.put('catalog/'+id,bytes,{httpMetadata:{contentType:type}});
 return Response.json({url:'/media/'+id},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Image upload is unavailable. Please try again.'},{status:503});}
}
