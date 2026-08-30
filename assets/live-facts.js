(function(){'use strict';
  var nodes=document.querySelectorAll('[data-live-fact-key]');
  if(!nodes.length)return;
  fetch('/seo/live-facts.json',{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null}).then(function(data){
    if(!data)return;
    var byKey={};(data.records||[]).forEach(function(x){byKey[x.key]=x});
    nodes.forEach(function(node){
      var fact=byKey[node.dataset.liveFactKey];if(!fact)return;
      var stale=new Date().toISOString().slice(0,10)>fact.recheck_after||fact.status!=='verified';
      node.setAttribute('data-source-label',fact.source_label);
      node.setAttribute('data-last-verified',fact.last_verified_at);
      node.setAttribute('data-recheck-after',fact.recheck_after);
      if(stale){
        var card=node.closest('article,.now,.card')||node;
        card.classList.add('needs-reverification');
        if(!card.querySelector('.fact-status')){var p=document.createElement('p');p.className='fact-status needs-reverification';p.textContent='Needs reverification before relying on this fact.';card.appendChild(p)}
      }
    });
  }).catch(function(){});
})();
