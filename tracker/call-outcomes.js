((global)=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const DAY_MS=24*60*60*1000;
const SCHEDULED_OUTCOMES=['call_later','busy'];

function noAnswerFollowUp(now=Date.now()){return new Date(Number(now)+DAY_MS).toISOString()}
function buildOutcomePayload(leadId,outcome,followUpAt,now=Date.now(),notes){
  if(!leadId)throw Error('Missing family lead');
  if(!['reached','no_answer','call_later','busy'].includes(outcome))throw Error('Choose a call outcome');
  const payload={action:'record_call_outcome',id:String(leadId),call_outcome:outcome};
  if(outcome==='no_answer')payload.next_follow_up_at=noAnswerFollowUp(now);
  if(SCHEDULED_OUTCOMES.includes(outcome)){
    const follow=new Date(followUpAt||'');
    if(!Number.isFinite(follow.getTime())||follow.getTime()<=Number(now))throw Error('Choose a future follow-up time');
    payload.next_follow_up_at=follow.toISOString();
  }
  const trimmedNotes=typeof notes==='string'?notes.trim():'';
  if(trimmedNotes)payload.notes=trimmedNotes;
  return payload;
}

const core={noAnswerFollowUp,buildOutcomePayload};
if(typeof module!=='undefined'&&module.exports)module.exports=core;
if(!global||typeof document==='undefined')return;

const $=id=>document.getElementById(id);
let pending=null,openTimer=null,saving=false,pendingOutcome=null;
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(body){
  const response=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password()},body:JSON.stringify(body),cache:'no-store'});
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw Error(data.detail||data.error||'Could not save call outcome');
  return data;
}
function localValue(date){const d=new Date(date),pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())}
function ensureDialog(){
  if($('callOutcomeDialog'))return;
  const wrap=document.createElement('section');
  wrap.id='callOutcomeDialog';wrap.className='call-outcome-modal hidden';
  wrap.innerHTML='<div class="call-outcome-sheet" role="dialog" aria-modal="true" aria-labelledby="callOutcomeTitle"><span class="eyebrow">CALL OUTCOME</span><h2 id="callOutcomeTitle">What happened?</h2><p id="callOutcomeName" class="call-outcome-name"></p><div class="call-outcome-options"><button type="button" data-call-outcome="reached"><strong>Spoke to them</strong><span>Mark contacted</span></button><button type="button" data-call-outcome="no_answer"><strong>No answer</strong><span>Retry in 24 hours</span></button><button type="button" data-call-outcome="busy"><strong>Busy</strong><span>Choose a callback time</span></button><button type="button" data-call-outcome="call_later"><strong>Call back later</strong><span>Choose a time</span></button></div><form id="callFollowUpForm" class="call-later-form hidden"><label>Follow-up time<input id="callFollowUpAt" type="datetime-local" required></label><button class="btn primary" type="submit">Schedule follow-up</button></form><label class="call-outcome-note-label" for="callOutcomeNote">Note (optional)<textarea id="callOutcomeNote" rows="2" placeholder="What happened on this call?" maxlength="1000"></textarea></label><p id="callOutcomeError" class="call-outcome-error" role="alert"></p></div>';
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-call-outcome]').forEach(button=>button.onclick=()=>choose(button.dataset.callOutcome));
  $('callFollowUpForm').onsubmit=e=>{e.preventDefault();save(pendingOutcome,$('callFollowUpAt').value)};
}
function open(){
  if(!pending||saving)return;
  ensureDialog();clearTimeout(openTimer);openTimer=null;
  $('callOutcomeName').textContent=pending.name||'Family call';
  $('callOutcomeError').textContent='';
  $('callOutcomeNote').value='';
  $('callFollowUpForm').classList.add('hidden');
  pendingOutcome=null;
  $('callFollowUpAt').value=localValue(Date.now()+DAY_MS);
  $('callOutcomeDialog').classList.remove('hidden');
  document.body.classList.add('call-outcome-open');
  setTimeout(()=>$('callOutcomeDialog').querySelector('[data-call-outcome="reached"]')?.focus(),30);
}
function close(){
  $('callOutcomeDialog')?.classList.add('hidden');
  document.body.classList.remove('call-outcome-open');
  pending=null;pendingOutcome=null;
}
function choose(outcome){
  if(SCHEDULED_OUTCOMES.includes(outcome)){
    pendingOutcome=outcome;
    $('callFollowUpForm').classList.remove('hidden');
    $('callFollowUpAt').focus();
    return;
  }
  save(outcome);
}
async function save(outcome,followUpAt){
  if(!pending||saving)return;
  let payload;
  try{payload=buildOutcomePayload(pending.id,outcome,followUpAt,Date.now(),$('callOutcomeNote')?.value)}catch(error){$('callOutcomeError').textContent=error.message;return}
  saving=true;
  const buttons=$('callOutcomeDialog').querySelectorAll('button');buttons.forEach(button=>button.disabled=true);
  $('callOutcomeError').textContent='Saving…';
  try{
    await api(payload);close();
    const refresh=$('refresh');if(refresh)refresh.click();
  }catch(error){$('callOutcomeError').textContent=error.message||'Could not save call outcome'}
  finally{saving=false;buttons.forEach(button=>button.disabled=false)}
}
async function recordForLead(leadId,outcome,followUpAt,notes){
  const payload=buildOutcomePayload(leadId,outcome,followUpAt,Date.now(),notes);
  await api(payload);
  const refresh=$('refresh');if(refresh)refresh.click();
}
function openForLead(leadId,name,preferredOutcome){
  if(!leadId)return;
  pending={id:String(leadId),name:name||'Family call'};
  open();
  if(SCHEDULED_OUTCOMES.includes(preferredOutcome))choose(preferredOutcome);
}
function callLead(leadId,name,phone){
  if(!leadId||!phone)return;
  pending={id:String(leadId),name:name||'Client call'};
  location.href='tel:'+String(phone);
  scheduleOpen();
}
function scheduleOpen(){
  clearTimeout(openTimer);
  openTimer=setTimeout(()=>{if(document.visibilityState==='visible')open()},700);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-call-lead][href^="tel:"]');
  if(!link)return;
  pending={id:link.dataset.callLead,name:link.dataset.callName||link.closest('.next-row')?.querySelector('strong')?.textContent?.trim()||'Family call'};
  scheduleOpen();
},true);
document.addEventListener('visibilitychange',()=>{if(pending&&document.visibilityState==='visible')scheduleOpen()});
global.addEventListener('focus',()=>{if(pending)scheduleOpen()});
global.AqoonCallOutcomes={recordForLead,openForLead,callLead};
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));
