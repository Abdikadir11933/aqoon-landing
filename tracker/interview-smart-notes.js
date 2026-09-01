(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let leadId="",timer;
const DRAFT_TTL_MS=7*24*60*60*1000;
const aliases={
  applied:["applied","application","apply","codsi","hakemus","ilmoittaut"],
  private_ok:["private","service voucher","voucher","yksityinen","palveluseteli"],
  has_place:["daycare","place","päiväkoti","xannaano"],
  interest:["hobby","sport","football","swimming","dance","music","coding","harrastus","ciyaar"],
  cost:["free","fee","price","cost","maksu","ilmainen"],
  jobseeker:["jobseeker","job seeker","työnhakija"],
  training:["training","new field","koulutus"],
  cv:["cv","résumé","resume"],
  school_support:["school support","support","teacher","koulu","tuki"],
  childcare:["childcare","daycare","päiväkoti"],
  documents:["certificate","diploma","documents","todistus"]
};
function key(){return leadId?`aqoon_interview_draft_${leadId}`:""}
function status(t){const x=$("#draftStatus");if(x)x.textContent=t}
function readDraft(){
  const k=key();if(!k)return null;
  const raw=localStorage.getItem(k);if(!raw)return null;
  try{
    const draft=JSON.parse(raw);
    if(!draft||typeof draft!=="object")return null;
    if(draft.saved_at&&Date.now()-new Date(draft.saved_at).getTime()>DRAFT_TTL_MS){localStorage.removeItem(k);return null}
    return draft;
  }catch{return{version:1,notes:raw,fields:{},canonical:{}}}
}
function collectFields(){
  const fields={};
  document.querySelectorAll("#drawer [data-key]").forEach(el=>{
    const k=el.dataset.key;if(!k)return;
    if(el.matches("input,textarea,select")){if(el.value!=="")fields[k]=el.value;return}
    if(el.classList.contains("choice-row")){
      const values=[...el.querySelectorAll(".choice.on")].map(b=>b.dataset.value);
      if(values.length)fields[k]=el.classList.contains("match-multi")?values:values[0];
    }
  });
  return fields;
}
function draftSnapshot(){return{version:2,saved_at:new Date().toISOString(),notes:$("#iNotes")?.value||"",fields:collectFields(),canonical:{relevant_updates_ok:$("#iRelevantUpdatesOk")?.value||"",outcome_followup_ok:$("#iOutcomeFollowupOk")?.value||"",urgency:$("#iUrgency")?.value||"normal",next_action:$("#iNextAction")?.value||"",follow_up:$("#iFollow")?.value||""}}}
function writeDraft(){const k=key();if(!k)return;localStorage.setItem(k,JSON.stringify(draftSnapshot()));status("All answers saved as a device draft")}
function saveDraft(now=false){clearTimeout(timer);if(now){writeDraft();return}timer=setTimeout(writeDraft,200)}
function restoreField(el,value){
  if(el.matches("input,textarea,select")){el.value=Array.isArray(value)?value.join(", "):value;return}
  if(!el.classList.contains("choice-row"))return;
  const wanted=Array.isArray(value)?value:[value];
  el.querySelectorAll(".choice").forEach(b=>b.classList.toggle("on",wanted.includes(b.dataset.value)));
}
function restore(){
  const draft=readDraft();if(!draft){status("All answers save on this device until the interview is saved");return}
  if($("#iNotes"))$("#iNotes").value=draft.notes||"";
  document.querySelectorAll("#drawer [data-key]").forEach(el=>{const k=el.dataset.key;if(Object.prototype.hasOwnProperty.call(draft.fields||{},k))restoreField(el,draft.fields[k])});
  const c=draft.canonical||{},ids={relevant_updates_ok:"iRelevantUpdatesOk",outcome_followup_ok:"iOutcomeFollowupOk",urgency:"iUrgency",next_action:"iNextAction",follow_up:"iFollow"};
  Object.entries(ids).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&Object.prototype.hasOwnProperty.call(c,k))el.value=c[k]});
  if(window.AqoonInterview?.currentAnswers)Object.assign(window.AqoonInterview.currentAnswers,draft.fields||{});
  document.dispatchEvent(new CustomEvent("aqoon:interview-answers-restored"));
  status("Unsaved interview restored from this device");
}
function patchInterviewContextSave(){
  if(window.__aqoonInterviewContextSavePatch)return;
  window.__aqoonInterviewContextSavePatch=1;
  const original=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const url=typeof input==="string"?input:(input&&input.url)||"";
      if(url.includes("family-leads-admin")&&init?.body){
        const body=JSON.parse(init.body);
        if(body.action==="save_interview"){
          const notes=$("#iNotes")?.value.trim()||"";
          body.answers=Object.assign({},body.answers||{});
          if(notes){
            body.answers.operator_context_notes=notes;
            if(!String(body.summary||"").includes("operator context:"))body.summary=(body.summary||"Interview saved.").replace(/\.?$/,"; operator context: ")+notes+".";
          }
          const training=body.answers.work_search_scope==="Work plus training options"||["Yes","Maybe"].includes(body.answers.apprenticeship)||(Array.isArray(body.answers.cross_service_needs_all)&&body.answers.cross_service_needs_all.some(x=>["Finnish / education","Programmes / training"].includes(x)));
          if(training){const topics=String(body.interview_type||"work").split("+").filter(Boolean);if(!topics.includes("education"))topics.push("education");body.interview_type=[...new Set(topics)].join("+")}
          init=Object.assign({},init,{body:JSON.stringify(body)});
        }
      }
    }catch(e){console.warn("AQOON interview context save merge skipped",e)}
    return original(input,init);
  };
}
function selectValue(options,sentence){const s=sentence.toLowerCase(),find=x=>options.find(o=>o.toLowerCase()===x)||options.find(o=>o.toLowerCase().includes(x));
  if(/doesn.?t want|not interested|do not want|ei halua|ma rabto/.test(s))return find("no");
  if(/not yet|hasn.?t|haven.?t|didn.?t|ei vielä|not applied|no application/.test(s))return find("no")||find("no place")||find("no cv");
  if(/thinking|maybe|depends|considering|harkitsee|miettii/.test(s))return find("maybe")||find("explain first")||find("not sure");
  if(/not sure|don.?t know|unknown|ei tiedä|ma hubo/.test(s))return find("not sure");
  if(/must be free|needs? to be free|only free/.test(s))return find("must be free");
  if(/small fee|can pay|fee okay/.test(s))return find("small fee okay");
  if(/\b(yes|already|has|wants|okay|ok|kyllä)\b/.test(s))return find("yes");
  if(/\b(no|none|without|ei)\b/.test(s))return find("no")||find("no place")||find("no cv");
  return null
}
function suggest(){const notes=$("#iNotes")?.value.trim(),out=$("#noteSuggestions");if(!notes){out.innerHTML="Write or dictate the conversation first.";out.classList.remove("hidden");return}const sentences=notes.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean),found=[];
  document.querySelectorAll("#questions .choice-row").forEach(row=>{const q=row.closest(".question"),label=q?.querySelector("label")?.textContent.toLowerCase()||"",k=row.dataset.key||"",words=(aliases[k]||label.split(/\W+/).filter(x=>x.length>5)).map(x=>x.toLowerCase()),sentence=sentences.find(s=>words.some(w=>s.toLowerCase().includes(w)));if(!sentence)return;const buttons=[...row.querySelectorAll(".choice")],options=buttons.map(b=>b.dataset.value),value=selectValue(options,sentence);if(value)found.push({k,label:q.querySelector("label").textContent,value,sentence,row})});
  out.innerHTML=found.length?`<small>Suggestions only — approve each one. Original notes stay unchanged.</small>`+found.map((x,i)=>`<div class="suggestion" data-suggestion="${i}"><p><strong>${esc(x.label)}</strong><br>${esc(x.value)} <span class="muted">from “${esc(x.sentence)}”</span></p><button type="button">Apply</button></div>`).join(""):`<div class="empty">No safe structured suggestions found. Keep the notes and tap the answer choices directly.</div>`;out.classList.remove("hidden");out.querySelectorAll("[data-suggestion]").forEach(el=>el.querySelector("button").onclick=()=>{const x=found[Number(el.dataset.suggestion)],b=[...x.row.querySelectorAll(".choice")].find(v=>v.dataset.value===x.value);b?.click();el.classList.add("applied");el.querySelector("button").textContent="Applied ✓"})
}
function start(){
  patchInterviewContextSave();
  const notesLabel=document.querySelector('label[for="iNotes"]');
  if(notesLabel)notesLabel.textContent='Additional information / specify';
  const notesHint=document.querySelector('#iNotes')?.previousElementSibling;
  if(notesHint)notesHint.textContent='Write or dictate anything important in the family’s own words. AQOON keeps this context with the quick answers and uses both when preparing the research brief.';
  document.querySelector('#structureNotes')?.remove();
  document.querySelector('#noteSuggestions')?.remove();
  const originalOpenForNotes=window.openInterview;
  window.openInterview=function(id){
    if(originalOpenForNotes)originalOpenForNotes.call(this,id);
    leadId=id||"";
    setTimeout(restore,120);
    setTimeout(restore,420);
  };
  const drawer=$("#drawer");
  drawer?.addEventListener("input",()=>saveDraft());
  drawer?.addEventListener("change",()=>saveDraft());
  drawer?.addEventListener("click",e=>{if(e.target.closest(".choice"))setTimeout(()=>saveDraft(),0);if(e.target.closest("#saveInterview")){saveDraft(true);status("Saving interview…")}},true);
  window.addEventListener("aqoon:auth-expired",()=>saveDraft(true));
  window.addEventListener("aqoon:interview-saved",()=>{localStorage.removeItem(key());status("Saved to the family record")});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();
