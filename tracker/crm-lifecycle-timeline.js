(()=>{'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function formatDate(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

function formatDateTime(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'})+' '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
}

function getEventIcon(eventType){
  const icons={
    'first_interview':'📞',
    'follow_up_interview':'📞',
    'call_completed':'✓',
    'call_no_answer':'✗',
    'case_plan_created':'📋',
    'case_plan_updated':'✎',
    'case_status_changed':'→',
    'intake_completed':'✓',
    'resolution_submitted':'✓',
    'note_added':'📝'
  };
  return icons[eventType]||'•';
}

function getEventLabel(eventType){
  const labels={
    'first_interview':'First Interview',
    'follow_up_interview':'Follow-up Interview',
    'call_completed':'Call Completed',
    'call_no_answer':'Call - No Answer',
    'case_plan_created':'Case Plan Created',
    'case_plan_updated':'Case Plan Updated',
    'case_status_changed':'Status Changed',
    'intake_completed':'Intake Completed',
    'resolution_submitted':'Resolution Submitted',
    'note_added':'Note Added'
  };
  return labels[eventType]||eventType;
}

function getEventColor(eventType){
  const colors={
    'first_interview':'#13b9aa',
    'follow_up_interview':'#13b9aa',
    'call_completed':'#0a9b5c',
    'call_no_answer':'#c74c4c',
    'case_plan_created':'#6b5dab',
    'case_plan_updated':'#8873c2',
    'case_status_changed':'#e8a614',
    'intake_completed':'#0a9b5c',
    'resolution_submitted':'#0a9b5c',
    'note_added':'#999'
  };
  return colors[eventType]||'#999';
}

function renderTimelineEvents(lead,lifecycle){
  if(!lifecycle||!lifecycle.events)return'<div style="padding:12px;color:var(--t,#13b9aa);font-size:12px;text-align:center">No activity recorded</div>';

  const events=[...(lifecycle.events||[])];

  if(lead){
    if(lead.created_at){
      events.unshift({
        created_at:lead.created_at,
        event_type:'intake_started',
        description:'Intake started'
      });
    }
  }

  events.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

  const html=events.slice(0,20).map((evt,i)=>{
    const date=formatDateTime(evt.created_at);
    const icon=getEventIcon(evt.event_type);
    const label=getEventLabel(evt.event_type);
    const color=getEventColor(evt.event_type);

    return `
      <div class="crm-timeline-dot" style="--dot-color:${esc(color)}">
        <div class="crm-timeline-marker">${esc(icon)}</div>
        <div class="crm-timeline-content">
          <div class="crm-timeline-label">${esc(label)}</div>
          <div class="crm-timeline-date">${esc(date)}</div>
          ${evt.description?`<div class="crm-timeline-desc">${esc(evt.description)}</div>`:''}
        </div>
      </div>
    `;
  }).join('');

  return html;
}

function injectTimelineStyles(){
  if(document.getElementById('crmLifecycleTimelineStyles'))return;
  const style=document.createElement('style');
  style.id='crmLifecycleTimelineStyles';
  style.textContent=`.crm-timeline-dot{position:relative;padding-left:32px;padding-bottom:16px}.crm-timeline-dot:last-child{padding-bottom:0}.crm-timeline-dot:not(:last-child)::before{content:'';position:absolute;left:11px;top:24px;bottom:-16px;width:2px;background:var(--l,#e9e5dc)}.crm-timeline-marker{position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--dot-color,#999);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid var(--p,#f8f5ee)}.crm-timeline-content{flex:1}.crm-timeline-label{font-size:12px;font-weight:600;color:var(--n,#0a1a30)}.crm-timeline-date{font-size:11px;color:var(--t,#13b9aa);margin-top:2px}.crm-timeline-desc{font-size:11px;color:var(--n,#0a1a30);margin-top:4px;padding:6px;background:rgba(0,0,0,0.03);border-radius:3px}`;
  document.head.appendChild(style);
}

function appendTimelineToContext(leadId){
  const contextContent=$('contextPanelContent');
  if(!contextContent)return;

  const lead=window.leads?.find(l=>l.id===leadId)||window.partials?.find(l=>l.id===leadId);
  const lifecycle=window.CrmLifecycleData?.getLifecycle(leadId);

  let timelineSection=contextContent.querySelector('[data-lifecycle-timeline]');
  if(!timelineSection){
    timelineSection=document.createElement('div');
    timelineSection.dataset.lifecycleTimeline='1';
    timelineSection.className='crm-context-section';
    contextContent.appendChild(timelineSection);
  }

  timelineSection.innerHTML=`
    <div class="crm-context-label">Activity Timeline</div>
    <div>${renderTimelineEvents(lead,lifecycle)}</div>
  `;
}

function $(){
  return document.getElementById(...arguments);
}

function patchContextPanel(){
  if(window.__lifecycleTimelinePatched)return;
  window.__lifecycleTimelinePatched=1;

  const origOpen=window.CrmContextPanel?.open;
  if(typeof origOpen!=='function')return;

  window.CrmContextPanel.open=function(leadId){
    origOpen.call(this,leadId);
    setTimeout(()=>appendTimelineToContext(leadId),250);
  };
}

function start(){
  injectTimelineStyles();
  setTimeout(()=>{
    patchContextPanel();
  },100);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.CrmLifecycleTimeline={render:(lead,lifecycle)=>renderTimelineEvents(lead,lifecycle)};
})();
