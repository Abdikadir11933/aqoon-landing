(()=>{'use strict';
const LEADS_END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const OPS_END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/ops-admin';
const MUTATING_LEAD_ACTIONS=new Set(['save_interview','interview_save','record_call_outcome','update']);
const MUTATING_OPS_ACTIONS=new Set(['save_opportunity','delete_opportunity','add_activity','save_event','delete_event']);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let operators=[],opById={},leadAttrib={},oppRecords={},autoOpened=false,badgeTimer=null;

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}
function meName(){return sessionStorage.getItem('aqoon_operator_name')||''}
function setMe(id,name){sessionStorage.setItem('aqoon_operator_id',id);sessionStorage.setItem('aqoon_operator_name',name);renderPill();closePicker();scheduleBadgeRefresh()}
function clearMe(){sessionStorage.removeItem('aqoon_operator_id');sessionStorage.removeItem('aqoon_operator_name');autoOpened=false}
function nameFor(id){if(!id)return'';const o=opById[id];return o?o.display_name:''}

function injectStyles(){
  if(document.getElementById('operatorIdentityStyles'))return;
  const style=document.createElement('style');
  style.id='operatorIdentityStyles';
  style.textContent='.operator-pill{position:fixed;top:8px;right:8px;z-index:40;background:#fff;border:1px solid var(--l,#e9e5dc);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700;color:var(--n,#0a1a30);box-shadow:0 4px 12px rgba(16,42,70,.08);cursor:pointer;display:flex;align-items:center;gap:6px}.operator-pill.hidden{display:none}.operator-pill .dot{width:7px;height:7px;border-radius:50%;background:var(--t,#13b9aa);flex:0 0 auto}.operator-pill.unset{background:var(--sand,#f8c66f);color:#5a3d0e}.operator-modal{position:fixed;inset:0;z-index:50;background:rgba(10,26,48,.45);display:flex;align-items:center;justify-content:center;padding:20px}.operator-modal.hidden{display:none}.operator-sheet{background:#fff;border-radius:20px;padding:22px;max-width:360px;width:100%;text-align:center}.operator-sheet h2{margin:6px 0 4px;font-size:19px}.operator-options{display:grid;gap:8px;margin:16px 0 6px}.operator-choice{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:13px;padding:13px;font-weight:700;font-size:14px;color:var(--n,#0a1a30);cursor:pointer}.operator-choice:hover{border-color:var(--t,#13b9aa)}.operator-dismiss{border:0;background:transparent;color:var(--m,#7a8290);font-size:11px;margin-top:10px;cursor:pointer;text-decoration:underline}.operator-badge-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0}.op-tag{background:var(--c,#f0ece3);color:var(--n,#0a1a30);border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700}.op-tag-empty{background:#fee9e5;color:#9f4038}.op-touch{font-size:9px;color:var(--m,#7a8290)}.op-claim{border:0;background:var(--t,#13b9aa);color:#052c27;border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer}.pill-operator{color:#5a7d78;font-weight:700}';
  document.head.appendChild(style);
}

function ensurePill(){
  if(document.getElementById('operatorPill'))return;
  const pill=document.createElement('button');
  pill.type='button';pill.id='operatorPill';pill.className='operator-pill hidden';
  pill.onclick=openPicker;
  document.body.appendChild(pill);
}
function renderPill(){
  const pill=document.getElementById('operatorPill');if(!pill)return;
  const appEl=document.getElementById('app');
  const visible=appEl&&!appEl.classList.contains('hidden');
  pill.classList.toggle('hidden',!visible);
  const name=meName();
  pill.innerHTML=name?('<span class="dot"></span>Acting as <b>'+esc(name)+'</b> · switch'):'Who are you working as?';
  pill.classList.toggle('unset',!name);
}

function ensurePicker(){
  if(document.getElementById('operatorPicker'))return;
  const wrap=document.createElement('div');
  wrap.id='operatorPicker';wrap.className='operator-modal hidden';
  wrap.innerHTML='<div class="operator-sheet" role="dialog" aria-modal="true" aria-labelledby="operatorPickerTitle"><span class="eyebrow">ACTING AS</span><h2 id="operatorPickerTitle">Who are you working as?</h2><p class="muted">This tags every call, interview and update you save, so both of you can see who did what.</p><div id="operatorOptions" class="operator-options"><p class="muted">Loading…</p></div><button type="button" class="operator-dismiss" id="operatorDismiss">Not now</button></div>';
  document.body.appendChild(wrap);
  wrap.addEventListener('click',e=>{if(e.target===wrap)closePicker()});
  document.getElementById('operatorDismiss').onclick=closePicker;
}
async function fetchOperators(){
  if(operators.length)return operators;
  try{
    const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify({action:'operators'})});
    const d=await r.json();
    if(Array.isArray(d.operators)){operators=d.operators;opById=Object.fromEntries(operators.map(o=>[o.id,o]));}
  }catch(e){}
  return operators;
}
async function openPicker(){
  ensurePicker();
  document.getElementById('operatorPicker').classList.remove('hidden');
  const box=document.getElementById('operatorOptions');
  box.innerHTML='<p class="muted">Loading…</p>';
  const ops=await fetchOperators();
  if(!ops.length){box.innerHTML='<p class="muted">No operators configured yet.</p>';return}
  box.innerHTML=ops.map(o=>'<button type="button" class="operator-choice" data-op="'+esc(o.id)+'">'+esc(o.display_name)+'</button>').join('');
  box.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{const o=opById[b.dataset.op];setMe(b.dataset.op,o?o.display_name:'')});
}
function closePicker(){document.getElementById('operatorPicker')?.classList.add('hidden')}
function maybeAutoOpen(){
  if(autoOpened||meId())return;
  autoOpened=true;
  setTimeout(openPicker,500);
}

