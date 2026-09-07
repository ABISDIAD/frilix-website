import {bagDb} from '../../../db/bag';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Use the Frilix contact page.'},{status:403});
 try{const raw=await request.text();if(raw.length>8000)return Response.json({error:'Your message is too long.'},{status:400});const d=JSON.parse(raw);if(d?.website)return Response.json({ok:true});const name=typeof d?.name==='string'?d.name.trim():'';const email=typeof d?.email==='string'?d.email.trim().toLowerCase():'';const message=typeof d?.message==='string'?d.message.trim():'';
 if(!name||name.length>100||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||message.length>3000||typeof d.id!=='string'||!/^[a-f0-9-]{36}$/.test(d.id))return Response.json({error:'Enter your name, a valid email and a message of 10–3,000 characters.'},{status:400});
 await bagDb().prepare('INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(d.id,name,email,message).run();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'We couldn’t save your message. Please try again.'},{status:503});}}
