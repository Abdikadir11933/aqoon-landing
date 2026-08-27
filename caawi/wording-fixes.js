(()=>{'use strict';
const REPLACEMENTS=new Map([
  ['Dugsiga iyo taageerada ilmaha','Skuulka iyo taageerada ilmaha'],
  ['Su’aalo ku saabsan dugsiga, luqadda ama taageerada','Su’aalo ku saabsan skuulka, luqadda ama taageerada'],
  ['Xannaano, dugsi ama ciyaaro','Xannaano, skuul ama ciyaaro'],
  ['Ciyaaro iyo hiwaayado','Ciyaaro iyo harrastukset'],
  ['Hel ciyaar ama hobby ku habboon ilmaha','Hel ciyaar ama harrastus ku habboon ilmaha']
]);

function fixString(v){
  if(typeof v!=='string')return v;
  let out=v;
  REPLACEMENTS.forEach((next,old)=>{out=out.split(old).join(next)});
  return out;
}

function replaceText(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{node.nodeValue=fixString(node.nodeValue)});
}

const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  try{
    if(init?.body&&typeof init.body==='string'){
      const body=JSON.parse(init.body);
      if(body.sub_need)body.sub_need=fixString(body.sub_need);
      if(Array.isArray(body.additional_needs))body.additional_needs=body.additional_needs.map(x=>Object.assign({},x,{sub_need:fixString(x?.sub_need)}));
      init=Object.assign({},init,{body:JSON.stringify(body)});
    }
  }catch{}
  return originalFetch(input,init);
};

const observer=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1)replaceText(node)})));
function start(){replaceText(document);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
