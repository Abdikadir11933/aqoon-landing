(()=>{'use strict';

const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const CHILD_ROUTES=new Set(['daycare','school_child','hobby']);
const CHILD_NEED_DOMAINS={daycare:'daycare',school_child:'school',hobby:'hobby'};
const DRAFT_ID_TTL_MS=7*24*60*60*1000;
const states=new Map();
let leadId='';
let suppressRender=false;
let syncTimer=0;
let childCountRenderTimer=0;

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
function newId(){
  if(window.crypto?.randomUUID)return window.crypto.randomUUID();
  const bytes=new Uint8Array(16);window.crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  return[...bytes].map((byte,index)=>([4,6,8,10].includes(index)?'-':'')+byte.toString(16).padStart(2,'0')).join('');
}

function draftIdKey(){return leadId?'aqoon_family_setup_ids_'+leadId:''}
function readDraftIds(){
  const key=draftIdKey();if(!key)return[];
  const raw=localStorage.getItem(key);if(!raw)return[];
  try{
    const draft=JSON.parse(raw);
    if(!draft||!Array.isArray(draft.ids))return[];
    if(draft.saved_at&&Date.now()-new Date(draft.saved_at).getTime()>DRAFT_ID_TTL_MS){localStorage.removeItem(key);return[]}
    return draft.ids;
  }catch{localStorage.removeItem(key);return[]}
}
function writeDraftIds(s){
  const key=draftIdKey();if(!key)return;
  const ids=s.rows.map(row=>row.personId?null:row.clientId);
  if(ids.some(Boolean))localStorage.setItem(key,JSON.stringify({saved_at:new Date().toISOString(),ids}));
  else localStorage.removeItem(key);
}

async function api(body){
  const response=await fetch(END,{method:'POST',headers:window.AqoonAuthHeaders(),body:JSON.stringify(body),cache:'no-store'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.detail||data.error||'Could not save family details');
  return data;
}

function lead(){return(window.AqoonApp?.leads||[]).find(row=>row.id===leadId)||null}
function members(){const householdId=lead()?.household_id;return(window.AqoonApp?.householdPeople||[]).filter(row=>row.household_id===householdId)}
function children(){return members().filter(row=>row.role==='child').sort((a,b)=>String(a.created_at||a.id).localeCompare(String(b.created_at||b.id)))}
function extraMembers(){return members().filter(row=>row.role!=='contact'&&row.role!=='child')}
function routeSet(){const meta=document.getElementById('dMeta')?.textContent||'',match=meta.match(/Interview topics:\s*([^·]+)/i);return new Set((match?match[1]:meta).split('+').map(value=>value.trim().toLowerCase()).filter(Boolean))}
function isChildRoute(){return[...routeSet()].some(route=>CHILD_ROUTES.has(route))}
function childNeeds(){
  const expected=new Set([...routeSet()].map(route=>CHILD_NEED_DOMAINS[route]).filter(Boolean));
  return(window.AqoonApp?.familyNeeds||[]).filter(need=>need.source_lead_id===leadId&&need.status==='active'&&expected.has(need.need_domain));
}
function linkableChildNeed(){const needs=childNeeds();return needs.length===1?needs[0]:null}
function sourceQuestion(key){return document.querySelector('#questions [data-key="'+key+'"]')?.closest('.question')||null}
function sourceControl(key){return document.querySelector('#questions [data-key="'+key+'"]')||null}

function ageBand(age){
  if(age===null||age===undefined||age==='')return null;
  const years=Number(age);
  if(!Number.isInteger(years)||years<0||years>120)return null;
  if(years<3)return'Under 3';
  if(years<=6)return'Age 3–6';
  if(years<=15)return'Grades 1–9';
  if(years<18)return'Older children';
  return'Adult';
}

function selectedSource(key){
  const control=sourceControl(key);
  if(!control?.classList.contains('choice-row'))return'';
  return control.querySelector('.choice.on')?.dataset.value||'';
}

function initialState(){
  const saved=children();
  const latest=lead()?.latest_interview?.answers||{};
  const existingParent=String(latest.primary_contact_parent_caregiver||'');
  const subjectId=linkableChildNeed()?.subject_person_id||null;
  return{
    parent:existingParent,
    count:saved.length?String(saved.length):'',
    rows:saved.map((person,index)=>({personId:person.id,clientId:person.id,displayLabel:person.display_label||'Child '+(index+1),age:person.age_years??''})),
    subjectKey:subjectId?('id:'+subjectId):(saved.length===1?'id:'+saved[0].id:''),
    clientAge:String(latest.client_age??sourceControl('client_age')?.value??''),
    municipality:String(latest.home_municipality||selectedSource('home_municipality')||''),
    dirty:false,
    saving:false,
    optionalOpen:false,
  };
}

function state(){
  if(!states.has(leadId))states.set(leadId,initialState());
  return states.get(leadId);
}

function ensureSnapshotSource(key,label){
  let input=sourceControl(key);
  if(input)return input;
  const questions=document.getElementById('questions');
  if(!questions)return null;
  const wrapper=document.createElement('div');
  wrapper.className='question household-snapshot-source';
  wrapper.innerHTML='<label>'+esc(label)+'</label><input type="hidden" data-key="'+esc(key)+'">';
  questions.prepend(wrapper);
  return wrapper.querySelector('[data-key]');
}

function setInputSource(key,value,label){
  const control=sourceControl(key)||ensureSnapshotSource(key,label||key);
  if(!control||control.classList.contains('choice-row'))return;
  const next=value===null||value===undefined?'':String(value);
  if(control.value!==next){control.value=next;control.dispatchEvent(new Event('input',{bubbles:true}))}
}

function setChoiceSource(key,values){
  const row=sourceControl(key);
  if(!row?.classList.contains('choice-row'))return;
  const wanted=new Set(Array.isArray(values)?values:[values]);
  let changed=false;
  row.querySelectorAll('.choice').forEach(button=>{const on=wanted.has(button.dataset.value);if(button.classList.contains('on')!==on){button.classList.toggle('on',on);changed=true}});
  if(changed)row.dispatchEvent(new Event('input',{bubbles:true}));
}

function manageSource(key){
  const question=sourceQuestion(key);
  if(!question)return;
  question.classList.add('household-managed-source');
  question.setAttribute('aria-hidden','true');
}

function childBands(rows){return[...new Set(rows.map(row=>ageBand(row.age)).filter(band=>band&&band!=='Adult'))]}
function syncLegacyHouseholdAnswers(s){
  const bands=childBands(s.rows);
  const subjectIndex=subjectRowIndex(s);
  const otherRows=subjectIndex>=0?s.rows.filter((_,index)=>index!==subjectIndex):s.rows;
  if(sourceControl('household_children')){
    manageSource('household_children');
    if(bands.length)setChoiceSource('household_children',bands);
    else setChoiceSource('household_children',[]);
  }
  if(sourceControl('other_children_stages')){
    manageSource('other_children_stages');
    const otherBands=childBands(otherRows);
    setChoiceSource('other_children_stages',otherBands.length?otherBands:(otherRows.length?[]:'No other children'));
  }
  if(sourceControl('youngest_child_age')&&s.rows.some(row=>row.age!=='')){
    setInputSource('youngest_child_age',Math.min(...s.rows.filter(row=>row.age!=='').map(row=>Number(row.age))));
  }else if(sourceControl('youngest_child_age'))setInputSource('youngest_child_age','');
}

function syncManagedFields(){
  if(!leadId||!document.getElementById('householdPeopleCard'))return;
  const s=state();
  if(sourceControl('client_age')){manageSource('client_age');setInputSource('client_age',s.clientAge)}
  if(sourceControl('home_municipality')){manageSource('home_municipality');setChoiceSource('home_municipality',s.municipality)}
  const includeChildren=s.parent==='Yes'||(isChildRoute()&&!!s.parent);
  setInputSource('primary_contact_parent_caregiver',s.parent,'Primary contact is a parent or guardian');
  setInputSource('household_child_count',includeChildren?s.rows.length:'','Number of children recorded');
  setInputSource('household_child_ages',JSON.stringify(s.rows.map(row=>row.age===''?null:Number(row.age))),'Children’s ages');
  syncLegacyHouseholdAnswers(s);
}

function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(syncManagedFields,0)}

function host(){
  let card=document.getElementById('householdPeopleCard');
  if(card)return card;
  const questions=document.getElementById('questions');
  const wrap=document.getElementById('interviewQaCollapse');
  const anchor=wrap||questions;
  if(!anchor)return null;
  card=document.createElement('section');
  card.id='householdPeopleCard';
  card.className='household-people-card';
  anchor.before(card);
  return card;
}

function moveNotesAfterQuestions(){
  const capture=document.querySelector('#drawer .interview-capture');
  const anchor=document.getElementById('interviewQaCollapse')||document.getElementById('questions');
  if(capture&&anchor&&anchor.nextElementSibling!==capture)anchor.after(capture);
  const label=capture?.querySelector('label[for="iNotes"]');
  const hint=capture?.querySelector('p');
  if(label)label.textContent='Anything else the family said (optional)';
  if(hint)hint.textContent='Keep only useful context in the family’s own words. The quick answers above remain the structured record.';
}

function ensureRows(s,count){
  const savedCount=s.rows.filter(row=>row.personId).length;
  const requested=Number(count);
  const safe=Math.max(savedCount,Number.isInteger(requested)&&requested>=0&&requested<=20?requested:0);
  while(s.rows.length<safe){const id=newId();s.rows.push({personId:null,clientId:id,displayLabel:'Child '+(s.rows.length+1),age:''})}
  if(s.rows.length>safe)s.rows=s.rows.slice(0,safe);
  s.rows.forEach((row,index)=>{row.displayLabel=row.displayLabel||'Child '+(index+1)});
  s.count=safe?String(safe):'';
  if(s.subjectKey&&subjectRowIndex(s)<0)s.subjectKey='';
  if(s.rows.length===1&&!s.subjectKey)s.subjectKey=rowKey(s.rows[0],0);
}

function rowKey(row,index){return'id:'+(row.personId||row.clientId||index)}
function subjectRowIndex(s){return s.rows.findIndex((row,index)=>rowKey(row,index)===s.subjectKey)}

function personSummary(person){
  const role=person.role==='adult'?'Additional adult':person.role==='dependent'?'Dependent':'Other person';
  return[role,person.age_years!==null&&person.age_years!==undefined?person.age_years+' years':person.age_band].filter(Boolean).join(' · ');
}

function familyBasicsFields(s){
  const current=lead();
  const hasClientAge=!!sourceControl('client_age');
  const hasMunicipality=!!sourceControl('home_municipality');
  const city=current?.city||'the intake city';
  if(!hasClientAge&&!hasMunicipality)return'';
  return'<div class="household-match-basics"><strong>Details needed for matching</strong><div class="household-basics-grid">'+
    (hasClientAge?'<label>Age of the adult this request is about<input id="familyClientAge" type="number" min="0" max="120" inputmode="numeric" value="'+esc(s.clientAge)+'" required><small>This is an interview answer. It does not create another adult.</small></label>':'')+
    (hasMunicipality?'<fieldset><legend>Is '+esc(city)+' the registered municipality (kotikunta) for the person this route concerns?</legend><div class="household-choice-row" data-family-choice="municipality">'+choiceButtons(['Yes','No','Not sure'],s.municipality)+'</div></fieldset>':'')+
    '</div></div>';
}

function choiceButtons(values,selected){return values.map(value=>'<button type="button" class="household-choice'+(selected===value?' on':'')+'" data-value="'+esc(value)+'" aria-pressed="'+(selected===value?'true':'false')+'">'+esc(value)+'</button>').join('')}

function childrenEditor(s){
  const show=s.parent==='Yes'||(isChildRoute()&&!!s.parent);
  if(!show)return'';
  const savedCount=s.rows.filter(row=>row.personId).length;
  const countLabel=s.parent==='Yes'?'How many children are in this household?':'How many children are part of this case?';
  const subject=linkableChildNeed(),candidateNeeds=childNeeds();
  return'<div class="household-children-panel">'+
    '<label class="household-count">'+esc(countLabel)+'<input id="familyChildCount" type="number" min="'+Math.max(1,savedCount)+'" max="20" inputmode="numeric" value="'+esc(s.count)+'" placeholder="0"><small>The number cannot remove children already saved. Correct a saved record separately.</small></label>'+
    (s.rows.length?'<div class="household-child-grid">'+s.rows.map((row,index)=>'<label for="familyChildAge'+index+'">Child '+(index+1)+' age <span>years</span><input id="familyChildAge'+index+'" data-child-age="'+index+'" type="number" min="0" max="120" inputmode="numeric" value="'+esc(row.age)+'" placeholder="Not sure" aria-describedby="familyChildAgeHelp'+index+'"><small id="familyChildAgeHelp'+index+'">No name needed'+(row.personId?' · already saved':'')+'</small></label>').join('')+'</div>':'')+
    (subject&&s.rows.length?'<fieldset class="household-subject"><legend>Which child is this request about?</legend><div class="household-choice-row" data-family-choice="subject">'+s.rows.map((row,index)=>{const key=rowKey(row,index),text='Child '+(index+1)+(row.age!==''?' · '+esc(row.age)+' years':'');return'<button type="button" class="household-choice'+(s.subjectKey===key?' on':'')+'" data-value="'+esc(key)+'" aria-pressed="'+(s.subjectKey===key?'true':'false')+'">'+text+'</button>'}).join('')+'</div><small>The selected child will be linked only to the active '+esc(subject.need_domain)+' request.</small></fieldset>':'')+
    (candidateNeeds.length>1?'<p class="household-link-note">Several child requests are active. Save the children here, then link each request separately so the wrong need is never assigned.</p>':'')+
    '<p class="household-save-note">Children are saved to the family record when you save the interview.</p></div>';
}

function optionalMembers(s){
  const extras=extraMembers();
  return'<details class="household-optional" '+(s.optionalOpen?'open':'')+'><summary>Add someone else <span>optional</span></summary>'+
    (extras.length?'<div class="household-extra-list">'+extras.map(person=>'<span>'+esc(personSummary(person))+'</span>').join('')+'</div>':'')+
    '<form id="householdMemberForm"><div class="household-member-grid"><label>Who are you adding?<select id="householdMemberRole"><option value="adult">Another adult</option><option value="dependent">Dependent</option><option value="other">Other person</option></select></label><label>Private label<input id="householdMemberLabel" maxlength="80" placeholder="Other adult — no full name needed" required></label><label>Age (optional)<input id="householdMemberAge" type="number" min="0" max="120" inputmode="numeric"></label></div><p>This is only for another person who matters to the case. The primary contact is already included.</p><button class="btn secondary" id="householdMemberSave" type="submit">Save additional person</button> <span id="householdMemberStatus" role="status" aria-live="polite"></span></form></details>';
}

function render(){
  if(suppressRender)return;
  const card=host(),current=lead();
  if(!card||!current?.household_id){card?.remove();return}
  const s=state();
  moveNotesAfterQuestions();
  card.innerHTML='<div class="household-people-head"><div><span class="household-step">Start here</span><strong>Family basics</strong><small>The person you are speaking with is already included. Add only children and anyone else relevant to this case.</small></div><span class="household-contact-chip">Contact person · included</span></div>'+
    '<fieldset class="household-parent"><legend>Is the person you are speaking with a parent or guardian?</legend><div class="household-choice-row" data-family-choice="parent">'+choiceButtons(['Yes','No','Not sure'],s.parent)+'</div><small>Choose “No” only if this was confirmed. Add children here only when they belong to this same family record.</small></fieldset>'+childrenEditor(s)+familyBasicsFields(s)+optionalMembers(s)+'<div id="familySetupStatus" class="household-status" role="status" aria-live="polite"></div>';
  bind(card,s);
  syncManagedFields();
}

function markDirty(s){s.dirty=true;writeDraftIds(s);syncManagedFields()}

function bind(card,s){
  document.getElementById('familyClientAge')?.addEventListener('input',event=>{s.clientAge=event.target.value;markDirty(s)});
  document.querySelector('[data-family-choice="municipality"]')?.addEventListener('click',event=>{const button=event.target.closest('button[data-value]');if(!button)return;s.municipality=button.dataset.value;markDirty(s);render()});
  document.querySelector('[data-family-choice="parent"]')?.addEventListener('click',event=>{const button=event.target.closest('button[data-value]');if(!button)return;s.parent=button.dataset.value;if((s.parent==='Yes'||isChildRoute())&&!s.count)ensureRows(s,1);if(s.parent!=='Yes'&&!isChildRoute()){s.count='';s.rows=s.rows.filter(row=>row.personId)}markDirty(s);render()});
  const childCountInput=document.getElementById('familyChildCount');
  const applyChildCount=(event,strict)=>{const requested=Number(event.target.value),savedCount=children().length;if(!Number.isInteger(requested)||requested<1||requested>20){if(strict){status('Enter a child count from 1 to 20.',true);event.target.value=s.count||String(Math.max(savedCount,1));event.target.focus()}return false}if(requested<savedCount){if(strict){status('Saved children are never removed by changing this number.',true);event.target.value=String(Math.max(savedCount,1));event.target.focus()}return false}ensureRows(s,requested);markDirty(s);return true};
  childCountInput?.addEventListener('input',event=>{clearTimeout(childCountRenderTimer);if(!applyChildCount(event,false))return;childCountRenderTimer=setTimeout(()=>{if(state()===s&&(s.parent==='Yes'||isChildRoute()))render()},180)});
  childCountInput?.addEventListener('change',event=>{clearTimeout(childCountRenderTimer);if(applyChildCount(event,true))render()});
  card.querySelectorAll('[data-child-age]').forEach(input=>input.addEventListener('input',event=>{const index=Number(event.target.dataset.childAge);s.rows[index].age=event.target.value;markDirty(s);scheduleSync()}));
  document.querySelector('[data-family-choice="subject"]')?.addEventListener('click',event=>{const button=event.target.closest('button[data-value]');if(!button)return;s.subjectKey=button.dataset.value;markDirty(s);render()});
  const details=card.querySelector('.household-optional');details?.addEventListener('toggle',()=>{s.optionalOpen=details.open});
  document.getElementById('householdMemberForm')?.addEventListener('submit',saveAdditionalMember);
}

function status(message,error=false){const node=document.getElementById('familySetupStatus');if(!node)return;node.textContent=message;node.classList.toggle('error-text',error);node.setAttribute('role',error?'alert':'status');node.setAttribute('aria-live',error?'assertive':'polite')}

function validateSetup(s){
  if(!s.parent)return{message:'Choose Yes, No or Not sure for parent or guardian.',target:'[data-family-choice="parent"] button'};
  const requiresChildren=s.parent==='Yes'||isChildRoute();
  if(requiresChildren&&!s.rows.length)return{message:'Add how many children are in the household or case.',target:'#familyChildCount'};
  const invalidChild=s.rows.findIndex(row=>row.age!==''&&(!Number.isInteger(Number(row.age))||Number(row.age)<0||Number(row.age)>120));
  if(invalidChild>=0)return{message:'Use a valid age from 0 to 120 for each child, or leave it blank if it is not known.',target:'#familyChildAge'+invalidChild};
  if(linkableChildNeed()&&s.rows.length&&subjectRowIndex(s)<0)return{message:'Choose which child this request is about.',target:'[data-family-choice="subject"] button'};
  if(sourceControl('client_age')&&!s.clientAge)return{message:'Add the age of the adult this request is about.',target:'#familyClientAge'};
  if(s.clientAge!==''&&(!Number.isInteger(Number(s.clientAge))||Number(s.clientAge)<0||Number(s.clientAge)>120))return{message:'Use a valid age from 0 to 120.',target:'#familyClientAge'};
  if(sourceControl('home_municipality')&&!s.municipality)return{message:'Choose the registered municipality for the person this route concerns.',target:'[data-family-choice="municipality"] button'};
  return null;
}

async function persistFamilySetup(s){
  const error=validateSetup(s);if(error)throw Error(error.message);
  if(!s.rows.length){s.dirty=false;return}
  const subjectIndex=subjectRowIndex(s),need=linkableChildNeed();
  const result=await api({action:'save_family_setup',lead_id:leadId,children:s.rows.map((row,index)=>({person_id:row.personId||row.clientId,age_years:row.age===''?null:Number(row.age),display_label:row.displayLabel||('Child '+(index+1)),family_need_id:need&&index===subjectIndex?need.id:null}))});
  suppressRender=true;
  try{
    (result.children||[]).forEach(person=>window.AqoonApp?.patchHouseholdLocal?.(person,null));
    (result.needs||[]).forEach(linkedNeed=>{const existing=(window.AqoonApp?.familyNeeds||[]).find(item=>item.id===linkedNeed.id)||{};window.AqoonApp?.patchHouseholdLocal?.(null,{...existing,...linkedNeed})});
  }finally{suppressRender=false}
  const saved=result.children||[];
  s.rows=s.rows.map((row,index)=>{const person=saved[index]||{};return{...row,personId:person.id||row.personId,clientId:person.id||row.clientId,displayLabel:person.display_label||row.displayLabel}});
  if(subjectIndex>=0)s.subjectKey=rowKey(s.rows[subjectIndex],subjectIndex);
  s.dirty=false;
  writeDraftIds(s);
  syncManagedFields();
}

async function saveAdditionalMember(event){
  event.preventDefault();
  const button=document.getElementById('householdMemberSave'),message=document.getElementById('householdMemberStatus');
  const displayLabel=document.getElementById('householdMemberLabel').value.trim();
  if(!displayLabel){message.textContent='Add a private label.';return}
  button.disabled=true;message.textContent='Saving…';
  try{
    const age=document.getElementById('householdMemberAge').value;
    const result=await api({action:'save_household_member',lead_id:leadId,role:document.getElementById('householdMemberRole').value,display_label:displayLabel,age_band:ageBand(age),age_years:age||null,family_need_id:null});
    window.AqoonApp?.patchHouseholdLocal?.(result.person,result.need);
    state().optionalOpen=false;
    render();
  }catch(error){message.textContent=error.message}finally{button.disabled=false}
}

async function interceptInterviewSave(event){
  const button=event.target.closest('#saveInterview');
  if(!button||button.dataset.familySetupBypass==='1'||!leadId)return;
  const s=state(),error=validateSetup(s);
  if(error){event.preventDefault();event.stopImmediatePropagation();status(error.message,true);const target=document.querySelector(error.target);target?.focus();target?.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(!s.dirty&&!s.rows.some(row=>!row.personId))return;
  event.preventDefault();event.stopImmediatePropagation();
  s.saving=true;button.disabled=true;status('Saving family details…');
  try{
    await persistFamilySetup(s);
    status('Family details saved. Saving interview…');
    button.dataset.familySetupBypass='1';button.disabled=false;button.click();delete button.dataset.familySetupBypass;
  }catch(error){button.disabled=false;status(error.message||String(error),true)}finally{s.saving=false}
}

function parseArraySource(key){
  const raw=sourceControl(key)?.value;
  if(!raw)return[];
  try{const value=JSON.parse(raw);return Array.isArray(value)?value:[]}catch{return[]}
}

function restoreManagedState(){
  if(!leadId||!document.getElementById('householdPeopleCard'))return;
  const s=state(),saved=children();
  const parent=sourceControl('primary_contact_parent_caregiver')?.value;
  if(parent)s.parent=parent;
  const age=sourceControl('client_age')?.value;if(age!==undefined&&age!=='')s.clientAge=age;
  const municipality=selectedSource('home_municipality');if(municipality)s.municipality=municipality;
  const ages=parseArraySource('household_child_ages'),ids=readDraftIds();
  const requested=Number(sourceControl('household_child_count')?.value)||Math.max(ages.length,ids.length,saved.length);
  if(requested){
    ensureRows(s,requested);
    s.rows.forEach((row,index)=>{
      if(ages[index]!==undefined&&ages[index]!==null)row.age=String(ages[index]);
      if(!row.personId&&typeof ids[index]==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ids[index]))row.clientId=ids[index];
    });
  }
  s.dirty=s.rows.some(row=>!row.personId);
  render();
}

const style=document.createElement('style');
style.textContent=`
.household-people-card{margin:12px 0;padding:15px;border:1px solid #cbe7e4;border-radius:16px;background:#f8fbfa}
.household-people-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.household-people-head strong{display:block;font-size:16px}.household-people-head small{display:block;color:var(--m);font-size:12px;line-height:1.45;margin-top:4px;max-width:430px}.household-step{display:block;color:var(--td);font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px}.household-contact-chip{background:#fff;border:1px solid #cbe7e4;border-radius:999px;padding:8px 10px;font-size:11px;font-weight:800;white-space:nowrap}
.household-match-basics{border-top:1px solid #dceae7;margin-top:13px;padding-top:12px}.household-match-basics>strong{display:block;font-size:13px;margin-bottom:8px}.household-basics-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.household-basics-grid>label,.household-basics-grid fieldset,.household-parent,.household-subject{margin:0;border:0;padding:0;font-size:13px;font-weight:750}.household-basics-grid input{margin-top:6px}.household-basics-grid small,.household-parent>small,.household-subject>small,.household-count small{display:block;color:var(--m);font-size:11px;font-weight:500;line-height:1.45;margin-top:5px}.household-basics-grid legend,.household-parent legend,.household-subject legend{font-size:13px;font-weight:750;margin-bottom:7px}
.household-parent{border-top:1px solid #dceae7;margin-top:13px;padding-top:12px}.household-choice-row{display:flex;flex-wrap:wrap;gap:6px}.household-choice{min-height:44px;border:1px solid var(--l);background:#fff;color:var(--n);border-radius:999px;padding:9px 14px;font-size:12px;font-weight:750;cursor:pointer}.household-choice.on{background:var(--n);border-color:var(--n);color:#fff}.household-choice:focus-visible,.household-optional summary:focus-visible{outline:3px solid #65cfc6;outline-offset:2px}
.household-children-panel{margin-top:13px;padding:12px;border-radius:13px;background:#fff;border:1px solid var(--l)}.household-count{display:block;font-size:13px;font-weight:750}.household-count input{width:95px;display:block;margin-top:6px}.household-child-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:11px}.household-child-grid label{font-size:12px;font-weight:750}.household-child-grid label span{font-weight:500;color:var(--m)}.household-child-grid input{margin-top:5px}.household-child-grid small{display:block;color:var(--m);font-size:10px;font-weight:500;margin-top:4px}.household-subject{border-top:1px solid var(--l);margin-top:12px;padding-top:11px}.household-save-note,.household-link-note{font-size:11px;line-height:1.45;color:var(--m);margin:11px 0 0}.household-link-note{color:#7a5a15;background:#fff6df;border-radius:9px;padding:9px}
.household-optional{border-top:1px solid #dceae7;margin-top:13px;padding-top:10px}.household-optional summary{cursor:pointer;font-size:12px;font-weight:800;color:var(--td);min-height:44px;display:flex;align-items:center;gap:6px}.household-optional summary span{color:var(--m);font-size:11px;font-weight:500}.household-extra-list{display:flex;flex-wrap:wrap;gap:5px;margin:3px 0 9px}.household-extra-list span{background:#fff;border:1px solid var(--l);border-radius:999px;padding:6px 9px;font-size:11px}.household-member-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.household-member-grid label{font-size:11px;font-weight:700}.household-member-grid input,.household-member-grid select{margin-top:4px}.household-optional form p,#householdMemberStatus{font-size:11px;line-height:1.4;color:var(--m)}.household-status{font-size:11px;line-height:1.4;color:var(--g);font-weight:700;margin-top:8px}.household-status:empty{display:none}.household-status.error-text{color:var(--r)}
#householdPeopleCard input,#householdPeopleCard select,#householdPeopleCard button{min-height:44px}
.household-managed-source,.household-snapshot-source{display:none!important}
@media(max-width:560px){.household-people-head{display:block}.household-contact-chip{display:inline-block;margin-top:9px}.household-basics-grid{grid-template-columns:1fr}.household-child-grid{grid-template-columns:1fr 1fr}.household-member-grid{grid-template-columns:1fr}.household-choice{min-height:44px}.household-count input{width:100%}}
`;
document.head.appendChild(style);

document.querySelector('#drawer')?.addEventListener('click',interceptInterviewSave,true);
document.querySelector('#questions')?.addEventListener('click',event=>{if(event.target.closest('.choice'))scheduleSync()});
document.addEventListener('aqoon:interview-answers-restored',()=>setTimeout(restoreManagedState,0));
const questionObserver=new MutationObserver(()=>scheduleSync());
const questionHost=document.getElementById('questions');if(questionHost)questionObserver.observe(questionHost,{childList:true,subtree:true});

const originalOpen=window.openInterview;
window.openInterview=function(id){
  if(originalOpen)originalOpen.call(this,id);
  leadId=id||'';
  states.delete(leadId);
  setTimeout(render,0);
  setTimeout(render,180);
};
window.addEventListener('dataUpdated',event=>{if(leadId&&['household','leads'].includes(event.detail?.scope))render()});

window.AqoonHouseholdSetup=Object.freeze({ageBand});
})();
