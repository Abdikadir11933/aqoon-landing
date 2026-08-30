(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const style=document.createElement('style');
style.textContent=`.next-steps-panel{background:#fef8f3;border:1px solid #e4dfd3;border-radius:14px;padding:14px;margin:12px 0;margin-top:16px}.next-steps-title{font-size:11px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;color:#333;margin-bottom:10px}.next-steps-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.next-step-card{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:10px;font-size:12px;line-height:1.4;cursor:pointer;transition:all 120ms}.next-step-card:hover{background:#f9f8f6;border-color:#3a9b8a}.next-step-card.urgent{border-left:3px solid #d97560;background:#fef6f3}.next-step-icon{font-size:16px;margin-bottom:4px}.next-step-text{font-weight:600;color:#333;margin-bottom:2px}.next-step-hint{font-size:10px;color:#889;display:block;margin-top:4px}.next-step-highlight{outline:2px solid #3a9b8a;outline-offset:3px;border-radius:14px}`;
document.head.appendChild(style);

let nextStepsOpen=false;

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

async function loadLifecycle(leadId){
  if(!leadId)return null;
  try{
    const lc=await fetch(END_LIFECYCLE,{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json','x-tracker-password':pw()},sessionStorage.getItem('aqoon_auth_token')?{Authorization:'Bearer '+sessionStorage.getItem('aqoon_auth_token')}:{}),
      body:JSON.stringify({action:'list',lead_id:leadId}),
      cache:'no-store'
    }).then(r=>r.json());
    return {plans:lc.plans||[],events:lc.events||[]};
  }catch(e){
    return null;
  }
}

function buildNextSteps(lead,currentAnswers,lifecycle){
  const steps=[];
  if(!lifecycle)return steps;

  const {plans,events}=lifecycle;
  const activePlan=plans?.find(p=>p.plan_status!=='resolved'&&p.plan_status!=='closed_unresolved');
  const lastEvent=events?.[0];
  const hasPendingNeeds=currentAnswers?.cross_service_needs_all && Array.isArray(currentAnswers.cross_service_needs_all) && currentAnswers.cross_service_needs_all.length>0;
  const awaitingEvent=events?.find(e=>e.event_type==='awaiting_response');
  const daysSinceAwaiting=awaitingEvent ? Math.floor((Date.now()-new Date(awaitingEvent.occurred_at).getTime())/(24*60*60*1000)) : 0;

  if(activePlan?.plan_status==='awaiting_outcome'){
    steps.push({
      icon:'📋',
      title:'Record outcome',
      hint:'Mark case as resolved or create new opportunity',
      urgent:false,
      action:'recordOutcome'
    });
  }

  if(hasPendingNeeds){
    steps.push({
      icon:'➕',
      title:'Log new needs',
      hint:'Cross-service needs detected. Create opportunities.',
      urgent:false,
      action:'logNeeds'
    });
  }

  if(awaitingEvent && daysSinceAwaiting>3){
    steps.push({
      icon:'⏰',
      title:'Check official response',
      hint:`Awaiting since ${daysSinceAwaiting}d. Follow up now?`,
      urgent:daysSinceAwaiting>7,
      action:'checkResponse'
    });
  }

  if(currentAnswers?.next_follow_up_at){
    const followUpDate=new Date(currentAnswers.next_follow_up_at);
    const daysUntilFollowUp=Math.ceil((followUpDate.getTime()-Date.now())/(24*60*60*1000));
    if(daysUntilFollowUp<=7 && daysUntilFollowUp>=-1){
      steps.push({
        icon:'📞',
        title:'Prepare follow-up call',
        hint:daysUntilFollowUp<0?'Overdue':'Coming up this week',
        urgent:daysUntilFollowUp<0,
        action:'prepareFollowUp'
      });
    }
  }

  return steps;
}

function renderNextSteps(lead,currentAnswers,lifecycle){
  const host=$('promptWrap');
  if(!host)return;

  const steps=buildNextSteps(lead,currentAnswers,lifecycle);
  if(!steps.length)return;

  let html='<div class="next-steps-panel">';
  html+='<div class="next-steps-title">Next steps suggested</div>';
  html+='<div class="next-steps-grid">';
  steps.forEach(s=>{
    html+='<div class="next-step-card '+(s.urgent?'urgent':'')+'" data-action="'+esc(s.action)+'">';
    html+='<div class="next-step-icon">'+s.icon+'</div>';
    html+='<div class="next-step-text">'+esc(s.title)+'</div>';
    html+='<span class="next-step-hint">'+esc(s.hint)+'</span>';
    html+='</div>';
  });
  html+='</div></div>';

  const existingPanel=host.querySelector('.next-steps-panel');
  if(existingPanel)existingPanel.remove();
  host.insertAdjacentHTML('beforeend',html);

  host.querySelectorAll('.next-step-card').forEach(card=>{
    card.addEventListener('click',()=>handleAction(card.dataset.action,lead));
  });
}

function handleAction(action,lead){
  switch(action){
    case 'recordOutcome': {
      // There's no single "record outcome" button - case-lifecycle.js
      // renders different action buttons (Submitted/Responded/Resolve/
      // Close) depending on the case plan's current status. Point the
      // operator at that panel instead of clicking a selector that never
      // matched anything.
      const panel=document.getElementById('caseLifecycle');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Open the case plan below to record what happened.');
      break;
    }
    case 'logNeeds':
      // sales_opportunities is an organization-level deal record with no
      // family_lead_id column - there is no "create an opportunity for
      // this family" feature to link to yet, so this stays a manual
      // reminder rather than implying a click-through that doesn't exist.
      alert('Cross-service needs detected for this family. Note them in the case plan below - there is no automatic link to a sales opportunity yet.');
      break;
    case 'checkResponse': {
      const panel=document.getElementById('caseLifecycle');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Check with the family or official service about the pending response, then record it in the case plan below.');
      break;
    }
    case 'prepareFollowUp': {
      const panel=document.getElementById('interview-context-panel');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Review prior interview notes and prepare talking points for follow-up.');
      break;
    }
  }
}

function attach(lead,currentAnswers){
  loadLifecycle(lead.id).then(lifecycle=>{
    if(lifecycle)renderNextSteps(lead,currentAnswers,lifecycle);
  });
}

// Both the legacy fallback and the active route-specific save path emit this
// only after family-leads-admin has returned success. Listening to the saved
// event avoids depending on which function reference happened to be assigned
// to #saveInterview.onclick when the drawer's wrapper chain finished opening.
window.addEventListener('aqoon:interview-saved',event=>{
  const {lead,answers}=event.detail||{};
  if(lead&&answers)attach(lead,answers);
});

window.AqoonNextSteps={attach};
})();