function leadBadgeHtml(attrib){
  const assignedName=nameFor(attrib.assigned_operator_id),lastName=nameFor(attrib.last_actor_id);
  const mine=attrib.assigned_operator_id&&attrib.assigned_operator_id===meId();
  let html='<span class="op-tag'+(attrib.assigned_operator_id?'':' op-tag-empty')+'">'+(assignedName?esc(assignedName):'Unassigned')+'</span>';
  if(lastName)html+='<span class="op-touch">Last touched '+esc(lastName)+'</span>';
  if(!mine&&meId())html+='<button type="button" class="op-claim" data-claim-lead="1">Assign to me</button>';
  return html;
}
function refreshLeadBadges(){
  document.querySelectorAll('#leadList .lead').forEach(card=>{
    const id=card.querySelector('[data-open]')?.dataset.open;
    if(!id)return;
    const attrib=leadAttrib[id];
    if(!attrib)return;
    const pills=card.querySelector('.pills');
    if(pills){
      let tag=pills.querySelector('.pill-operator');
      if(!tag){tag=document.createElement('span');tag.className='pill pill-operator';pills.appendChild(tag);}
      const assignedName=nameFor(attrib.assigned_operator_id);
      tag.textContent=assignedName?('👤 '+assignedName):'👤 Unassigned';
    }
    const actions=card.querySelector('.actions');
    if(actions){
      let badge=card.querySelector('.operator-badge-wrap');
      if(!badge){badge=document.createElement('div');badge.className='operator-badge-wrap';actions.parentElement.insertBefore(badge,actions);}
      badge.innerHTML=leadBadgeHtml(attrib);
      const claim=badge.querySelector('[data-claim-lead]');
      if(claim)claim.onclick=e=>{e.stopPropagation();assignLead(id)};
    }
  });
}
async function assignLead(id){
  try{
    await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify({action:'update',id,assigned_operator_id:meId(),operator_id:meId()})});
    document.getElementById('refresh')?.click();
  }catch(e){}
}

