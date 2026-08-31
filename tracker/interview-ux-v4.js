(()=>{'use strict';
const ROOT='#questions';
const $=id=>document.getElementById(id);
let scheduled=false;
let busyRestoreTimer=null;

const style=document.createElement('style');
style.textContent=`
#drawer .choice,#drawer button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#drawer .choice{transition:transform .08s ease,background .08s ease,border-color .08s ease}
#drawer .choice:active{transform:scale(.985)}
#saveInterview[aria-busy="true"]{opacity:.78;cursor:progress}
.ux-canonical-question{background:#fbfaf7;border:1px solid #ece7dd;border-radius:12px;padding:11px}
.ux-canonical-question label{font-size:12px}.ux-canonical-question small{display:block;color:var(--m);font-size:9px;margin-top:4px}
#promptWrap.research-brief-compact{margin-top:10px;background:#f7f4ee;border:1px solid var(--l);border-radius:13px;padding:10px}
#promptWrap.research-brief-compact #promptBox{display:none;margin-top:9px;max-height:280px;overflow:auto}
#promptWrap.research-brief-compact.brief-open #promptBox{display:block}
#promptWrap.research-brief-compact #copyPrompt{display:none}
.research-brief-bar{display:flex;align-items:center;justify-content:space-between;gap:8px}
.research-brief-bar div{min-width:0}.research-brief-bar strong{display:block;font-size:11px}.research-brief-bar small{display:block;color:var(--m);font-size:9px;margin-top:2px}
.research-brief-actions{display:flex;gap:6px;flex-shrink:0}.research-brief-actions button{border:1px solid var(--l);background:#fff;color:var(--n);border-radius:8px;padding:7px 9px;font-size:9px;font-weight:800}
`;
document.head.appendChild(style);

function routeSet(){
  const meta=$('dMeta')?.textContent||'';
  const m=meta.match(/Interview topics:\s*([^·]+)/i);
  return new Set((m?m[1]:meta).split('+').map(x=>x.trim().toLowerCase()).filter(Boolean));
}
function city(){return (($('dMeta')?.textContent||'').split(' · ')[0]||'').trim().toLowerCase()}
function q(key){return document.querySelector(ROOT+' [data-key="'+key+'"]')?.closest('.question')||null}
function row(key){return document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]')||null}
function selected(key){const r=row(key);return r?[...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value):[]}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function setLabel(key,text){
  const box=q(key),label=box?.querySelector('label');if(!label)return;
  const badge=label.querySelector('small')?.outerHTML||'';
  const html=text+(badge?' '+badge:'');
  if(label.innerHTML!==html)label.innerHTML=html;
}
function wireRow(r){
  if(!r||r.dataset.ux4Wired==='1')return;
  r.dataset.ux4Wired='1';
  r.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    const before=b.getBoundingClientRect().top;
    requestAnimationFrame(()=>{
      syncCanonicalVisibility(true);
      const after=b.isConnected?b.getBoundingClientRect().top:before;
      const delta=after-before;
      if(Math.abs(delta)>1)window.scrollBy(0,delta);
    });
  }));
}
function replaceChoices(key,values){
  const r=row(key);if(!r)return;
  const current=[...r.querySelectorAll('.choice')].map(b=>b.dataset.value);
  if(current.length===values.length&&current.every((v,i)=>v===values[i])){wireRow(r);return}
  const chosen=new Set([...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value));
  r.innerHTML=values.map(v=>'<button type="button" class="choice'+(chosen.has(v)?' on':'')+'" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('');
  r.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    if(r.classList.contains('match-multi'))b.classList.toggle('on');
    else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
    r.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  wireRow(r);
}
function hide(key,on=true){const box=q(key);if(box)box.classList.toggle('hidden',on)}
function showGroup(group,on){document.querySelectorAll(ROOT+' [data-branch-group="'+group+'"]').forEach(el=>{const next=on?'':'none';if(el.style.display!==next)el.style.display=next})}

function addCanonical(key,label,type='text',options=[],required=true,note='Used by the verified route match.'){
  const host=$(ROOT.slice(1));if(!host||q(key))return q(key);
  const box=document.createElement('div');
  box.className='question match-extra ux-canonical-question';
  box.dataset.uxCanonical='1';
  box.dataset.matchRequired=required?'1':'0';
  let control='';
  if(type==='select')control='<div class="choice-row" data-key="'+esc(key)+'">'+options.map(v=>'<button type="button" class="choice" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>';
  else control='<input data-key="'+esc(key)+'" type="'+esc(type)+'">';
  box.innerHTML='<label>'+esc(label)+(required?' <small style="color:#0A8F89">needed for matching</small>':'')+'</label>'+control+(note?'<small>'+esc(note)+'</small>':'');
  const finish=document.querySelector('[data-universal-proof-section="1"]');
  if(finish)host.insertBefore(box,finish);else host.appendChild(box);
  wireRow(box.querySelector('.choice-row'));
  if(type==='select')box.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    box.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  }));
  return box;
}
function setCanonicalVisible(key,on,clearHidden=false){
  const box=q(key);if(!box)return;
  const wasHidden=box.classList.contains('hidden');
  box.classList.toggle('hidden',!on);
  if(clearHidden&&!on&&!wasHidden){
    box.querySelectorAll('.choice.on').forEach(x=>x.classList.remove('on'));
    box.querySelectorAll('input,textarea,select').forEach(x=>x.value='');
  }
}
function ensureCanonicalInputs(){
  const rs=routeSet();
  if(rs.has('daycare')){
    addCanonical('child_age_or_birth_date','Child’s date of birth','date',[],true,'Exact age matters for age-specific daycare and esiopetus routes.');
    addCanonical('desired_start_date','When should the daycare / esiopetus place start?','date',[],true,'Used for official timing and notice-period checks.');
    addCanonical('preferred_area','Preferred area or daycare location','text',[],true,'Needed for municipal/provider route matching.');
    addCanonical('income_statement_status','If private daycare / palveluseteli is considered, can the family provide the income information the city asks for?','select',['Yes','No','Not sure'],false,'Only appears for a private/voucher route.');
    addCanonical('support_need_description','What support or accessibility should the daycare / esiopetus provider assess?','text',[],false,'Only appears when support is relevant.');
  }
  if(rs.has('hobby')&&city()==='vantaa'){
    addCanonical('household_income_context','Would the cost of a paid hobby be difficult for the household?','select',['Yes','No','Not sure'],false,'Only for Vantaa hobby-cost support.');
    addCanonical('hobby_support_need','Is the child looking for a paid, guided hobby?','select',['Yes','No','Not sure'],false,'Only for Vantaa hobby-cost support.');
  }
  if(rs.has('work')){
    addCanonical('planned_unemployment_date','If current work is ending, when does unemployment start?','date',[],false,'Only appears when work is ending.');
    addCanonical('current_earned_income','Current earned-income situation','select',['No earned income','Some / occasional income','Part-time income','Full-time income','Not sure'],false,'Only appears when an unemployment-income route is relevant.');
    addCanonical('other_income_context','Any other income the official benefit route may need to know about?','select',['No / none known','Yes','Not sure'],false,'High-level context only; AQOON does not calculate benefits.');
  }
  if(rs.has('education'))addCanonical('education_support_need','If studying vocationally, is there an individual study-plan / HOKS support issue to check?','text',[],false,'Only for a vocational-study support route.');
  syncCanonicalVisibility(false);
}
function syncCanonicalVisibility(clearHidden=false){
  const rs=routeSet();
  if(rs.has('daycare')){
    const opts=selected('care_options'),goal=selected('care_goal')[0]||'',support=selected('support_arrangement')[0]||'';
    setCanonicalVisible('income_statement_status',opts.some(v=>/private|palveluseteli|no preference/i.test(v)),clearHidden);
    setCanonicalVisible('support_need_description',/esiopetus/i.test(goal)||/yes|not sure/i.test(support),clearHidden);
  }
  if(rs.has('hobby')&&city()==='vantaa'){
    const cost=selected('activity_cost')[0]||'';
    const need=/free|small fee/i.test(cost);
    setCanonicalVisible('household_income_context',need,clearHidden);
    setCanonicalVisible('hobby_support_need',need,clearHidden);
  }
  if(rs.has('work')){
    const primary=selected('primary_situation')[0]||'';
    setCanonicalVisible('planned_unemployment_date',/working/i.test(primary),clearHidden);
    const benefit=/unemployed|seeking work/i.test(primary)||selected('student_benefit_context').some(v=>/support|benefit/i.test(v));
    setCanonicalVisible('current_earned_income',benefit,clearHidden);
    setCanonicalVisible('other_income_context',benefit,clearHidden);
  }
  if(rs.has('education'))setCanonicalVisible('education_support_need',selected('current_study')[0]==='Vocational',clearHidden);
}
function mirrorCanonicalBeforeSave(){
  const rs=routeSet();if(!rs.has('work'))return;
  const primary=selected('primary_situation')[0]||'';
  let input=document.querySelector(ROOT+' input[data-key="main_status"]');
  if(!input){input=document.createElement('input');input.type='hidden';input.dataset.key='main_status';$(ROOT.slice(1))?.appendChild(input)}
  input.value=primary;
}

