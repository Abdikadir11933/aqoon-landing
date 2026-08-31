(()=>{'use strict';
// Exact-match only: codes come from data-stage/pill textContent, which are
// always the whole code string, never a larger sentence. Safe to keep short.
const CODES=new Map([
  ['reach','First contact'],
  ['guide','Guiding'],
  ['start','Started'],
  ['retention','Follow-up'],
  ['referral','Referral'],
  ['not_started','Not started'],
  ['in_progress','In progress'],
  ['completed','Completed'],
  ['new','New'],
  ['contacted','Contacted'],
  ['resolved','Resolved']
]);
const PHRASES=new Map([
  ['Dugsiga iyo taageerada ilmaha','Skuulka iyo taageerada ilmaha'],
  ['Ciyaaro iyo hiwaayado','Ciyaaro iyo harrastukset'],
  ['Hel ciyaar ama hobby ku habboon ilmaha','Hel ciyaar ama harrastus ku habboon ilmaha']
]);
const SELECTOR='.stage-btn,.pill.stage,.pill.new,.pill.contacted,.pill.resolved';
function cleanElement(el){
  if(!(el instanceof HTMLElement))return;
  if(el.matches('.stage-btn')){const raw=el.dataset.stage;if(CODES.has(raw)&&el.textContent!==CODES.get(raw))el.textContent=CODES.get(raw);return}
  if(el.matches('.pill.stage,.pill.new,.pill.contacted,.pill.resolved')){const raw=el.textContent.trim();if(CODES.has(raw))el.textContent=CODES.get(raw)}
}
function replacePhrases(root){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    let out=node.nodeValue,next=out;
    PHRASES.forEach((value,old)=>{if(next.includes(old))next=next.split(old).join(value)});
    if(next!==out)node.nodeValue=next;
  }
}
function normalize(root){
  if(!(root instanceof Element||root instanceof Document))return;
  if(root instanceof Element&&root.matches(SELECTOR))cleanElement(root);
  root.querySelectorAll?.(SELECTOR).forEach(cleanElement);
  replacePhrases(root);
}
let pending=new Set(),frame=0;
function flush(){
  frame=0;
  const roots=[...pending];pending.clear();
  // Drop descendants when an ancestor is already queued, so one large panel
  // insertion is traversed once instead of once per nested mutation.
  const unique=roots.filter((root,i)=>!roots.some((other,j)=>i!==j&&other.contains?.(root)));
  unique.forEach(normalize);
}
function queue(root){if(!(root instanceof Element))return;pending.add(root);if(!frame)frame=requestAnimationFrame(flush)}
const observer=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)queue(node)})));
function start(){normalize(document);observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
