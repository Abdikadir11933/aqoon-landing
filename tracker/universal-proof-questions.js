(()=>{'use strict';
const ROOT='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
let loading=false,lastLoaded=0;

function row(key,label,values,{multi=false,note=''}={}){
  const q=document.createElement('div');q.className='question match-extra universal-proof-question';q.dataset.universalProof='1';
  q.innerHTML='<label>'+label+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+key+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+v.replace(/"/g,'&quot;')+'">'+v+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+note+'</small>':'');
  const r=q.querySelector('.choice-row');r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{if(multi)b.classList.toggle('on');else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on')}});return q;
}
function section(){
  const wrap=document.createElement('div');wrap.dataset.universalProofSection='1';wrap.className='universal-proof-section';
  const head=document.createElement('div');head.className='question match-extra evidence-section';head.dataset.universalProof='1';
  head.innerHTML='<label style="font-size:17px">AQOON & wider-needs check</label><small class="muted" style="display:block;margin-top:5px">Ask this at the end of every first interview, no matter why they first contacted AQOON. Keep it quick and conversational.</small>';
  wrap.appendChild(head);
  wrap.appendChild(row('aqoon_awareness_before','Before this, did they already know AQOON existed?',['Yes','No','Not sure']));
  wrap.appendChild(row('entry_service_awareness','Before AQOON, did they know the exact programme/service we discussed existed?',['Yes – knew it','Had heard of it but did not understand it','No','Not sure']));
  wrap.appendChild(row('entry_service_self_navigation','Without AQOON, would they have known how to find/apply/use it?',['Yes','Partly / maybe','No','Not sure']));
  wrap.appendChild(row('vantaa_hobbies_awareness_all','If they live in Vantaa: did they know Vantaa offers free school-age hobby groups / Harrastusten Vantaa?',['Yes','Had heard something','No','Not in Vantaa / not relevant','Not sure']));
  wrap.appendChild(row('vantaa_hobbies_possible_need','Could free hobby help be useful for any child in the family?',['Yes – wants help now','Maybe / later','No','No school-age children','Not in Vantaa / not relevant']));
  wrap.appendChild(row('private_daycare_awareness_all','Did they know private daycare can also be an option, depending on municipality, fee and availability?',['Yes – understood it','Had heard of private daycare but assumed it was not realistic','No','Not sure']));
  wrap.appendChild(row('daycare_possible_need_all','Does the family have a daycare need now or coming soon?',['Yes – now','Yes – within 6 months','Maybe later','No','No daycare-age children']));
  wrap.appendChild(row('cross_service_needs_all','After talking, what else could they realistically need help with?',['Work','School / child support','Daycare','Children’s hobbies','Finnish / education','Kela / benefits','Programmes / training','Housing','Letters / applications','Nothing else now'],{multi:true,note:'Do not sell or force a need. Tick only what the person says is relevant after a short explanation.'}));
  wrap.appendChild(row('aqoon_return_intent','If another Finnish-system question comes up, would they contact AQOON again?',['Yes','Maybe','No','Not sure']));
  return wrap;
}
function ready(root){return !!root.querySelector('.question [data-key]');}
function ensure(){
  const root=document.querySelector(ROOT);if(!root||!ready(root))return;
  let s=root.querySelector('[data-universal-proof-section="1"]');if(!s){s=section();root.appendChild(s);}else if(root.lastElementChild!==s)root.appendChild(s);
}
function count(ints,key){const c={};let n=0;(ints||[]).forEach(i=>{const v=i.answers&&i.answers[key];if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>c[x]=(c[x]||0)+1)});return{n,c};}
function bars(title,d){const es=Object.entries(d.c).sort((a,b)=>b[1]-a[1]);if(!es.length)return '<div style="margin-top:12px"><strong>'+title+'</strong><p class="sub">No answers yet.</p></div>';const p=Math.max(...es.map(x=>x[1]));return '<div style="margin-top:12px"><strong>'+title+'</strong><small class="muted" style="margin-left:6px">n='+d.n+'</small><div class="bars" style="margin-top:8px">'+es.map(([k,v])=>'<div class="bar-row"><span>'+k+'</span><div class="bar-track"><i style="width:'+Math.max(6,Math.round(v/p*100))+'%"></i></div><strong>'+v+'</strong></div>').join('')+'</div></div>'}
function ensureAnalytics(){
  if(document.getElementById('universalProofAnalytics'))return document.getElementById('universalProofAnalytics');
  const anchor=document.getElementById('interviewEvidenceCard')||document.querySelector('.analytics-view .breakdown-card');if(!anchor)return null;
  const d=document.createElement('details');d.className='command-card';d.id='universalProofAnalytics';d.innerHTML='<summary>AQOON & cross-service proof</summary><p class="sub">Aggregate answers from the end-of-interview check across all interview types.</p><div id="universalProofBody"><p class="sub">Open to load.</p></div>';
  anchor.insertAdjacentElement('afterend',d);d.addEventListener('toggle',()=>{if(d.open)load(false)});return d;
}
async function load(force){
  const card=ensureAnalytics(),body=document.getElementById('universalProofBody');if(!card||!body||loading)return;if(!force&&lastLoaded&&Date.now()-lastLoaded<30000)return;
  const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;loading=true;body.innerHTML='<p class="sub">Loading…</p>';
  try{const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');const m=new Map();(d.interviews||[]).filter(i=>i.status==='completed').forEach(i=>{const o=m.get(i.lead_id);if(!o||String(i.updated_at)>String(o.updated_at))m.set(i.lead_id,i)});const ints=[...m.values()].filter(i=>i.answers&&i.answers.aqoon_awareness_before!==undefined);body.innerHTML='<div class="analytics-secondary"><span>Interviews with universal check <strong>'+ints.length+'</strong></span></div>'+bars('Knew AQOON before contact',count(ints,'aqoon_awareness_before'))+bars('Knew the entry service/programme existed',count(ints,'entry_service_awareness'))+bars('Could self-navigate without AQOON',count(ints,'entry_service_self_navigation'))+bars('Vantaa free-hobby awareness',count(ints,'vantaa_hobbies_awareness_all'))+bars('Possible hobby need uncovered',count(ints,'vantaa_hobbies_possible_need'))+bars('Private-daycare awareness',count(ints,'private_daycare_awareness_all'))+bars('Daycare need now / coming soon',count(ints,'daycare_possible_need_all'))+bars('Other needs uncovered',count(ints,'cross_service_needs_all'))+bars('Would contact AQOON again',count(ints,'aqoon_return_intent'));lastLoaded=Date.now();}catch(e){body.innerHTML='<p class="sub">Could not load: '+String(e.message||e)+'</p>';}finally{loading=false;}
}
const obs=new MutationObserver(()=>ensure());
function start(){const r=document.querySelector(ROOT);if(r)obs.observe(r,{childList:true,subtree:true});ensure();ensureAnalytics();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
document.addEventListener('click',e=>{if(e.target.closest('[data-interview]'))setTimeout(ensure,180);if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureAnalytics();load(false)},300);if(e.target.closest('#refresh'))setTimeout(()=>load(true),400)},false);
})();