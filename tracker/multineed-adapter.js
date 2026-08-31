(()=>{'use strict';
// This layer sits after operator-identity.js (which adds the JWT) and before
// app.js. It keeps the original multi-need compatibility transform, and also
// deduplicates/caches read-only Edge Function calls so opening tabs or the
// same family repeatedly does not pay the same 400–1500ms network cost.
const originalFetch=window.fetch.bind(window);
const memory=new Map();
const inflight=new Map();
const now=()=>Date.now();
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const ttlFor=(url,action)=>{
  if(url.includes('/family-leads-admin')){
    if(action==='list')return 5000;
    if(action==='analytics')return 60000;
    if(action==='programs'||action==='programmes'||action==='operators')return 600000;
    if(action==='ping'||action==='whoami')return 15000;
  }
  if(url.includes('/ops-admin')&&action==='list')return 15000;
  if(url.includes('/family-case-lifecycle-admin')&&action==='list')return 10000;
  if(url.includes('/family-interview-history-admin')&&(action==='list'||action==='history'))return 10000;
  if(url.includes('/family-route-preview-admin')&&(action==='list'||action==='preview'||action==='match_preview'))return 5000;
  return 0;
};
const persistentKind=(url,action)=>url.includes('/family-leads-admin')&&(action==='analytics'||action==='programs'||action==='programmes')?action:null;
function keyFor(url,body){return url+'|'+JSON.stringify(body||{})}
function synthetic(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS})}
function transform(url,body,data){
  if(!url.includes('/family-leads-admin')||body?.action!=='list'||!Array.isArray(data?.leads))return data;
  return Object.assign({},data,{leads:data.leads.map(lead=>{
    const extras=Array.isArray(lead.additional_needs)?lead.additional_needs:[];
    if(!extras.length)return lead;
    const line='Other needs: '+extras.map(x=>[x.main_need,x.sub_need].filter(Boolean).join(' · ')).filter(Boolean).join(' | ');
    return Object.assign({},lead,{notes:[line,lead.notes].filter(Boolean).join('\n')});
  })});
}
function persist(kind,data){
  if(!kind)return;
  try{sessionStorage.setItem('aqoon_read_cache_'+kind,JSON.stringify({at:now(),data}))}catch(_){ }
}
function persisted(kind,ttl){
  if(!kind)return null;
  try{
    const x=JSON.parse(sessionStorage.getItem('aqoon_read_cache_'+kind)||'null');
    return x&&now()-x.at<ttl?x.data:null;
  }catch(_){return null}
}
function remember(k,data,ttl,kind){memory.set(k,{at:now(),ttl,data});persist(kind,data)}
function remembered(k,ttl,kind){
  const x=memory.get(k);
  if(x&&now()-x.at<Math.min(ttl,x.ttl))return x.data;
  const p=persisted(kind,ttl);
  if(p){memory.set(k,{at:now(),ttl,data:p});return p}
  return null;
}
function invalidateForWrite(url){
  for(const k of [...memory.keys()]){
    if(url.includes('/ops-admin')){if(k.includes('/ops-admin'))memory.delete(k)}
    else if(k.includes('/family-leads-admin')||k.includes('/family-case-lifecycle-admin')||k.includes('/family-interview-history-admin')||k.includes('/family-route-preview-admin'))memory.delete(k);
  }
}
function analyticsPlaceholder(days){return {days:Number(days||30),definitions:{},unique_visitors:0,sessions:0,page_views:0,sources:{},needs:{},cities:{},devices:{},traffic_trend:[],hourly_24h:[],flow:{},flow_rates:{},flow_dropoffs:[],lead_records_in_range:0,tracked_lead_records:0,untracked_lead_records:0,new_lead_records_in_range:0,recent:[]}}
async function networkJson(input,init,url,body,k,ttl,kind){
  const response=await originalFetch(input,init);
  let data=null;
  try{data=transform(url,body,await response.clone().json())}catch(_){return response}
  if(response.ok&&ttl)remember(k,data,ttl,kind);
  return synthetic(data,response.status);
}
function background(input,init,url,body,k,ttl,kind){
  if(inflight.has(k))return inflight.get(k);
  const p=networkJson(input,init,url,body,k,ttl,kind).then(async r=>{
    try{return await r.clone().json()}catch(_){return null}
  }).finally(()=>inflight.delete(k));
  inflight.set(k,p);
  return p;
}
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input&&input.url)||'';
  if(!init||String(init.method||'GET').toUpperCase()!=='POST'||typeof init.body!=='string')return originalFetch(input,init);
  let body;try{body=JSON.parse(init.body)}catch(_){return originalFetch(input,init)}
  const action=String(body?.action||'');
  const ttl=ttlFor(url,action);
  if(!ttl){invalidateForWrite(url);return originalFetch(input,init)}
  const k=keyFor(url,body),kind=persistentKind(url,action);
  const hit=remembered(k,ttl,kind);
  if(hit)return synthetic(hit);
  if(inflight.has(k))return synthetic(await inflight.get(k));

  // Heavy bootstrap reads should not block Dashboard/CRM. On the first cold
  // load we let app.js continue immediately, warm the data in parallel, then
  // ask the existing app handlers to consume the cached result.
  if(url.includes('/family-leads-admin')&&(action==='analytics'||action==='programs'||action==='programmes')){
    const p=background(input,init,url,body,k,ttl,kind);
    if(action==='analytics'){
      p.then(()=>setTimeout(()=>{const d=document.getElementById('days');if(d&&typeof d.onchange==='function')d.onchange()},50));
      return synthetic(analyticsPlaceholder(body.days));
    }
    p.then(()=>setTimeout(()=>document.getElementById('refresh')?.click(),900));
    return synthetic({programs:[],programmes:[]});
  }

  const p=background(input,init,url,body,k,ttl,kind);
  const data=await p;
  return synthetic(data||{});
};
})();
