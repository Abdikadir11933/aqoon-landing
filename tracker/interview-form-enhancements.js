(()=>{'use strict';
const QUESTIONS='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const PILOT_DEPTH_MODULE_ENABLED=false;
let evidenceLoadedAt=0;

function wireChoiceRow(row){
  if(!row||row.dataset.wired==='1')return;
  row.dataset.wired='1';
  row.querySelectorAll('.choice').forEach(button=>{
    button.onclick=()=>{
      if(row.classList.contains('match-multi')) button.classList.toggle('on');
      else { row.querySelectorAll('.choice').forEach(x=>x.classList.remove('on')); button.classList.add('on'); }
    };
  });
}
function enhanceBarrier(root){
  const row=root.querySelector('.choice-row[data-key="barrier"]');
  if(!row||row.dataset.multiEnhanced==='1')return;
  row.dataset.multiEnhanced='1';row.classList.add('match-multi');row.dataset.wired='0';wireChoiceRow(row);
}
function addConditionNote(root,key,label){
  const row=root.querySelector('.choice-row[data-key="'+key+'"]');if(!row)return;
  const question=row.closest('.question');if(!question||question.querySelector('[data-key="'+key+'_notes"]'))return;
  const wrap=document.createElement('div');wrap.style.marginTop='10px';
  wrap.innerHTML='<label style="display:block;font-size:13px;margin-bottom:6px">'+label+'</label><input data-key="'+key+'_notes" type="text" placeholder="e.g. only if paid / depends on terms">';question.appendChild(wrap);
}
function addChoiceQuestion(root,key,label,values,{multi=false,note=''}={}){
  if(root.querySelector('[data-key="'+key+'"]'))return;
  const q=document.createElement('div');q.className='question match-extra evidence-question';
  q.innerHTML='<label>'+label+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+key+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+v.replace(/"/g,'&quot;')+'">'+v+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+note+'</small>':'');
  root.appendChild(q);wireChoiceRow(q.querySelector('.choice-row'));
}
function addTextQuestion(root,key,label,{type='text',placeholder='',note=''}={}){
  if(root.querySelector('[data-key="'+key+'"]'))return;
  const q=document.createElement('div');q.className='question match-extra evidence-question';
  q.innerHTML='<label>'+label+'</label><input data-key="'+key+'" type="'+type+'" '+(type==='number'?'min="0" inputmode="numeric" ':'')+'placeholder="'+placeholder.replace(/"/g,'&quot;')+'">'+(note?'<small class="muted" style="display:block;margin-top:8px">'+note+'</small>':'');root.appendChild(q);
}
function addSection(root,id,title,subtitle){
  if(root.querySelector('[data-evidence-section="'+id+'"]'))return;
  const s=document.createElement('div');s.className='question match-extra evidence-section';s.dataset.evidenceSection=id;
  s.innerHTML='<label style="font-size:17px">'+title+'</label>'+(subtitle?'<small class="muted" style="display:block;margin-top:5px">'+subtitle+'</small>':'');root.appendChild(s);
}
function routeReady(root){return !!root.querySelector('[data-key="client_age"],[data-key="care_goal"],[data-key="grade"],[data-key="business_stage"],[data-key="service_area"],[data-key="known_service"]');}
function addJobSearchProfile(root){
  const anchor=root.querySelector('.choice-row[data-key="jobseeker_active"]');if(!anchor||root.querySelector('[data-key="job_search_profile"]'))return;
  const anchorQuestion=anchor.closest('.question');if(!anchorQuestion)return;
  const question=document.createElement('div');question.className='question match-extra'+(anchorQuestion.classList.contains('hidden')?' hidden':'');question.dataset.branch=anchorQuestion.dataset.branch||'';question.dataset.branchSource=anchorQuestion.dataset.branchSource||'';
  question.innerHTML='<label>Työnhakuprofiili published? <small style="color:#0A8F89">new rule from 1.9.2026</small></label><div class="choice-row" data-key="job_search_profile"><button type="button" class="choice" data-value="Published">Published</button><button type="button" class="choice" data-value="Not published">Not published</button><button type="button" class="choice" data-value="Not yet applicable">Not yet applicable</button><button type="button" class="choice" data-value="Not sure">Not sure</button></div><small class="muted" style="display:block;margin-top:8px">From 1 Sep 2026 publishing and keeping the profile published is generally required when the obligation applies. New jobseekers usually have 15 working days after job search starts. If job search started before 1 Sep, the obligation normally begins at the next työnhakukeskustelu, followed by 15 working days. Exceptions exist; missing the profile deadline does not itself end job search or unemployment security.</small>';
  anchorQuestion.insertAdjacentElement('afterend',question);wireChoiceRow(question.querySelector('.choice-row'));
}
function addCoreEvidence(root){
  if(!routeReady(root))return;
  addSection(root,'acquisition','Quick evidence check','Ask naturally. These fields let AQOON prove where demand came from, what families already knew, and whether one first need opens other needs.');
  addChoiceQuestion(root,'aqoon_discovery','How did they first find AQOON?',['TikTok video','TikTok comment/DM','Friend or family','WhatsApp','Google / website','In person','Other / not sure']);
  addChoiceQuestion(root,'prior_awareness','Before AQOON, did they know this option/service existed?',['Yes – knew it','Had heard of it but did not understand','No','Not sure']);
  addChoiceQuestion(root,'self_navigation','Without AQOON, would they have known what to do next?',['Yes','Maybe / partly','No','Not sure']);
  addChoiceQuestion(root,'access_barriers','What was stopping them from acting before?',['Did not know it existed','Did not understand eligibility','Language','Form / digital system','Cost assumption','Did not know where to start','Fear / trust / consequences','Transport','Childcare / timing','No one to ask','Other'],{multi:true});
  addChoiceQuestion(root,'other_needs_discovered','Anything else they want help with after this first issue?',['Work','School','Daycare','Hobbies','Finnish / education','Kela / benefits','Programmes','Housing','Letters / forms','Nothing else now'],{multi:true,note:'Key cross-need measure. Do not force extra needs; record only what the family raises or confirms.'});
  addChoiceQuestion(root,'outcome_followup_ok','Okay for AQOON to check later what happened?',['Yes','No','Not sure']);
}
function addHobbyEvidence(root){
  if(!routeReady(root)||!root.querySelector('[data-key="hobby_time"]')||root.querySelector('[data-evidence-section="hobby-proof"]'))return;
  addSection(root,'hobby-proof','Hobby / Vantaa proof','Short questions for aggregate pilot reporting. Ask only what fits naturally.');
  addTextQuestion(root,'eligible_children_count','How many children in this family are in grades 1–9?',{type:'number',placeholder:'e.g. 2',note:'Needed to report target-group children, not only family contacts.'});
  addChoiceQuestion(root,'eligible_grades','Which grades are those children in?',['1','2','3','4','5','6','7','8','9'],{multi:true});
  addChoiceQuestion(root,'parent_hobby_attitude','How does the parent generally feel about regular hobbies for children?',['Very positive','Positive if practical / easy','Neutral','Hesitant / has concerns','Not a priority now','Not sure']);
  addChoiceQuestion(root,'hobby_before','Was the child already doing a regular hobby before this?',['Yes','No','Stopped recently','Not sure']);
  addChoiceQuestion(root,'harrastusten_vantaa_awareness','Before AQOON, had they heard of Harrastusten Vantaa / Harrastamisen Suomen malli?',['Yes – knew it','Had heard the name only','No','Not sure']);
  addChoiceQuestion(root,'hobby_free_awareness','Before AQOON, did they know these groups can be free?',['Yes','No','Not sure']);
  addChoiceQuestion(root,'hobby_registration_help','How much help do they need with registration?',['None – can do it alone','Link/explanation is enough','Need help while filling it','Need to do it together','Not sure'],{note:'Only ask if a Vantaa hobby need was already confirmed (vantaa_hobbies_possible_need = Yes/Maybe above) — this measures how much hands-on support to give, not whether the need exists.'});
  addChoiceQuestion(root,'hobby_main_barrier','Main reason the child was not already participating?',['Did not know about it','Could not find suitable activity','Registration was difficult','Group full / no place','Transport','Schedule','Language','Cost assumption','Child not interested','Parent not sure / trust','Other','Not applicable']);
  addChoiceQuestion(root,'hobby_outcome_stage','Where is this hobby case now?',['Need confirmed','Link / options sent','Registration started','Registered','Child started','No suitable place / group full','Waiting / follow-up','Did not proceed']);
  addChoiceQuestion(root,'hobby_persistence','Later follow-up: is the child still participating?',['Follow-up not due','Yes – still attending','Changed group/activity','Stopped','Never started','Not known yet']);
}
function addDaycareEvidence(root){
  if(!routeReady(root)||!root.querySelector('[data-key="care_goal"]')||root.querySelector('[data-evidence-section="daycare-proof"]'))return;
  addSection(root,'daycare-proof','Daycare decision proof','Keep this quick. These fields refresh the Pilke evidence and track the new funnel to a real start.');
  addChoiceQuestion(root,'daycare_child_age','Child age?',['Under 1','1','2','3','4','5','6','School-age / other','Not sure']);
  addChoiceQuestion(root,'daycare_current_state','Current situation before this call?',['Child at home','Municipal application / waiting','Municipal daycare','Private daycare','Changing daycare','Future need only','Not sure']);
  addChoiceQuestion(root,'private_daycare_awareness','Before AQOON, did they know private daycare could be a realistic option?',['Yes – understood it','Had heard of private daycare but assumed it was not for us','No','Not sure']);
  addChoiceQuestion(root,'private_daycare_cost_belief','Before AQOON, what did they think private daycare would cost per month?',['Same / similar to municipal','0–100 €','100–300 €','300–500 €','500–1,000 €','Over 1,000 €','Did not know']);
  addChoiceQuestion(root,'private_daycare_consider','If the real fee, location and place fit, would they consider private daycare?',['Yes','Maybe','No','Already chose private']);
  addChoiceQuestion(root,'daycare_priorities','What matters most when choosing daycare?',['Close to home','Language / bilingual','Educational focus','Fast place / start date','Price','Opening hours','Sibling / friends','Trust / recommendation','Other'],{multi:true});
  addChoiceQuestion(root,'application_steps_known','Before AQOON, did they understand the application steps needed for the route they want?',['Yes','Partly','No','Not sure']);
  addChoiceQuestion(root,'private_route_parallel_steps_awareness','Before AQOON, did they know a private-daycare route may require a separate provider application plus municipality/Kela steps?',['Yes','No','Not sure','Not applicable to this route'],{note:'Exact process varies by municipality; this records awareness, not a universal rule.'});
  addChoiceQuestion(root,'daycare_application_help','How much application help do they need?',['Can do it alone','Explanation / links are enough','Need help while filling it','Need to do it together','Not sure']);
  addChoiceQuestion(root,'daycare_action_stage','Where is this daycare case now?',['Exploring options','Private daycare chosen','Application steps explained','Application started','Application submitted','Place confirmed','Child started','Waiting / follow-up','Did not proceed']);
}
function countField(interviews,key){
  const c={};let n=0;interviews.forEach(i=>{const v=i.answers&&i.answers[key];if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>{const k=String(x);c[k]=(c[k]||0)+1;});});return {n,c};
}
function numericSum(interviews,key){return interviews.reduce((s,i)=>{const n=Number(i.answers&&i.answers[key]);return s+(Number.isFinite(n)&&n>0?n:0);},0);}
function rows(title,data,max=8){
  const entries=Object.entries(data.c).sort((a,b)=>b[1]-a[1]).slice(0,max),peak=entries.length?Math.max(...entries.map(e=>Number(e[1])||0)):1;
  return '<div style="margin-top:14px"><strong>'+title+'</strong><small class="muted" style="margin-left:6px">n='+data.n+'</small>'+(entries.length?'<div class="bars" style="margin-top:8px">'+entries.map(([k,v])=>'<div class="bar-row"><span>'+k+'</span><div class="bar-track"><i style="width:'+Math.max(6,Math.round(Number(v)/peak*100))+'%"></i></div><strong>'+v+'</strong></div>').join('')+'</div>':'<p class="sub">No recorded answers yet.</p>')+'</div>';
}
function latestInterviews(list){const m=new Map();(list||[]).filter(i=>i.status==='completed').forEach(i=>{const old=m.get(i.lead_id);if(!old||String(i.updated_at)>String(old.updated_at))m.set(i.lead_id,i);});return [...m.values()];}
function ensureEvidenceCard(){
  if(document.getElementById('interviewEvidenceCard'))return document.getElementById('interviewEvidenceCard');
  const analytics=document.querySelector('.analytics-view'),anchor=analytics?.querySelector('.breakdown-card');if(!analytics||!anchor)return null;
  const card=document.createElement('details');card.className='command-card';card.id='interviewEvidenceCard';
  card.innerHTML='<summary>Interview evidence & pilot questions</summary><p class="sub">Live aggregate of completed first interviews. No family names or phone numbers are shown here.</p><div id="interviewEvidenceBody"><p class="sub">Open to load.</p></div>';
  anchor.insertAdjacentElement('afterend',card);card.addEventListener('toggle',()=>{if(card.open)loadEvidence(false)});return card;
}
async function loadEvidence(force=false){
  const card=ensureEvidenceCard(),body=document.getElementById('interviewEvidenceBody');if(!card||!body)return;
  if(!force&&evidenceLoadedAt&&Date.now()-evidenceLoadedAt<30000)return;if(!sessionStorage.getItem('aqoon_auth_token'))return;
  body.innerHTML='<p class="sub">Loading interview evidence…</p>';
  try{
    const r=await fetch(ADMIN,{method:'POST',headers:window.AqoonAuthHeaders(),body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');
    const ints=latestInterviews(d.interviews||[]),leads=d.leads||[];
    const hobby=ints.filter(i=>i.answers&&(i.answers.harrastusten_vantaa_awareness!==undefined||i.answers.hobby_registration_help!==undefined||i.answers.hobby_outcome_stage!==undefined));
    const daycare=ints.filter(i=>i.answers&&(i.answers.private_daycare_awareness!==undefined||i.answers.private_daycare_consider!==undefined||i.answers.daycare_action_stage!==undefined));
    const grades=countField(hobby,'grade'),grade19=Object.entries(grades.c).filter(([k])=>/^[1-9]$/.test(k)).reduce((s,[,v])=>s+Number(v),0),targetChildren=numericSum(hobby,'eligible_children_count');
    const stages={};leads.forEach(l=>{const k=l.journey_stage||'reach';stages[k]=(stages[k]||0)+1;});
    body.innerHTML='<div class="analytics-secondary" style="margin-top:12px"><span>Completed evidence interviews <strong>'+ints.filter(i=>i.answers&&i.answers.aqoon_discovery!==undefined).length+'</strong></span><span>Hobby/Vantaa <strong>'+hobby.length+'</strong></span><span>Daycare <strong>'+daycare.length+'</strong></span></div>'+
      rows('How families first found AQOON',countField(ints,'aqoon_discovery'))+rows('Prior awareness of the entry service/opportunity',countField(ints,'prior_awareness'))+rows('Would they have known the next step without AQOON?',countField(ints,'self_navigation'))+rows('Barriers before contact',countField(ints,'access_barriers'))+rows('Additional needs discovered',countField(ints,'other_needs_discovered'))+
      '<hr style="border:0;border-top:1px solid #eee;margin:20px 0"><strong>Hobby / Vantaa reporting</strong><p class="sub">Recorded main-child grades 1–9: <b>'+grade19+'</b> · Total grade 1–9 children explicitly counted in families: <b>'+targetChildren+'</b></p>'+rows('Parent attitude to regular hobbies',countField(hobby,'parent_hobby_attitude'))+rows('Harrastusten Vantaa awareness',countField(hobby,'harrastusten_vantaa_awareness'))+rows('Knew groups can be free',countField(hobby,'hobby_free_awareness'))+rows('Registration-help intensity',countField(hobby,'hobby_registration_help'))+rows('Main participation barrier',countField(hobby,'hobby_main_barrier'))+rows('Current hobby case stage',countField(hobby,'hobby_outcome_stage'))+rows('Persistence follow-up',countField(hobby,'hobby_persistence'))+
      '<hr style="border:0;border-top:1px solid #eee;margin:20px 0"><strong>Daycare / Pilke evidence refresh</strong>'+rows('Private daycare awareness before AQOON',countField(daycare,'private_daycare_awareness'))+rows('Prior private-daycare cost belief',countField(daycare,'private_daycare_cost_belief'))+rows('Would consider private daycare if fit',countField(daycare,'private_daycare_consider'))+rows('Daycare decision priorities',countField(daycare,'daycare_priorities'))+rows('Understood application steps before AQOON',countField(daycare,'application_steps_known'))+rows('Knew route may have parallel provider + municipality/Kela steps',countField(daycare,'private_route_parallel_steps_awareness'))+rows('Application-help intensity',countField(daycare,'daycare_application_help'))+rows('Current daycare case stage',countField(daycare,'daycare_action_stage'))+rows('Current CRM journey stages',{n:leads.length,c:stages});
    evidenceLoadedAt=Date.now();
  }catch(e){body.innerHTML='<p class="sub">Could not load interview evidence: '+String(e.message||e)+'</p>';}
}
function enhance(){
  const root=document.querySelector(QUESTIONS);if(!root)return;enhanceBarrier(root);addJobSearchProfile(root);addConditionNote(root,'work_tryout','Työkokeilu notes / conditions');addConditionNote(root,'apprenticeship','Oppisopimus notes / conditions');if(PILOT_DEPTH_MODULE_ENABLED){addCoreEvidence(root);addHobbyEvidence(root);addDaycareEvidence(root);}root.querySelectorAll('.choice-row').forEach(wireChoiceRow);if(PILOT_DEPTH_MODULE_ENABLED)ensureEvidenceCard();
}
const observer=new MutationObserver(()=>enhance());
const start=()=>{const root=document.querySelector(QUESTIONS);if(root)observer.observe(root,{childList:true,subtree:true});enhance();if(PILOT_DEPTH_MODULE_ENABLED)ensureEvidenceCard();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
// enhance() also runs via the MutationObserver above whenever #questions
// gains children (e.g. once interview-match.js populates it), so this was
// a redundant, now-broken second trigger - fixed for clarity, not because
// it was the only path.
const originalOpenForEnhancements=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForEnhancements)originalOpenForEnhancements.call(this,id);
  setTimeout(enhance,80);
};
document.addEventListener('click',e=>{if(!PILOT_DEPTH_MODULE_ENABLED)return;if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureEvidenceCard();loadEvidence(false)},250);if(e.target.closest('#refresh'))setTimeout(()=>loadEvidence(true),350);},false);
})();