function contextualizeOpening(){
  const rs=routeSet(),child=['daycare','school_child','hobby'].some(x=>rs.has(x));
  if(child){
    setLabel('case_subject','Who are you speaking with about the child?');
    replaceChoices('case_subject',['Parent / guardian','Other caregiver','Helping the family','Not sure']);
    setLabel('current_situation','What is the parent / caregiver doing right now?');
    replaceChoices('current_situation',['Working','Studying / education','Seeking work','At home with children','Mixed / not sure']);
    setLabel('immediate_goal','What does the family want to solve first?');
    if(rs.has('daycare'))replaceChoices('immediate_goal',['Find daycare','Compare options / cost','Apply / register','Make work or study possible','Esiopetus','Other / not sure']);
    else if(rs.has('school_child'))replaceChoices('immediate_goal',['Understand school support','Prepare a school meeting','S2 / valmistava','Wilma / decision','School transition','Other / not sure']);
    else replaceChoices('immediate_goal',['Find an activity','Free / low-cost option','Registration help','Right time / location','Support or accessibility','Other / not sure']);
    return;
  }
  setLabel('case_subject','Who are we helping today?');
  replaceChoices('case_subject',['The person I am speaking with','Their household / family','Someone else','Not sure']);
  if(rs.has('work')||rs.has('education')||rs.has('entrepreneurship')){hide('current_situation',true);hide('immediate_goal',true)}
  else if(rs.has('program')){setLabel('current_situation','What is the person mainly doing right now?');replaceChoices('current_situation',['Working','Studying','Seeking work','At home / caregiving','New in Finland / settling','Mixed / not sure']);hide('immediate_goal',true)}
  else if(rs.has('service_support')){hide('current_situation',true);hide('immediate_goal',true)}
}
function simplifyEvidenceFinish(){
  const rs=routeSet(),child=['daycare','school_child','hobby'].some(x=>rs.has(x));
  const section=document.querySelector('[data-universal-proof-section="1"]');if(!section)return;
  const firstHead=section.querySelector('.evidence-section');
  if(firstHead){const label=firstHead.querySelector('label'),sub=firstHead.querySelector('small');if(label)label.textContent='AQOON & next needs';if(sub)sub.textContent='Finish with a few quick taps — only ask what adds new information.'}
  setLabel('entry_service_awareness','Before AQOON, did they know this option existed?');
  setLabel('entry_service_self_navigation','Without AQOON, would they know what to do next?');
  setLabel('entry_blockers','What made this difficult before?');
  setLabel('cross_service_needs_all','Anything else AQOON should help with?');
  replaceChoices('cross_service_needs_all',['Work','School / child','Daycare','Children’s hobbies','Finnish / education','Kela / benefits','Programmes / training','Housing','Letters / applications','Nothing else now']);
  setLabel('aqoon_return_intent','Would they use AQOON again for another Finland question?');
  setLabel('relevant_updates_ok','Can AQOON contact them when a clearly relevant opportunity opens?');
  setLabel('outcome_followup_ok','Can AQOON check later what happened with this issue?');
  if(child){hide('household_children',true);setLabel('work_interest_gate','Does the parent / caregiver also need work support?');replaceChoices('work_interest_gate',['Looking for work now','Likely within 12 months','Already working / no current need','No work help now','Not sure'])}
  if(rs.has('daycare')){hide('daycare_possible_need_all',true);showGroup('daycare',true)}
  if(rs.has('school_child')){hide('school_help_possible',true);showGroup('school',true)}
  if(rs.has('hobby')){hide('vantaa_hobbies_possible_need',true);showGroup('school',true);if(city()==='vantaa')showGroup('vantaa-hobby',true)}
  if(rs.has('work')){hide('work_interest_gate',true);showGroup('work-proof',true)}
  $('iRelevantUpdatesOk')?.closest('.question')?.classList.add('hidden');
  $('iOutcomeFollowupOk')?.closest('.question')?.classList.add('hidden');
}
function compactResearchBrief(){
  const wrap=$('promptWrap');if(!wrap||wrap.classList.contains('hidden'))return;
  wrap.classList.add('research-brief-compact');
  if(!$('researchBriefBar')){
    const bar=document.createElement('div');bar.id='researchBriefBar';bar.className='research-brief-bar';
    bar.innerHTML='<div><strong>Research brief ready</strong><small>Case plan stays primary. Open the full brief only when needed.</small></div><div class="research-brief-actions"><button type="button" id="copyBriefCompact">Copy</button><button type="button" id="toggleBriefCompact">Show brief</button></div>';
    wrap.prepend(bar);
    $('copyBriefCompact').onclick=()=>$('copyPrompt')?.click();
    $('toggleBriefCompact').onclick=()=>{wrap.classList.toggle('brief-open');$('toggleBriefCompact').textContent=wrap.classList.contains('brief-open')?'Hide brief':'Show brief'};
  }
}
function prioritizeCasePlan(){const capture=document.querySelector('#drawer .interview-capture'),plan=$('caseLifecycle');if(capture&&plan&&capture.nextElementSibling!==plan)capture.after(plan)}
function optimize(){scheduled=false;contextualizeOpening();simplifyEvidenceFinish();ensureCanonicalInputs();document.querySelectorAll(ROOT+' .choice-row').forEach(wireRow);compactResearchBrief();prioritizeCasePlan()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(optimize)}
function setSaveBusy(){
  const b=$('saveInterview');if(!b)return;
  clearTimeout(busyRestoreTimer);
  const original=b.dataset.uxOriginalText||b.textContent;
  b.dataset.uxOriginalText=original;b.setAttribute('aria-busy','true');b.textContent='Saving interview…';
  busyRestoreTimer=setTimeout(()=>{if(b.getAttribute('aria-busy')==='true'){b.removeAttribute('aria-busy');b.textContent=original}},12000);
}
function markSaved(){
  const b=$('saveInterview');if(!b)return;
  clearTimeout(busyRestoreTimer);b.removeAttribute('aria-busy');b.textContent='Saved ✓';
  setTimeout(()=>{if(b.isConnected)b.textContent=b.dataset.uxOriginalText||'Save interview & build deep-research brief'},900);
}
function start(){
  const drawer=$('drawer');
  if(drawer){
    const observer=new MutationObserver(muts=>{if(muts.some(m=>m.addedNodes.length||m.removedNodes.length))schedule()});
    observer.observe(drawer,{childList:true,subtree:true});
  }
  document.addEventListener('click',e=>{
    const target=e.target.closest?.('#saveInterview');
    if(target){mirrorCanonicalBeforeSave();setTimeout(setSaveBusy,0)}
  },true);
  document.querySelector(ROOT)?.addEventListener('click',e=>{
    if(!e.target.closest('.choice'))return;
    const tapped=e.target.closest('.choice'),before=tapped.getBoundingClientRect().top;
    requestAnimationFrame(()=>{syncCanonicalVisibility(true);const after=tapped.isConnected?tapped.getBoundingClientRect().top:before;const delta=after-before;if(Math.abs(delta)>1)window.scrollBy(0,delta)});
  });
  window.addEventListener('aqoon:interview-saved',()=>{markSaved();setTimeout(()=>{compactResearchBrief();prioritizeCasePlan();syncCanonicalVisibility(false)},0)});
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
