import shell from './index.html?raw';
export const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function page(title:string,description:string,body:string,script:string){return shell.replace(/<title>.*?<\/title>/,`<title>${escape(title)} — Frilix</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(description)}">`).replace(/<main>[\s\S]*?<\/main>/,`<main>${body}</main>`).replace('src="/app.js"',`src="${script}"`);}
