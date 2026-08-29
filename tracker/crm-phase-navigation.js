(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

// Phase navigation state
let currentPhase='incomplete';
let operatorScope='all';
let meId=()=>sessionStorage.getItem('aqoon_operator_id')||'';

const PHASES={
  incomplete:{label:'Unfinished Intake',filter:l=>l.status==='partial'},
  first:{label:'First Interview',filter:l=>l.status==='new'},
  followup:{label:'Follow-ups',filter:l=>l.status!=='new'&&l.next_follow_up_at&&new Date(l.next_follow_up_at)<=new Date()},
  active:{label:'Active Cases',filter:l=>l.status!=='new'&&l.status!=='resolved'&&l.status!=='partial'&&(!l.next_follow_up_at||new Date(l.next_follow_up_at)>new Date())},
  awaiting:{label:'Awaiting Outcome',filter:l=>l._case_plan_status==='awaiting_outcome'},
  resolved:{label:'Resolved',filter:l=>l.status==='resolved'}
};

function injectStyles(){
  if(document.getElementById('crmPhaseNavigationStyles'))return;
  const style=document.createElement('style');
  style.id='crmPhaseNavigationStyles';
  style.textContent=`.crm-nav-container{padding:12px 0;border-bottom:1px solid var(--l,#e9e5dc)}.crm-operator-scope{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;padding:0 12px}.crm-scope-btn{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:12px;padding:10px;font-size:12px;font-weight:600;color:var(--n,#0a1a30);cursor:pointer;transition:all 120ms}.crm-scope-btn:hover{border-color:var(--t,#13b9aa);background:#faf9f7}.crm-scope-btn.on{background:var(--t,#13b9aa);border-color:var(--t,#13b9aa);color:#052c27}.crm-phases{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;padding:0 12px}.crm-phase-btn{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:12px;padding:12px 10px;font-size:12px;font-weight:600;color:var(--n,#0a1a30);cursor:pointer;transition:all 120ms;text-align:center;display:grid;grid-template-columns:1fr;gap:4px}.crm-phase-btn:hover{border-color:var(--t,#13b9aa);background:#faf9f7}.crm-phase-btn.on{background:var(--t,#13b9aa);border-color:var(--t,#13b9aa);color:#052c27;box-shadow:0 2px 8px rgba(58,155,138,.15)}.crm-phase-label{font-size:11px}.crm-phase-count{font-size:13px;font-weight:700}`;
  document.head.appendChild(style);
}

function renderPhaseNavigation(leads,partials){
  const container=$('familyQueues');
  if(!container)return;

  injectStyles();

  // Calculate counts for each phase
  const allItems=[...partials,...leads];
  const phaseC={};
  Object.entries(PHASES).forEach(([key,phase])=>{
    let items=allItems;
    if(operatorScope==='mine')items=items.filter(l=>l.assigned_operator_id===meId());
    else if(operatorScope==='unassigned')items=items.filter(l=>!l.assigned_operator_id);
    phaseC[key]=items.filter(phase.filter).length;
  });

  // Render
  container.innerHTML=`
    <div class="crm-nav-container">
      <div class="crm-operator-scope">
        <button type="button" class="crm-scope-btn ${operatorScope==='all'?'on':''}" data-scope="all">All Families</button>
        <button type="button" class="crm-scope-btn ${operatorScope==='mine'?'on':''}" data-scope="mine">Assigned to me</button>
        <button type="button" class="crm-scope-btn ${operatorScope==='unassigned'?'on':''}" data-scope="unassigned">Unassigned</button>
      </div>
      <div class="crm-phases">
        ${Object.entries(PHASES).map(([key,phase])=>`
          <button type="button" class="crm-phase-btn ${currentPhase===key?'on':''}" data-phase="${key}">
            <span class="crm-phase-label">${phase.label}</span>
            <strong class="crm-phase-count">${phaseC[key]}</strong>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Attach handlers
  container.querySelectorAll('[data-scope]').forEach(btn=>{
    btn.onclick=e=>{
      e.stopPropagation();
      operatorScope=btn.dataset.scope;
      if(window.renderCRM)window.renderCRM();
    };
  });

  container.querySelectorAll('[data-phase]').forEach(btn=>{
    btn.onclick=e=>{
      e.stopPropagation();
      currentPhase=btn.dataset.phase;
      if(window.crmQueue)window.crmQueue=btn.dataset.phase==='incomplete'?'incomplete':btn.dataset.phase==='first'?'first':btn.dataset.phase==='followup'?'followup':btn.dataset.phase==='active'?'active':btn.dataset.phase==='resolved'?'resolved':'all';
      if(window.renderCRM)window.renderCRM();
    };
  });
}

function patchRenderCRM(){
  if(window.__phaseNavPatched)return;
  window.__phaseNavPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const leads=window.leads||[];
    const partials=window.partials||[];
    renderPhaseNavigation(leads,partials);

    // Apply operator scope filtering
    if(operatorScope==='mine'){
      const me=meId();
      leads.forEach(l=>l._filtered_out=!!(l.assigned_operator_id!==me));
      partials.forEach(l=>l._filtered_out=!!(l.assigned_operator_id!==me));
    }else if(operatorScope==='unassigned'){
      leads.forEach(l=>l._filtered_out=!!l.assigned_operator_id);
      partials.forEach(l=>l._filtered_out=!!l.assigned_operator_id);
    }else{
      leads.forEach(l=>l._filtered_out=false);
      partials.forEach(l=>l._filtered_out=false);
    }

    return orig.apply(this,arguments);
  };
}

function start(){
  patchRenderCRM();
  setTimeout(()=>renderPhaseNavigation(window.leads||[],window.partials||[]),100);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.CrmPhaseNav={renderPhaseNavigation,setPhase:(p)=>currentPhase=p,setScope:(s)=>operatorScope=s,getPhase:()=>currentPhase,getScope:()=>operatorScope};
})();
