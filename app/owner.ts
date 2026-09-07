import {getChatGPTUser} from './chatgpt-auth';
const OWNER_EMAIL='aminebouanani48mor@gmail.com';
export async function ownerAccess(){const user=await getChatGPTUser();return !user?'anonymous':user.email.toLowerCase()===OWNER_EMAIL?'owner':'denied';}
