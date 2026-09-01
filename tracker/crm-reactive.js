(()=>{'use strict';
const $=id=>document.getElementById(id);
let timer=null;
function ensureStrip(){const host=document.querySelector('#analytics .analytics-summary');if(!host)return null;let strip=$('crmStateStrip');if(strip)return strip;strip=document.createElement('div');strip.id='crmStateStrip';strip.className='crm-state-strip';const secondary=host.querySelector('.secondary-kpis');if(secondary)secondary.insertAdjacentElement('afterend',strip);else host.appendChild(strip);return strip}
function renderStates(leads){const strip=ensureStrip();if(!strip)return;const all=leads||[],waiting=all.filter(x=>x.status==='new').length,contacted=all.filter(x=>x.status==='contacted').length,resolved=all.filter(x=>x.status==='resolved'||x.journey_stage==='resolved').length,active=all.filter(x=>x.status!=='resolved'&&x.journey_stage!=='resolved').length;strip.innerHTML='<div><span>Active</span><strong>'+active+'</strong></div><div><span>Waiting</span><strong>'+waiting+'</strong></div><div><span>Contacted</span><strong>'+contacted+'</strong></div><div><span>Resolved</span><strong>'+resolved+'</strong></div>'}
function sync(){renderStates(window.AqoonApp?.leads||[])}
function scheduleSync(delay=120){clearTimeout(timer);timer=setTimeout(sync,delay)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-contacted],[data-resolve],[data-stage],#saveInterview');if(!b)return;scheduleSync(b.id==='saveInterview'?850:500)},true);
const app=$('app');if(app)new MutationObserver(()=>{if(!app.classList.contains('hidden'))sync()}).observe(app,{attributes:true,attributeFilter:['class']});
const analytics=$('analytics');if(analytics)new MutationObserver(()=>{if(!analytics.classList.contains('hidden'))sync()}).observe(analytics,{attributes:true,attributeFilter:['class']});
window.addEventListener('dataUpdated',sync);
setTimeout(sync,700);
})();
