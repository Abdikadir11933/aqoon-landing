(()=>{'use strict';
const ROOT='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
let loading=false,lastLoaded=0;

const WEEKLY={enabled:false,id:'',label:'',values:['Yes','No','Not sure'],city:null};

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function row(key,label,values,{multi=false,note='',group=''}={}){
  const q=document.createElement('div');q.className='question match-extra universal-proof-question';q.dataset.universalProof='1';if(group)q.dataset.branchGroup=group;
  q.innerHTML='<label>'+esc(label)+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+esc(key)+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+esc(note)+'</small>':'');
  const r=q.querySelector('.choice-row');r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{if(multi)b.classList.toggle('on');else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on')}syncBranches();});return q;
}
function head(title,sub){const h=document.createElement('div');h.className='question match-extra evidence-section';h.dataset.universalProof='1';h.innerHTML='<label style="font-size:17px">'+esc(title)+'</label><small class="muted" style="display:block;margin-top:5px">'+esc(sub)+'</small>';return h;}
function city(){return (document.getElementById('dMeta')?.textContent||'').split(' · ')[0].trim();}
function hasSelected(key,value){const r=document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]');return !!r&&[...r.querySelectorAll('.choice.on')].some(b=>b.dataset.value===value);}
function selected(key){const r=document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]');if(!r)return[];return [...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value);}
function showGroup(group,on){document.querySelectorAll(ROOT+' [data-branch-group="'+group+'"]').forEach(el=>el.style.display=on?'':'none');}
function syncBranches(){
  const kids=selected('household_children');
  const hasYoung=kids.includes('Under 3')||kids.includes('Age 3–6');
  const hasSchool=kids.includes('Grades 1–9');
  const work=selected('work_interest_gate')[0]||'';
  showGroup('daycare',hasYoung);
  showGroup('school',hasSchool);
  showGroup('vantaa-hobby',hasSchool&&city().toLowerCase()==='vantaa');
  showGroup('work-proof',work==='Looking for work now'||work==='Likely within 12 months');
  if(WEEKLY.enabled)showGroup('weekly',!WEEKLY.city||city().toLowerCase()===String(WEEKLY.city).toLowerCase());
}
function ensureQuestion(root,key,node){if(root.querySelector('[data-key="'+key+'"]'))return;root.appendChild(node);}
function section(){
  const wrap=document.createElement('div');wrap.dataset.universalProofSection='1';wrap.className='universal-proof-section';
  wrap.appendChild(head('Always ask · evidence & next needs','About 1–2 minutes. Ask naturally at the end of every first interview. Branch questions appear only when relevant.'));
  ensureQuestion(wrap,'aqoon_awareness_before',row('aqoon_awareness_before','Before today, did they already know AQOON existed?',['Yes','Had seen it but never used it','No','Not sure']));
  ensureQuestion(wrap,'entry_service_awareness',row('entry_service_awareness','Before AQOON, did they know the exact service/programme/opportunity discussed today existed?',['Yes – knew it','Had heard of it but did not understand it','No','Not sure']));
  ensureQuestion(wrap,'entry_service_self_navigation',row('entry_service_self_navigation','Without AQOON, would they have known what to do next?',['Yes','Partly / maybe','No','Not sure']));
  ensureQuestion(wrap,'entry_blockers',row('entry_blockers','What stopped them from acting before?',['Did not know it existed','Did not understand eligibility','Language','Form / digital system','Thought it cost too much','Did not know where to start','No one to ask','Childcare / timing','Transport','Trust / uncertainty','Other'],{multi:true}));
  ensureQuestion(wrap,'household_children',row('household_children','Children in the household?',['No children','Under 3','Age 3–6','Grades 1–9','Older children'],{multi:true,note:'This is the branch gate. It keeps the rest short and lets AQOON ask the same relevant questions across every interview type.'}));
  ensureQuestion(wrap,'work_interest_gate',row('work_interest_gate','Work situation for future support?',['Looking for work now','Likely within 12 months','Already working / no current need','Not looking for work now','Not sure']));

  wrap.appendChild(head('Work-system check','Shown only when work is relevant.'));
  ensureQuestion(wrap,'jobseeker',row('jobseeker','Is job search currently active with employment services?',['Yes','No','Not sure'],{group:'work-proof'}));
  ensureQuestion(wrap,'employment_plan_status',row('employment_plan_status','Do they currently have an employment / integration / activation plan?',['Yes – employment plan','Yes – integration plan','Yes – other plan','No','Not sure'],{group:'work-proof'}));
  ensureQuestion(wrap,'work_support_awareness',row('work_support_awareness','Before AQOON, which of these did they actually understand?',['Työkokeilu','Oppisopimus','Palkkatuki','Kotoutumissuunnitelma','Työhönvalmennus','None of these','Not sure'],{multi:true,group:'work-proof'}));

  wrap.appendChild(head('Daycare cross-check','Shown only when there is a child under school age.'));
  ensureQuestion(wrap,'private_daycare_awareness_all',row('private_daycare_awareness_all','Before AQOON, did they know private daycare can be a realistic option too?',['Yes – understood it','Had heard of it but assumed it was expensive / not for us','No','Not sure'],{group:'daycare'}));
  ensureQuestion(wrap,'daycare_possible_need_all',row('daycare_possible_need_all','Any daycare need now or coming up?',['Yes – now','Within 6 months','Later / when work or studies start','No','Not sure'],{group:'daycare'}));
  ensureQuestion(wrap,'daycare_application_awareness_all',row('daycare_application_awareness_all','Would they know where/how to apply without help?',['Yes','Partly','No','Not sure'],{group:'daycare'}));
  ensureQuestion(wrap,'daycare_future_reminder',row('daycare_future_reminder','Would a reminder before the next likely application need be useful?',['Yes','Maybe','No'],{group:'daycare'}));

  wrap.appendChild(head('School / hobby cross-check','Shown only when there is a child in grades 1–9.'));
  ensureQuestion(wrap,'school_help_possible',row('school_help_possible','Any school / Wilma / support issue they may want help with?',['Yes – now','Maybe later','No','Not sure'],{group:'school'}));
  ensureQuestion(wrap,'vantaa_hobbies_awareness_all',row('vantaa_hobbies_awareness_all','Before AQOON, did they know Harrastusten Vantaa offers free school-age hobby groups?',['Yes – knew it','Had heard something','No','Not sure'],{group:'vantaa-hobby'}));
  ensureQuestion(wrap,'vantaa_hobbies_possible_need',row('vantaa_hobbies_possible_need','Could one of their children use a free hobby place?',['Yes – wants help now','Maybe next round','No','Not sure'],{group:'vantaa-hobby'}));
  ensureQuestion(wrap,'vantaa_hobbies_reminder',row('vantaa_hobbies_reminder','If groups are full now, should AQOON remind them before the next registration/opening?',['Yes','Maybe','No'],{group:'vantaa-hobby'}));

  if(WEEKLY.enabled&&WEEKLY.id&&WEEKLY.label)wrap.appendChild(row('weekly_'+WEEKLY.id,WEEKLY.label,WEEKLY.values,{group:'weekly',note:'Rotating research question. Change only the WEEKLY config at the top of this file.'}));

  wrap.appendChild(head('Finish','Capture broader demand without forcing it.'));
  ensureQuestion(wrap,'cross_service_needs_all',row('cross_service_needs_all','After talking, what else is genuinely relevant?',['Work','School / child support','Daycare','Children’s hobbies','Finnish / education','Kela / benefits','Programmes / training','Housing','Letters / applications','Nothing else now'],{multi:true,note:'Only tick confirmed needs. Do not create needs just to improve the data.'}));
  ensureQuestion(wrap,'aqoon_return_intent',row('aqoon_return_intent','If another Finnish-system question comes up, would they contact AQOON again?',['Yes','Maybe','No','Not sure']));
  ensureQuestion(wrap,'relevant_updates_ok',row('relevant_updates_ok','Okay for AQOON to contact them when a clearly relevant opportunity/application window opens?',['Yes','No','Ask each time / not sure'],{note:'Operational permission note only; do not treat this as blanket marketing consent.'}));
  ensureQuestion(wrap,'outcome_followup_ok',row('outcome_followup_ok','Okay for AQOON to check later what happened with today’s issue?',['Yes','No','Not sure']));
  return wrap;
}
function ready(root){return !!root.querySelector('.question [data-key]');}
function ensure(){const root=document.querySelector(ROOT);if(!root||!ready(root))return;let s=root.querySelector('[data-universal-proof-section="1"]');if(!s){s=section();root.appendChild(s);}else if(root.lastElementChild!==s)root.appendChild(s);syncBranches();}

function scrapeAnswers(){
  const out={};document.querySelectorAll(ROOT+' [data-key]').forEach(el=>{
    const k=el.dataset.key;if(!k)return;
    if(el.matches('input,textarea,select')){if(el.value!=='')out[k]=el.value;return;}
    if(el.classList.contains('choice-row')){const vals=[...el.querySelectorAll('.choice.on')].map(b=>b.dataset.value);if(vals.length)out[k]=el.classList.contains('match-multi')?vals:vals[0];}
  });return out;
}
function patchSaveFetch(){
  if(window.__aqoonUniversalSavePatch)return;window.__aqoonUniversalSavePatch=1;const original=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.includes('family-leads-admin')&&init?.body){const body=JSON.parse(init.body);if(body.action==='save_interview'){
        const extra=scrapeAnswers();body.answers=Object.assign({},body.answers||{},extra);
        const lines=Object.entries(extra).map(([k,v])=>'- '+k+': '+(Array.isArray(v)?v.join(', '):v));
        if(lines.length)body.research_prompt=(body.research_prompt||'')+'\n\nUNIVERSAL INTERVIEW EVIDENCE / CROSS-NEEDS\n'+lines.join('\n');
        init=Object.assign({},init,{body:JSON.stringify(body)});
      }}
    }catch(e){console.warn('AQOON universal interview save merge skipped',e);}
    return original(input,init);
  };
}

