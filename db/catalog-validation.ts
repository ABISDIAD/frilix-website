export function validImage(value:unknown){
 if(typeof value!=='string'||value.length>2000)return false;
 if(/^\/(?:assets\/[a-zA-Z0-9_./-]+|media\/[a-f0-9-]{36})$/.test(value))return true;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
}
