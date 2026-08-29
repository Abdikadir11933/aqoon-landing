(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}

function injectOperatorQueues(){
  const queuesEl=$('familyQueues');
  if(!queuesEl)return;

  const me=meId();
  if(!me){
    removeOperatorQueues();
    return;
  }

  let wrapper=queuesEl.querySelector('[data-operator-queues]');
  if(!wrapper){
    wrapper=document.createElement('div');
    wrapper.dataset.operatorQueues='1';
    wrapper.style.cssText='margin-top:12px;padding-top:12px;border-top:1px solid var(--l,#e9e5dc)';
    queuesEl.appendChild(wrapper);
  }

  wrapper.innerHTML='<button type="button" data-operator-scope="mine" class="operator-queue-btn"><span>Assigned to me</span><strong id="opQueueMineCnt">0</strong></button><button type="button" data-operator-scope="unassigned" class="operator-queue-btn"><span>Unassigned</span><strong id="opQueueUnassignedCnt">0</strong></button>';

  updateOperatorQueueCounts();

  wrapper.querySelectorAll('[data-operator-scope]').forEach(btn=>{
    btn.onclick=e=>{
      e.stopPropagation();
      const scope=btn.dataset.operatorScope;
      window.crmOperatorScope=scope;
      wrapper.querySelectorAll('[data-operator-scope]').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      filterAndRenderLeads();
    };
    if(window.crmOperatorScope===btn.dataset.operatorScope)btn.classList.add('on');
  });
}

function removeOperatorQueues(){
  const wrapper=$('familyQueues')?.querySelector('[data-operator-queues]');
  if(wrapper)wrapper.remove();
}

function updateOperatorQueueCounts(){
  const leads=window.leads||[];
  const partials=window.partials||[];
  const all=[...partials,...leads];
  const me=meId();

  const mineCount=all.filter(x=>x.assigned_operator_id===me).length;
  const unassignedCount=all.filter(x=>!x.assigned_operator_id).length;

  const mineEl=$('opQueueMineCnt');
  const unassignedEl=$('opQueueUnassignedCnt');
  if(mineEl)mineEl.textContent=mineCount;
  if(unassignedEl)unassignedEl.textContent=unassignedCount;
}

function filterAndRenderLeads(){
  const leadList=$('leadList');
  const partialList=$('partials');
  if(!leadList||!partialList)return;

  const scope=window.crmOperatorScope;
  const me=meId();

  const shouldShow=lead=>{
    if(scope==='mine')return lead.assigned_operator_id===me;
    if(scope==='unassigned')return !lead.assigned_operator_id;
    return true;
  };

  leadList.querySelectorAll('.lead').forEach(card=>{
    const leadId=card.querySelector('[data-open]')?.dataset.open;
    if(!leadId)return;
    const lead=window.leads?.find(x=>x.id===leadId);
    if(!lead)return;
    card.style.display=shouldShow(lead)?'':'none';
  });

  partialList.querySelectorAll('.lead').forEach(card=>{
    const leadId=card.querySelector('[data-open]')?.dataset.open;
    if(!leadId)return;
    const lead=window.partials?.find(x=>x.id===leadId);
    if(!lead)return;
    card.style.display=shouldShow(lead)?'':'none';
  });

  const visible=leadList.querySelectorAll('.lead[style*="none"]').length===0&&leadList.querySelectorAll('.lead').length>0;
  if(visible)updateOperatorQueueCounts();
}

function injectStyles(){
  if(document.getElementById('operatorCrmFilterStyles'))return;
  const style=document.createElement('style');
  style.id='operatorCrmFilterStyles';
  style.textContent=`.operator-queue-btn{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:12px;padding:10px 14px;font-size:12px;font-weight:600;color:var(--n,#0a1a30);cursor:pointer;transition:all 120ms;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;width:100%;margin-bottom:8px}.operator-queue-btn:hover{border-color:var(--t,#13b9aa);background:var(--p,#faf8f3)}.operator-queue-btn.on{background:var(--t,#13b9aa);border-color:var(--t,#13b9aa);color:#052c27}.operator-queue-btn strong{font-weight:700;color:currentColor}`;
  document.head.appendChild(style);
}

function patchRenderCRM(){
  if(window.__operatorCrmFilterPatched)return;
  window.__operatorCrmFilterPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const result=orig.apply(this,arguments);
    setTimeout(()=>{
      injectOperatorQueues();
      filterAndRenderLeads();
    },0);
    return result;
  };
}

function start(){
  injectStyles();
  patchRenderCRM();

  const queuesEl=$('familyQueues');
  if(queuesEl){
    const observer=new MutationObserver(()=>injectOperatorQueues());
    observer.observe(queuesEl,{childList:true});
  }

  const crmEl=$('crm');
  if(crmEl){
    const crmObs=new MutationObserver(()=>{
      if(!crmEl.classList.contains('hidden')){
        injectOperatorQueues();
        filterAndRenderLeads();
      }else{
        removeOperatorQueues();
      }
    });
    crmObs.observe(crmEl,{attributes:true,attributeFilter:['class']});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
