(()=>{'use strict';
const $=id=>document.getElementById(id);

function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}

function getOperatorScope(){
  return window.operatorScope||sessionStorage.getItem('crmOperatorScope')||'all';
}

function filterAnalyticsByScope(items){
  const scope=getOperatorScope();
  const me=meId();

  if(!Array.isArray(items))return items;

  if(scope==='mine'){
    return items.filter(x=>x.assigned_operator_id===me);
  }

  if(scope==='unassigned'){
    return items.filter(x=>!x.assigned_operator_id);
  }

  return items;
}

function updateAnalyticsSection(){
  const analyticsView=$('analytics');
  if(!analyticsView||analyticsView.classList.contains('hidden'))return;

  const journeys=$('journeys');
  if(journeys){
    const allRows=journeys.querySelectorAll('.jrow');
    const leads=window.leads||[];

    allRows.forEach(row=>{
      const leadId=row.dataset.leadId;
      if(!leadId){
        row.style.display='';
        return;
      }

      const lead=leads.find(l=>l.id===leadId);
      if(!lead){
        row.style.display='none';
        return;
      }

      const scope=getOperatorScope();
      const me=meId();

      let shouldShow=true;
      if(scope==='mine')shouldShow=lead.assigned_operator_id===me;
      else if(scope==='unassigned')shouldShow=!lead.assigned_operator_id;

      row.style.display=shouldShow?'':'none';
    });
  }

  updateAnalyticsHeader();
}

function updateAnalyticsHeader(){
  const scope=getOperatorScope();
  const me=meId();
  const analyticsView=$('analytics');
  if(!analyticsView)return;

  let header=analyticsView.querySelector('.analytics-note strong:first-of-type');
  if(header){
    const meSession=sessionStorage.getItem('aqoon_operator_name')||'';
    if(scope==='mine'){
      header.textContent=meSession?`${meSession}'s traffic`:'My traffic';
    }else if(scope==='unassigned'){
      header.textContent='Unassigned families traffic';
    }else{
      header.textContent='Traffic';
    }
  }
}

function patchRenderCRM(){
  if(window.__operatorAnalyticsPatched)return;
  window.__operatorAnalyticsPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const result=orig.apply(this,arguments);
    setTimeout(()=>{
      updateAnalyticsSection();
    },50);
    return result;
  };
}

function patchPhaseNavigation(){
  if(window.__phaseNavPatchedForAnalytics)return;
  window.__phaseNavPatchedForAnalytics=1;

  const origCrmPhase=window.CrmPhaseNav?.renderPhaseNavigation;
  if(typeof origCrmPhase!=='function')return;

  window.CrmPhaseNav.renderPhaseNavigation=function(leads,partials){
    const result=origCrmPhase.apply(this,arguments);
    setTimeout(()=>{
      updateAnalyticsSection();
    },50);
    return result;
  };
}

function observeAnalyticsTabSwitch(){
  const analyticsView=$('analytics');
  if(!analyticsView)return;

  const observer=new MutationObserver(mutations=>{
    mutations.forEach(m=>{
      if(m.type==='attributes'&&m.attributeName==='class'){
        if(!analyticsView.classList.contains('hidden')){
          setTimeout(()=>updateAnalyticsSection(),100);
        }
      }
    });
  });

  observer.observe(analyticsView,{attributes:true,attributeFilter:['class']});
}

function start(){
  setTimeout(()=>{
    patchRenderCRM();
    patchPhaseNavigation();
    observeAnalyticsTabSwitch();
    updateAnalyticsSection();
  },100);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.OperatorAnalytics={update:()=>updateAnalyticsSection()};
})();
