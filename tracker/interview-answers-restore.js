(()=>{'use strict';
const $=id=>document.getElementById(id);
let pending=null,observer=null;
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
function notifyRestored(){document.dispatchEvent(new CustomEvent('aqoon:interview-answers-restored'))}
function stopWatching(){observer?.disconnect();observer=null}
function watch(){
  stopWatching();
  const host=$('questions');if(!host)return;
  applyTo(host);
  notifyRestored();
  observer=new MutationObserver(mutations=>{mutations.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)applyTo(node)}));notifyRestored()});
  observer.observe(host,{childList:true,subtree:true});
}
const originalOpenForRestore=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForRestore)originalOpenForRestore.call(this,id);
  pending=null;stopWatching();
  if(!id)return;
  // The lead (with its embedded latest_interview) is already in
  // window.AqoonApp.leads - the queue that opened this drawer was built
  // from that same array, so there's no need for a second 'list' fetch
  // just to look up one record already in memory.
  const lead=(window.AqoonApp?.leads||[]).find(x=>x.id===id);
  const answers=lead?.latest_interview?.answers;
  if(answers&&typeof answers==='object'&&Object.keys(answers).length){pending=answers;watch()}
};
document.addEventListener('click',event=>{if(event.target.closest('#closeDrawer')){pending=null;stopWatching()}});
})();
