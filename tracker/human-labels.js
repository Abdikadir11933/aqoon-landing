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
// Substring-safe only: these are long, distinctive phrases used for a
// document-wide taxonomy rename. Never add a short/generic entry here — a
// short key (e.g. 'start', 'new') matches inside unrelated words anywhere in
// the document ("started" -> "Starteded", "knew" -> "kNew") because
// replaceText() below does a blind substring find/replace across every text
// node, not just the taxonomy labels it's meant for.
const PHRASES=new Map([
  ['Dugsiga iyo taageerada ilmaha','Skuulka iyo taageerada ilmaha'],
  ['Ciyaaro iyo hiwaayado','Ciyaaro iyo harrastukset'],
  ['Hel ciyaar ama hobby ku habboon ilmaha','Hel ciyaar ama harrastus ku habboon ilmaha']
]);

function cleanElement(el){
  if(!(el instanceof HTMLElement))return;
  if(el.matches('.stage-btn')){
    const raw=el.dataset.stage;
    if(CODES.has(raw))el.textContent=CODES.get(raw);
  }
  if(el.matches('.pill.stage')){
    const raw=el.textContent.trim();
    if(CODES.has(raw))el.textContent=CODES.get(raw);
  }
  if(el.matches('.pill.new,.pill.contacted,.pill.resolved')){
    const raw=el.textContent.trim();
    if(CODES.has(raw))el.textContent=CODES.get(raw);
  }
}

function replaceText(root=document){
  root.querySelectorAll?.('.stage-btn,.pill.stage,.pill.new,.pill.contacted,.pill.resolved').forEach(cleanElement);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    let out=node.nodeValue;
    PHRASES.forEach((next,old)=>{if(out.includes(old))out=out.split(old).join(next)});
    node.nodeValue=out;
  });
}

const observer=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)replaceText(node)})));
function start(){replaceText(document);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
