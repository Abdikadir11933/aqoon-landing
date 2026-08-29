(()=>{'use strict';
const END_CALL_LOG='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

let callHistoryCache={};

async function loadCallHistory(leadId){
  if(!leadId)return null;

  const now=Date.now();
  const cached=callHistoryCache[leadId];
  if(cached&&now-cached.expiry<60000)return cached.data;

  try{
    const r=await fetch(END_CALL_LOG,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':pw()},
      body:JSON.stringify({action:'get_call_history',lead_id:leadId}),
      cache:'no-store'
    });
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.calls){
      callHistoryCache[leadId]={data:d.calls,expiry:now};
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

function renderCallHistorySection(calls){
  if(!calls||!calls.length){
    return '<div class="crm-call-history-empty">No calls recorded yet</div>';
  }

  return calls.slice(-10).reverse().map(call=>{
    const date=formatDate(call.created_at);
    const time=formatTime(call.created_at);
    const outcome=call.outcome||call.call_outcome||'unknown';
    const operator=call.operator_name||'—';
    const notes=call.notes||'';
    const callback=call.next_follow_up_at?`${formatDate(call.next_follow_up_at)} ${formatTime(call.next_follow_up_at)}`:'';

    const outcomeClass=`call-outcome-${outcome}`;
    const outcomeLabel={'reached':'Spoke to them','no_answer':'No answer','call_later':'Call back later','busy':'Busy'}[outcome]||outcome;

    return `
      <div class="crm-call-history-item">
        <div class="crm-call-header">
          <div class="crm-call-time">${esc(date)} ${esc(time)}</div>
          <span class="call-outcome-badge ${esc(outcomeClass)}">${esc(outcomeLabel)}</span>
        </div>
        <div class="crm-call-details"><small>Operator: ${esc(operator)}</small>${callback?`<small> · Callback: ${esc(callback)}</small>`:''}</div>
        ${notes?`<div class="crm-call-notes">${esc(notes)}</div>`:''}
      </div>
    `;
  }).join('');
}

// Called by crm-queue-navigation.js's family panel (not the old, deleted
// context-panel chain this file used to depend on - that chain was never
// actually invoked by anything real, so this viewer never rendered before).
// Styling comes from the already-linked crm-call-history.css, not injected
// here, since duplicating it inline would just fight the cascade.
async function renderInto(container,leadId){
  if(!container||!leadId)return;
  container.innerHTML='<div class="crm-call-history-empty">Loading call history…</div>';
  const calls=await loadCallHistory(leadId);
  container.innerHTML=renderCallHistorySection(calls);
}

window.AqoonCallHistory={renderInto,load:loadCallHistory,render:renderCallHistorySection};
})();
