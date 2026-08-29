(()=>{'use strict';
const $=id=>document.getElementById(id);

function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}

function filterByOperatorScope(items){
  const scope=window.operatorScope||sessionStorage.getItem('crmOperatorScope')||'all';
  const me=meId();

  if(scope==='mine')return items.filter(x=>x.assigned_operator_id===me);
  if(scope==='unassigned')return items.filter(x=>!x.assigned_operator_id);
  return items;
}

function due(lead){
  if(!lead.next_follow_up_at)return false;
  return new Date(lead.next_follow_up_at)<=new Date();
}

function renderOperatorDashboard(){
  const leads=window.leads||[];
  const partials=window.partials||[];
  const scope=window.operatorScope||sessionStorage.getItem('crmOperatorScope')||'all';

  const filteredLeads=filterByOperatorScope(leads);
  const filteredPartials=filterByOperatorScope(partials);

  const incompleteCount=filteredPartials.length;
  const firstCount=filteredLeads.filter(x=>x.status==='new'&&!due(x)).length;
  const followupCount=filteredLeads.filter(due).length;
  const activeCount=filteredLeads.filter(x=>x.status!=='new'&&x.status!=='resolved'&&!due(x)).length;

  const pulse=$('pulseIncomplete');
  if(pulse){
    pulse.textContent=incompleteCount;
  }

  const pulseFirstEl=$('pulseFirst');
  if(pulseFirstEl){
    pulseFirstEl.textContent=firstCount;
  }

  const pulseFollowupEl=$('pulseFollowup');
  if(pulseFollowupEl){
    pulseFollowupEl.textContent=followupCount;
  }

  const pulseActiveEl=$('pulseActive');
  if(pulseActiveEl){
    pulseActiveEl.textContent=activeCount;
  }

  updateDashboardHeadline(incompleteCount+firstCount+followupCount+activeCount);
}

function updateDashboardHeadline(total){
  const headline=$('todayHeadline');
  if(!headline)return;

  const scope=window.operatorScope||sessionStorage.getItem('crmOperatorScope')||'all';
  const me=meId();

  let title='Loading today\'s work…';

  if(scope==='mine'&&me){
    const meSession=sessionStorage.getItem('aqoon_operator_name')||'';
    title=meSession?`${meSession}'s work today`:'My work today';
  }else if(scope==='unassigned'){
    title='Unassigned families today';
  }else{
    title='All families today';
  }

  headline.textContent=title;
}

function patchRenderCRM(){
  if(window.__operatorDashboardPatched)return;
  window.__operatorDashboardPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const result=orig.apply(this,arguments);
    setTimeout(()=>{
      renderOperatorDashboard();
    },50);
    return result;
  };
}

function patchPhaseNavigation(){
  if(window.__phaseNavPatchedForDash)return;
  window.__phaseNavPatchedForDash=1;

  const origCrmPhase=window.CrmPhaseNav?.renderPhaseNavigation;
  if(typeof origCrmPhase!=='function')return;

  window.CrmPhaseNav.renderPhaseNavigation=function(leads,partials){
    const result=origCrmPhase.apply(this,arguments);
    setTimeout(()=>{
      renderOperatorDashboard();
    },50);
    return result;
  };
}

function start(){
  setTimeout(()=>{
    patchRenderCRM();
    patchPhaseNavigation();
    renderOperatorDashboard();
  },100);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.OperatorDashboard={render:()=>renderOperatorDashboard()};
})();
