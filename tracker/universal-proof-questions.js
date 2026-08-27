(()=>{'use strict';
const ROOT='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
let loading=false,lastLoaded=0,currentResearchTab='overview';

const WEEKLY={enabled:false,id:'',label:'',values:['Yes','No','Not sure'],city:null};
const EXCLUSIVE=new Set(['No children','None of these','Not sure','Nothing else now']);
const ALIASES={
  entry_service_awareness:['prior_awareness'],
  entry_service_self_navigation:['self_navigation'],
  entry_blockers:['access_barriers'],
  cross_service_needs_all:['other_needs_discovered'],
  private_daycare_awareness_all:['private_daycare_awareness'],
  vantaa_hobbies_awareness_all:['harrastusten_vantaa_awareness'],
  jobseeker:['jobseeker_active']
};

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function row(key,label,values,{multi=false,note='',group=''}={}){
  const q=document.createElement('div');q.className='question match-extra universal-proof-question';q.dataset.universalProof='1';if(group)q.dataset.branchGroup=group;
  q.innerHTML='<label>'+esc(label)+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+esc(key)+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+esc(note)+'</small>':'');
  const r=q.querySelector('.choice-row');r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{
    if(multi){const v=b.dataset.value;if(EXCLUSIVE.has(v)){r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');}else{r.querySelectorAll('.choice').forEach(x=>{if(EXCLUSIVE.has(x.dataset.value))x.classList.remove('on')});b.classList.toggle('on');}}
    else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');}
    syncBranches();
  });return q;
}
function head(title,sub,group=''){const h=document.createElement('div');h.className='question match-extra evidence-section';h.dataset.universalProof='1';if(group)h.dataset.branchGroup=group;h.innerHTML='<label style="font-size:17px">'+esc(title)+'</label><small class="muted" style="display:block;margin-top:5px">'+esc(sub)+'</small>';return h;}
function city(){return (document.getElementById('dMeta')?.textContent||'').split(' · ')[0].trim();}
function selected(key){const r=document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]');if(!r)return[];return [...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value);}
function showGroup(group,on){document.querySelectorAll(ROOT+' [data-branch-group="'+group+'"]').forEach(el=>{el.style.display=on?'':'none';if(!on){el.querySelectorAll?.('.choice.on').forEach(x=>x.classList.remove('on'));el.querySelectorAll?.('input,textarea,select').forEach(x=>{x.value=''})}});}
function syncBranches(){const kids=selected('household_children'),hasYoung=kids.includes('Under 3')||kids.includes('Age 3–6'),hasSchool=kids.includes('Grades 1–9'),work=selected('work_interest_gate')[0]||'';showGroup('daycare',hasYoung);showGroup('school',hasSchool);showGroup('vantaa-hobby',hasSchool&&city().toLowerCase()==='vantaa');showGroup('work-proof',work==='Looking for work now'||work==='Likely within 12 months');if(WEEKLY.enabled)showGroup('weekly',!WEEKLY.city||city().toLowerCase()===String(WEEKLY.city).toLowerCase());}
function exists(key){return !!document.querySelector(ROOT+' [data-key="'+key+'"]');}
function anyExists(keys){return keys.some(exists);}
function appendIfMissing(wrap,key,node){if(!exists(key))wrap.appendChild(node);}
function section(){
  const wrap=document.createElement('div');wrap.dataset.universalProofSection='1';wrap.className='universal-proof-section';
  wrap.appendChild(head('Always ask · evidence & next needs','About 1–2 minutes. Existing route questions are reused instead of repeated; only relevant branches open.'));
  appendIfMissing(wrap,'aqoon_awareness_before',row('aqoon_awareness_before','Before today, did they already know AQOON existed?',['Yes','Had seen it but never used it','No','Not sure']));
  if(!anyExists(['entry_service_awareness','prior_awareness']))wrap.appendChild(row('entry_service_awareness','Before AQOON, did they know the exact service/programme/opportunity discussed today existed?',['Yes – knew it','Had heard of it but did not understand it','No','Not sure']));
  if(!anyExists(['entry_service_self_navigation','self_navigation']))wrap.appendChild(row('entry_service_self_navigation','Without AQOON, would they have known what to do next?',['Yes','Partly / maybe','No','Not sure']));
  if(!anyExists(['entry_blockers','access_barriers']))wrap.appendChild(row('entry_blockers','What stopped them from acting before?',['Did not know it existed','Did not understand eligibility','Language','Form / digital system','Thought it cost too much','Did not know where to start','No one to ask','Childcare / timing','Transport','Trust / uncertainty','Other'],{multi:true}));
  appendIfMissing(wrap,'household_children',row('household_children','Children in the household?',['No children','Under 3','Age 3–6','Grades 1–9','Older children'],{multi:true,note:'Branch gate only — keeps the rest of the call short.'}));
  appendIfMissing(wrap,'work_interest_gate',row('work_interest_gate','Work situation for future support?',['Looking for work now','Likely within 12 months','Already working / no current need','Not looking for work now','Not sure']));

  wrap.appendChild(head('Work-system check','Only when work is relevant.','work-proof'));
  if(!anyExists(['jobseeker','jobseeker_active']))wrap.appendChild(row('jobseeker','Is job search currently active with employment services?',['Yes','No','Not sure'],{group:'work-proof'}));
  appendIfMissing(wrap,'employment_plan_status',row('employment_plan_status','Do they currently have an employment / integration / activation plan?',['Yes – employment plan','Yes – integration plan','Yes – other plan','No','Not sure'],{group:'work-proof'}));
  appendIfMissing(wrap,'work_support_awareness',row('work_support_awareness','Before AQOON, which of these did they actually understand?',['Työkokeilu','Oppisopimus','Palkkatuki','Kotoutumissuunnitelma','Työhönvalmennus','None of these','Not sure'],{multi:true,group:'work-proof'}));

  wrap.appendChild(head('Daycare cross-check','Only when there is a child under school age.','daycare'));
  if(!anyExists(['private_daycare_awareness_all','private_daycare_awareness']))wrap.appendChild(row('private_daycare_awareness_all','Before AQOON, did they know private daycare can be a realistic option too?',['Yes – understood it','Had heard of it but assumed it was expensive / not for us','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_possible_need_all',row('daycare_possible_need_all','Any daycare need now or coming up?',['Yes – now','Within 6 months','Later / when work or studies start','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_application_awareness_all',row('daycare_application_awareness_all','Would they know where/how to apply without help?',['Yes','Partly','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_future_reminder',row('daycare_future_reminder','Would a reminder before the next likely application need be useful?',['Yes','Maybe','No'],{group:'daycare'}));

  wrap.appendChild(head('School / hobby cross-check','Only when there is a child in grades 1–9.','school'));
  appendIfMissing(wrap,'school_help_possible',row('school_help_possible','Any school / Wilma / support issue they may want help with?',['Yes – now','Maybe later','No','Not sure'],{group:'school'}));
  if(!anyExists(['vantaa_hobbies_awareness_all','harrastusten_vantaa_awareness']))wrap.appendChild(row('vantaa_hobbies_awareness_all','Before AQOON, did they know Harrastusten Vantaa offers free school-age hobby groups?',['Yes – knew it','Had heard something','No','Not sure'],{group:'vantaa-hobby'}));
  appendIfMissing(wrap,'vantaa_hobbies_possible_need',row('vantaa_hobbies_possible_need','Could one of their children use a free hobby place?',['Yes – wants help now','Maybe next round','No','Not sure'],{group:'vantaa-hobby'}));
  appendIfMissing(wrap,'vantaa_hobbies_reminder',row('vantaa_hobbies_reminder','If groups are full now, should AQOON remind them before the next registration/opening?',['Yes','Maybe','No'],{group:'vantaa-hobby'}));

  if(WEEKLY.enabled&&WEEKLY.id&&WEEKLY.label)wrap.appendChild(row('weekly_'+WEEKLY.id,WEEKLY.label,WEEKLY.values,{group:'weekly',note:'Rotating research question. Use a new ID if wording/meaning changes.'}));

  wrap.appendChild(head('Finish','Capture broader demand without forcing it.'));
  if(!anyExists(['cross_service_needs_all','other_needs_discovered']))wrap.appendChild(row('cross_service_needs_all','After talking, what else is genuinely relevant?',['Work','School / child support','Daycare','Children’s hobbies','Finnish / education','Kela / benefits','Programmes / training','Housing','Letters / applications','Nothing else now'],{multi:true,note:'Only tick confirmed needs.'}));
  appendIfMissing(wrap,'aqoon_return_intent',row('aqoon_return_intent','If another Finnish-system question comes up, would they contact AQOON again?',['Yes','Maybe','No','Not sure']));
  appendIfMissing(wrap,'relevant_updates_ok',row('relevant_updates_ok','Okay for AQOON to contact them when a clearly relevant opportunity/application window opens?',['Yes','No','Ask each time / not sure'],{note:'Operational permission only; do not treat as blanket marketing consent.'}));
  appendIfMissing(wrap,'outcome_followup_ok',row('outcome_followup_ok','Okay for AQOON to check later what happened with today’s issue?',['Yes','No','Not sure']));
  return wrap;
}
function ready(root){return !!root.querySelector('.question [data-key]');}
function ensure(){const root=document.querySelector(ROOT);if(!root||!ready(root))return;let s=root.querySelector('[data-universal-proof-section="1"]');if(!s){s=section();root.appendChild(s);}else if(root.lastElementChild!==s)root.appendChild(s);syncBranches();}

function scrapeAnswers(){
  const out={};document.querySelectorAll(ROOT+' [data-key]').forEach(el=>{const k=el.dataset.key;if(!k||el.closest('[data-branch-group][style*="display: none"]'))return;if(el.matches('input,textarea,select')){if(el.value!=='')out[k]=el.value;return;}if(el.classList.contains('choice-row')){const vals=[...el.querySelectorAll('.choice.on')].map(b=>b.dataset.value);if(vals.length)out[k]=el.classList.contains('match-multi')?vals:vals[0];}});
  Object.entries(ALIASES).forEach(([target,sources])=>{if(out[target]!==undefined)return;for(const source of sources){if(out[source]!==undefined){out[target]=out[source];break;}}});
  return out;
}
function patchSaveFetch(){if(window.__aqoonUniversalSavePatch)return;window.__aqoonUniversalSavePatch=1;const original=window.fetch.bind(window);window.fetch=async function(input,init){try{const url=typeof input==='string'?input:(input&&input.url)||'';if(url.includes('family-leads-admin')&&init?.body){const body=JSON.parse(init.body);if(body.action==='save_interview'){const extra=scrapeAnswers();body.answers=Object.assign({},body.answers||{},extra);const lines=Object.entries(extra).map(([k,v])=>'- '+k+': '+(Array.isArray(v)?v.join(', '):v));if(lines.length)body.research_prompt=(body.research_prompt||'')+'\n\nUNIVERSAL INTERVIEW EVIDENCE / CROSS-NEEDS\n'+lines.join('\n');init=Object.assign({},init,{body:JSON.stringify(body)});}}}catch(e){console.warn('AQOON universal interview save merge skipped',e);}return original(input,init);};}

function count(ints,key){const c={};let n=0;(ints||[]).forEach(i=>{let v=i.answers&&i.answers[key];if(v===undefined&&ALIASES[key])for(const s of ALIASES[key]){if(i.answers?.[s]!==undefined){v=i.answers[s];break;}}if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>c[x]=(c[x]||0)+1)});return{n,c};}
function pct(d,match){if(!d.n)return 0;let v=0;Object.entries(d.c).forEach(([k,n])=>{if(match(k))v+=n});return Math.round(v/d.n*100);}
function metric(label,value){return'<div class="research-kpi"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';}
function question(title,d){const es=Object.entries(d.c).sort((a,b)=>b[1]-a[1]);if(!es.length)return'';const max=Math.max(...es.map(x=>x[1]),1);return'<div class="research-question"><div class="research-qtop"><strong>'+esc(title)+'</strong><small>n='+d.n+'</small></div>'+es.map(([k,v])=>'<div class="research-answer"><span title="'+esc(k)+'">'+esc(k)+'</span><div class="research-track"><div class="research-fill" style="width:'+Math.max(4,Math.round(v/max*100))+'%"></div></div><b>'+v+' · '+Math.round(v/d.n*100)+'%</b></div>').join('')+'</div>';}
function pane(id,questions,emptyText){const html=questions.filter(Boolean).join('');return'<div class="research-pane" data-research-pane="'+id+'" '+(id===currentResearchTab?'':'hidden')+'>'+(html||'<div class="research-empty">'+esc(emptyText||'No answers in this section yet.')+'</div>')+'</div>';}
function tabButton(id,label){return'<button type="button" class="research-tab '+(id===currentResearchTab?'on':'')+'" data-research-tab="'+id+'">'+esc(label)+'</button>';}
function ensureAnalytics(){
  document.getElementById('interviewEvidenceCard')?.remove();
  let card=document.getElementById('universalProofAnalytics');if(card)return card;
  const anchor=document.querySelector('.analytics-view .breakdown-card');if(!anchor)return null;
  card=document.createElement('article');card.className='command-card research-card';card.id='universalProofAnalytics';card.innerHTML='<div class="research-head"><div><h3>Interview insights</h3><p class="sub">Aggregated answers from completed first interviews.</p></div><div class="research-count" id="researchCount">0</div></div><div id="universalProofBody"><div class="research-empty">Loading interview insights…</div></div>';
  anchor.insertAdjacentElement('afterend',card);return card;
}
function bindResearchTabs(){document.querySelectorAll('[data-research-tab]').forEach(b=>b.onclick=()=>{currentResearchTab=b.dataset.researchTab;document.querySelectorAll('[data-research-tab]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('[data-research-pane]').forEach(p=>p.hidden=p.dataset.researchPane!==currentResearchTab);});}
async function load(force){
  const card=ensureAnalytics(),body=document.getElementById('universalProofBody');if(!card||!body||loading)return;if(!force&&lastLoaded&&Date.now()-lastLoaded<30000)return;
  const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;loading=true;body.innerHTML='<div class="research-empty">Loading interview insights…</div>';
  try{
    const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');
    const m=new Map();(d.interviews||[]).filter(i=>i.status==='completed').forEach(i=>{const o=m.get(i.lead_id);if(!o||String(i.updated_at)>String(o.updated_at))m.set(i.lead_id,i)});
    const ints=[...m.values()],core=ints.filter(i=>i.answers&&Object.keys(i.answers).some(k=>['aqoon_awareness_before','entry_service_awareness','prior_awareness','household_children','work_interest_gate'].includes(k)));
    document.getElementById('researchCount').textContent=core.length;
    const aware=count(core,'entry_service_awareness'),navigate=count(core,'entry_service_self_navigation'),other=count(core,'cross_service_needs_all');
    const unawarePct=pct(aware,k=>k==='No'||k.includes('did not understand'));
    const needsCount=Object.entries(other.c).filter(([k])=>k!=='Nothing else now').reduce((s,[,v])=>s+v,0);
    const workRelevant=core.filter(i=>{const v=i.answers?.work_interest_gate;return v==='Looking for work now'||v==='Likely within 12 months'});
    const young=core.filter(i=>{const v=i.answers?.household_children;const a=Array.isArray(v)?v:[v];return a.includes('Under 3')||a.includes('Age 3–6')});
    const school=core.filter(i=>{const v=i.answers?.household_children;const a=Array.isArray(v)?v:[v];return a.includes('Grades 1–9')});
    const vantaa=school.filter(i=>{const lead=(d.leads||[]).find(l=>l.id===i.lead_id);return String(lead?.city||'').toLowerCase()==='vantaa'||i.answers?.vantaa_hobbies_awareness_all!==undefined||i.answers?.harrastusten_vantaa_awareness!==undefined});
    body.innerHTML='<div class="research-kpis">'+metric('Interviewed',core.length)+metric('Didn’t know entry',aware.n?unawarePct+'%':'—')+metric('Extra needs',other.n?needsCount:'—')+'</div>'+
      '<div class="research-tabs">'+tabButton('overview','Overview')+tabButton('work','Work')+tabButton('daycare','Daycare')+tabButton('vantaa','Vantaa')+tabButton('next','Next needs')+'</div>'+
      pane('overview',[
        question('Knew AQOON before',count(core,'aqoon_awareness_before')),
        question('Knew the service / programme',aware),
        question('Could navigate without AQOON',navigate),
        question('What blocked action',count(core,'entry_blockers')),
        question('Children in household',count(core,'household_children'))
      ],'Complete a few interviews and the baseline awareness picture will appear here.')+
      pane('work',[
        question('Work situation',count(core,'work_interest_gate')),
        question('Active jobseeker registration',count(workRelevant,'jobseeker')),
        question('Employment / integration plan',count(workRelevant,'employment_plan_status')),
        question('Supports understood before',count(workRelevant,'work_support_awareness'))
      ],'No work-relevant interview answers yet.')+
      pane('daycare',[
        question('Private daycare awareness',count(young,'private_daycare_awareness_all')),
        question('Daycare need timing',count(young,'daycare_possible_need_all')),
        question('Could apply without help',count(young,'daycare_application_awareness_all')),
        question('Would a future reminder help',count(young,'daycare_future_reminder'))
      ],'No interviews with a daycare-age child have answered these questions yet.')+
      pane('vantaa',[
        question('Harrastusten Vantaa awareness',count(vantaa,'vantaa_hobbies_awareness_all')),
        question('Possible free-hobby need',count(vantaa,'vantaa_hobbies_possible_need')),
        question('Reminder before next opening',count(vantaa,'vantaa_hobbies_reminder')),
        question('School / Wilma support need',count(school,'school_help_possible'))
      ],'No relevant Vantaa school-age family answers yet.')+
      pane('next',[
        question('Other needs uncovered',other),
        question('Would return to AQOON',count(core,'aqoon_return_intent')),
        question('Relevant update permission',count(core,'relevant_updates_ok')),
        question('Outcome follow-up okay',count(core,'outcome_followup_ok'))
      ],'No cross-need or follow-up answers yet.')+
      '<div class="research-callout">Percentages use only people who were actually asked and answered that question. Conditional sections do not use all interviews as the denominator.</div>';
    bindResearchTabs();lastLoaded=Date.now();
  }catch(e){body.innerHTML='<div class="research-empty">Could not load interview insights: '+esc(e.message||e)+'</div>';}finally{loading=false;}
}

const obs=new MutationObserver(()=>{ensure();document.getElementById('interviewEvidenceCard')?.remove();});
function start(){patchSaveFetch();const r=document.querySelector(ROOT);if(r)obs.observe(r,{childList:true,subtree:true});ensure();ensureAnalytics();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
document.addEventListener('click',e=>{if(e.target.closest('[data-interview]'))setTimeout(ensure,180);if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureAnalytics();load(false)},300);if(e.target.closest('#refresh'))setTimeout(()=>load(true),400)},false);
})();
