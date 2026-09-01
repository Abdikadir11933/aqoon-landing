(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let leadId="",timer;
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
function restore(){const k=key(),box=$("#iNotes");if(!k||!box)return;const saved=localStorage.getItem(k);if(saved&&!box.value){box.value=saved;status("Draft restored from this device")}else status("Draft saves on this device")}
function saveDraft(){clearTimeout(timer);timer=setTimeout(()=>{const k=key(),box=$("#iNotes");if(k&&box){localStorage.setItem(k,box.value);status("Draft saved")}},250)}
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
  };
  document.addEventListener("click",e=>{if(e.target.closest("#saveInterview"))setTimeout(()=>{if(!$("#promptWrap")?.classList.contains("hidden")){localStorage.removeItem(key());status("Saved to the family record")}},900)});
  $("#iNotes")?.addEventListener("input",saveDraft);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();
