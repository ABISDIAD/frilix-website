import {env} from 'cloudflare:workers';
export async function saveSubscriber(email:string){
 if(!env.DB)throw new Error('Subscriber storage unavailable');
 const code='FRLX-'+crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase();
 await env.DB.batch([
 env.DB.prepare('INSERT INTO subscribers (email, consent_version) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').bind(email,'frilix-news-launch-v1'),
 env.DB.prepare('INSERT INTO welcome_emails (email, code) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').bind(email,code)
 ]);
}
