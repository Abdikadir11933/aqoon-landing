(()=>{'use strict';
const END_CALL_LOG='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

let callHistoryCache={};
let callHistoryCacheExpiry=0;

async function loadCallHistory(leadId){
  if(!leadId)return null;

  const now=Date.now();
  const needsFresh=now-callHistoryCacheExpiry>60000;
  if(!needsFresh&&callHistoryCache[leadId])return callHistoryCache[leadId];

  try{
    const r=await fetch(END_CALL_LOG,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':pw()},
      body:JSON.stringify({action:'get_call_history',lead_id:leadId}),
      cache:'no-store'
    });
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.calls){
      callHistoryCache[leadId]=d.calls;
      callHistoryCacheExpiry=now;
      return d.calls;
    }
  }catch(e){
    console.warn('Failed to load call history:',e.message);
  }
  return null;
}

function formatDate(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function formatTime(dateStr){
  if(!dateStr)return'';
  const d=new Date(dateStr);
  return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
}

function formatDuration(seconds){
  if(!seconds||seconds<0)return'—';
  const mins=Math.floor(seconds/60);
  const secs=seconds%60;
  return `${mins}m ${secs}s`;
}

function renderCallHistorySection(calls){
  if(!calls||!calls.length){
    return '<div class="crm-call-history-empty">No calls recorded</div>';
  }

  const html=calls.slice(-10).reverse().map(call=>{
    const date=formatDate(call.created_at);
    const time=formatTime(call.created_at);
    const duration=formatDuration(call.duration_seconds);
    const outcome=call.call_outcome||'unknown';
    const operator=call.operator_name||call.assigned_operator_id||'—';
    const notes=call.notes||'';

    const outcomeClass=`call-outcome-${outcome}`;
    const outcomeLabel={'reached':'Connected','no_answer':'No Answer','call_later':'Scheduled','attempted':'Attempted'}[outcome]||outcome;

    return `
      <div class="crm-call-history-item">
        <div class="crm-call-header">
          <div class="crm-call-time">${esc(date)} ${esc(time)}</div>
          <span class="call-outcome-badge ${esc(outcomeClass)}">${esc(outcomeLabel)}</span>
        </div>
        <div class="crm-call-details">
          <small>Duration: ${esc(duration)} • Operator: ${esc(operator)}</small>
        </div>
        ${notes?`<div class="crm-call-notes">${esc(notes)}</div>`:''}
      </div>
    `;
  }).join('');

  return html;
}

function injectCallHistoryStyles(){
  if(document.getElementById('crmCallHistoryStyles'))return;
  const style=document.createElement('style');
  style.id='crmCallHistoryStyles';
  style.textContent=`.crm-call-history-item{padding:12px 0;border-bottom:1px solid var(--l,#e9e5dc)}.crm-call-history-item:last-child{border-bottom:none}.crm-call-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.crm-call-time{font-size:12px;font-weight:600;color:var(--t,#13b9aa)}.call-outcome-badge{display:inline-block;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase}.call-outcome-reached{background:#d4f5f0;color:#0a6659}.call-outcome-no_answer{background:#fde9e7;color:#a6370f}.call-outcome-call_later{background:#f0e9f8;color:#5a3a8a}.call-outcome-attempted{background:#e8ecf5;color:#1f3a6b}.call-outcome-unknown{background:var(--l,#e9e5dc);color:var(--n,#0a1a30)}.crm-call-details{font-size:11px;color:var(--n,#0a1a30)}.crm-call-notes{font-size:12px;color:var(--n,#0a1a30);margin-top:6px;padding:8px;background:rgba(0,0,0,0.03);border-radius:4px;line-height:1.4}.crm-call-history-empty{font-size:12px;color:var(--t,#13b9aa);padding:12px 0;text-align:center}`;
  document.head.appendChild(style);
}

function appendCallHistory(leadId){
  const contextContent=$('contextPanelContent');
  if(!contextContent)return;

  loadCallHistory(leadId).then(calls=>{
    let callSection=contextContent.querySelector('[data-call-history]');
    if(!callSection){
      callSection=document.createElement('div');
      callSection.dataset.callHistory='1';
      callSection.className='crm-context-section';
      contextContent.appendChild(callSection);
    }

    callSection.innerHTML=`
      <div class="crm-context-label">Call History</div>
      <div>${renderCallHistorySection(calls)}</div>
    `;
  }).catch(e=>console.warn('Call history render failed:',e.message));
}

function $(){
  return document.getElementById(...arguments);
}

function patchContextPanel(){
  if(window.__callHistoryPatched)return;
  window.__callHistoryPatched=1;

  const origOpen=window.CrmContextPanel?.open;
  if(typeof origOpen!=='function')return;

  window.CrmContextPanel.open=function(leadId){
    origOpen.call(this,leadId);
    setTimeout(()=>appendCallHistory(leadId),200);
  };
}

function start(){
  injectCallHistoryStyles();
  setTimeout(()=>{
    patchContextPanel();
  },100);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.CrmCallHistory={load:(id)=>loadCallHistory(id),render:(calls)=>renderCallHistorySection(calls)};
})();
