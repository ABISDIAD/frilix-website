export async function bagRequest(change){const response=await fetch('/api/bag',change?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(change)}:{});const data=await response.json();if(!response.ok)throw new Error(data.error||'Your bag is unavailable. Please try again.');updateCount(data.count);return data;}
export function updateCount(count){const badge=document.getElementById('bag-count');if(badge)badge.textContent=count;}
bagRequest().catch(()=>{const badge=document.getElementById('bag-count');if(badge)badge.textContent='—';});
