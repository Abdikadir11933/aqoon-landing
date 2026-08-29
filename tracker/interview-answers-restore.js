(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const $=id=>document.getElementById(id);
let pending=null,observer=null;
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(body){const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password()},body:JSON.stringify(body),cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
function fill(el,value){
  if(el.matches('input,textarea')){if(el.value==='')el.value=Array.isArray(value)?value.join(', '):value;return}
  if(el.classList.contains('choice-row')){
    if(el.querySelector('.choice.on'))return;
    const wanted=Array.isArray(value)?value:[value];
    el.querySelectorAll('.choice').forEach(b=>{if(wanted.includes(b.dataset.value))b.classList.add('on')});
  }
}
function applyTo(root){
  if(!pending||!root.querySelectorAll)return;
  root.querySelectorAll('[data-key]').forEach(el=>{
    const key=el.dataset.key;
    if(key&&Object.prototype.hasOwnProperty.call(pending,key))fill(el,pending[key]);
  });
}
function stopWatching(){observer?.disconnect();observer=null}
function watch(){
  stopWatching();
  const host=$('questions');if(!host)return;
  applyTo(host);
  observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)applyTo(node)})));
  observer.observe(host,{childList:true,subtree:true});
}
const originalOpenForRestore=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForRestore)originalOpenForRestore.call(this,id);
  pending=null;stopWatching();
  if(!id)return;
  api({action:'list'}).then(d=>{
    const lead=(d.leads||[]).find(x=>x.id===id);
    const answers=lead?.latest_interview?.answers;
    if(answers&&typeof answers==='object'&&Object.keys(answers).length){pending=answers;watch()}
  }).catch(()=>{});
};
document.addEventListener('click',event=>{if(event.target.closest('#closeDrawer')){pending=null;stopWatching()}});
})();
