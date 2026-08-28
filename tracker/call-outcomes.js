((global)=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const DAY_MS=24*60*60*1000;

function noAnswerFollowUp(now=Date.now()){return new Date(Number(now)+DAY_MS).toISOString()}
function buildOutcomePayload(leadId,outcome,followUpAt,now=Date.now()){
  if(!leadId)throw Error('Missing family lead');
  if(!['reached','no_answer','call_later'].includes(outcome))throw Error('Choose a call outcome');
  const payload={action:'record_call_outcome',id:String(leadId),call_outcome:outcome};
  if(outcome==='no_answer')payload.next_follow_up_at=noAnswerFollowUp(now);
  if(outcome==='call_later'){
    const follow=new Date(followUpAt||'');
    if(!Number.isFinite(follow.getTime())||follow.getTime()<=Number(now))throw Error('Choose a future follow-up time');
    payload.next_follow_up_at=follow.toISOString();
  }
  return payload;
}

const core={noAnswerFollowUp,buildOutcomePayload};
if(typeof module!=='undefined'&&module.exports)module.exports=core;
if(!global||typeof document==='undefined')return;

const $=id=>document.getElementById(id);
let pending=null,openTimer=null,saving=false;
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
  wrap.innerHTML='<div class="call-outcome-sheet" role="dialog" aria-modal="true" aria-labelledby="callOutcomeTitle"><span class="eyebrow">CALL OUTCOME</span><h2 id="callOutcomeTitle">What happened?</h2><p id="callOutcomeName" class="call-outcome-name"></p><div class="call-outcome-options"><button type="button" data-call-outcome="reached"><strong>Reached</strong><span>Mark contacted</span></button><button type="button" data-call-outcome="no_answer"><strong>No answer</strong><span>Retry in 24 hours</span></button><button type="button" data-call-outcome="call_later"><strong>Call later</strong><span>Choose a time</span></button></div><form id="callLaterForm" class="call-later-form hidden"><label>Follow-up time<input id="callLaterAt" type="datetime-local" required></label><button class="btn primary" type="submit">Schedule follow-up</button></form><p id="callOutcomeError" class="call-outcome-error" role="alert"></p></div>';
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-call-outcome]').forEach(button=>button.onclick=()=>choose(button.dataset.callOutcome));
  $('callLaterForm').onsubmit=e=>{e.preventDefault();save('call_later',$('callLaterAt').value)};
}
function open(){
  if(!pending||saving)return;
  ensureDialog();clearTimeout(openTimer);openTimer=null;
  $('callOutcomeName').textContent=pending.name||'Family call';
  $('callOutcomeError').textContent='';
  $('callLaterForm').classList.add('hidden');
  $('callLaterAt').value=localValue(Date.now()+DAY_MS);
  $('callOutcomeDialog').classList.remove('hidden');
  document.body.classList.add('call-outcome-open');
  setTimeout(()=>$('callOutcomeDialog').querySelector('[data-call-outcome="reached"]')?.focus(),30);
}
function close(){
  $('callOutcomeDialog')?.classList.add('hidden');
  document.body.classList.remove('call-outcome-open');
  pending=null;
}
function choose(outcome){
  if(outcome==='call_later'){
    $('callLaterForm').classList.remove('hidden');
    $('callLaterAt').focus();
    return;
  }
  save(outcome);
}
async function save(outcome,followUpAt){
  if(!pending||saving)return;
  let payload;
  try{payload=buildOutcomePayload(pending.id,outcome,followUpAt)}catch(error){$('callOutcomeError').textContent=error.message;return}
  saving=true;
  const buttons=$('callOutcomeDialog').querySelectorAll('button');buttons.forEach(button=>button.disabled=true);
  $('callOutcomeError').textContent='Saving…';
  try{
    await api(payload);close();
    const refresh=$('refresh');if(refresh)refresh.click();
  }catch(error){$('callOutcomeError').textContent=error.message||'Could not save call outcome'}
  finally{saving=false;buttons.forEach(button=>button.disabled=false)}
}
function scheduleOpen(){
  clearTimeout(openTimer);
  openTimer=setTimeout(()=>{if(document.visibilityState==='visible')open()},700);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-call-lead][href^="tel:"]');
  if(!link)return;
  pending={id:link.dataset.callLead,name:link.dataset.callName||link.closest('.lead,.next-row')?.querySelector('h3,strong')?.textContent?.trim()||'Family call'};
  scheduleOpen();
},true);
document.addEventListener('visibilitychange',()=>{if(pending&&document.visibilityState==='visible')scheduleOpen()});
global.addEventListener('focus',()=>{if(pending)scheduleOpen()});
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));