function count(ints,key){const c={};let n=0;(ints||[]).forEach(i=>{const v=i.answers&&i.answers[key];if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>c[x]=(c[x]||0)+1)});return{n,c};}
function bars(title,d){const es=Object.entries(d.c).sort((a,b)=>b[1]-a[1]);if(!es.length)return'<div style="margin-top:12px"><strong>'+esc(title)+'</strong><p class="sub">No answers yet.</p></div>';const p=Math.max(...es.map(x=>x[1]));return'<div style="margin-top:12px"><strong>'+esc(title)+'</strong><small class="muted" style="margin-left:6px">n='+d.n+'</small><div class="bars" style="margin-top:8px">'+es.map(([k,v])=>'<div class="bar-row"><span>'+esc(k)+'</span><div class="bar-track"><i style="width:'+Math.max(6,Math.round(v/p*100))+'%"></i></div><strong>'+v+'</strong></div>').join('')+'</div></div>'}
function ensureAnalytics(){if(document.getElementById('universalProofAnalytics'))return document.getElementById('universalProofAnalytics');const anchor=document.getElementById('interviewEvidenceCard')||document.querySelector('.analytics-view .breakdown-card');if(!anchor)return null;const d=document.createElement('details');d.className='command-card';d.id='universalProofAnalytics';d.innerHTML='<summary>Universal interview evidence</summary><p class="sub">Same baseline across all interview types, with branched life-stage questions.</p><div id="universalProofBody"><p class="sub">Open to load.</p></div>';anchor.insertAdjacentElement('afterend',d);d.addEventListener('toggle',()=>{if(d.open)load(false)});return d;}
async function load(force){
  const card=ensureAnalytics(),body=document.getElementById('universalProofBody');if(!card||!body||loading)return;if(!force&&lastLoaded&&Date.now()-lastLoaded<30000)return;const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;loading=true;body.innerHTML='<p class="sub">Loading…</p>';
  try{const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');const m=new Map();(d.interviews||[]).filter(i=>i.status==='completed').forEach(i=>{const o=m.get(i.lead_id);if(!o||String(i.updated_at)>String(o.updated_at))m.set(i.lead_id,i)});const ints=[...m.values()];const core=ints.filter(i=>i.answers&&i.answers.aqoon_awareness_before!==undefined);body.innerHTML='<div class="analytics-secondary"><span>Universal-check interviews <strong>'+core.length+'</strong></span></div>'+bars('Knew AQOON before',count(core,'aqoon_awareness_before'))+bars('Knew entry service/programme',count(core,'entry_service_awareness'))+bars('Could navigate without AQOON',count(core,'entry_service_self_navigation'))+bars('Main blockers',count(core,'entry_blockers'))+bars('Children in household',count(core,'household_children'))+bars('Work relevance',count(core,'work_interest_gate'))+bars('Active jobseeker status',count(core,'jobseeker'))+bars('Employment / integration plan status',count(core,'employment_plan_status'))+bars('Work supports understood before',count(core,'work_support_awareness'))+bars('Private-daycare awareness',count(core,'private_daycare_awareness_all'))+bars('Daycare need timing',count(core,'daycare_possible_need_all'))+bars('Could navigate daycare application',count(core,'daycare_application_awareness_all'))+bars('Vantaa hobby awareness',count(core,'vantaa_hobbies_awareness_all'))+bars('Possible Vantaa hobby need',count(core,'vantaa_hobbies_possible_need'))+bars('School support need uncovered',count(core,'school_help_possible'))+bars('Other needs uncovered',count(core,'cross_service_needs_all'))+bars('Would return to AQOON',count(core,'aqoon_return_intent'))+bars('Relevant update permission',count(core,'relevant_updates_ok'))+bars('Outcome follow-up okay',count(core,'outcome_followup_ok'));lastLoaded=Date.now();}catch(e){body.innerHTML='<p class="sub">Could not load: '+esc(e.message||e)+'</p>';}finally{loading=false;}
}
const obs=new MutationObserver(()=>ensure());
function start(){patchSaveFetch();const r=document.querySelector(ROOT);if(r)obs.observe(r,{childList:true,subtree:true});ensure();ensureAnalytics();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
document.addEventListener('click',e=>{if(e.target.closest('[data-interview]'))setTimeout(ensure,180);if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureAnalytics();load(false)},300);if(e.target.closest('#refresh'))setTimeout(()=>load(true),400)},false);
})();