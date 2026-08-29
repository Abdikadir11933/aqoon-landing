(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

let lifecycleCache={};
let cacheExpiry=0;

async function loadLifecycleData(leadIds){
  if(!Array.isArray(leadIds)||!leadIds.length)return;

  const now=Date.now();
  const needsFresh=now-cacheExpiry>60000;
  if(!needsFresh)return;

  try{
    const r=await fetch(END_LIFECYCLE,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':pw()},
      body:JSON.stringify({action:'batch_list',lead_ids:leadIds}),
      cache:'no-store'
    });
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.lifecycle){
      lifecycleCache={};
      d.lifecycle.forEach(lc=>{
        const plan=lc.plans?.[0];
        lifecycleCache[lc.lead_id]={
          case_plan_status:plan?.status||null,
          case_plan_id:plan?.id||null,
          events:lc.events||[]
        };
      });
      cacheExpiry=now;
    }
  }catch(e){
    console.warn('Failed to load lifecycle data:',e.message);
  }
}

function enrichLeads(leads){
  if(!Array.isArray(leads))return leads;
  return leads.map(l=>{
    const lc=lifecycleCache[l.id]||{};
    return Object.assign({},l,{
      _case_plan_status:lc.case_plan_status,
      _case_plan_id:lc.case_plan_id,
      _case_events:lc.events||[]
    });
  });
}

function patchFetchLifecycle(){
  if(window.__lifecycleDataPatched)return;
  window.__lifecycleDataPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const leads=window.leads||[];
    const leadIds=leads.map(l=>l.id).filter(Boolean);

    loadLifecycleData(leadIds).then(()=>{
      const enriched=enrichLeads(leads);
      window.leads=enriched;
      if(window.CrmPhaseNav?.renderPhaseNavigation){
        window.CrmPhaseNav.renderPhaseNavigation(enriched,window.partials||[]);
      }
    }).catch(e=>console.warn('Lifecycle enrichment failed:',e.message));

    return orig.apply(this,arguments);
  };
}

function start(){
  patchFetchLifecycle();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.CrmLifecycleData={loadLifecycleData,enrichLeads,getLifecycle:(leadId)=>lifecycleCache[leadId]};
})();
