(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const style=document.createElement('style');
style.textContent=`.interview-recap{background:#f5f3f1;border:1px solid #e4dfd3;border-radius:14px;padding:12px;margin-bottom:12px}.recap-title{font-size:11px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;color:#333;margin-bottom:8px}.recap-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;line-height:1.4}.recap-col{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px}.recap-col strong{display:block;font-size:9px;text-transform:uppercase;color:#556;margin-bottom:4px}.recap-changed{background:#fef6f3;border-left:3px solid #d97560}.recap-timeline{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px;margin-top:8px;font-size:10px;color:#687}.recap-timeline-item{padding:4px 0;border-top:1px solid #ede9e2}.recap-timeline-item:first-child{border-top:0}.recap-button{width:100%;border:0;background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px 10px;text-align:left;font-size:12px;font-weight:600;color:#333;cursor:pointer;margin-top:8px}.recap-button:hover{background:#f9f8f6}.recap-button.on{background:#e8f4f1;border-color:#3a9b8a}`;
document.head.appendChild(style);

let recapOpen=false,leadData=null;

function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}

function valueDisplay(v){if(!v)return'—';if(Array.isArray(v))return v.join(', ');return String(v);}

// firstAnswers comes from the saved interview (server data); currentAnswers
// is freshly scraped from the DOM on every toggle (scrapeCurrentAnswers()).
// For a multi-select field those are always two different array objects
// even when they hold the same choices, so a plain !== always reported
// every multi-select field as "changed" - regardless of whether the
// operator had touched it - since arrays compare by reference, not content.
function valuesEqual(a,b){
  if(Array.isArray(a)||Array.isArray(b)){
    const norm=v=>(Array.isArray(v)?v:v==null?[]:[v]).slice().sort();
    const A=norm(a),B=norm(b);
    return A.length===B.length&&A.every((v,i)=>v===B[i]);
  }
  return a===b;
}

function buildRecap(firstAnswers,currentAnswers,events){
  const changedKeys=new Set();
  const allKeys=new Set([...Object.keys(firstAnswers||{}),...Object.keys(currentAnswers||{})]);

  const changed={};
  allKeys.forEach(k=>{
    const first=firstAnswers?.[k];
    const current=currentAnswers?.[k];
    if(!valuesEqual(first,current)){
      changedKeys.add(k);
      changed[k]={first,current};
    }
  });

  let html='<div class="interview-recap">';
  html+='<button type="button" class="recap-button '+(recapOpen?'on':'')+'">← What changed since first interview</button>';

  if(recapOpen){
    if(changedKeys.size){
      html+='<div class="recap-title" style="margin-top:10px">Changes</div>';
      html+='<div class="recap-grid">';
      [...changedKeys].slice(0,4).forEach(k=>{
        const {first,current}=changed[k];
        html+='<div class="recap-col recap-changed">';
        html+='<strong>'+esc(k)+'</strong>';
        html+='<span style="color:#999;font-size:9px;display:block;margin:3px 0">Was: '+esc(valueDisplay(first))+'</span>';
        html+='<span style="font-weight:600">Now: '+esc(valueDisplay(current))+'</span>';
        html+='</div>';
      });
      html+='</div>';
      if(changedKeys.size>4){
        html+='<p style="font-size:10px;color:#887;margin:6px 0 0">+'+(changedKeys.size-4)+' more changes</p>';
      }
    }

    if(events?.length){
      html+='<div class="recap-title" style="margin-top:10px">Actions taken</div>';
      html+='<div class="recap-timeline">';
      events.slice(0,5).forEach(e=>{
        html+='<div class="recap-timeline-item">'+esc(fmt(e.occurred_at))+' · '+esc(e.event_type)+(e.note?': '+esc(e.note):'')+'</div>';
      });
      html+='</div>';
    }
  }
  html+='</div>';
  return html;
}

async function load(leadId){
  if(!leadId)return;
  try{
    const lc=await fetch(END_LIFECYCLE,{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json','x-tracker-password':sessionStorage.getItem('aqoon_tracker_password')||''},sessionStorage.getItem('aqoon_auth_token')?{Authorization:'Bearer '+sessionStorage.getItem('aqoon_auth_token')}:{}),
      body:JSON.stringify({action:'list',lead_id:leadId}),
      cache:'no-store'
    }).then(r=>r.json());

    leadData={plans:lc.plans||[],events:lc.events||[]};
  }catch(e){
    // Silently fail if we can't load lifecycle data
  }
}

function render(lead,firstAnswers,currentAnswers){
  const host=$('interview-follow-up-panel');
  if(!host||!firstAnswers)return;

  const events=leadData?.events||[];
  host.innerHTML=buildRecap(firstAnswers,currentAnswers,events);
  host.querySelector('.recap-button')?.addEventListener('click',toggle);
}

function scrapeCurrentAnswers(){
  const out={};
  document.querySelectorAll('#questions [data-key]').forEach(el=>{
    const k=el.dataset.key;if(!k)return;
    if(el.matches('input,textarea,select')){if(el.value!=='')out[k]=el.value;return;}
    if(el.classList.contains('choice-row')){
      const vals=[...el.querySelectorAll('.choice.on')].map(b=>b.dataset.value);
      if(vals.length)out[k]=el.classList.contains('match-multi')?vals:vals[0];
    }
  });
  return out;
}

function toggle(){
  recapOpen=!recapOpen;
  const lead=window.AqoonInterview?.activeLead;
  const first=window.AqoonInterview?.firstAnswers;
  // Re-scraped fresh on every toggle, not the stale snapshot from when the
  // drawer opened - the operator has usually answered more by the time they
  // click "what changed".
  const current=scrapeCurrentAnswers();
  if(lead&&first)render(lead,first,current);
}

function attach(lead,firstAnswers,currentAnswers){
  let host=$('interview-follow-up-panel');
  if(!host){
    host=document.createElement('div');
    host.id='interview-follow-up-panel';
    const questions=$('questions');
    questions?.parentNode?.insertBefore(host,questions);
  }
  recapOpen=false;
  load(lead.id).then(()=>render(lead,firstAnswers,currentAnswers));
}

// Hook into interview context to show recap if this is a follow-up
const originalContextAttach=window.AqoonInterviewContext?.attach;
if(originalContextAttach){
  window.AqoonInterviewContext.attach=function(lead){
    originalContextAttach.call(this,lead);
    // If latest_interview exists, this drawer open is a follow-up (not a
    // first interview) - show the recap panel comparing first vs. current.
    if(lead.latest_interview){
      setTimeout(()=>{
        const firstAnswers=lead.latest_interview.answers||{};
        window.AqoonInterview.firstAnswers=firstAnswers;
        window.AqoonInterview.currentAnswers=scrapeCurrentAnswers();
        attach(lead,firstAnswers,window.AqoonInterview.currentAnswers);
      },100);
    }
  };
}

window.AqoonFollowUpRecap={render,attach,toggle};
})();
