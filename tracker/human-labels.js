(()=>{'use strict';
const TEXT=new Map([
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
  ['resolved','Resolved'],
  ['Dugsiga iyo taageerada ilmaha','Skuulka iyo taageerada ilmaha'],
  ['Ciyaaro iyo hiwaayado','Ciyaaro iyo harrastukset'],
  ['Hel ciyaar ama hobby ku habboon ilmaha','Hel ciyaar ama harrastus ku habboon ilmaha']
]);

function cleanElement(el){
  if(!(el instanceof HTMLElement))return;
  if(el.matches('.stage-btn')){
    const raw=el.dataset.stage;
    if(TEXT.has(raw))el.textContent=TEXT.get(raw);
  }
  if(el.matches('.pill.stage')){
    const raw=el.textContent.trim();
    if(TEXT.has(raw))el.textContent=TEXT.get(raw);
  }
  if(el.matches('.pill.new,.pill.contacted,.pill.resolved')){
    const raw=el.textContent.trim();
    if(TEXT.has(raw))el.textContent=TEXT.get(raw);
  }
}

function replaceText(root=document){
  root.querySelectorAll?.('.stage-btn,.pill.stage,.pill.new,.pill.contacted,.pill.resolved').forEach(cleanElement);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    let out=node.nodeValue;
    TEXT.forEach((next,old)=>{if(out.includes(old))out=out.split(old).join(next)});
    node.nodeValue=out;
  });
}

const observer=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)replaceText(node)})));
function start(){replaceText(document);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