function refreshOppBadges(){
  document.querySelectorAll('#salesPipeline .opportunity').forEach(card=>{
    const id=card.dataset.opp;
    if(!id)return;
    const rec=oppRecords[id];
    if(!rec)return;
    const content=card.querySelector('.opp-content'),now=card.querySelector('.opp-now');
    if(!content||!now)return;
    let badge=card.querySelector('.operator-badge-wrap');
    if(!badge){badge=document.createElement('div');badge.className='operator-badge-wrap';content.insertBefore(badge,now);}
    const ownerName=nameFor(rec.owner_operator_id),mine=rec.owner_operator_id&&rec.owner_operator_id===meId();
    let html='<span class="op-tag'+(rec.owner_operator_id?'':' op-tag-empty')+'">'+(ownerName?esc(ownerName):'Unowned')+'</span>';
    if(!mine&&meId())html+='<button type="button" class="op-claim" data-claim-opp="1">Make mine</button>';
    badge.innerHTML=html;
    const claim=badge.querySelector('[data-claim-opp]');
    if(claim)claim.onclick=e=>{e.stopPropagation();claimOpportunity(id)};
  });
}
async function claimOpportunity(id){
  const rec=oppRecords[id];if(!rec)return;
  try{
    await fetch(OPS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify(Object.assign({},rec,{action:'save_opportunity',owner_operator_id:meId(),operator_id:meId()}))});
    document.getElementById('refresh')?.click();
  }catch(e){}
}

function scheduleBadgeRefresh(){
  clearTimeout(badgeTimer);
  badgeTimer=setTimeout(()=>{refreshLeadBadges();refreshOppBadges();},80);
}

function patchFetch(){
  if(window.__aqoonOperatorFetchPatch)return;
  window.__aqoonOperatorFetchPatch=1;
  const orig=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isLeads=url.includes('/family-leads-admin'),isOps=url.includes('/ops-admin');
    if((isLeads||isOps)&&init&&typeof init.body==='string'){
      try{
        const body=JSON.parse(init.body);
        const operator=meId();
        if(operator&&!('operator_id' in body)&&((isLeads&&MUTATING_LEAD_ACTIONS.has(body.action))||(isOps&&MUTATING_OPS_ACTIONS.has(body.action)))){
          body.operator_id=operator;
          init=Object.assign({},init,{body:JSON.stringify(body)});
        }
      }catch(e){}
    }
    const response=await orig(input,init);
    if(!isLeads&&!isOps)return response;
    try{
      const data=await response.clone().json();
      if(Array.isArray(data.operators)&&data.operators.length){operators=data.operators;opById=Object.fromEntries(operators.map(o=>[o.id,o]));}
      if(isLeads&&Array.isArray(data.leads)){
        leadAttrib={};
        data.leads.forEach(l=>{leadAttrib[l.id]={assigned_operator_id:l.assigned_operator_id||null,last_actor_id:l.last_actor_id||null,consent_relevant_updates_ok:l.consent_relevant_updates_ok,consent_outcome_followup_ok:l.consent_outcome_followup_ok};});
        scheduleBadgeRefresh();
      }
      if(isOps&&Array.isArray(data.opportunities)){
        oppRecords={};
        data.opportunities.forEach(o=>{oppRecords[o.id]=o;});
        scheduleBadgeRefresh();
      }
    }catch(e){}
    return response;
  };
}

function start(){
  injectStyles();
  patchFetch();
  ensurePill();
  renderPill();
  const appEl=document.getElementById('app'),lockEl=document.getElementById('lock');
  if(appEl){
    const obs=new MutationObserver(()=>{
      renderPill();
      if(!appEl.classList.contains('hidden')){maybeAutoOpen();scheduleBadgeRefresh();}
    });
    obs.observe(appEl,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
    if(!appEl.classList.contains('hidden')){maybeAutoOpen();scheduleBadgeRefresh();}
  }
  if(lockEl){
    const lockObs=new MutationObserver(()=>{if(!lockEl.classList.contains('hidden')){clearMe();renderPill();}});
    lockObs.observe(lockEl,{attributes:true,attributeFilter:['class']});
  }
  document.getElementById('logout')?.addEventListener('click',()=>{clearMe();renderPill();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
