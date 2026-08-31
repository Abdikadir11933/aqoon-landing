(()=>{'use strict';
// 2026-08-31 interview UX pass. This intentionally runs after bundle.js so
// it can improve the live conversation/workspace without changing matching
// criteria or backend lifecycle rules. The screen recording from the current
// production flow is the UX reference: route-specific matching stays intact;
// generic context and post-save workspace hierarchy are simplified here.
const ROOT='#questions';
const $=id=>document.getElementById(id);
let scheduled=false;

const style=document.createElement('style');
style.textContent=`
#promptWrap.research-brief-compact{margin-top:10px;background:#f7f4ee;border:1px solid var(--l);border-radius:13px;padding:10px}
#promptWrap.research-brief-compact #promptBox{display:none;margin-top:9px;max-height:280px;overflow:auto}
#promptWrap.research-brief-compact.brief-open #promptBox{display:block}
#promptWrap.research-brief-compact #copyPrompt{display:none}
.research-brief-bar{display:flex;align-items:center;justify-content:space-between;gap:8px}
.research-brief-bar div{min-width:0}.research-brief-bar strong{display:block;font-size:11px}.research-brief-bar small{display:block;color:var(--m);font-size:9px;margin-top:2px}
.research-brief-actions{display:flex;gap:6px;flex-shrink:0}.research-brief-actions button{border:1px solid var(--l);background:#fff;color:var(--n);border-radius:8px;padding:7px 9px;font-size:9px;font-weight:800}
#promptWrap.research-brief-compact #scenarioResult{margin:9px 0 0!important;padding:9px!important;font-size:10px}
#promptWrap.research-brief-compact #scenarioCapture{margin-top:8px!important}
#promptWrap.research-brief-compact #scenarioCapture summary{font-size:10px}
.universal-proof-section>.evidence-section:first-child label{font-size:15px!important}
.universal-proof-section>.evidence-section:first-child small{font-size:10px}
.universal-proof-question[data-ux-secondary="1"]{opacity:.96}
`;
document.head.appendChild(style);

function routeSet(){
  const meta=$('dMeta')?.textContent||'';
  const m=meta.match(/Interview topics:\s*([^·]+)/i);
  return new Set((m?m[1]:meta).split('+').map(x=>x.trim().toLowerCase()).filter(Boolean));
}
function q(key){return document.querySelector(ROOT+' [data-key="'+key+'"]')?.closest('.question')||null}
function row(key){return document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]')||null}
function setLabel(key,text){const box=q(key),label=box?.querySelector('label');if(label){const badge=label.querySelector('small')?.outerHTML||'';label.innerHTML=text+(badge?' '+badge:'')}}
function replaceChoices(key,values){
  const r=row(key);if(!r)return;
  const selected=new Set([...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value));
  r.innerHTML=values.map(v=>'<button type="button" class="choice'+(selected.has(v)?' on':'')+'" data-value="'+String(v).replace(/"/g,'&quot;')+'">'+v+'</button>').join('');
  // Existing scripts use onclick rather than delegation for these rows. Wire
  // the same single/multi behavior after replacing labels/options.
  r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{
    if(r.classList.contains('match-multi'))b.classList.toggle('on');
    else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
    r.dispatchEvent(new Event('change',{bubbles:true}));
  });
  r.dataset.wired='1';
}
function hide(key,on=true){q(key)?.classList.toggle('hidden',on)}
function showGroup(group,on){document.querySelectorAll(ROOT+' [data-branch-group="'+group+'"]').forEach(el=>el.style.display=on?'':'none')}

function contextualizeOpening(){
  const rs=routeSet(),child=['daycare','school_child','hobby'].some(x=>rs.has(x));
  if(child){
    setLabel('case_subject','Who are you speaking with about the child?');
    replaceChoices('case_subject',['Parent / guardian','Other caregiver','Helping the family','Not sure']);
    setLabel('current_situation','What is the parent / caregiver doing right now?');
    replaceChoices('current_situation',['Working','Studying / education','Seeking work','At home with children','Mixed / not sure']);
    if(rs.has('daycare')){
      setLabel('immediate_goal','What does the family want to solve first?');
      replaceChoices('immediate_goal',['Find daycare','Compare options / cost','Apply / register','Make work or study possible','Esiopetus','Other / not sure']);
    }else if(rs.has('school_child')){
      setLabel('immediate_goal','What does the family want to solve first?');
      replaceChoices('immediate_goal',['Understand school support','Prepare a school meeting','S2 / valmistava','Wilma / decision','School transition','Other / not sure']);
    }else{
      setLabel('immediate_goal','What does the family want to solve first?');
      replaceChoices('immediate_goal',['Find an activity','Free / low-cost option','Registration help','Right time / location','Support or accessibility','Other / not sure']);
    }
    return;
  }

  setLabel('case_subject','Who are we helping today?');
  replaceChoices('case_subject',['The person I am speaking with','Their household / family','Someone else','Not sure']);

  // Route-specific questions immediately below already capture these facts
  // better than the old generic "what is happening in their life" layer.
  // Hide the duplicate generic questions rather than making the operator ask
  // the same thing twice. Hidden required fields are excluded by missing().
  if(rs.has('work')||rs.has('education')||rs.has('entrepreneurship')){
    hide('current_situation',true);hide('immediate_goal',true);
  }else if(rs.has('program')){
    setLabel('current_situation','What is the person mainly doing right now?');
    replaceChoices('current_situation',['Working','Studying','Seeking work','At home / caregiving','New in Finland / settling','Mixed / not sure']);
    hide('immediate_goal',true);
  }else if(rs.has('service_support')){
    hide('current_situation',true);hide('immediate_goal',true);
  }else{
    setLabel('current_situation','What is the person’s situation right now?');
    setLabel('immediate_goal','What would be most useful to solve first?');
  }
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

  if(child){
    // The intake + route already establish that this family has the target
    // child. Do not make the operator rediscover that just to open a branch.
    hide('household_children',true);
    setLabel('work_interest_gate','Does the parent / caregiver also need work support?');
    replaceChoices('work_interest_gate',['Looking for work now','Likely within 12 months','Already working / no current need','No work help now','Not sure']);
  }

  if(rs.has('daycare')){
    hide('daycare_possible_need_all',true); // primary need already says yes
    showGroup('daycare',true);
    setLabel('private_daycare_awareness_all','Before AQOON, did they know private daycare could also be realistic?');
    setLabel('daycare_application_awareness_all','Would they know how to apply without help?');
    setLabel('daycare_future_reminder','Would a reminder before the next application need help?');
  }
  if(rs.has('school_child')){
    hide('school_help_possible',true); // this is already the primary case
    showGroup('school',true);
  }
  if(rs.has('hobby')){
    hide('vantaa_hobbies_possible_need',true); // hobby need already confirmed
    showGroup('school',true);
    if((($('dMeta')?.textContent||'').split(' · ')[0]||'').toLowerCase()==='vantaa')showGroup('vantaa-hobby',true);
  }
  if(rs.has('work')){
    hide('work_interest_gate',true); // primary need already says work
    showGroup('work-proof',true);
  }

  // The fast button versions above save the same consent keys. Keeping the
  // old trailing selects created duplicate questions in the recording.
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

function prioritizeCasePlan(){
  const capture=document.querySelector('#drawer .interview-capture'),plan=$('caseLifecycle');
  if(!capture||!plan)return;
  if(capture.nextElementSibling!==plan)capture.after(plan);
}
function optimize(){scheduled=false;contextualizeOpening();simplifyEvidenceFinish();compactResearchBrief();prioritizeCasePlan()}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(optimize,0)}

const observer=new MutationObserver(schedule);
function start(){const drawer=$('drawer');if(drawer)observer.observe(drawer,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});document.addEventListener('click',e=>{if(e.target.closest('#saveInterview,[data-interview]'))setTimeout(schedule,80)},true);schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
