(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let contextOpen=false;

const style=document.createElement('style');
style.textContent=`.interview-context{background:#f5f3f1;border:1px solid #e4dfd3;border-radius:14px;padding:12px;margin-bottom:12px}.context-summary{font-size:12px;line-height:1.5;color:#555}.context-summary strong{display:block;margin:8px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#333}.context-prompt{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px;margin:6px 0;font-size:11px;line-height:1.4;max-height:120px;overflow-y:auto;color:#556;font-family:monospace}.context-timeline{font-size:10px;color:#687;margin:6px 0 0}.context-timeline div{padding:4px 0;border-top:1px solid #ede9e2}.context-button{width:100%;border:0;background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px 10px;text-align:left;font-size:12px;font-weight:600;color:#333;cursor:pointer;margin-top:8px}.context-button:hover{background:#f9f8f6}.context-button.on{background:#e6f4f1;border-color:#3a9b8a}`;
document.head.appendChild(style);

function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}

function render(lead){
  const host=$('interview-context-panel');
  if(!host||!lead)return;

  const summary=lead.latest_interview?.summary||'';
  const prompt=lead.latest_interview?.research_prompt||'';
  const nextAction=lead.latest_interview?.next_action||'';

  let html='<div class="interview-context">';
  html+='<button type="button" class="context-button '+(contextOpen?'on':'')+'">← Interview context</button>';

  if(contextOpen){
    if(summary){
      html+='<div class="context-summary">';
      html+='<strong>Previous interview</strong>';
      html+='<div>'+esc(summary)+'</div>';
      if(nextAction){
        html+='<strong style="margin-top:10px">Next action</strong>';
        html+='<div>'+esc(nextAction)+'</div>';
      }
      html+='</div>';
    }
    if(prompt){
      html+='<strong style="display:block;margin:10px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#333">Research brief</strong>';
      html+='<div class="context-prompt">'+esc(prompt.slice(0,800))+(prompt.length>800?'…':'')+'</div>';
    }
  }
  html+='</div>';

  host.innerHTML=html;
  host.querySelector('.context-button')?.addEventListener('click',toggle);
}

function toggle(){
  contextOpen=!contextOpen;
  // Re-render with open/close state
  const lead=window.AqoonInterview?.activeLead;
  if(lead)render(lead);
}

function attach(lead){
  let host=$('interview-context-panel');
  if(!host){
    // Create panel before #questions
    host=document.createElement('div');
    host.id='interview-context-panel';
    const questions=$('questions');
    questions?.parentNode?.insertBefore(host,questions);
  }
  contextOpen=false;
  render(lead);
}

// Hook into interview drawer open
const originalOpen=window.openInterview;
window.openInterview=function(id){
  if(originalOpen)originalOpen.call(this,id);
  // After drawer opens, attach context if we have activeLead
  setTimeout(()=>{
    const activeLead=window.AqoonInterview?.activeLead;
    if(activeLead)attach(activeLead);
  },50);
};

// Export for other modules
window.AqoonInterviewContext={render,attach,toggle};
})();
