const eastern=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
export function formatEastern(value){
 if(!value)return '—';
 const raw=String(value).trim();
 const normalized=/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)?raw.replace(' ','T')+'Z':raw;
 const date=new Date(normalized);return Number.isNaN(date.getTime())?'—':eastern.format(date);
}
