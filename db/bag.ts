import {env} from 'cloudflare:workers';
export function bagDb(){if(!env.DB)throw new Error('Bag storage unavailable');return env.DB;}
