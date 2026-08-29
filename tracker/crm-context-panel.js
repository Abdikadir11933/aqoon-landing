(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let contextPanelOpen=false;
let currentLeadId=null;

function injectStyles(){
  if(document.getElementById('crmContextPanelStyles'))return;
  const style=document.createElement('style');
  style.id='crmContextPanelStyles';
  style.textContent=`.crm-context-panel{position:fixed;right:0;top:0;width:360px;height:100vh;background:var(--p,#f8f5ee);border-left:1px solid var(--l,#e9e5dc);z-index:1000;transform:translateX(100%);transition:transform 300ms cubic-bezier(0.4,0,0.2,1);overflow-y:auto;display:flex;flex-direction:column}@media(max-width:768px){.crm-context-panel{width:100%;right:0}}.crm-context-panel.open{transform:translateX(0)}.crm-context-panel-header{padding:16px 20px;border-bottom:1px solid var(--l,#e9e5dc);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.crm-context-panel-header h3{margin:0;font-size:16px;font-weight:700;color:var(--n,#0a1a30)}.crm-context-panel-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--n,#0a1a30);padding:0;width:24px;height:24px}.crm-context-panel-content{flex:1;overflow-y:auto}.crm-context-section{padding:16px 20px;border-bottom:1px solid var(--l,#e9e5dc)}.crm-context-label{font-size:11px;font-weight:700;color:var(--t,#13b9aa);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}.crm-context-value{font-size:13px;color:var(--n,#0a1a30);line-height:1.5}.crm-context-badge{display:inline-block;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;background:var(--t,#13b9aa);color:#fff;margin-right:4px}.crm-timeline-event{padding:12px 0;border-left:2px solid var(--l,#e9e5dc);padding-left:12px;margin-left:0}.crm-timeline-event:last-child{border-left-color:transparent}.crm-timeline-time{font-size:11px;color:var(--t,#13b9aa);font-weight:600}.crm-timeline-text{font-size:12px;color:var(--n,#0a1a30);margin-top:2px}.crm-context-overlay{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.15);z-index:999;opacity:0;pointer-events:none;transition:opacity 300ms}@media(prefers-reduced-motion:no-preference){}.crm-context-overlay.open{opacity:1;pointer-events:auto}`;
  document.head.appendChild(style);
}

function formatDate(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function renderContextPanel(lead,interview,lifecycle){
  if(!lead)return;

  const header=$('contextPanelHeader');
  const content=$('contextPanelContent');
  if(!header||!content)return;

  const status=lead.status||'unknown';
  const statusLabel={'new':'First Contact','contacted':'Contacted','partial':'Incomplete Intake','resolved':'Resolved'}[status]||status;
  const need=lead.primary_need||'—';
  const city=lead.city||'—';
  const phone=lead.phone?'***-***-'+lead.phone.slice(-4):'—';

  const casePlan=lifecycle?.case_plan_status||null;
  const events=lifecycle?.events||[];

  let timelineHtml='';
  if(events.length){
    events.slice(-5).reverse().forEach(evt=>{
      const time=formatDate(evt.created_at||evt.timestamp);
      const type=evt.event_type||'event';
      timelineHtml+=`<div class="crm-timeline-event"><div class="crm-timeline-time">${esc(time)}</div><div class="crm-timeline-text">${esc(type)}</div></div>`;
    });
  }else{
    timelineHtml='<div class="crm-timeline-event"><div class="crm-timeline-text">No events recorded</div></div>';
  }

  let caseHtml='';
  if(casePlan){
    const badgeClass=casePlan==='awaiting_outcome'?'crm-context-badge':'';
    caseHtml=`<div class="crm-context-section"><div class="crm-context-label">Case Status</div><div class="crm-context-value">${badgeClass?'<span class="crm-context-badge">'+esc(casePlan)+'</span>':'Not set'}</div></div>`;
  }

  content.innerHTML=`
    <div class="crm-context-section">
      <div class="crm-context-label">Name</div>
      <div class="crm-context-value">${esc(lead.family_name||lead.name||'—')}</div>
    </div>
    <div class="crm-context-section">
      <div class="crm-context-label">Status & Primary Need</div>
      <div class="crm-context-value">
        <strong>${esc(statusLabel)}</strong>
        <div style="margin-top:8px;font-size:12px;color:var(--n,#0a1a30)">${esc(need)}</div>
      </div>
    </div>
    <div class="crm-context-section">
      <div class="crm-context-label">Location & Contact</div>
      <div class="crm-context-value">${esc(city)} • ${esc(phone)}</div>
    </div>
    ${caseHtml}
    <div class="crm-context-section">
      <div class="crm-context-label">Recent Activity</div>
      <div>${timelineHtml}</div>
    </div>
    <div class="crm-context-section">
      <div class="crm-context-label">First Contact Date</div>
      <div class="crm-context-value">${esc(formatDate(lead.created_at))}</div>
    </div>
  `;
}

function openContextPanel(leadId){
  currentLeadId=leadId;
  contextPanelOpen=true;

  const panel=$('crmContextPanel');
  const overlay=$('crmContextOverlay');
  if(panel)panel.classList.add('open');
  if(overlay)overlay.classList.add('open');

  const lead=window.leads?.find(l=>l.id===leadId)||window.partials?.find(l=>l.id===leadId);
  const lifecycle=window.CrmLifecycleData?.getLifecycle(leadId);

  renderContextPanel(lead,null,lifecycle);
}

function closeContextPanel(){
  contextPanelOpen=false;
  currentLeadId=null;

  const panel=$('crmContextPanel');
  const overlay=$('crmContextOverlay');
  if(panel)panel.classList.remove('open');
  if(overlay)overlay.classList.remove('open');
}

function injectPanelMarkup(){
  if($('crmContextPanel'))return;

  const container=document.body;
  const html=`
    <div id="crmContextOverlay" class="crm-context-overlay"></div>
    <div id="crmContextPanel" class="crm-context-panel">
      <div class="crm-context-panel-header">
        <h3 id="contextPanelHeader">Family Context</h3>
        <button class="crm-context-panel-close" id="contextPanelCloseBtn" aria-label="Close panel">✕</button>
      </div>
      <div id="contextPanelContent" class="crm-context-panel-content"></div>
    </div>
  `;

  const wrapper=document.createElement('div');
  wrapper.innerHTML=html;
  container.appendChild(wrapper);

  $('contextPanelCloseBtn').onclick=e=>{
    e.stopPropagation();
    closeContextPanel();
  };

  $('crmContextOverlay').onclick=e=>{
    e.stopPropagation();
    closeContextPanel();
  };
}

function attachLeadClickHandlers(){
  const leadCards=document.querySelectorAll('.lead[data-open]');
  leadCards.forEach(card=>{
    const existingHandler=card.onclick;
    card.onclick=e=>{
      const leadId=card.querySelector('[data-open]')?.dataset.open;
      if(leadId&&e.target.closest('[data-open]')===card.querySelector('[data-open]')){
        openContextPanel(leadId);
      }
      if(existingHandler)existingHandler.call(card,e);
    };
  });
}

function patchRenderCRM(){
  if(window.__contextPanelPatched)return;
  window.__contextPanelPatched=1;

  const orig=window.renderCRM;
  if(typeof orig!=='function')return;

  window.renderCRM=function(){
    const result=orig.apply(this,arguments);
    setTimeout(()=>{
      attachLeadClickHandlers();
    },0);
    return result;
  };
}

function start(){
  injectStyles();
  injectPanelMarkup();
  patchRenderCRM();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.CrmContextPanel={open:(id)=>openContextPanel(id),close:()=>closeContextPanel(),isOpen:()=>contextPanelOpen,getCurrentId:()=>currentLeadId};
})();
