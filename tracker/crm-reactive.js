(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const $=id=>document.getElementById(id);
let busy=false,timer=null;
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(body){const p=password();if(!p)return null;const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':p},body:JSON.stringify(body),cache:'no-store'});if(!r.ok)return null;return r.json()}
function ensureStrip(){const host=document.querySelector('#analytics .analytics-summary');if(!host)return null;let strip=$('crmStateStrip');if(strip)return strip;strip=document.createElement('div');strip.id='crmStateStrip';strip.className='crm-state-strip';const secondary=host.querySelector('.secondary-kpis');if(secondary)secondary.insertAdjacentElement('afterend',strip);else host.appendChild(strip);return strip}
function renderStates(leads){const strip=ensureStrip();if(!strip)return;const all=leads||[],waiting=all.filter(x=>x.status==='new').length,contacted=all.filter(x=>x.status==='contacted').length,resolved=all.filter(x=>x.status==='resolved'||x.journey_stage==='resolved').length,closed=all.filter(x=>x.status==='closed').length,active=all.filter(x=>x.status!=='resolved'&&x.status!=='closed'&&x.journey_stage!=='resolved').length;strip.innerHTML='<div><span>Active</span><strong>'+active+'</strong></div><div><span>Waiting</span><strong>'+waiting+'</strong></div><div><span>Contacted</span><strong>'+contacted+'</strong></div><div><span>Resolved</span><strong>'+resolved+'</strong></div><div><span>Closed</span><strong>'+closed+'</strong></div>'}
async function sync(){if(busy)return;busy=true;try{const d=await api({action:'list'});if(d&&Array.isArray(d.leads))renderStates(d.leads)}finally{busy=false}}
function scheduleSync(delay=450){clearTimeout(timer);timer=setTimeout(async()=>{const refresh=$('refresh');if(refresh)refresh.click();await sync()},delay)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-contacted],[data-resolve],[data-stage],#saveInterview');if(!b)return;scheduleSync(b.id==='saveInterview'?850:500)},true);
const app=$('app');if(app)new MutationObserver(()=>{if(!app.classList.contains('hidden'))sync()}).observe(app,{attributes:true,attributeFilter:['class']});
const analytics=$('analytics');if(analytics)new MutationObserver(()=>{if(!analytics.classList.contains('hidden'))sync()}).observe(analytics,{attributes:true,attributeFilter:['class']});
setTimeout(sync,700);
})();
