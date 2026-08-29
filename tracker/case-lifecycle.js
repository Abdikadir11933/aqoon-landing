(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const END_HISTORY='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-interview-history-admin';
const $=id=>document.getElementById(id);
let leadId='',plans=[],events=[],revisions=[],busy=false;
const style=document.createElement('style');
style.textContent='.case-lifecycle{background:#fff;border:1px solid var(--l);border-radius:14px;padding:13px;margin-top:12px}.case-lifecycle h3{font-size:12px;margin:0 0 9px}.case-lifecycle .muted{font-size:11px}.plan-card{background:var(--p);border:1px solid var(--l);border-radius:11px;padding:10px;margin-bottom:9px}.plan-card strong{display:block;font-size:12px}.plan-card small{display:block;color:var(--m);font-size:10px;margin-top:3px}.plan-status{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--td);background:#eef9f7;border-radius:999px;padding:3px 8px;margin-top:6px}.plan-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.plan-actions button{border:0;border-radius:9px;background:var(--c);color:var(--n);padding:8px 10px;font-size:10px;font-weight:700}.plan-actions button.primary{background:var(--n);color:#fff}.plan-actions button.danger{background:#fde9e6;color:#92372f}.new-plan-row{display:flex;gap:6px;margin-top:6px}.new-plan-row input{flex:1}.new-plan-row button{border:0;border-radius:9px;background:var(--n);color:#fff;padding:0 13px;font-size:11px;font-weight:700}.case-events{margin-top:9px;font-size:10px;color:var(--m)}.case-events div{padding:4px 0;border-top:1px solid var(--l)}.case-revisions{margin-top:9px}.revision-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--l);font-size:10px}.revision-row button{border:0;border-radius:8px;background:var(--c);color:var(--n);padding:5px 9px;font-size:9px;font-weight:700}.case-lifecycle-error{color:#92372f;font-size:10px;margin-top:6px}';
document.head.appendChild(style);
const PLAN_LABELS={research:'Researching options',options_ready:'Options ready to present',action_in_progress:'Action in progress',awaiting_outcome:'Waiting on authority/provider decision',persistence_check:'Response received — confirming outcome',resolved:'Resolved',closed_unresolved:'Closed — no resolution'};
const EVENT_LABELS={interview_completed:'First interview completed',research_completed:'Research completed',options_presented:'Options presented to family',plan_selected:'Plan selected',official_action_started:'Application/registration submitted',official_response_received:'Authority/provider responded',persistence_confirmed:'Outcome confirmed still active',case_resolved:'Case resolved',case_closed_unresolved:'Case closed without resolution',follow_up_attempted:'Follow-up attempted'};
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(url,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password()},body:JSON.stringify(body),cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}
function host(){let el=$('caseLifecycle');if(el)return el;const actions=document.querySelector('#drawer .interview-actions');if(!actions)return null;el=document.createElement('section');el.id='caseLifecycle';el.className='case-lifecycle';actions.after(el);return el}
function activePlan(){return plans.find(p=>p.plan_status!=='resolved'&&p.plan_status!=='closed_unresolved')||null}
function reasonFor(plan){const ev=events.find(e=>e.case_plan_id===plan.id&&e.event_type==='case_closed_unresolved');return ev?.note||''}
function planCard(plan){
  const status=PLAN_LABELS[plan.plan_status]||plan.plan_status,terminal=plan.plan_status==='resolved'||plan.plan_status==='closed_unresolved';
  const buttons=[];
  if(!terminal){
    if(plan.plan_status!=='awaiting_outcome'&&plan.plan_status!=='persistence_check')buttons.push('<button type="button" data-lc-action="submitted" data-lc-id="'+esc(plan.id)+'">Submitted — waiting on decision</button>');
    if(plan.plan_status==='awaiting_outcome')buttons.push('<button type="button" data-lc-action="responded" data-lc-id="'+esc(plan.id)+'">Authority/provider responded</button>');
    buttons.push('<button type="button" class="primary" data-lc-action="resolve" data-lc-id="'+esc(plan.id)+'">Resolve</button>');
    buttons.push('<button type="button" class="danger" data-lc-action="close" data-lc-id="'+esc(plan.id)+'">Close — no resolution</button>');
  }
  const reason=plan.plan_status==='closed_unresolved'?reasonFor(plan):'';
  return '<article class="plan-card"><strong>'+esc(plan.title||'Case plan')+'</strong>'+(plan.next_action?'<small>'+esc(plan.next_action)+'</small>':'')+(plan.next_follow_up_at?'<small>Next: '+esc(fmt(plan.next_follow_up_at))+'</small>':'')+'<span class="plan-status">'+esc(status)+'</span>'+(reason?'<small><strong>Closed:</strong> '+esc(reason)+'</small>':'')+(buttons.length?'<div class="plan-actions">'+buttons.join('')+'</div>':'')+'</article>';
}
function eventsHtml(){const recent=events.slice(0,6);if(!recent.length)return'';return '<div class="case-events">'+recent.map(e=>'<div>'+esc(fmt(e.occurred_at))+' · '+esc(EVENT_LABELS[e.event_type]||e.event_type)+'</div>').join('')+'</div>'}
function revisionsHtml(){if(!revisions.length)return'';return '<div class="case-revisions"><small class="muted">Interview edit history</small>'+revisions.map(r=>'<div class="revision-row"><span>Rev '+esc(r.revision_number)+' · '+esc(fmt(r.captured_at))+'</span><button type="button" data-lc-restore="'+esc(r.id)+'">Restore</button></div>').join('')+'</div>'}
function render(){
  const el=host();if(!el)return;
  const plan=activePlan(),otherPlans=plans.filter(p=>p!==plan);
  el.innerHTML='<h3>Case plan</h3>'+(plan?planCard(plan):'<p class="muted">No active case plan yet.</p><div class="new-plan-row"><input id="newPlanTitle" type="text" placeholder="e.g. Apply for private daycare voucher"><button type="button" id="newPlanBtn">Start plan</button></div>')+(otherPlans.length?'<p class="muted" style="margin-top:9px">'+otherPlans.length+' earlier plan'+(otherPlans.length===1?'':'s')+' on this family.</p>':'')+eventsHtml()+revisionsHtml()+'<p class="case-lifecycle-error hidden" id="caseLifecycleError"></p>';
  $('newPlanBtn')?.addEventListener('click',createPlan);
  el.querySelectorAll('[data-lc-action]').forEach(b=>b.onclick=()=>runAction(b.dataset.lcAction,b.dataset.lcId));
  el.querySelectorAll('[data-lc-restore]').forEach(b=>b.onclick=()=>restore(b.dataset.lcRestore));
}
function fail(message){const box=$('caseLifecycleError');if(box){box.textContent=message;box.classList.remove('hidden')}}
async function load(){
  if(!leadId)return;
  try{
    const[lc,hist]=await Promise.all([api(END_LIFECYCLE,{action:'list',lead_id:leadId}),api(END_HISTORY,{action:'list',lead_id:leadId}).catch(()=>({revisions:[]}))]);
    plans=lc.plans||[];events=lc.events||[];revisions=hist.revisions||[];
    render();
  }catch(error){const el=host();if(el)el.innerHTML='<h3>Case plan</h3><p class="case-lifecycle-error">'+esc(error.message)+'</p>'}
}
async function createPlan(){
  const title=($('newPlanTitle')?.value||'').trim();
  if(!title)return fail('Add a short plan title first.');
  if(busy)return;busy=true;
  try{await api(END_LIFECYCLE,{action:'save_plan',lead_id:leadId,title});await load()}
  catch(error){fail(error.message==='first_interview_required'?'Save the first interview above before starting a case plan.':error.message)}
  finally{busy=false}
}
async function submitPlanUpdate(plan,overrides){
  return api(END_LIFECYCLE,{action:'save_plan',lead_id:leadId,id:plan.id,title:plan.title,official_decision_maker:plan.official_decision_maker,selected_option:plan.selected_option,plan_status:overrides.plan_status||plan.plan_status,next_action:'next_action'in overrides?overrides.next_action:plan.next_action,next_follow_up_at:'next_follow_up_at'in overrides?overrides.next_follow_up_at:plan.next_follow_up_at});
}
async function runAction(action,planId){
  if(busy)return;
  const plan=plans.find(p=>p.id===planId);if(!plan)return;
  busy=true;
  try{
    if(action==='submitted'){
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'official_action_started'});
      await submitPlanUpdate(plan,{plan_status:'awaiting_outcome'});
    }else if(action==='responded'){
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'official_response_received'});
      await submitPlanUpdate(plan,{plan_status:'persistence_check'});
    }else if(action==='resolve'){
      if(!confirm('Mark this case plan resolved?'))return;
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'case_resolved'});
      await submitPlanUpdate(plan,{plan_status:'resolved'});
    }else if(action==='close'){
      const reason=(prompt('Why is this case plan closing without a resolution? (e.g. family unreachable, withdrew, no longer eligible)')||'').trim();
      if(!reason)return;
      if(!confirm('Close this case plan without a resolution?'))return;
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'case_closed_unresolved',note:reason});
      await submitPlanUpdate(plan,{plan_status:'closed_unresolved'});
    }
    await load();
  }catch(error){fail(error.message)}
  finally{busy=false}
}
async function restore(revisionId){
  if(busy||!revisionId)return;
  if(!confirm('Restore this earlier interview version? The current answers will be replaced (this does not delete history).'))return;
  busy=true;
  try{
    await api(END_HISTORY,{action:'restore',lead_id:leadId,revision_id:revisionId,confirm_restore:true});
    $('refresh')?.click();
    await load();
  }catch(error){fail(error.message)}
  finally{busy=false}
}
document.addEventListener('click',event=>{const b=event.target.closest('[data-interview]');if(!b)return;leadId=b.dataset.interview||'';setTimeout(load,450)},true);
window.AqoonCaseLifecycle={logInterviewCompleted:id=>id?api(END_LIFECYCLE,{action:'log_event',lead_id:id,event_type:'interview_completed'}).catch(()=>{}):Promise.resolve()};
})();
