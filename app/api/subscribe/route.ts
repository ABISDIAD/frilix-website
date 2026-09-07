import {saveSubscriber} from '../../../db/subscribers';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Please submit the form from the Frilix website.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Invalid request.'},{status:415});
 let payload;
 try{const body=await request.text();if(body.length>2048)return Response.json({error:'Request too large.'},{status:413});payload=JSON.parse(body);}catch{return Response.json({error:'Invalid request.'},{status:400});}
 if(!payload||typeof payload!=='object')return Response.json({error:'Invalid request.'},{status:400});
 if(payload.website)return Response.json({ok:true});
 const email=typeof payload.email==='string'?payload.email.trim().toLowerCase():'';
 if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Enter a valid email address.'},{status:400});
 if(payload.consent!==true)return Response.json({error:'Please agree to receive Frilix updates.'},{status:400});
 try{await saveSubscriber(email);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}catch{console.error('Frilix subscriber storage unavailable');return Response.json({error:'We couldn’t save your email right now. Please try again.'},{status:503});}
}
