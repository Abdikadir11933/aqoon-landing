// GENERATED FILE - do not edit directly. Edit the source .js files and
// run `node scripts/build_tracker_bundle.js` to regenerate.
// tests/tracker-bundle.test.js fails if this drifts from the sources.

// ---- operator-identity.js ----
(()=>{'use strict';
const SUPABASE_URL='https://qxracwbsyfibcelasxbs.supabase.co';
const LEADS_END=SUPABASE_URL+'/functions/v1/family-leads-admin';
const OPS_END=SUPABASE_URL+'/functions/v1/ops-admin';
const ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cmFjd2JzeWZpYmNlbGFzeGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDEyMDYsImV4cCI6MjA5Mzk3NzIwNn0.RuLR2jqsRYN1vLEfa4u_wFpVRp-LRd6yP-5bCNXZyDg';
const MUTATING_LEAD_ACTIONS=new Set(['save_interview','interview_save','record_call_outcome','update']);
const MUTATING_OPS_ACTIONS=new Set(['save_opportunity','delete_opportunity','add_activity','save_event','delete_event']);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let operators=[],opById={},leadAttrib={},oppRecords={},badgeTimer=null,pickerMode='signin';

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}
function meName(){return sessionStorage.getItem('aqoon_operator_name')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
function setMe(id,name){sessionStorage.setItem('aqoon_operator_id',id);sessionStorage.setItem('aqoon_operator_name',name);renderPill();scheduleBadgeRefresh()}
function setAuthSession(token,refresh){if(token)sessionStorage.setItem('aqoon_auth_token',token);if(refresh)sessionStorage.setItem('aqoon_auth_refresh_token',refresh)}
function clearMe(){sessionStorage.removeItem('aqoon_operator_id');sessionStorage.removeItem('aqoon_operator_name');sessionStorage.removeItem('aqoon_auth_token');sessionStorage.removeItem('aqoon_auth_refresh_token');sessionStorage.removeItem('aqoon_tracker_password')}
function nameFor(id){if(!id)return'';const o=opById[id];return o?o.display_name:''}

// A real, verified sign-in makes the JWT sufficient on its own (see the
// Edge Function OR-logic: correct shared password OR a verified operator
// JWT). app.js still gates entirely on sessionStorage.aqoon_tracker_password,
// so once we know the person is real, we hand it a harmless placeholder and
// reload so app.js's own unchanged bootstrap does the rest, authenticated by
// the JWT this script attaches to every request (patched below).
function unlockWithSession(){sessionStorage.setItem('aqoon_tracker_password','session');location.reload()}
function signOut(){clearMe();location.reload()}

async function authRequest(path,body){
  const r=await fetch(SUPABASE_URL+path,{method:'POST',headers:{'Content-Type':'application/json',apikey:ANON_KEY},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error_description||d.msg||d.error||'Could not sign in');
  return d;
}
async function authSignIn(email,password){return authRequest('/auth/v1/token?grant_type=password',{email,password})}
async function authSignUp(email,password){return authRequest('/auth/v1/signup',{email,password})}
async function whoami(token){
  const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw(),Authorization:'Bearer '+token},body:JSON.stringify({action:'whoami'})});
  return r.json().catch(()=>({}));
}
async function claimOperator(token,operatorId){
  const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw(),Authorization:'Bearer '+token},body:JSON.stringify({action:'claim_operator',operator_id:operatorId})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||'Could not link this account');
  return d;
}

function injectStyles(){
  if(document.getElementById('operatorIdentityStyles'))return;
  const style=document.createElement('style');
  style.id='operatorIdentityStyles';
  style.textContent='.operator-pill{position:static;z-index:40;background:#fff;border:1px solid var(--l,#e9e5dc);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700;color:var(--n,#0a1a30);box-shadow:0 4px 12px rgba(16,42,70,.08);cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}.operator-pill.hidden{display:none}.operator-pill .dot{width:7px;height:7px;border-radius:50%;background:var(--t,#13b9aa);flex:0 0 auto}.operator-badge-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0}.op-tag{background:var(--c,#f0ece3);color:var(--n,#0a1a30);border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700}.op-tag-empty{background:#fee9e5;color:#9f4038}.op-touch{font-size:9px;color:var(--m,#7a8290)}.op-claim{border:0;background:var(--t,#13b9aa);color:#052c27;border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer}.pill-operator{color:#5a7d78;font-weight:700}.operator-auth{display:grid;gap:8px;margin-top:2px}.operator-auth input{width:100%;border:1px solid var(--l,#e9e5dc);border-radius:12px;padding:11px 12px;font-size:14px}.operator-auth-btn{border:0;background:var(--n,#0a1a30);color:#fff;border-radius:12px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;margin-top:2px}.operator-error{color:#9f4038;font-size:11px;min-height:14px}.operator-switch{text-align:center;margin-top:12px;font-size:11px;color:var(--m,#7a8290)}.operator-switch a{color:var(--t,#0c8c80);font-weight:700;cursor:pointer;text-decoration:underline}.operator-hr{border:0;border-top:1px solid var(--l,#e9e5dc);margin:14px 0}.operator-options{display:grid;gap:8px;margin:4px 0 6px}.operator-choice{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:13px;padding:13px;font-weight:700;font-size:14px;color:var(--n,#0a1a30);cursor:pointer}.operator-choice:hover{border-color:var(--t,#13b9aa)}.operator-choice.on{border-color:var(--t,#13b9aa);background:var(--t,#13b9aa);color:#052c27}@media(max-width:520px){.operator-pill{width:34px;height:34px;padding:0;justify-content:center;font-size:0}.operator-pill b{display:none}.operator-pill .dot{width:10px;height:10px}}';
  document.head.appendChild(style);
}

function ensurePill(){
  if(document.getElementById('operatorPill'))return;
  const pill=document.createElement('button');
  pill.type='button';pill.id='operatorPill';pill.className='operator-pill hidden';
  pill.title='Sign out';
  pill.onclick=()=>{if(confirm('Sign out of AQOON?'))signOut()};
  document.querySelector('.top-actions')?.prepend(pill) || document.body.appendChild(pill);
}
function renderPill(){
  const pill=document.getElementById('operatorPill');if(!pill)return;
  const appEl=document.getElementById('app');
  const visible=appEl&&!appEl.classList.contains('hidden');
  pill.classList.toggle('hidden',!visible);
  const name=meName();
  pill.setAttribute('aria-label',name?'Signed in as '+name+'. Sign out':'Sign out');
  pill.innerHTML=name?('<span class="dot"></span>Signed in: <b>'+esc(name)+'</b> · Sign out'):'';
}

// Replaces the original shared-password #login form with real sign-in/sign-up,
// the moment #lock is visible. The original form stays in the DOM (hidden),
// reachable through "Trouble signing in?" as an emergency fallback if the
// Edge Functions still accept the old shared password.
function ensureAuthUI(){
  const box=document.querySelector('.lockbox');
  if(!box||document.getElementById('operatorAuthWrap'))return;
  const originalForm=document.getElementById('login');
  if(originalForm)originalForm.classList.add('hidden');
  const wrap=document.createElement('div');
  wrap.id='operatorAuthWrap';
  box.appendChild(wrap);
  renderAuthUI();
}
function renderAuthUI(){
  const wrap=document.getElementById('operatorAuthWrap');
  if(!wrap)return;
  if(pickerMode==='signin'||pickerMode==='signup'){
    const isSignup=pickerMode==='signup';
    wrap.innerHTML='<form class="operator-auth" id="operatorAuthForm"><input type="email" id="operatorEmail" placeholder="Your email" autocomplete="username" required><input type="password" id="operatorPassword" placeholder="Password" autocomplete="'+(isSignup?'new-password':'current-password')+'" minlength="6" required>'+(isSignup?'<div id="operatorSignupOptions" class="operator-options"><p class="muted">Loading…</p></div>':'')+'<div class="operator-error" id="operatorAuthError"></div><button type="submit" class="operator-auth-btn" id="operatorAuthSubmit">'+(isSignup?'Create my account':'Unlock')+'</button></form><div class="operator-switch">'+(isSignup?'Already have an account? <a id="operatorToSignin">Sign in</a>':'New here? <a id="operatorToSignup">Create an account</a>')+'</div><hr class="operator-hr"><div class="operator-switch">Trouble signing in? <a id="operatorUseShared">Use the shared password</a></div>';
    let chosenOperatorId='';
    if(isSignup){
      fetchOperators().then(ops=>{
        const optBox=document.getElementById('operatorSignupOptions');
        if(!optBox)return;
        optBox.innerHTML=ops.length?('<p class="muted" style="margin:0 0 4px">Which one are you?</p>'+ops.map(o=>'<button type="button" class="operator-choice" data-op="'+esc(o.id)+'">'+esc(o.display_name)+'</button>').join('')):'<p class="muted">No operators configured yet.</p>';
        optBox.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{optBox.querySelectorAll('[data-op]').forEach(x=>x.classList.remove('on'));b.classList.add('on');chosenOperatorId=b.dataset.op;});
      });
    }
    document.getElementById('operatorToSignup')?.addEventListener('click',()=>{pickerMode='signup';renderAuthUI()});
    document.getElementById('operatorToSignin')?.addEventListener('click',()=>{pickerMode='signin';renderAuthUI()});
    document.getElementById('operatorUseShared').onclick=()=>{wrap.classList.add('hidden');document.getElementById('login')?.classList.remove('hidden');document.getElementById('password')?.focus()};
    document.getElementById('operatorAuthForm').onsubmit=async e=>{
      e.preventDefault();
      const email=document.getElementById('operatorEmail').value.trim(),password=document.getElementById('operatorPassword').value;
      const errEl=document.getElementById('operatorAuthError'),btn=document.getElementById('operatorAuthSubmit');
      errEl.textContent='';
      if(isSignup&&!chosenOperatorId){errEl.textContent='Pick which one of you this account is for.';return}
      btn.disabled=true;btn.textContent='Please wait…';
      try{
        const session=isSignup?await authSignUp(email,password):await authSignIn(email,password);
        if(!session.access_token)throw new Error('Check your email to confirm the account, then sign in.');
        setAuthSession(session.access_token,session.refresh_token);
        if(isSignup){
          const claimed=await claimOperator(session.access_token,chosenOperatorId);
          setMe(claimed.operator.id,claimed.operator.display_name);
          unlockWithSession();
        }else{
          const who=await whoami(session.access_token);
          if(who.operator){setMe(who.operator.id,who.operator.display_name);unlockWithSession();}
          else{pickerMode='claim';await renderAuthUI();}
        }
      }catch(ex){errEl.textContent=ex.message||'Something went wrong.';}
      finally{btn.disabled=false;btn.textContent=isSignup?'Create my account':'Unlock';}
    };
    return;
  }
  if(pickerMode==='claim'){
    wrap.innerHTML='<p class="muted">Signed in, but this account is not linked to either of you yet. Pick which one this is.</p><div id="operatorClaimOptions" class="operator-options"><p class="muted">Loading…</p></div><div class="operator-error" id="operatorAuthError"></div>';
    fetchOperators().then(ops=>{
      const box=document.getElementById('operatorClaimOptions');
      if(!box)return;
      box.innerHTML=ops.length?ops.map(o=>'<button type="button" class="operator-choice" data-op="'+esc(o.id)+'">'+esc(o.display_name)+'</button>').join(''):'<p class="muted">No operators configured yet.</p>';
      box.querySelectorAll('[data-op]').forEach(b=>b.onclick=async()=>{
        const errEl=document.getElementById('operatorAuthError');
        try{const claimed=await claimOperator(authToken(),b.dataset.op);setMe(claimed.operator.id,claimed.operator.display_name);unlockWithSession();}
        catch(ex){errEl.textContent=ex.message||'Could not link this account.';}
      });
    });
  }
}
async function fetchOperators(){
  if(operators.length)return operators;
  try{
    const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify({action:'operators'})});
    const d=await r.json();
    if(Array.isArray(d.operators)){operators=d.operators;opById=Object.fromEntries(operators.map(o=>[o.id,o]));}
  }catch(e){}
  return operators;
}

// The queue-based CRM redesign (crm-queue-navigation.js) owns the family
// list/panel DOM now - there is no more #leadList, so badge injection used
// to be dead code here. Instead of duplicating that DOM ownership, expose
// the operator name-lookup this file already maintains (opById/leadAttrib)
// and let crm-queue-navigation.js read it directly when it renders.
window.AqoonOperators={
  nameFor,
  meId,
  attribFor:id=>leadAttrib[id]||null,
  list:()=>operators.slice()
};

function refreshOppBadges(){
  document.querySelectorAll('#salesPipeline .opportunity').forEach(card=>{
    const id=card.dataset.opp;
    if(!id)return;
    const rec=oppRecords[id];
    if(!rec)return;
    const content=card.querySelector('.opp-content'),now=card.querySelector('.opp-now');
    if(!content||!now)return;
    let badge=card.querySelector('.operator-badge-wrap');
    if(!badge){badge=document.createElement('div');badge.className='operator-badge-wrap';content.insertBefore(badge,now);}
    const ownerName=nameFor(rec.owner_operator_id),mine=rec.owner_operator_id&&rec.owner_operator_id===meId();
    let html='<span class="op-tag'+(rec.owner_operator_id?'':' op-tag-empty')+'">'+(ownerName?esc(ownerName):'Unowned')+'</span>';
    if(!mine&&meId())html+='<button type="button" class="op-claim" data-claim-opp="1">Make mine</button>';
    badge.innerHTML=html;
    const claim=badge.querySelector('[data-claim-opp]');
    if(claim)claim.onclick=e=>{e.stopPropagation();claimOpportunity(id)};
  });
}
async function claimOpportunity(id){
  const rec=oppRecords[id];if(!rec)return;
  try{
    await fetch(OPS_END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify(Object.assign({},rec,{action:'save_opportunity',owner_operator_id:meId(),operator_id:meId()}))});
    document.getElementById('refresh')?.click();
  }catch(e){}
}

function scheduleBadgeRefresh(){
  // Only the sales-pipeline badges need an explicit refresh here: this
  // function runs from patchFetch's response interceptor, which finishes
  // populating opById/leadAttrib *before* the original caller (app.js,
  // incomplete-intake.js, etc.) gets the resolved response - so by the time
  // any of them run their own renderAll()+dispatchEvent('dataUpdated'),
  // operator names are already available and CrmQueues picks them up on
  // that same, single render pass. Dispatching a second 'dataUpdated' here
  // would just trigger a redundant rebuild of the family list ~80ms later,
  // detaching whatever the operator is mid-click on.
  clearTimeout(badgeTimer);
  badgeTimer=setTimeout(refreshOppBadges,80);
}

function patchFetch(){
  if(window.__aqoonOperatorFetchPatch)return;
  window.__aqoonOperatorFetchPatch=1;
  const orig=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isLeads=url.includes('/family-leads-admin'),isOps=url.includes('/ops-admin');
    if((isLeads||isOps)&&init&&typeof init.body==='string'){
      try{
        const body=JSON.parse(init.body);
        const operator=meId();
        if(operator&&!('operator_id' in body)&&((isLeads&&MUTATING_LEAD_ACTIONS.has(body.action))||(isOps&&MUTATING_OPS_ACTIONS.has(body.action)))){
          body.operator_id=operator;
          init=Object.assign({},init,{body:JSON.stringify(body)});
        }
        const token=authToken();
        if(token&&!(init.headers&&init.headers.Authorization)){
          init=Object.assign({},init,{headers:Object.assign({},init.headers,{Authorization:'Bearer '+token})});
        }
      }catch(e){}
    }
    const response=await orig(input,init);
    if(!isLeads&&!isOps)return response;
    try{
      const data=await response.clone().json();
      if(Array.isArray(data.operators)&&data.operators.length){operators=data.operators;opById=Object.fromEntries(operators.map(o=>[o.id,o]));}
      if(isLeads&&Array.isArray(data.leads)){
        leadAttrib={};
        data.leads.forEach(l=>{leadAttrib[l.id]={assigned_operator_id:l.assigned_operator_id||null,last_actor_id:l.last_actor_id||null,consent_relevant_updates_ok:l.consent_relevant_updates_ok,consent_outcome_followup_ok:l.consent_outcome_followup_ok};});
        scheduleBadgeRefresh();
      }
      if(isOps&&Array.isArray(data.opportunities)){
        oppRecords={};
        data.opportunities.forEach(o=>{oppRecords[o.id]=o;});
        scheduleBadgeRefresh();
      }
    }catch(e){}
    return response;
  };
}
// Wrap window.fetch immediately, before DOMContentLoaded: app.js's own
// bootstrap (last line of app.js, run at parse time) fires an unauthenticated
// ping the instant it loads. If patchFetch ran any later than this, that
// very first request would go out without the operator's JWT attached.
patchFetch();

function showSignIn(){clearMe();renderPill();pickerMode='signin';ensureAuthUI()}

// #lock has no "hidden" class in the initial markup - it is visible from
// first paint, before app.js's own async auto-login ping has had a chance
// to resolve. So "lock is visible" cannot be trusted as "genuinely locked
// out" until that ping has actually settled one way or the other:
// app.js hides #lock on success, or its lock() clears
// sessionStorage.aqoon_tracker_password on failure (removing an absent
// "hidden" class is a no-op that never fires a MutationObserver, so this
// first-load case has to be polled rather than observed).
function decideInitialAuthUI(){
  if(!sessionStorage.getItem('aqoon_tracker_password')){showSignIn();return}
  let tries=0;
  const check=()=>{
    const appEl=document.getElementById('app');
    if(appEl&&!appEl.classList.contains('hidden'))return; // auto-login succeeded
    if(!sessionStorage.getItem('aqoon_tracker_password')){showSignIn();return} // app.js's lock() ran: ping failed
    if(tries++<25)setTimeout(check,120);else showSignIn(); // ~3s safety timeout
  };
  check();
}

function start(){
  injectStyles();
  ensurePill();
  renderPill();
  const appEl=document.getElementById('app'),lockEl=document.getElementById('lock');
  if(appEl){
    const obs=new MutationObserver(()=>{
      renderPill();
      if(!appEl.classList.contains('hidden'))scheduleBadgeRefresh();
    });
    obs.observe(appEl,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
    if(!appEl.classList.contains('hidden'))scheduleBadgeRefresh();
  }
  if(lockEl){
    // Later, mid-session 401s are a real hidden->visible transition (the
    // app was unlocked, now it is not), so the observer alone is reliable here.
    const lockObs=new MutationObserver(()=>{if(!lockEl.classList.contains('hidden'))showSignIn()});
    lockObs.observe(lockEl,{attributes:true,attributeFilter:['class']});
  }
  decideInitialAuthUI();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

// ---- crm-call-history.js ----
(()=>{'use strict';
const END_CALL_LOG='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

let callHistoryCache={};

async function loadCallHistory(leadId){
  if(!leadId)return null;

  const now=Date.now();
  const cached=callHistoryCache[leadId];
  if(cached&&now-cached.expiry<60000)return cached.data;

  try{
    const r=await fetch(END_CALL_LOG,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':pw()},
      body:JSON.stringify({action:'get_call_history',lead_id:leadId}),
      cache:'no-store'
    });
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.calls){
      callHistoryCache[leadId]={data:d.calls,expiry:now};
      return d.calls;
    }
  }catch(e){
    console.warn('Failed to load call history:',e.message);
  }
  return null;
}

function formatDate(dateStr){
  if(!dateStr)return'—';
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function formatTime(dateStr){
  if(!dateStr)return'';
  const d=new Date(dateStr);
  return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
}

function renderCallHistorySection(calls){
  if(!calls||!calls.length){
    return '<div class="crm-call-history-empty">No calls recorded yet</div>';
  }

  return calls.slice(-10).reverse().map(call=>{
    const date=formatDate(call.created_at);
    const time=formatTime(call.created_at);
    const outcome=call.outcome||call.call_outcome||'unknown';
    const operator=call.operator_name||'—';
    const notes=call.notes||'';
    const callback=call.next_follow_up_at?`${formatDate(call.next_follow_up_at)} ${formatTime(call.next_follow_up_at)}`:'';

    const outcomeClass=`call-outcome-${outcome}`;
    const outcomeLabel={'reached':'Spoke to them','no_answer':'No answer','call_later':'Call back later','busy':'Busy'}[outcome]||outcome;

    return `
      <div class="crm-call-history-item">
        <div class="crm-call-header">
          <div class="crm-call-time">${esc(date)} ${esc(time)}</div>
          <span class="call-outcome-badge ${esc(outcomeClass)}">${esc(outcomeLabel)}</span>
        </div>
        <div class="crm-call-details"><small>Operator: ${esc(operator)}</small>${callback?`<small> · Callback: ${esc(callback)}</small>`:''}</div>
        ${notes?`<div class="crm-call-notes">${esc(notes)}</div>`:''}
      </div>
    `;
  }).join('');
}

// Called by crm-queue-navigation.js's family panel (not the old, deleted
// context-panel chain this file used to depend on - that chain was never
// actually invoked by anything real, so this viewer never rendered before).
// Styling comes from the already-linked crm-call-history.css, not injected
// here, since duplicating it inline would just fight the cascade.
async function renderInto(container,leadId){
  if(!container||!leadId)return;
  container.innerHTML='<div class="crm-call-history-empty">Loading call history…</div>';
  const calls=await loadCallHistory(leadId);
  container.innerHTML=renderCallHistorySection(calls);
}

window.AqoonCallHistory={renderInto,load:loadCallHistory,render:renderCallHistorySection};
})();

// ---- multineed-adapter.js ----
(()=>{'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const response=await originalFetch(input,init);
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.includes('/family-leads-admin')||!init||!init.body)return response;
    const requestBody=JSON.parse(init.body);
    if(requestBody.action!=='list')return response;
    const data=await response.clone().json();
    if(!data||!Array.isArray(data.leads))return response;
    data.leads=data.leads.map(lead=>{
      const extras=Array.isArray(lead.additional_needs)?lead.additional_needs:[];
      if(!extras.length)return lead;
      const line='Other needs: '+extras.map(x=>[x.main_need,x.sub_need].filter(Boolean).join(' · ')).filter(Boolean).join(' | ');
      return Object.assign({},lead,{notes:[line,lead.notes].filter(Boolean).join('\n')});
    });
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
  }catch(_){return response;}
};
})();

// ---- app.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
let password='',leads=[],partials=[],analytics={},programs=[],activeLead=null,answers={},activeQuestions=[],loading=null;
window.AqoonInterview={activeLead:null,currentAnswers:{}};
window.AqoonApp={get leads(){return leads},get partials(){return partials},get programs(){return programs},updateLead:(id,patch)=>updateLead(id,patch)};
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function api(body){return fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password},body:JSON.stringify(body)}).then(async r=>{let d={};try{d=await r.json()}catch{}if(r.status===401){lock();throw Error('Password expired or incorrect')}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d})}
function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}
function fmtHour(v){try{return new Intl.DateTimeFormat('fi-FI',{hour:'2-digit'}).format(new Date(v))}catch{return''}}
function fmtDay(v){try{return new Intl.DateTimeFormat('fi-FI',{day:'numeric',month:'short'}).format(new Date(v))}catch{return''}}
function err(m){$('err').textContent=m||'';$('err').classList.toggle('hidden',!m)}
function lock(){sessionStorage.removeItem('aqoon_tracker_password');password='';$('app').classList.add('hidden');$('lock').classList.remove('hidden')}
function tab(n){document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));$(n).classList.remove('hidden');document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===n));window.scrollTo(0,0)}
function load(){if(loading)return loading;err('');loading=Promise.all([api({action:'list'}),api({action:'analytics',days:Number($('days').value)}),api({action:'programs'})]).then(([l,a,p])=>{leads=l.leads||[];partials=l.incomplete_contacts||[];analytics=a;programs=p.programs||[];renderAll();window.dispatchEvent(new Event('dataUpdated'))}).catch(e=>err(e.message)).finally(()=>loading=null);return loading}
function renderAll(){renderPulse();renderDashboard();renderAnalytics();correctValidationNote()}
function renderPulse(){$('pulseIncomplete').textContent=partials.length;$('pulseFirst').textContent=leads.filter(x=>x.status==='new'&&!due(x)).length;$('pulseFollowup').textContent=leads.filter(due).length;$('pulseActive').textContent=leads.filter(x=>x.status!=='new'&&x.status!=='resolved'&&!due(x)).length}
function correctValidationNote(){const f=analytics.flow||{},val=f.validation_error||0;if(val)$('validationNote').innerHTML='<strong>'+val+' session'+(val===1?'':'s')+' hit contact validation.</strong> Some families corrected the field and continued, so this is diagnostic friction—not an automatic loss.'}
function countBy(arr,key){const o={};arr.forEach(x=>{const k=x[key];if(k)o[k]=(o[k]||0)+1});return o}
function due(x){return !!(x.next_follow_up_at&&new Date(x.next_follow_up_at)<=new Date())}
function sla(x){if(x.status!=='new'||!x.created_at)return null;const age=(Date.now()-new Date(x.created_at).getTime())/36e5;if(!Number.isFinite(age))return null;const left=48-age;if(left<=0)return{kind:'overdue',left,label:'OVERDUE '+Math.max(1,Math.ceil(-left))+'h'};if(left<=24)return{kind:'urgent',left,label:Math.max(1,Math.ceil(left))+'h LEFT'};return{kind:'fresh',left,label:Math.ceil(left)+'h left'}}
function operationalUrgent(x){const s=sla(x);return x.status!=='resolved'&&(due(x)||['urgent','high'].includes(x.urgency)||(s&&s.kind!=='fresh'))}
function priority(x){const s=sla(x);if(s?.kind==='overdue')return 0;if(s?.kind==='urgent')return 1;if(due(x)||x.urgency==='urgent')return 2;if(x.urgency==='high')return 3;if(x.status==='new')return 4;if(x.status==='contacted')return 5;return 6}
function bars(o){const a=Object.entries(o||{}).sort((x,y)=>y[1]-x[1]).slice(0,8),max=a[0]?.[1]||1;return a.map(([k,v])=>'<div class="brow"><span>'+esc(k)+'</span><div class="track"><div class="bar" style="width:'+Math.round(v/max*100)+'%"></div></div><strong>'+v+'</strong></div>').join('')||'<span class="muted">No data yet</span>'}
function biggestLeak(){const d=analytics.flow_dropoffs;if(!d?.length)return null;return d.filter(x=>x.base>0).sort((x,y)=>y.lost-x.lost||y.loss_rate-x.loss_rate)[0]||null}
function helsinkiDay(v){const d=v instanceof Date?v:new Date(v);if(!Number.isFinite(d.getTime()))return'';return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function renderLeadSpark(){const today=helsinkiDay(new Date()),[y,m,d]=today.split('-').map(Number),days=Array.from({length:7},(_,i)=>helsinkiDay(new Date(Date.UTC(y,m-1,d-(6-i),12)))),counts=Object.fromEntries(days.map(x=>[x,0]));leads.forEach(x=>{const key=helsinkiDay(x.created_at);if(key in counts)counts[key]++});const vals=days.map(x=>counts[x]),max=Math.max(...vals,1),spark=$('newLeadSpark');if(spark)spark.innerHTML=vals.map((v,i)=>'<i style="height:'+Math.max(v?8:3,Math.round(v/max*60))+'px" title="'+days[i]+': '+v+' new lead'+(v===1?'':'s')+'"></i>').join('');const todayCount=counts[today]||0,total=vals.reduce((a,b)=>a+b,0),yesterday=vals[5]||0;if($('newLeadWeek'))$('newLeadWeek').textContent=todayCount+' today';if($('newLeadTrend'))$('newLeadTrend').textContent=total+' in the last 7 days · '+(todayCount>yesterday?'up from '+yesterday+' yesterday':todayCount<yesterday?'down from '+yesterday+' yesterday':'same as yesterday')}
function renderDashboard(){const active=leads.filter(x=>x.status!=='resolved'),urgent=active.filter(operationalUrgent).sort((a,b)=>priority(a)-priority(b)||String(a.created_at).localeCompare(String(b.created_at))),fresh=leads.filter(x=>x.status==='new'&&!operationalUrgent(x)),waiting6=active.filter(x=>x.status==='new'&&(Date.now()-new Date(x.created_at).getTime())>=216e5);$('dashNew').textContent=fresh.length;$('dashDue').textContent=urgent.length;$('dashNewList').innerHTML=fresh.slice(0,3).map(x=>'<div class="dash-row"><span>'+esc(x.name)+'</span><strong>'+esc(x.main_need||'')+'</strong></div>').join('');$('dashDueList').innerHTML=urgent.slice(0,3).map(x=>'<div class="dash-row"><span>'+esc(x.name)+'</span><strong>'+esc(sla(x)?.label||'FOLLOW-UP')+'</strong></div>').join('');$('todayDate').textContent=new Intl.DateTimeFormat('en',{weekday:'long',day:'2-digit',month:'short'}).format(new Date()).toUpperCase();$('updatedAt').textContent='Live data · updated '+new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit'}).format(new Date());$('todayHeadline').textContent=partials.length?partials.length+' incomplete intake'+(partials.length===1?' needs':'s need')+' recovery':waiting6.length?waiting6.length+' families have waited 6+ hours':urgent.length?urgent.length+' families need attention today':active.length+' active families';const ring=$('todayRing');ring.querySelector('span').textContent=active.length;const urgentN=Math.min(active.length,urgent.length),total=Math.max(1,leads.length),safe=Math.max(0,(active.length-urgentN)/total*100),risk=Math.max(safe,Math.min(96,safe+urgentN/total*100));ring.style.background='conic-gradient(var(--t) 0 '+safe+'%,var(--sand) '+safe+'% '+risk+'%,var(--r) '+risk+'% 100%)';const clock=$('slaClock');clock.querySelectorAll('.clock-marker').forEach(x=>x.remove());active.filter(x=>sla(x)).sort((a,b)=>sla(a).left-sla(b).left).slice(0,5).forEach(x=>{const s=sla(x),m=document.createElement('div');m.className='clock-marker '+(s.kind==='overdue'?'overdue':s.left<=6?'critical':s.kind);m.style.left=Math.max(2,Math.min(98,Math.max(0,s.left)/48*100))+'%';m.innerHTML='<b>'+esc(s.kind==='overdue'?'late':Math.max(1,Math.ceil(s.left))+'h')+'</b><i title="'+esc(x.name)+'">'+esc((x.name||'?')[0].toUpperCase())+'</i>';clock.appendChild(m)});const order=['reach','guide','start','retention','referral'],labels={reach:'Reach',guide:'Contact',start:'Match',retention:'Support',referral:'Referral',resolved:'Resolved'},stages=countBy(active,'journey_stage');stages.resolved=leads.filter(x=>x.status==='resolved').length;$('dashStage').textContent=Object.entries(stages).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';$('dashStages').innerHTML='';$('stageStrip').innerHTML=[...order,'resolved'].map(k=>'<div class="pipeline-seg '+k+'" style="flex:'+Math.max(.35,stages[k]||0)+'" title="'+labels[k]+': '+(stages[k]||0)+'">'+(stages[k]||'')+'</div>').join('');$('pipelineLabels').innerHTML=[...order,'resolved'].map(k=>'<span>'+labels[k]+'</span>').join('');$('pipelineTitle').textContent='Where the '+leads.length+' families are';const leak=biggestLeak();$('dashLeak').textContent=leak?leak.lost:'—';$('dashLeakText').textContent=leak?leak.from+' → '+leak.to:'Not enough current data yet';$('dashLeakMini').innerHTML=leak?'<p>'+leak.loss_rate+'% dropped here</p>':'';const next=[...partials.map(x=>({name:x.name,phone:x.phone,city:'Incomplete intake',main_need:'Recover request',critical:true})),...urgent.map(x=>Object.assign({critical:true},x)),...fresh].slice(0,3);$('doNext').innerHTML=next.map(x=>'<div class="next-row '+(x.critical?'critical':'')+'"><div><strong>'+esc(x.name)+'</strong><small>'+esc([x.city,x.main_need].filter(Boolean).join(' · '))+'</small></div><div class="next-row-actions"><a href="tel:'+esc(x.phone)+'">Call</a>'+(x.id?'<button type="button" class="next-log-btn" data-log-lead="'+esc(x.id)+'" data-log-name="'+esc(x.name)+'…27421 tokens truncated…t_type)+(e.note?': '+esc(e.note):'')+'</div>';
      });
      html+='</div>';
    }
  }
  html+='</div>';
  return html;
}

async function load(leadId){
  if(!leadId)return;
  try{
    const lc=await fetch(END_LIFECYCLE,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':sessionStorage.getItem('aqoon_tracker_password')||''},
      body:JSON.stringify({action:'list',lead_id:leadId}),
      cache:'no-store'
    }).then(r=>r.json());

    leadData={plans:lc.plans||[],events:lc.events||[]};
  }catch(e){
    // Silently fail if we can't load lifecycle data
  }
}

function render(lead,firstAnswers,currentAnswers){
  const host=$('interview-follow-up-panel');
  if(!host||!firstAnswers)return;

  const events=leadData?.events||[];
  host.innerHTML=buildRecap(firstAnswers,currentAnswers,events);
  host.querySelector('.recap-button')?.addEventListener('click',toggle);
}

function scrapeCurrentAnswers(){
  const out={};
  document.querySelectorAll('#questions [data-key]').forEach(el=>{
    const k=el.dataset.key;if(!k)return;
    if(el.matches('input,textarea,select')){if(el.value!=='')out[k]=el.value;return;}
    if(el.classList.contains('choice-row')){
      const vals=[...el.querySelectorAll('.choice.on')].map(b=>b.dataset.value);
      if(vals.length)out[k]=el.classList.contains('match-multi')?vals:vals[0];
    }
  });
  return out;
}

function toggle(){
  recapOpen=!recapOpen;
  const lead=window.AqoonInterview?.activeLead;
  const first=window.AqoonInterview?.firstAnswers;
  // Re-scraped fresh on every toggle, not the stale snapshot from when the
  // drawer opened - the operator has usually answered more by the time they
  // click "what changed".
  const current=scrapeCurrentAnswers();
  if(lead&&first)render(lead,first,current);
}

function attach(lead,firstAnswers,currentAnswers){
  let host=$('interview-follow-up-panel');
  if(!host){
    host=document.createElement('div');
    host.id='interview-follow-up-panel';
    const questions=$('questions');
    questions?.parentNode?.insertBefore(host,questions);
  }
  recapOpen=false;
  load(lead.id).then(()=>render(lead,firstAnswers,currentAnswers));
}

// Hook into interview context to show recap if this is a follow-up
const originalContextAttach=window.AqoonInterviewContext?.attach;
if(originalContextAttach){
  window.AqoonInterviewContext.attach=function(lead){
    originalContextAttach.call(this,lead);
    // If latest_interview exists, this drawer open is a follow-up (not a
    // first interview) - show the recap panel comparing first vs. current.
    if(lead.latest_interview){
      setTimeout(()=>{
        const firstAnswers=lead.latest_interview.answers||{};
        window.AqoonInterview.firstAnswers=firstAnswers;
        window.AqoonInterview.currentAnswers=scrapeCurrentAnswers();
        attach(lead,firstAnswers,window.AqoonInterview.currentAnswers);
      },100);
    }
  };
}

window.AqoonFollowUpRecap={render,attach,toggle};
})();

// ---- interview-next-steps.js ----
(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const style=document.createElement('style');
style.textContent=`.next-steps-panel{background:#fef8f3;border:1px solid #e4dfd3;border-radius:14px;padding:14px;margin:12px 0;margin-top:16px}.next-steps-title{font-size:11px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;color:#333;margin-bottom:10px}.next-steps-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.next-step-card{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:10px;font-size:12px;line-height:1.4;cursor:pointer;transition:all 120ms}.next-step-card:hover{background:#f9f8f6;border-color:#3a9b8a}.next-step-card.urgent{border-left:3px solid #d97560;background:#fef6f3}.next-step-icon{font-size:16px;margin-bottom:4px}.next-step-text{font-weight:600;color:#333;margin-bottom:2px}.next-step-hint{font-size:10px;color:#889;display:block;margin-top:4px}.next-step-highlight{outline:2px solid #3a9b8a;outline-offset:3px;border-radius:14px}`;
document.head.appendChild(style);

let nextStepsOpen=false;

function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}

async function loadLifecycle(leadId){
  if(!leadId)return null;
  try{
    const lc=await fetch(END_LIFECYCLE,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-tracker-password':pw()},
      body:JSON.stringify({action:'list',lead_id:leadId}),
      cache:'no-store'
    }).then(r=>r.json());
    return {plans:lc.plans||[],events:lc.events||[]};
  }catch(e){
    return null;
  }
}

function buildNextSteps(lead,currentAnswers,lifecycle){
  const steps=[];
  if(!lifecycle)return steps;

  const {plans,events}=lifecycle;
  const activePlan=plans?.find(p=>p.status!=='completed');
  const lastEvent=events?.[0];
  const hasPendingNeeds=currentAnswers?.cross_service_needs_all && Array.isArray(currentAnswers.cross_service_needs_all) && currentAnswers.cross_service_needs_all.length>0;
  const awaitingEvent=events?.find(e=>e.event_type==='awaiting_response');
  const daysSinceAwaiting=awaitingEvent ? Math.floor((Date.now()-new Date(awaitingEvent.occurred_at).getTime())/(24*60*60*1000)) : 0;

  if(activePlan?.status==='awaiting_outcome'){
    steps.push({
      icon:'📋',
      title:'Record outcome',
      hint:'Mark case as resolved or create new opportunity',
      urgent:false,
      action:'recordOutcome'
    });
  }

  if(hasPendingNeeds){
    steps.push({
      icon:'➕',
      title:'Log new needs',
      hint:'Cross-service needs detected. Create opportunities.',
      urgent:false,
      action:'logNeeds'
    });
  }

  if(awaitingEvent && daysSinceAwaiting>3){
    steps.push({
      icon:'⏰',
      title:'Check official response',
      hint:`Awaiting since ${daysSinceAwaiting}d. Follow up now?`,
      urgent:daysSinceAwaiting>7,
      action:'checkResponse'
    });
  }

  if(currentAnswers?.next_follow_up_at){
    const followUpDate=new Date(currentAnswers.next_follow_up_at);
    const daysUntilFollowUp=Math.ceil((followUpDate.getTime()-Date.now())/(24*60*60*1000));
    if(daysUntilFollowUp<=7 && daysUntilFollowUp>=-1){
      steps.push({
        icon:'📞',
        title:'Prepare follow-up call',
        hint:daysUntilFollowUp<0?'Overdue':'Coming up this week',
        urgent:daysUntilFollowUp<0,
        action:'prepareFollowUp'
      });
    }
  }

  return steps;
}

function renderNextSteps(lead,currentAnswers,lifecycle){
  const host=$('promptWrap');
  if(!host)return;

  const steps=buildNextSteps(lead,currentAnswers,lifecycle);
  if(!steps.length)return;

  let html='<div class="next-steps-panel">';
  html+='<div class="next-steps-title">Next steps suggested</div>';
  html+='<div class="next-steps-grid">';
  steps.forEach(s=>{
    html+='<div class="next-step-card '+(s.urgent?'urgent':'')+'" data-action="'+esc(s.action)+'">';
    html+='<div class="next-step-icon">'+s.icon+'</div>';
    html+='<div class="next-step-text">'+esc(s.title)+'</div>';
    html+='<span class="next-step-hint">'+esc(s.hint)+'</span>';
    html+='</div>';
  });
  html+='</div></div>';

  const existingPanel=host.querySelector('.next-steps-panel');
  if(existingPanel)existingPanel.remove();
  host.insertAdjacentHTML('beforeend',html);

  host.querySelectorAll('.next-step-card').forEach(card=>{
    card.addEventListener('click',()=>handleAction(card.dataset.action,lead));
  });
}

function handleAction(action,lead){
  switch(action){
    case 'recordOutcome': {
      // There's no single "record outcome" button - case-lifecycle.js
      // renders different action buttons (Submitted/Responded/Resolve/
      // Close) depending on the case plan's current status. Point the
      // operator at that panel instead of clicking a selector that never
      // matched anything.
      const panel=document.getElementById('caseLifecycle');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Open the case plan below to record what happened.');
      break;
    }
    case 'logNeeds':
      // sales_opportunities is an organization-level deal record with no
      // family_lead_id column - there is no "create an opportunity for
      // this family" feature to link to yet, so this stays a manual
      // reminder rather than implying a click-through that doesn't exist.
      alert('Cross-service needs detected for this family. Note them in the case plan below - there is no automatic link to a sales opportunity yet.');
      break;
    case 'checkResponse': {
      const panel=document.getElementById('caseLifecycle');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Check with the family or official service about the pending response, then record it in the case plan below.');
      break;
    }
    case 'prepareFollowUp': {
      const panel=document.getElementById('interview-context-panel');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.classList.add('next-step-highlight');setTimeout(()=>panel.classList.remove('next-step-highlight'),1500)}
      else alert('Review prior interview notes and prepare talking points for follow-up.');
      break;
    }
  }
}

function attach(lead,currentAnswers){
  loadLifecycle(lead.id).then(lifecycle=>{
    if(lifecycle)renderNextSteps(lead,currentAnswers,lifecycle);
  });
}

const originalSaveInterview=window.saveInterview;
if(typeof originalSaveInterview==='function'){
  window.saveInterview=async function(){
    const result=await originalSaveInterview.apply(this,arguments);
    const lead=window.AqoonInterview?.activeLead;
    const current=window.AqoonInterview?.currentAnswers;
    if(lead&&current)attach(lead,current);
    return result;
  };
}

window.AqoonNextSteps={attach};
})();

// ---- universal-proof-questions.js ----
(()=>{'use strict';
const ROOT='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
let loading=false,lastLoaded=0,currentResearchTab='overview';

const WEEKLY={enabled:false,id:'',label:'',values:['Yes','No','Not sure'],city:null};
const EXCLUSIVE=new Set(['No children','None of these','Not sure','Nothing else now']);
const ALIASES={
  entry_service_awareness:['prior_awareness'],
  entry_service_self_navigation:['self_navigation'],
  entry_blockers:['access_barriers'],
  cross_service_needs_all:['other_needs_discovered'],
  private_daycare_awareness_all:['private_daycare_awareness'],
  vantaa_hobbies_awareness_all:['harrastusten_vantaa_awareness'],
  jobseeker:['jobseeker_active']
};
// vantaa_hobbies_possible_need (below) and interview-form-enhancements.js's
// hobby_registration_help are NOT aliased on purpose - they ask different
// things (need-gate vs. how much hands-on help to give) with different
// answer sets, so copying one into the other would misclassify answers.
// hobby_registration_help's own note tells the operator to only ask it once
// this question has confirmed a need. See decision doc 0002 §2.

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function row(key,label,values,{multi=false,note='',group=''}={}){
  const q=document.createElement('div');q.className='question match-extra universal-proof-question';q.dataset.universalProof='1';if(group)q.dataset.branchGroup=group;
  q.innerHTML='<label>'+esc(label)+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+esc(key)+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+esc(note)+'</small>':'');
  const r=q.querySelector('.choice-row');r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{
    if(multi){const v=b.dataset.value;if(EXCLUSIVE.has(v)){r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');}else{r.querySelectorAll('.choice').forEach(x=>{if(EXCLUSIVE.has(x.dataset.value))x.classList.remove('on')});b.classList.toggle('on');}}
    else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');}
    syncBranches();
  });return q;
}
function head(title,sub,group=''){const h=document.createElement('div');h.className='question match-extra evidence-section';h.dataset.universalProof='1';if(group)h.dataset.branchGroup=group;h.innerHTML='<label style="font-size:17px">'+esc(title)+'</label><small class="muted" style="display:block;margin-top:5px">'+esc(sub)+'</small>';return h;}
function city(){return (document.getElementById('dMeta')?.textContent||'').split(' · ')[0].trim();}
function selected(key){const r=document.querySelector(ROOT+' .choice-row[data-key="'+key+'"]');if(!r)return[];return [...r.querySelectorAll('.choice.on')].map(b=>b.dataset.value);}
function showGroup(group,on){document.querySelectorAll(ROOT+' [data-branch-group="'+group+'"]').forEach(el=>{el.style.display=on?'':'none';if(!on){el.querySelectorAll?.('.choice.on').forEach(x=>x.classList.remove('on'));el.querySelectorAll?.('input,textarea,select').forEach(x=>{x.value=''})}});}
function syncBranches(){const kids=selected('household_children'),hasYoung=kids.includes('Under 3')||kids.includes('Age 3–6'),hasSchool=kids.includes('Grades 1–9'),work=selected('work_interest_gate')[0]||'';showGroup('daycare',hasYoung);showGroup('school',hasSchool);showGroup('vantaa-hobby',hasSchool&&city().toLowerCase()==='vantaa');showGroup('work-proof',work==='Looking for work now'||work==='Likely within 12 months');if(WEEKLY.enabled)showGroup('weekly',!WEEKLY.city||city().toLowerCase()===String(WEEKLY.city).toLowerCase());}
function exists(key){return !!document.querySelector(ROOT+' [data-key="'+key+'"]');}
function anyExists(keys){return keys.some(exists);}
function appendIfMissing(wrap,key,node){if(!exists(key))wrap.appendChild(node);}
function section(){
  const wrap=document.createElement('div');wrap.dataset.universalProofSection='1';wrap.className='universal-proof-section';
  wrap.appendChild(head('Always ask · evidence & next needs','About 1–2 minutes. Existing route questions are reused instead of repeated; only relevant branches open.'));
  appendIfMissing(wrap,'aqoon_awareness_before',row('aqoon_awareness_before','Before today, did they already know AQOON existed?',['Yes','Had seen it but never used it','No','Not sure']));
  if(!anyExists(['entry_service_awareness','prior_awareness']))wrap.appendChild(row('entry_service_awareness','Before AQOON, did they know the exact service/programme/opportunity discussed today existed?',['Yes – knew it','Had heard of it but did not understand it','No','Not sure']));
  if(!anyExists(['entry_service_self_navigation','self_navigation']))wrap.appendChild(row('entry_service_self_navigation','Without AQOON, would they have known what to do next?',['Yes','Partly / maybe','No','Not sure']));
  if(!anyExists(['entry_blockers','access_barriers']))wrap.appendChild(row('entry_blockers','What stopped them from acting before?',['Did not know it existed','Did not understand eligibility','Language','Form / digital system','Thought it cost too much','Did not know where to start','No one to ask','Childcare / timing','Transport','Trust / uncertainty','Other'],{multi:true}));
  appendIfMissing(wrap,'household_children',row('household_children','Children in the household?',['No children','Under 3','Age 3–6','Grades 1–9','Older children'],{multi:true,note:'Branch gate only — keeps the rest of the call short.'}));
  appendIfMissing(wrap,'work_interest_gate',row('work_interest_gate','Work situation for future support?',['Looking for work now','Likely within 12 months','Already working / no current need','Not looking for work now','Not sure']));

  wrap.appendChild(head('Work-system check','Only when work is relevant.','work-proof'));
  if(!anyExists(['jobseeker','jobseeker_active']))wrap.appendChild(row('jobseeker','Is job search currently active with employment services?',['Yes','No','Not sure'],{group:'work-proof'}));
  appendIfMissing(wrap,'employment_plan_status',row('employment_plan_status','Do they currently have an employment / integration / activation plan?',['Yes – employment plan','Yes – integration plan','Yes – other plan','No','Not sure'],{group:'work-proof'}));
  appendIfMissing(wrap,'work_support_awareness',row('work_support_awareness','Before AQOON, which of these did they actually understand?',['Työkokeilu','Oppisopimus','Palkkatuki','Kotoutumissuunnitelma','Työhönvalmennus','None of these','Not sure'],{multi:true,group:'work-proof'}));

  wrap.appendChild(head('Daycare cross-check','Only when there is a child under school age.','daycare'));
  if(!anyExists(['private_daycare_awareness_all','private_daycare_awareness']))wrap.appendChild(row('private_daycare_awareness_all','Before AQOON, did they know private daycare can be a realistic option too?',['Yes – understood it','Had heard of it but assumed it was expensive / not for us','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_possible_need_all',row('daycare_possible_need_all','Any daycare need now or coming up?',['Yes – now','Within 6 months','Later / when work or studies start','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_application_awareness_all',row('daycare_application_awareness_all','Would they know where/how to apply without help?',['Yes','Partly','No','Not sure'],{group:'daycare'}));
  appendIfMissing(wrap,'daycare_future_reminder',row('daycare_future_reminder','Would a reminder before the next likely application need be useful?',['Yes','Maybe','No'],{group:'daycare'}));

  wrap.appendChild(head('School / hobby cross-check','Only when there is a child in grades 1–9.','school'));
  appendIfMissing(wrap,'school_help_possible',row('school_help_possible','Any school / Wilma / support issue they may want help with?',['Yes – now','Maybe later','No','Not sure'],{group:'school'}));
  if(!anyExists(['vantaa_hobbies_awareness_all','harrastusten_vantaa_awareness']))wrap.appendChild(row('vantaa_hobbies_awareness_all','Before AQOON, did they know Harrastusten Vantaa offers free school-age hobby groups?',['Yes – knew it','Had heard something','No','Not sure'],{group:'vantaa-hobby'}));
  appendIfMissing(wrap,'vantaa_hobbies_possible_need',row('vantaa_hobbies_possible_need','Could one of their children use a free hobby place?',['Yes – wants help now','Maybe next round','No','Not sure'],{group:'vantaa-hobby'}));
  appendIfMissing(wrap,'vantaa_hobbies_reminder',row('vantaa_hobbies_reminder','If groups are full now, should AQOON remind them before the next registration/opening?',['Yes','Maybe','No'],{group:'vantaa-hobby'}));

  if(WEEKLY.enabled&&WEEKLY.id&&WEEKLY.label)wrap.appendChild(row('weekly_'+WEEKLY.id,WEEKLY.label,WEEKLY.values,{group:'weekly',note:'Rotating research question. Use a new ID if wording/meaning changes.'}));

  wrap.appendChild(head('Finish','Capture broader demand without forcing it.'));
  if(!anyExists(['cross_service_needs_all','other_needs_discovered']))wrap.appendChild(row('cross_service_needs_all','After talking, what else is genuinely relevant?',['Work','School / child support','Daycare','Children’s hobbies','Finnish / education','Kela / benefits','Programmes / training','Housing','Letters / applications','Nothing else now'],{multi:true,note:'Only tick confirmed needs.'}));
  appendIfMissing(wrap,'aqoon_return_intent',row('aqoon_return_intent','If another Finnish-system question comes up, would they contact AQOON again?',['Yes','Maybe','No','Not sure']));
  appendIfMissing(wrap,'relevant_updates_ok',row('relevant_updates_ok','Okay for AQOON to contact them when a clearly relevant opportunity/application window opens?',['Yes','No','Ask each time / not sure'],{note:'Operational permission only; do not treat as blanket marketing consent.'}));
  appendIfMissing(wrap,'outcome_followup_ok',row('outcome_followup_ok','Okay for AQOON to check later what happened with today’s issue?',['Yes','No','Not sure']));
  return wrap;
}
function ready(root){return !!root.querySelector('.question [data-key]');}
function ensure(){const root=document.querySelector(ROOT);if(!root||!ready(root))return;let s=root.querySelector('[data-universal-proof-section="1"]');if(!s){s=section();root.appendChild(s);}else if(root.lastElementChild!==s)root.appendChild(s);syncBranches();}

function scrapeAnswers(){
  const out={};document.querySelectorAll(ROOT+' [data-key]').forEach(el=>{const k=el.dataset.key;if(!k||el.closest('[data-branch-group][style*="display: none"]'))return;if(el.matches('input,textarea,select')){if(el.value!=='')out[k]=el.value;return;}if(el.classList.contains('choice-row')){const vals=[...el.querySelectorAll('.choice.on')].map(b=>b.dataset.value);if(vals.length)out[k]=el.classList.contains('match-multi')?vals:vals[0];}});
  Object.entries(ALIASES).forEach(([target,sources])=>{if(out[target]!==undefined)return;for(const source of sources){if(out[source]!==undefined){out[target]=out[source];break;}}});
  return out;
}
function patchSaveFetch(){if(window.__aqoonUniversalSavePatch)return;window.__aqoonUniversalSavePatch=1;const original=window.fetch.bind(window);window.fetch=async function(input,init){try{const url=typeof input==='string'?input:(input&&input.url)||'';if(url.includes('family-leads-admin')&&init?.body){const body=JSON.parse(init.body);if(body.action==='save_interview'){const extra=scrapeAnswers();body.answers=Object.assign({},body.answers||{},extra);const lines=Object.entries(extra).map(([k,v])=>'- '+k+': '+(Array.isArray(v)?v.join(', '):v));if(lines.length)body.research_prompt=(body.research_prompt||'')+'\n\nUNIVERSAL INTERVIEW EVIDENCE / CROSS-NEEDS\n'+lines.join('\n');init=Object.assign({},init,{body:JSON.stringify(body)});}}}catch(e){console.warn('AQOON universal interview save merge skipped',e);}return original(input,init);};}

function count(ints,key){const c={};let n=0;(ints||[]).forEach(i=>{let v=i.answers&&i.answers[key];if(v===undefined&&ALIASES[key])for(const s of ALIASES[key]){if(i.answers?.[s]!==undefined){v=i.answers[s];break;}}if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>c[x]=(c[x]||0)+1)});return{n,c};}
function pct(d,match){if(!d.n)return 0;let v=0;Object.entries(d.c).forEach(([k,n])=>{if(match(k))v+=n});return Math.round(v/d.n*100);}
function metric(label,value){return'<div class="research-kpi"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';}
function question(title,d){const es=Object.entries(d.c).sort((a,b)=>b[1]-a[1]);if(!es.length)return'';const max=Math.max(...es.map(x=>x[1]),1);return'<div class="research-question"><div class="research-qtop"><strong>'+esc(title)+'</strong><small>n='+d.n+'</small></div>'+es.map(([k,v])=>'<div class="research-answer"><span title="'+esc(k)+'">'+esc(k)+'</span><div class="research-track"><div class="research-fill" style="width:'+Math.max(4,Math.round(v/max*100))+'%"></div></div><b>'+v+' · '+Math.round(v/d.n*100)+'%</b></div>').join('')+'</div>';}
function pane(id,questions,emptyText){const html=questions.filter(Boolean).join('');return'<div class="research-pane" data-research-pane="'+id+'" '+(id===currentResearchTab?'':'hidden')+'>'+(html||'<div class="research-empty">'+esc(emptyText||'No answers in this section yet.')+'</div>')+'</div>';}
function tabButton(id,label){return'<button type="button" class="research-tab '+(id===currentResearchTab?'on':'')+'" data-research-tab="'+id+'">'+esc(label)+'</button>';}
function ensureAnalytics(){
  document.getElementById('interviewEvidenceCard')?.remove();
  let card=document.getElementById('universalProofAnalytics');if(card)return card;
  const anchor=document.querySelector('.analytics-view .breakdown-card');if(!anchor)return null;
  card=document.createElement('article');card.className='command-card research-card';card.id='universalProofAnalytics';card.innerHTML='<div class="research-head"><div><h3>Interview insights</h3><p class="sub">Aggregated answers from completed first interviews.</p></div><div class="research-count" id="researchCount">0</div></div><div id="universalProofBody"><div class="research-empty">Loading interview insights…</div></div>';
  anchor.insertAdjacentElement('afterend',card);return card;
}
function bindResearchTabs(){document.querySelectorAll('[data-research-tab]').forEach(b=>b.onclick=()=>{currentResearchTab=b.dataset.researchTab;document.querySelectorAll('[data-research-tab]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('[data-research-pane]').forEach(p=>p.hidden=p.dataset.researchPane!==currentResearchTab);});}
async function load(force){
  const card=ensureAnalytics(),body=document.getElementById('universalProofBody');if(!card||!body||loading)return;if(!force&&lastLoaded&&Date.now()-lastLoaded<30000)return;
  const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;loading=true;body.innerHTML='<div class="research-empty">Loading interview insights…</div>';
  try{
    const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');
    const m=new Map();(d.interviews||[]).filter(i=>i.status==='completed').forEach(i=>{const o=m.get(i.lead_id);if(!o||String(i.updated_at)>String(o.updated_at))m.set(i.lead_id,i)});
    const ints=[...m.values()],core=ints.filter(i=>i.answers&&Object.keys(i.answers).some(k=>['aqoon_awareness_before','entry_service_awareness','prior_awareness','household_children','work_interest_gate'].includes(k)));
    document.getElementById('researchCount').textContent=core.length;
    const aware=count(core,'entry_service_awareness'),navigate=count(core,'entry_service_self_navigation'),other=count(core,'cross_service_needs_all');
    const unawarePct=pct(aware,k=>k==='No'||k.includes('did not understand'));
    const needsCount=Object.entries(other.c).filter(([k])=>k!=='Nothing else now').reduce((s,[,v])=>s+v,0);
    const workRelevant=core.filter(i=>{const v=i.answers?.work_interest_gate;return v==='Looking for work now'||v==='Likely within 12 months'});
    const young=core.filter(i=>{const v=i.answers?.household_children;const a=Array.isArray(v)?v:[v];return a.includes('Under 3')||a.includes('Age 3–6')});
    const school=core.filter(i=>{const v=i.answers?.household_children;const a=Array.isArray(v)?v:[v];return a.includes('Grades 1–9')});
    const vantaa=school.filter(i=>{const lead=(d.leads||[]).find(l=>l.id===i.lead_id);return String(lead?.city||'').toLowerCase()==='vantaa'||i.answers?.vantaa_hobbies_awareness_all!==undefined||i.answers?.harrastusten_vantaa_awareness!==undefined});
    body.innerHTML='<div class="research-kpis">'+metric('Interviewed',core.length)+metric('Didn’t know entry',aware.n?unawarePct+'%':'—')+metric('Extra needs',other.n?needsCount:'—')+'</div>'+
      '<div class="research-tabs">'+tabButton('overview','Overview')+tabButton('work','Work')+tabButton('daycare','Daycare')+tabButton('vantaa','Vantaa')+tabButton('next','Next needs')+'</div>'+
      pane('overview',[
        question('Knew AQOON before',count(core,'aqoon_awareness_before')),
        question('Knew the service / programme',aware),
        question('Could navigate without AQOON',navigate),
        question('What blocked action',count(core,'entry_blockers')),
        question('Children in household',count(core,'household_children'))
      ],'Complete a few interviews and the baseline awareness picture will appear here.')+
      pane('work',[
        question('Work situation',count(core,'work_interest_gate')),
        question('Active jobseeker registration',count(workRelevant,'jobseeker')),
        question('Employment / integration plan',count(workRelevant,'employment_plan_status')),
        question('Supports understood before',count(workRelevant,'work_support_awareness'))
      ],'No work-relevant interview answers yet.')+
      pane('daycare',[
        question('Private daycare awareness',count(young,'private_daycare_awareness_all')),
        question('Daycare need timing',count(young,'daycare_possible_need_all')),
        question('Could apply without help',count(young,'daycare_application_awareness_all')),
        question('Would a future reminder help',count(young,'daycare_future_reminder'))
      ],'No interviews with a daycare-age child have answered these questions yet.')+
      pane('vantaa',[
        question('Harrastusten Vantaa awareness',count(vantaa,'vantaa_hobbies_awareness_all')),
        question('Possible free-hobby need',count(vantaa,'vantaa_hobbies_possible_need')),
        question('Reminder before next opening',count(vantaa,'vantaa_hobbies_reminder')),
        question('School / Wilma support need',count(school,'school_help_possible'))
      ],'No relevant Vantaa school-age family answers yet.')+
      pane('next',[
        question('Other needs uncovered',other),
        question('Would return to AQOON',count(core,'aqoon_return_intent')),
        question('Relevant update permission',count(core,'relevant_updates_ok')),
        question('Outcome follow-up okay',count(core,'outcome_followup_ok'))
      ],'No cross-need or follow-up answers yet.')+
      '<div class="research-callout">Percentages use only people who were actually asked and answered that question. Conditional sections do not use all interviews as the denominator.</div>';
    bindResearchTabs();lastLoaded=Date.now();
  }catch(e){body.innerHTML='<div class="research-empty">Could not load interview insights: '+esc(e.message||e)+'</div>';}finally{loading=false;}
}

const obs=new MutationObserver(()=>{ensure();document.getElementById('interviewEvidenceCard')?.remove();});
// ensureAnalytics()/load() built a duplicate "Interview insights" analytics
// card that analytics-mobile-v2.css permanently hides (#aqResearchPulse in
// analytics-mobile-v2.js is the one visible card now) - no longer called, so
// this file stops fetching/computing an aggregate that's never shown.
function start(){patchSaveFetch();const r=document.querySelector(ROOT);if(r)obs.observe(r,{childList:true,subtree:true});ensure();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
document.addEventListener('click',e=>{if(e.target.closest('[data-interview]'))setTimeout(ensure,180)},false);
})();

// ---- incomplete-intake.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-incomplete-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const SUBS={
  'Carruur iyo skuul':['Päiväkoti ama xannaano','Esiopetus','Skuulka iyo taageerada ilmaha','Harrastus ama ciyaar','Codsi ama diiwaangelin'],
  'Shaqo':['Shaqo raadis','CV ama codsi shaqo','Tababar ama xirfad','Bilaabidda ganacsi'],
  'Waxbarasho':['Barashada Finnish-ka','YKI','Waxbarasho ama shahaado','Wax kale oo waxbarasho ah'],
  'Arrin kale':['Wax aan kor ku qornayn']
};
let active=null;
function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
async function api(body){
  const headers={'Content-Type':'application/json','x-tracker-password':pw()},token=authToken();
  if(token)headers.Authorization='Bearer '+token;
  const r=await fetch(END,{method:'POST',headers,body:JSON.stringify(body),cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d
}
function ensureUI(){if($('incompleteDrawer'))return;const style=document.createElement('style');style.textContent='.intake-select{width:100%;min-height:52px;border:1px solid #e4dfd3;border-radius:16px;background:#fff;padding:10px 12px;font:inherit;color:#123554}.intake-error{color:#a33a32;font-size:13px;margin-top:8px}.intake-hint{font-size:12px;color:#687281;margin:5px 0 0}';document.head.appendChild(style);
const el=document.createElement('section');el.id='incompleteDrawer';el.className='drawer hidden';el.innerHTML='<div class="drawer-card"><div class="drawer-top"><div><h2 id="incName">Finish request</h2><small class="muted" id="incMeta"></small></div><button class="btn secondary" id="incClose" type="button">Close</button></div><div class="question"><label>City</label><input id="incCity" list="incCities" placeholder="Vantaa, Helsinki, Espoo…"><datalist id="incCities"><option>Vantaa</option><option>Helsinki</option><option>Espoo</option><option>Tampere</option></datalist></div><div class="question"><label>What do they mainly need?</label><select id="incMain" class="intake-select"><option value="">Choose</option><option>Carruur iyo skuul</option><option>Shaqo</option><option>Waxbarasho</option><option>Arrin kale</option></select></div><div class="question hidden" id="incAgeWrap"><label>Child stage</label><select id="incAge" class="intake-select"><option value="">Not sure</option><option value="under7">Daycare or preschool</option><option value="over7">School-age</option></select></div><div class="question"><label>What specifically?</label><select id="incSub" class="intake-select" disabled><option value="">Choose the main need first</option></select><p class="intake-hint">Ask this while you are on the call. It completes the short intake before the first interview; it is not an eligibility decision.</p></div><div id="incErr" class="intake-error"></div><button class="btn primary" id="incSave" type="button" style="width:100%;padding:14px">Save &amp; start first interview</button></div>';document.body.appendChild(el);
$('incClose').onclick=close;$('incMain').onchange=renderSubs;$('incSave').onclick=save;el.addEventListener('click',e=>{if(e.target===el)close()});}
function renderSubs(){const main=$('incMain').value,list=SUBS[main]||[];$('incSub').disabled=!list.length;$('incSub').innerHTML=list.length?'<option value="">Choose</option>'+list.map(x=>'<option>'+esc(x)+'</option>').join(''):'<option value="">Choose the main need first</option>';$('incAgeWrap').classList.toggle('hidden',main!=='Carruur iyo skuul')}
function open(contact){ensureUI();active=contact;$('incName').textContent='Finish request · '+(contact.name||'Family');$('incMeta').textContent=contact.phone||'';$('incCity').value=contact.city||'';$('incMain').value=contact.main_need||'';renderSubs();if(contact.sub_need)$('incSub').value=contact.sub_need;if(contact.age_group)$('incAge').value=contact.age_group;$('incErr').textContent='';$('incompleteDrawer').classList.remove('hidden');document.body.style.overflow='hidden';setTimeout(()=>$('incCity').focus(),60)}
function close(){$('incompleteDrawer')?.classList.add('hidden');document.body.style.overflow='';active=null}
// Each of these calls the visible refresh button, which runs app.js's own
// load() (leads + analytics + programs) and, once that's genuinely fresh,
// dispatches 'dataUpdated' itself - the single source of truth for a
// re-render. Dispatching 'dataUpdated' here too used to force a second,
// wasted CrmQueues render against still-stale in-memory data a moment
// before the real one, doubling the visible lag on every assign/remove/
// finish/create action.
async function save(){if(!active)return;const city=$('incCity').value.trim(),main=$('incMain').value,sub=$('incSub').value,age=main==='Carruur iyo skuul'?$('incAge').value:'';if(!city||!main||!sub){$('incErr').textContent='Add the city, main need and specific need first.';return}const btn=$('incSave');btn.disabled=true;btn.textContent='Saving…';$('incErr').textContent='';try{
  const result=await api({action:'complete',id:active.id,city,main_need:main,sub_need:sub,age_group:age||null});
  close();
  // openInterview reads the lead straight out of window.AqoonApp.leads; a
  // freshly-created lead isn't in that array yet at this exact moment (it
  // only exists once refresh's own load() resolves), so calling it here
  // used to silently no-op - the drawer never opened, with no error shown.
  // Wait for the same 'dataUpdated' event that load() dispatches once the
  // new lead is actually in memory, then open it.
  if(result.lead_id&&typeof window.openInterview==='function'){
    const openWhenReady=()=>{window.removeEventListener('dataUpdated',openWhenReady);window.openInterview(result.lead_id)};
    window.addEventListener('dataUpdated',openWhenReady);
  }
  const refresh=$('refresh');if(refresh)refresh.click()
}catch(e){$('incErr').textContent=e.message||'Could not save.'}finally{btn.disabled=false;btn.textContent='Save & start first interview'}}
async function remove(contact,onDone){if(!confirm('Delete the unfinished intake for '+(contact.name||'this contact')+'? This removes the saved contact details and cannot be undone. Anonymous funnel counts stay intact.'))return;try{await api({action:'delete',id:contact.id});const refresh=$('refresh');if(refresh)refresh.click();if(onDone)onDone()}catch(e){alert(e.message||'Could not delete this unfinished intake.')}}
async function assign(contact,operatorId,onDone){try{await api({action:'assign',id:contact.id,operator_id:operatorId});const refresh=$('refresh');if(refresh)refresh.click();if(onDone)onDone()}catch(e){alert(e.message||'Could not assign this intake.')}}
// Called directly by the queue UI (crm-queue-navigation.js) with the partial
// record it already has in memory — no separate fetch/sync needed here.
window.AqoonIncompleteIntake={open,remove,assign};
})();

// ---- human-labels.js ----
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

// ---- analytics-mobile-v2.js ----
(()=>{'use strict';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const $=s=>document.querySelector(s);
let loadedAt=0,loading=false,active='access';
const ALIASES={entry_service_awareness:['prior_awareness'],entry_service_self_navigation:['self_navigation'],entry_blockers:['access_barriers'],cross_service_needs_all:['other_needs_discovered'],private_daycare_awareness_all:['private_daycare_awareness'],vantaa_hobbies_awareness_all:['harrastusten_vantaa_awareness'],jobseeker:['jobseeker_active']};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function val(i,key){let v=i?.answers?.[key];if(v===undefined&&ALIASES[key])for(const k of ALIASES[key]){if(i?.answers?.[k]!==undefined){v=i.answers[k];break}}return v}
function dist(ints,key){const c={};let n=0;ints.forEach(i=>{const v=val(i,key);if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>c[x]=(c[x]||0)+1)});return{n,c}}
function rate(d,fn){if(!d.n)return null;let hit=0;Object.entries(d.c).forEach(([k,n])=>{if(fn(String(k)))hit+=n});return{pct:Math.round(hit/d.n*100),hit,n:d.n}}
function signal(label,r){if(!r)return'';return'<div class="aq-signal"><label>'+esc(label)+'</label><div class="aq-signal-main"><strong>'+r.pct+'%</strong><small>'+r.hit+' / '+r.n+'</small></div><div class="aq-meter"><i style="width:'+r.pct+'%"></i></div></div>'}
function ranks(label,d){const es=Object.entries(d.c).sort((a,b)=>b[1]-a[1]).slice(0,4);if(!es.length)return'';const max=es[0][1]||1;return'<div class="aq-signal wide"><label>'+esc(label)+'</label>'+es.map(([k,v])=>'<div class="aq-rank"><span title="'+esc(k)+'">'+esc(k)+'</span><div class="aq-meter"><i style="width:'+Math.round(v/max*100)+'%"></i></div><b>'+v+'</b></div>').join('')+'</div>'}
function kpi(label,r){return'<div class="aq-research-kpi"><span>'+esc(label)+'</span><strong>'+(r?r.pct+'%':'—')+'</strong></div>'}
function hideOld(){document.querySelectorAll('#interviewEvidenceCard,#universalProofAnalytics').forEach(x=>x.style.setProperty('display','none','important'));document.querySelectorAll('#analytics details').forEach(d=>{const t=d.querySelector('summary')?.textContent?.trim().toLowerCase()||'';if(t.includes('interview evidence')||t.includes('universal interview'))d.style.setProperty('display','none','important')})}
function ensureCard(){hideOld();let c=$('#aqResearchPulse');if(c)return c;const anchor=$('#analytics .breakdown-card');if(!anchor)return null;c=document.createElement('article');c.id='aqResearchPulse';c.className='command-card aq-research-card';c.innerHTML='<div class="aq-research-head"><div><h3>Interview signals</h3><p>Fast proof from completed first interviews</p></div><div class="aq-research-n" id="aqResearchN">0</div></div><div id="aqResearchBody"><div class="aq-empty">No interview answers yet.</div></div>';anchor.insertAdjacentElement('afterend',c);return c}
function tab(id,label){return'<button type="button" class="aq-research-tab '+(active===id?'on':'')+'" data-aq-tab="'+id+'">'+label+'</button>'}
function pane(id,html){return'<div class="aq-research-pane" data-aq-pane="'+id+'" '+(active===id?'':'hidden')+'>'+(html||'<div class="aq-empty">No answers in this section yet.</div>')+'</div>'}
function bind(){document.querySelectorAll('[data-aq-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.aqTab;document.querySelectorAll('[data-aq-tab]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('[data-aq-pane]').forEach(p=>p.hidden=p.dataset.aqPane!==active)})}
async function load(force=false){const card=ensureCard(),body=$('#aqResearchBody');if(!card||!body||loading)return;if(!force&&loadedAt&&Date.now()-loadedAt<30000)return;const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;loading=true;try{const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');const latest=new Map();(d.interviews||[]).filter(i=>i.status==='completed').forEach(i=>{const old=latest.get(i.lead_id);if(!old||String(i.updated_at)>String(old.updated_at))latest.set(i.lead_id,i)});const ints=[...latest.values()],core=ints.filter(i=>i.answers&&Object.keys(i.answers).length);$('#aqResearchN').textContent=core.length;
const aware=rate(dist(core,'entry_service_awareness'),k=>k==='No'||k.includes('did not understand'));
const navigate=rate(dist(core,'entry_service_self_navigation'),k=>k==='No'||k.includes('Partly'));
const extra=rate(dist(core,'cross_service_needs_all'),k=>k!=='Nothing else now');
const job=rate(dist(core,'jobseeker'),k=>k==='No'||k==='Not sure');
const plan=rate(dist(core,'employment_plan_status'),k=>k==='No'||k==='Not sure');
const privateDaycare=rate(dist(core,'private_daycare_awareness_all'),k=>k==='No'||k.includes('assumed'));
const daycareApply=rate(dist(core,'daycare_application_awareness_all'),k=>k==='No'||k==='Partly');
const hobbyAware=rate(dist(core,'vantaa_hobbies_awareness_all'),k=>k==='No'||k.includes('heard something'));
const hobbyNeed=rate(dist(core,'vantaa_hobbies_possible_need'),k=>k.startsWith('Yes')||k.startsWith('Maybe'));
const ret=rate(dist(core,'aqoon_return_intent'),k=>k==='Yes'||k==='Maybe');
const updates=rate(dist(core,'relevant_updates_ok'),k=>k==='Yes');
const follow=rate(dist(core,'outcome_followup_ok'),k=>k==='Yes');
body.innerHTML='<div class="aq-research-kpis">'+kpi('Didn’t know option',aware)+kpi('Couldn’t self-navigate',navigate)+kpi('Extra need found',extra)+'</div><div class="aq-research-tabs">'+tab('access','Access')+tab('work','Work')+tab('families','Families')+tab('next','Next')+'</div>'+pane('access',signal('Didn’t know / understand the entry option',aware)+signal('Would not confidently know the next step',navigate)+ranks('Top barriers',dist(core,'entry_blockers')))+pane('work',signal('Job search not active / unknown',job)+signal('No known employment or integration plan',plan)+ranks('Work supports understood before AQOON',dist(core,'work_support_awareness')))+pane('families',signal('Private daycare not understood',privateDaycare)+signal('Would need help navigating daycare application',daycareApply)+signal('Harrastusten Vantaa not known',hobbyAware)+signal('Possible free-hobby need',hobbyNeed))+pane('next',signal('Would come back to AQOON',ret)+signal('Wants relevant future updates',updates)+signal('Okay with outcome follow-up',follow)+ranks('Other needs uncovered',dist(core,'cross_service_needs_all')));bind();loadedAt=Date.now()}catch(e){body.innerHTML='<div class="aq-empty">Could not load interview signals.</div>'}finally{loading=false}}
function compactTraffic(){const c=$('#trafficChart');if(!c)return;const cols=c.querySelectorAll('.tcol');c.style.removeProperty('min-width');c.style.setProperty('--hour-cols',String(Math.max(1,cols.length)));cols.forEach(x=>{x.style.removeProperty('width');x.style.removeProperty('min-width')})}
const obs=new MutationObserver(()=>{hideOld();compactTraffic()});function start(){ensureCard();compactTraffic();const a=$('#analytics');if(a)obs.observe(a,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureCard();compactTraffic();load(false)},180);if(e.target.closest('#refresh'))setTimeout(()=>load(true),350)},false);setTimeout(()=>{hideOld();compactTraffic()},400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

// ---- crm-manage.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-manage';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let activeDelete=null;
function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(body){const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify(body),cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
function refresh(){const b=document.getElementById('refresh');if(b)b.click();else location.reload()}
function toast(msg,bad=false){let t=document.getElementById('crmManageToast');if(!t){t=document.createElement('div');t.id='crmManageToast';t.className='crm-manage-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.toggle('bad',bad);t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),2600)}
function ensureAddButton(){const header=document.querySelector('#crm .crm-header');if(!header||document.getElementById('crmAddLead'))return;const b=document.createElement('button');b.type='button';b.id='crmAddLead';b.className='crm-add-btn';b.setAttribute('aria-label','Add family or lead');b.innerHTML='<span>＋</span><b>Add family / lead</b>';header.appendChild(b);b.onclick=openAdd}
function ensureDialog(){if(document.getElementById('crmManageDialog'))return;const wrap=document.createElement('div');wrap.id='crmManageDialog';wrap.className='crm-manage-modal hidden';wrap.innerHTML='<div class="crm-manage-sheet" role="dialog" aria-modal="true" aria-labelledby="crmManageTitle"><div class="crm-manage-head"><div><span class="eyebrow">MANUAL CRM ENTRY</span><h2 id="crmManageTitle">Add family / lead</h2></div><button type="button" class="crm-manage-x" data-close>×</button></div><p class="crm-manage-intro">Name and phone are enough to save the contact now. Fill the rest only if you already know it.</p><form id="crmAddForm"><div class="crm-manage-grid"><label>Name *<input name="name" required autocomplete="name" placeholder="Family / contact name"></label><label>Phone *<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="+358…"></label><label>City<input name="city" autocomplete="address-level2" placeholder="Helsinki, Vantaa…"></label><label>Main need<input name="main_need" list="crmNeedOptions" placeholder="Work, school, daycare…"></label><label class="wide">More specific need<input name="sub_need" placeholder="What do they need help with?"></label><label>Source<select name="manual_source"><option value="manual">Manual</option><option value="phone">Phone call</option><option value="tiktok-dm">TikTok DM</option><option value="whatsapp">WhatsApp</option><option value="in-person">In person</option><option value="referral">Referral</option><option value="other">Other</option></select></label><label>Age / life stage<input name="age_group" placeholder="Optional"></label><label class="wide">Notes<textarea name="notes" rows="3" placeholder="Anything useful before the first interview"></textarea></label></div><datalist id="crmNeedOptions"><option value="Carruur iyo skuul"><option value="Shaqo"><option value="Waxbarasho"><option value="Arrin kale"><option value="Päiväkoti / varhaiskasvatus"><option value="Skuulka iyo taageerada ilmaha"><option value="Ciyaaro iyo harrastukset"></datalist><button class="btn teal crm-save" type="submit">Save to CRM</button></form></div>';document.body.appendChild(wrap);wrap.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeDialog);wrap.addEventListener('click',e=>{if(e.target===wrap)closeDialog()});wrap.querySelector('#crmAddForm').onsubmit=saveLead}
function openAdd(){ensureDialog();const d=document.getElementById('crmManageDialog');d.classList.remove('hidden');document.body.classList.add('crm-modal-open');setTimeout(()=>d.querySelector('input[name="name"]')?.focus(),80)}
function closeDialog(){document.getElementById('crmManageDialog')?.classList.add('hidden');document.body.classList.remove('crm-modal-open')}
async function saveLead(e){e.preventDefault();const f=e.currentTarget,b=f.querySelector('button[type="submit"]'),fd=new FormData(f);b.disabled=true;b.textContent='Saving…';try{await api({action:'create',name:fd.get('name'),phone:fd.get('phone'),city:fd.get('city'),main_need:fd.get('main_need'),sub_need:fd.get('sub_need'),age_group:fd.get('age_group'),notes:fd.get('notes'),manual_source:fd.get('manual_source')});f.reset();closeDialog();toast('Family added to CRM');setTimeout(refresh,250)}catch(err){toast(err.message||'Could not add family',true)}finally{b.disabled=false;b.textContent='Save to CRM'}}
function confirmDelete(id,name,onDone){activeDelete={id,name,onDone};let d=document.getElementById('crmDeleteDialog');if(!d){d=document.createElement('div');d.id='crmDeleteDialog';d.className='crm-manage-modal hidden';d.innerHTML='<div class="crm-manage-sheet crm-delete-sheet" role="dialog" aria-modal="true"><div class="crm-manage-head"><div><span class="eyebrow">REMOVE CRM FAMILY</span><h2>Delete permanently?</h2></div><button type="button" class="crm-manage-x" data-del-close>×</button></div><p id="crmDeleteText"></p><div class="crm-delete-note">This removes the CRM family and its saved first-interview records. Anonymous funnel analytics remain untouched.</div><div class="crm-delete-actions"><button class="btn secondary" type="button" data-del-close>Cancel</button><button class="btn crm-delete-confirm" id="crmDeleteConfirm" type="button">Delete permanently</button></div></div>';document.body.appendChild(d);d.querySelectorAll('[data-del-close]').forEach(x=>x.onclick=()=>d.classList.add('hidden'));d.querySelector('#crmDeleteConfirm').onclick=deleteLead}d.querySelector('#crmDeleteText').innerHTML='Remove <strong>'+esc(name)+'</strong> from the CRM?';d.classList.remove('hidden')}
async function deleteLead(){if(!activeDelete)return;const b=document.getElementById('crmDeleteConfirm');b.disabled=true;b.textContent='Deleting…';try{await api({action:'delete',id:activeDelete.id});document.getElementById('crmDeleteDialog').classList.add('hidden');toast('Removed from CRM');const onDone=activeDelete.onDone;activeDelete=null;if(onDone)onDone();setTimeout(refresh,250)}catch(err){toast(err.message||'Could not remove family',true)}finally{b.disabled=false;b.textContent='Delete permanently'}}
window.AqoonCrmManage={openAdd,confirmDelete};
const obs=new MutationObserver(()=>{ensureAddButton()});function start(){ensureAddButton();ensureDialog();const crm=document.getElementById('crm');if(crm)obs.observe(crm,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-tab="crm"],#refresh'))setTimeout(ensureAddButton,250)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

// ---- operations-system.js ----
(()=>{
const END="https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/ops-admin";
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const stages=["lead","contacted","discovery","proposal_sent","decision_review","won","delivery","expansion","closed_lost"];
const labels={lead:"Lead",contacted:"Contacted",discovery:"Discovery",proposal_sent:"Proposal sent",decision_review:"Decision review",won:"Won",delivery:"Delivery",expansion:"Expansion",closed_lost:"Closed lost"};
let data={opportunities:[],activities:[],events:[],family_followups:[],demand:null},filter="all",mode="",record=null,loading=false;
function bars(o,max){const a=Object.entries(o||{}).sort((x,y)=>y[1]-x[1]).slice(0,8),m=max||a[0]?.[1]||1;return a.map(([k,v])=>`<div class="brow"><span>${esc(k)}</span><div class="track"><div class="bar" style="width:${Math.round(v/m*100)}%"></div></div><strong>${v}</strong></div>`).join("")||'<span class="muted">No unmatched demand right now.</span>'}
function renderDemand(){
  const d=data.demand;
  const card=$("#demandCard");
  if(!card)return;
  if(!d||!d.total_unmatched){$("#demandTotal").textContent="";$("#demandByNeed").innerHTML='<span class="muted">No unmatched demand right now — everything active has moved past first match.</span>';$("#demandByNeedCity").innerHTML="";return}
  $("#demandTotal").textContent=`${d.total_unmatched} of ${d.total_active} active families`;
  $("#demandByNeed").innerHTML=bars(d.by_need);
  const byNeedCity=Object.fromEntries((d.by_need_city||[]).map(x=>[`${x.need} · ${x.city}`,x.count]));
  $("#demandByNeedCity").innerHTML=bars(byNeedCity);
}
function password(){return sessionStorage.getItem("aqoon_tracker_password")||""}
async function api(body){const r=await fetch(END,{method:"POST",headers:{"Content-Type":"application/json","x-tracker-password":password()},body:JSON.stringify(body),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||d.error||"Operations request failed");return d}
function fail(e){const box=$("#err");if(box){box.textContent=e.message||String(e);box.classList.remove("hidden")}else alert(e.message||e)}
function dt(v){if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?"":new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Helsinki",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(d)}
function local(v){if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?"":new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function priority(o){if(!o.next_action_at)return 1;const t=new Date(o.next_action_at).getTime(),now=Date.now();if(t<now)return 0;if(t-now<86400000)return .5;return 2}
function progress(stage){const path=["lead","contacted","discovery","proposal_sent","decision_review","won","delivery","expansion"],i=path.indexOf(stage);return path.map((_,n)=>`<i class="${n<=i?"done":""}"></i>`).join("")}
function isOverdue(o){return o.next_action_at&&new Date(o.next_action_at)<new Date()}
function hasNoAction(o){return !o.next_action||!o.next_action_at}
function renderSales(){
  const active=data.opportunities.filter(x=>x.stage!=="closed_lost"),overdue=active.filter(isOverdue).length,noAction=active.filter(hasNoAction).length;
  $("#salesHealth").innerHTML=`<button type="button" data-health-filter="all" class="${filter==="all"?"on":""}"><strong>${active.length}</strong><span>active relationships</span></button><button type="button" data-health-filter="overdue" class="${filter==="overdue"?"on":""}"><strong>${overdue}</strong><span>overdue actions</span></button><button type="button" data-health-filter="no_action" class="${filter==="no_action"?"on":""}"><strong>${noAction}</strong><span>without next action</span></button>`;
  const counts=Object.fromEntries(stages.map(s=>[s,data.opportunities.filter(x=>x.stage===s).length]));
  $("#salesStageFilter").innerHTML=`<button class="${filter==="all"?"on":""}" data-sales-filter="all">All ${data.opportunities.length}</button>`+stages.filter(s=>counts[s]).map(s=>`<button class="${filter===s?"on":""}" data-sales-filter="${s}">${labels[s]} ${counts[s]}</button>`).join("");
  const byFilter={all:()=>true,overdue:isOverdue,no_action:hasNoAction};
  const list=data.opportunities.filter(byFilter[filter]||(x=>x.stage===filter)).sort((a,b)=>priority(a)-priority(b)||String(b.updated_at).localeCompare(String(a.updated_at)));
  $("#salesPipeline").innerHTML=list.map(o=>`<article class="opportunity" data-opp="${esc(o.id)}"><div class="opp-rail ${esc(o.health)}"></div><div class="opp-content"><div class="opp-top"><div><h3>${esc(o.organization)}</h3><div class="opp-contact">${esc([o.contact_name,o.contact_role].filter(Boolean).join(" · ")||o.source||"AQOON relationship")}</div></div><span class="stage-pill ${esc(o.health)}">${esc(labels[o.stage]||o.stage)}</span></div><div class="opp-now"><span>NEXT</span><strong>${esc(o.next_action||"Set a next action")}</strong><time>${esc(o.next_action_at?dt(o.next_action_at):"No date")}</time></div><p class="opp-summary">${esc(o.summary||"Add the relationship context and decision status.")}</p>${o.matched_demand?`<div class="opp-demand-pill">${o.matched_demand.total} ${esc(o.demand_need)}${o.demand_city?" · "+esc(o.demand_city):""} · ${o.matched_demand.past_interview} past interview</div>`:""}<div class="opp-progress">${progress(o.stage)}</div></div><span class="opp-open" aria-hidden="true">›</span></article>`).join("")||'<div class="empty">No opportunities match this filter.</div>';
  document.querySelectorAll("[data-sales-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.salesFilter;renderSales()});
  document.querySelectorAll("[data-health-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.healthFilter;renderSales()});
  document.querySelectorAll("[data-opp]").forEach(x=>x.onclick=()=>openOpportunity(data.opportunities.find(o=>o.id===x.dataset.opp)));
}
function eventRows(){
  const now=Date.now()-86400000;
  const normal=data.events.filter(x=>x.status==="planned"&&new Date(x.starts_at).getTime()>=now).map(x=>({...x,source_kind:"event"}));
  const family=data.family_followups.filter(x=>new Date(x.next_follow_up_at).getTime()>=now).map(x=>({id:x.id,title:`Follow up · ${x.name}`,event_type:"call",starts_at:x.next_follow_up_at,notes:[x.city,x.main_need].filter(Boolean).join(" · "),source_kind:"family"}));
  const sales=data.opportunities.filter(o=>o.stage!=="closed_lost"&&o.next_action_at&&new Date(o.next_action_at).getTime()>=now&&!normal.some(e=>e.opportunity_id===o.id&&Math.abs(new Date(e.starts_at)-new Date(o.next_action_at))<43200000)).map(o=>({id:o.id,title:o.next_action||`Next action · ${o.organization}`,event_type:"task",starts_at:o.next_action_at,notes:o.organization,source_kind:"sales"}));
  return [...normal,...family,...sales].sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)).slice(0,8)
}
function renderAgenda(){const rows=eventRows();$("#agendaList").innerHTML=rows.map(x=>{const d=new Date(x.starts_at),day=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Helsinki",weekday:"short"}).format(d),date=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Helsinki",day:"numeric",month:"short"}).format(d);return `<div class="agenda-item" data-event="${x.source_kind==="event"?esc(x.id):""}"><div class="agenda-when"><strong>${esc(day)}</strong>${esc(date)}</div><div><h4>${esc(x.title)}</h4><p>${esc(x.notes||dt(x.starts_at))}</p></div><span class="agenda-kind ${esc(x.event_type)}">${esc(x.event_type)}</span></div>`}).join("")||'<div class="empty">No upcoming calls or meetings. Add the next commitment now.</div>';document.querySelectorAll("[data-event]:not([data-event=''])").forEach(x=>x.onclick=()=>openEvent(data.events.find(e=>e.id===x.dataset.event)))}
async function load(force=false){if(loading||!password())return;if(!force&&data.opportunities.length)return;loading=true;try{data=await api({action:"list"});renderSales();renderAgenda();renderDemand()}catch(e){fail(e)}finally{loading=false}}
function field(name,label,value="",type="text",full=false,options=[]){if(type==="select")return `<div class="ops-field ${full?"full":""}"><label>${label}</label><select name="${name}">${options.map(x=>`<option value="${x}" ${x===value?"selected":""}>${esc(labels[x]||x.replaceAll("_"," "))}</option>`).join("")}</select></div>`;if(type==="textarea")return `<div class="ops-field ${full?"full":""}"><label>${label}</label><textarea name="${name}">${esc(value)}</textarea></div>`;return `<div class="ops-field ${full?"full":""}"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`}
function showDialog(){$("#opsDialog").classList.remove("hidden");document.body.style.overflow="hidden";if(mode==="opportunity"&&!record)setTimeout(()=>editorTabs("plan"),0)}
function closeDialog(){$("#opsDialog").classList.add("hidden");document.body.style.overflow="";record=null}
function editorTabs(active="now"){document.querySelectorAll("[data-editor-tab]").forEach(b=>{const on=b.dataset.editorTab===active;b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on))});document.querySelectorAll("[data-editor-panel]").forEach(p=>p.classList.toggle("hidden",p.dataset.editorPanel!==active))}
function bindEditorTabs(){document.querySelectorAll("[data-editor-tab]").forEach(b=>b.onclick=()=>editorTabs(b.dataset.editorTab));document.querySelectorAll("textarea").forEach(t=>{const resize=()=>{t.style.height="auto";t.style.height=Math.min(180,t.scrollHeight)+"px"};t.addEventListener("input",resize);resize()})}
function openOpportunity(o=null){mode="opportunity";record=o;$("#opsDialogTitle").textContent=o?o.organization:"New sales lead";$("#opsDialogHint").textContent=o?"Update the next commitment first.":"Create the relationship, then set its first next action.";$("#deleteOpsRecord").classList.toggle("hidden",!o);const activities=o?data.activities.filter(a=>a.opportunity_id===o.id):[];const demandLine=o?.matched_demand?`<p class="opp-demand-line">${o.matched_demand.total} active ${esc(o.demand_need)}${o.demand_city?" · "+esc(o.demand_city):""} families · ${o.matched_demand.past_interview} past first interview</p>`:o?.demand_need?`<p class="opp-demand-line muted">No active families currently match ${esc(o.demand_need)}${o.demand_city?" · "+esc(o.demand_city):""}.</p>`:"";
$("#opsFormBody").innerHTML=`<div class="ops-editor-tabs" role="tablist"><button type="button" data-editor-tab="now" role="tab">Now</button><button type="button" data-editor-tab="plan" role="tab">Plan</button><button type="button" data-editor-tab="timeline" role="tab">Timeline <span>${activities.length}</span></button></div><section class="ops-editor-panel" data-editor-panel="now"><div class="editor-intro"><strong>What moves this relationship forward?</strong><span>These fields control the card and today view.</span></div>${demandLine}<div class="ops-grid">${field("stage","Stage",o?.stage||"lead","select",false,stages)}${field("health","Health",o?.health||"on_track","select",false,["on_track","waiting","at_risk","blocked"])}${field("next_action","One concrete next action",o?.next_action||"","textarea",true)}${field("next_action_at","When",local(o?.next_action_at),"datetime-local")}${field("probability","Probability %",o?.probability??"","number")}${field("summary","Current situation",o?.summary||"","textarea",true)}</div></section><section class="ops-editor-panel hidden" data-editor-panel="plan"><div class="editor-intro"><strong>Relationship context and definition of success</strong><span>Update this when the plan changes, not after every call.</span></div><div class="ops-grid">${field("organization","Organisation",o?.organization||"")}${field("contact_name","Contact",o?.contact_name||"")}${field("contact_role","Contact role",o?.contact_role||"")}${field("source","Relationship source",o?.source||"")}${field("demand_need","Family demand this represents",o?.demand_need||"","select",false,["","Carruur iyo skuul","Shaqo","Waxbarasho","Arrin kale"])}${field("demand_city","City (optional, narrows the count)",o?.demand_city||"")}${field("goal","Goal",o?.goal||"","textarea",true)}${field("success_definition","What does success mean?",o?.success_definition||"","textarea",true)}${field("completed_steps","Completed, one per line",(o?.completed_steps||[]).join("\n"),"textarea",true)}${field("next_steps","Planned steps, one per line",(o?.next_steps||[]).join("\n"),"textarea",true)}</div></section><section class="ops-editor-panel hidden" data-editor-panel="timeline"><div class="ops-timeline"><div class="editor-intro"><strong>Relationship timeline</strong><span>Keep evidence of emails, calls, meetings and decisions.</span></div>${activities.map(a=>`<div class="timeline-row"><i></i><div><strong>${esc(a.title)}</strong><small>${esc(a.activity_type)} · ${esc(dt(a.happened_at||a.due_at||a.created_at))}${a.notes?" · "+esc(a.notes):""}</small></div></div>`).join("")||'<div class="empty compact-empty">No activities yet.</div>'}${o?`<div class="activity-composer"><div class="ops-grid">${field("activity_title","What happened?")}${field("activity_type","Type","note","select",false,["email","call","meeting","proposal","report","note","task"])}${field("activity_notes","Short note","","textarea",true)}</div><button class="btn secondary" id="addActivity" type="button">+ Add to timeline</button></div>`:'<p class="empty compact-empty">Save the lead before adding timeline activity.</p>'}</div></section>`;showDialog();bindEditorTabs();editorTabs("now");if(o)$("#addActivity").onclick=addActivity}
function openEvent(e=null){mode="event";record=e;$("#opsDialogTitle").textContent=e?"Edit calendar item":"Add call or meeting";$("#opsDialogHint").textContent="Anything with a date should become visible work.";$("#deleteOpsRecord").classList.toggle("hidden",!e);const relationship=`<div class="ops-field"><label>Sales relationship (optional)</label><select name="opportunity_id"><option value="">General AQOON event</option>${data.opportunities.map(o=>`<option value="${esc(o.id)}" ${e?.opportunity_id===o.id?"selected":""}>${esc(o.organization)}</option>`).join("")}</select></div>`;$("#opsFormBody").innerHTML=`<div class="ops-grid">${field("title","Title",e?.title||"")}${field("event_type","Type",e?.event_type||"meeting","select",false,["call","meeting","deadline","task"])}${field("starts_at","Starts",local(e?.starts_at),"datetime-local")}${field("ends_at","Ends",local(e?.ends_at),"datetime-local")}${field("status","Status",e?.status||"planned","select",false,["planned","done","cancelled"])}${relationship}${field("notes","Notes",e?.notes||"","textarea",true)}</div>`;showDialog()}
function form(){return Object.fromEntries(new FormData($("#opsForm")).entries())}
async function save(e){e.preventDefault();const v=form();$("#saveOpsRecord").disabled=true;try{if(mode==="opportunity"){await api({action:"save_opportunity",id:record?.id,...v,probability:v.probability===""?null:Number(v.probability),completed_steps:v.completed_steps.split("\n").map(x=>x.trim()).filter(Boolean),next_steps:v.next_steps.split("\n").map(x=>x.trim()).filter(Boolean),next_action_at:v.next_action_at?new Date(v.next_action_at).toISOString():null})}else await api({action:"save_event",id:record?.id,...v,starts_at:v.starts_at?new Date(v.starts_at).toISOString():null,ends_at:v.ends_at?new Date(v.ends_at).toISOString():null});closeDialog();data.opportunities=[];await load(true)}catch(x){fail(x)}finally{$("#saveOpsRecord").disabled=false}}
async function remove(){if(!record)return;const what=mode==="opportunity"?record.organization:record.title;if(!confirm(`Delete ${what}? This cannot be undone.`))return;try{await api({action:mode==="opportunity"?"delete_opportunity":"delete_event",id:record.id});closeDialog();data.opportunities=[];await load(true)}catch(e){fail(e)}}
async function addActivity(){const v=form();if(!v.activity_title)return alert("Add an activity title first.");try{await api({action:"add_activity",opportunity_id:record.id,title:v.activity_title,activity_type:v.activity_type,notes:v.activity_notes,happened_at:new Date().toISOString(),completed_at:new Date().toISOString()});data.opportunities=[];await load(true);openOpportunity(data.opportunities.find(x=>x.id===record.id))}catch(e){fail(e)}}
function start(){
  $("#addOpportunity").onclick=()=>openOpportunity();$("#addAgendaEvent").onclick=()=>openEvent();$("#closeOpsDialog").onclick=closeDialog;$("#opsForm").onsubmit=save;$("#deleteOpsRecord").onclick=remove;
  document.addEventListener("click",e=>{if(e.target.closest('[data-tab="sales"]'))setTimeout(()=>load(true),100);if(e.target.closest("#refresh"))setTimeout(()=>load(true),150)});
  const obs=new MutationObserver(()=>{if(!$("#app").classList.contains("hidden"))load()});obs.observe($("#app"),{attributes:true,attributeFilter:["class"]});if(!$("#app").classList.contains("hidden"))load();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();

// ---- call-outcomes.js ----
((global)=>{'use strict';
// Two possible targets: a real family_leads row (record_call_outcome), or a
// still-incomplete family_intake_contacts row (log_call) - logging a call
// against an incomplete intake must never create a lead by itself, only
// finishing the intake form does that, so it goes to a different endpoint
// and action entirely rather than reusing the leads one.
const ENDPOINTS={lead:'https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin',intake:'https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-incomplete-admin'};
const ACTIONS={lead:'record_call_outcome',intake:'log_call'};
const DAY_MS=24*60*60*1000;
const SCHEDULED_OUTCOMES=['call_later','busy'];

function noAnswerFollowUp(now=Date.now()){return new Date(Number(now)+DAY_MS).toISOString()}
function buildOutcomePayload(leadId,outcome,followUpAt,now=Date.now(),notes,kind='lead'){
  if(!leadId)throw Error('Missing family lead');
  if(!['reached','no_answer','call_later','busy'].includes(outcome))throw Error('Choose a call outcome');
  const payload={action:ACTIONS[kind]||ACTIONS.lead,id:String(leadId),call_outcome:outcome};
  if(outcome==='no_answer')payload.next_follow_up_at=noAnswerFollowUp(now);
  if(SCHEDULED_OUTCOMES.includes(outcome)){
    const follow=new Date(followUpAt||'');
    if(!Number.isFinite(follow.getTime())||follow.getTime()<=Number(now))throw Error('Choose a future follow-up time');
    payload.next_follow_up_at=follow.toISOString();
  }
  const trimmedNotes=typeof notes==='string'?notes.trim():'';
  if(trimmedNotes)payload.notes=trimmedNotes;
  return payload;
}

const core={noAnswerFollowUp,buildOutcomePayload};
if(typeof module!=='undefined'&&module.exports)module.exports=core;
if(!global||typeof document==='undefined')return;

const $=id=>document.getElementById(id);
let pending=null,saving=false,pendingOutcome=null;
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
async function api(body,kind='lead'){
  const headers={'Content-Type':'application/json','x-tracker-password':password()},token=authToken();
  // family-leads-admin gets the operator's JWT from a global fetch patch in
  // operator-identity.js; family-incomplete-admin isn't covered by that
  // patch (same gap incomplete-intake.js already works around), so it's
  // attached directly here for the intake target.
  if(kind==='intake'&&token)headers.Authorization='Bearer '+token;
  const response=await fetch(ENDPOINTS[kind]||ENDPOINTS.lead,{method:'POST',headers,body:JSON.stringify(body),cache:'no-store'});
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw Error(data.detail||data.error||'Could not save call outcome');
  return data;
}
function localValue(date){const d=new Date(date),pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())}
function ensureDialog(){
  if($('callOutcomeDialog'))return;
  const wrap=document.createElement('section');
  wrap.id='callOutcomeDialog';wrap.className='call-outcome-modal hidden';
  wrap.innerHTML='<div class="call-outcome-sheet" role="dialog" aria-modal="true" aria-labelledby="callOutcomeTitle"><button type="button" class="call-outcome-close" id="callOutcomeClose" aria-label="Close">×</button><span class="eyebrow">CALL OUTCOME</span><h2 id="callOutcomeTitle">What happened?</h2><p id="callOutcomeName" class="call-outcome-name"></p><div class="call-outcome-options"><button type="button" data-call-outcome="reached"><strong>Spoke to them</strong><span>Mark contacted</span></button><button type="button" data-call-outcome="no_answer"><strong>No answer</strong><span>Retry in 24 hours</span></button><button type="button" data-call-outcome="busy"><strong>Busy</strong><span>Choose a callback time</span></button><button type="button" data-call-outcome="call_later"><strong>Call back later</strong><span>Choose a time</span></button></div><form id="callFollowUpForm" class="call-later-form hidden"><label>Follow-up time<input id="callFollowUpAt" type="datetime-local" required></label><button class="btn primary" type="submit">Schedule follow-up</button></form><label class="call-outcome-note-label" for="callOutcomeNote">Note (optional)<textarea id="callOutcomeNote" rows="2" placeholder="What happened on this call?" maxlength="1000"></textarea></label><p id="callOutcomeError" class="call-outcome-error" role="alert"></p></div>';
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-call-outcome]').forEach(button=>button.onclick=()=>choose(button.dataset.callOutcome));
  $('callFollowUpForm').onsubmit=e=>{e.preventDefault();save(pendingOutcome,$('callFollowUpAt').value)};
  $('callOutcomeClose').onclick=()=>{if(!saving)close()};
  wrap.addEventListener('click',e=>{if(e.target===wrap&&!saving)close()});
}
function open(){
  if(!pending||saving)return;
  ensureDialog();
  $('callOutcomeName').textContent=pending.name||'Family call';
  $('callOutcomeError').textContent='';
  $('callOutcomeNote').value='';
  $('callFollowUpForm').classList.add('hidden');
  pendingOutcome=null;
  $('callFollowUpAt').value=localValue(Date.now()+DAY_MS);
  $('callOutcomeDialog').classList.remove('hidden');
  document.body.classList.add('call-outcome-open');
  setTimeout(()=>$('callOutcomeDialog').querySelector('[data-call-outcome="reached"]')?.focus(),30);
}
function close(){
  $('callOutcomeDialog')?.classList.add('hidden');
  document.body.classList.remove('call-outcome-open');
  pending=null;pendingOutcome=null;
}
function choose(outcome){
  if(SCHEDULED_OUTCOMES.includes(outcome)){
    pendingOutcome=outcome;
    $('callFollowUpForm').classList.remove('hidden');
    $('callFollowUpAt').focus();
    return;
  }
  save(outcome);
}
async function save(outcome,followUpAt){
  if(!pending||saving)return;
  const kind=pending.kind||'lead',onReached=kind==='intake'&&outcome==='reached'?pending.onReached:null;
  let payload;
  try{payload=buildOutcomePayload(pending.id,outcome,followUpAt,Date.now(),$('callOutcomeNote')?.value,kind)}catch(error){$('callOutcomeError').textContent=error.message;return}
  saving=true;
  const buttons=$('callOutcomeDialog').querySelectorAll('button');buttons.forEach(button=>button.disabled=true);
  $('callOutcomeError').textContent='Saving…';
  try{
    await api(payload,kind);close();
    // For an incomplete intake, "spoke to them" is the moment to fill in
    // the intake form while the family is still on the line - that save
    // (not this one) is what actually creates the case and moves it to
    // First Contact, so hand off to it instead of just refreshing.
    if(onReached){onReached();return}
    const refresh=$('refresh');if(refresh)refresh.click();
  }catch(error){$('callOutcomeError').textContent=error.message||'Could not save call outcome'}
  finally{saving=false;buttons.forEach(button=>button.disabled=false)}
}
async function recordForLead(leadId,outcome,followUpAt,notes){
  const payload=buildOutcomePayload(leadId,outcome,followUpAt,Date.now(),notes);
  await api(payload);
  const refresh=$('refresh');if(refresh)refresh.click();
}
function openForLead(leadId,name,preferredOutcome){
  if(!leadId)return;
  pending={id:String(leadId),name:name||'Family call',kind:'lead'};
  open();
  if(SCHEDULED_OUTCOMES.includes(preferredOutcome))choose(preferredOutcome);
}
function openForIntake(contactId,name,onReached){
  if(!contactId)return;
  pending={id:String(contactId),name:name||'Family call',kind:'intake',onReached};
  open();
}
function callLead(leadId,name,phone){
  if(!leadId||!phone)return;
  location.href='tel:'+String(phone);
}
// Outcome logging is always explicit (a "Log call outcome"/"Log" button the
// operator taps once they're ready) rather than auto-popping this dialog
// after a tel: link is tapped - the visibility/focus-based auto-open this
// used to do felt laggy and unpredictable on the phone-app round trip, and
// every call site now has its own explicit log affordance instead.
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-log-lead]');
  if(!trigger)return;
  openForLead(trigger.dataset.logLead,trigger.dataset.logName||'Family call');
},true);
global.AqoonCallOutcomes={recordForLead,openForLead,openForIntake,callLead};
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));

// ---- crm-queue-navigation.js ----
/* Family CRM Queue-Based Navigation */

const CrmQueues = {
  phases: [
    { id: 'incomplete', label: 'Incomplete intake', color: 'navy' },
    { id: 'first_contact', label: 'First contact', color: 'teal' },
    { id: 'in_progress', label: 'Interview follow-up', color: 'cream' },
    { id: 'resolved', label: 'Resolved', color: 'cream' }
  ],

  expandedPhase: null,
  selectedFamily: null,

  init() {
    this.renderQueues();
    this.bindEvents();

    // Re-render when data updates
    window.addEventListener('dataUpdated', () => this.renderQueues());
  },

  renderQueues() {
    const grid = document.getElementById('crmQueuesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.phases.forEach(phase => {
      const families = this.getFamiliesByPhase(phase.id);
      const card = document.createElement('div');
      card.className = 'queue-card';
      card.dataset.phase = phase.id;

      const isExpanded = this.expandedPhase === phase.id;

      card.innerHTML = `
        <div class="queue-header" data-phase="${phase.id}">
          <h3>${phase.label}</h3>
          <span class="queue-count">${families.length}</span>
        </div>
        <div class="queue-content ${isExpanded ? '' : 'hidden'}" id="content-${phase.id}">
          <div class="family-list" id="list-${phase.id}"></div>
        </div>
      `;

      // Header click toggles expansion
      const header = card.querySelector('.queue-header');
      header.addEventListener('click', () => this.toggleQueue(phase.id));

      grid.appendChild(card);

      // Render families if expanded
      if (isExpanded) {
        this.renderFamiliesInPhase(phase.id, families);
      }
    });
  },

  toggleQueue(phaseId) {
    // Close other queues
    if (this.expandedPhase !== phaseId) {
      const previousContent = document.getElementById(`content-${this.expandedPhase}`);
      if (previousContent) previousContent.classList.add('hidden');
    }

    // Toggle current queue
    const content = document.getElementById(`content-${phaseId}`);
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      this.expandedPhase = phaseId;

      // Render families if not already rendered
      const list = document.getElementById(`list-${phaseId}`);
      if (list.innerHTML === '') {
        const families = this.getFamiliesByPhase(phaseId);
        this.renderFamiliesInPhase(phaseId, families);
      }
    } else {
      content.classList.add('hidden');
      this.expandedPhase = null;
    }
  },

  getFamiliesByPhase(phaseId) {
    // Get families from window.AqoonApp (populated by app.js)
    const leads = window.AqoonApp?.leads || [];
    const partials = window.AqoonApp?.partials || [];

    let families = [];

    if (phaseId === 'incomplete') {
      // Incomplete intake forms (from partials array)
      families = partials;
    } else if (phaseId === 'first_contact') {
      // Families with status 'new' (ready for first contact)
      families = leads.filter(x => x.status === 'new');
    } else if (phaseId === 'in_progress') {
      // Families with status 'contacted' (awaiting outcome/next steps)
      families = leads.filter(x => x.status === 'contacted');
    } else if (phaseId === 'resolved') {
      // Families with status 'resolved'
      families = leads.filter(x => x.status === 'resolved');
    }

    // Sort by creation date (oldest first per user requirement)
    return families.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  renderFamiliesInPhase(phaseId, families) {
    const list = document.getElementById(`list-${phaseId}`);
    if (!list) return;

    if (families.length === 0) {
      list.innerHTML = '<div class="queue-empty">No families in this queue</div>';
      return;
    }

    list.innerHTML = families
      .map(family => {
        const need = [family.city, family.main_need, family.sub_need].filter(Boolean).join(' · ');
        return `
        <div class="family-item" data-lead-id="${family.id}" data-phase="${phaseId}">
          <p class="family-item-name">${family.name || 'Unnamed'}</p>
          ${need ? `<p style="font-size:11px;color:var(--muted);margin:2px 0 0">${this.escapeHtml(need)}</p>` : ''}
          <div class="family-item-meta">
            <span class="family-item-operator">${this.operatorLabel(family.assigned_operator_id)}</span>
            <span class="family-item-time">${this.formatDate(family.created_at)}</span>
          </div>
        </div>
      `;
      })
      .join('');

    // Bind click handlers
    list.querySelectorAll('.family-item').forEach(item => {
      item.addEventListener('click', () => {
        const leadId = item.dataset.leadId;
        const phase = item.dataset.phase;
        this.openFamilyPanel(leadId, phase);
      });
    });
  },

  // Single call workflow reused across all three contactable phases: a Call
  // action plus one button that opens the AqoonCallOutcomes dialog, which
  // holds the actual outcome choices (Spoke to them / No answer / Busy /
  // Call back later) and a note field. Replaces what used to be three
  // near-identical 4-button grids, one of which (Contacted/No answer) fired
  // immediately with no note and no dialog, while Call later alone opened it.
  contactActionsHtml(leadId, lead, isIncomplete) {
    const name = lead.name || (isIncomplete ? 'this person' : 'this family');
    const callButton = isIncomplete
      ? `<button class="btn primary" data-action="call-incomplete" data-lead-id="${leadId}">Call</button>`
      : `<a class="btn primary" href="tel:${lead.phone || ''}" data-call-lead="${leadId}" data-call-name="${name}">Call</a>`;
    const logAction = isIncomplete ? 'log-outcome-incomplete' : 'log-outcome';
    const note = isIncomplete
      ? 'Logging what happened never moves this on its own. Only Finish intake — filling in city, need and specifics — moves them to First contact.'
      : 'Call opens the phone and asks for the outcome when you return, or log it directly — spoke to them, no answer, busy, or call back later.';
    return `
      <div class="panel-section contact-actions">
        <h4 class="panel-section-title">Contact ${isIncomplete ? 'this person' : 'this family'}</h4>
        <div class="call-workflow-row">
          ${callButton}
          <button class="btn secondary" data-action="${logAction}" data-lead-id="${leadId}">Log call outcome</button>
        </div>
        <p class="contact-action-note">${note}</p>
      </div>
    `;
  },

  openFamilyPanel(leadId, phaseId) {
    const leads = window.AqoonApp?.leads || [];
    const partials = window.AqoonApp?.partials || [];
    const lead = leads.find(l => l.id === leadId) || partials.find(l => l.id === leadId);
    if (!lead) return;

    this.selectedFamily = { lead, phaseId };
    const panel = document.getElementById('familyPanel');
    const panelName = document.getElementById('panelFamilyName');
    const panelContent = document.getElementById('panelContent');

    panelName.textContent = lead.name || 'Unnamed';

    // Build panel content based on phase
    const needLine = [lead.city, lead.main_need, lead.sub_need].filter(Boolean).join(' · ');
    let content = `
      <div class="panel-section">
        <h4 class="panel-section-title">Family Info</h4>
        ${needLine ? `<div class="panel-info">
          <div class="panel-info-label">Need</div>
          <div class="panel-info-value">${this.escapeHtml(needLine)}</div>
        </div>` : ''}
        <div class="panel-info">
          <div class="panel-info-label">Phone</div>
          <div class="panel-info-value">${lead.phone || '—'}</div>
        </div>
        <div class="panel-info">
          <div class="panel-info-label">Submitted</div>
          <div class="panel-info-value">${this.formatDate(lead.created_at)}</div>
        </div>
        <div class="panel-info">
          <div class="panel-info-label">Current operator</div>
          <div class="panel-info-value">${this.operatorLabel(lead.assigned_operator_id)}</div>
        </div>
      </div>
    `;
    const attrib = window.AqoonOperators?.attribFor(leadId);
    const lastTouchedName = attrib?.last_actor_id ? window.AqoonOperators?.nameFor(attrib.last_actor_id) : '';
    if (lastTouchedName) {
      content += `<p style="font-size:11px;color:var(--m);margin:-16px 0 16px">Last touched by ${lastTouchedName}</p>`;
    }

    // Phase-specific actions. Assign-to-me comes first (decide ownership),
    // then the contact/call workflow, so an operator claims a case before
    // acting on it rather than acting on something nobody owns yet.
    if (phaseId === 'incomplete') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign this intake to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="edit-intake" data-lead-id="${leadId}">Finish intake</button>
            <button class="btn secondary" data-action="delete-intake" data-lead-id="${leadId}">Delete</button>
          </div>
          <p style="font-size:11px;color:var(--muted);margin-top:8px">Assignment carries over automatically once the intake is finished and the family moves to the interview queue.</p>
        </div>
      `;
      if (lead.last_call_outcome) {
        content += `
          <div class="panel-section">
            <h4 class="panel-section-title">Last call</h4>
            <p style="font-size:13px;color:var(--ink);margin:0">${this.callOutcomeLabel(lead.last_call_outcome)} · ${this.formatDate(lead.last_call_at)}</p>
            ${lead.last_call_notes ? `<p style="font-size:12px;color:var(--muted);margin:4px 0 0">${this.escapeHtml(lead.last_call_notes)}</p>` : ''}
          </div>
        `;
      }
      content += this.contactActionsHtml(leadId, lead, true);
    } else if (phaseId === 'first_contact') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign interview to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">Start interview</button>
          </div>
        </div>
      `;
      content += this.contactActionsHtml(leadId, lead, false);
    } else if (phaseId === 'in_progress') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">${lead.interview_status === 'completed' ? 'Interview complete' : 'Interview still required'}</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">${lead.interview_status === 'completed' ? 'Review interview' : 'Start first interview'}</button>
            ${lead.interview_status === 'completed' ? '<button class="btn primary" data-action="mark-resolved" data-lead-id="' + leadId + '">Mark resolved</button>' : '<button class="btn secondary" data-action="return-to-first-contact" data-lead-id="' + leadId + '">Return to first contact</button>'}
          </div>
          ${lead.interview_status === 'completed' ? '' : '<p class="contact-action-note">This legacy case reached the follow-up queue without a completed interview. Return it to First contact before continuing.</p>'}
        </div>
      `;
      content += this.contactActionsHtml(leadId, lead, false);
    } else if (phaseId === 'resolved') {
      // Resolving used to be a one-way door - no action here offered a way
      // back if a case was resolved by mistake or needs to reopen.
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Resolved</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="reopen-case" data-lead-id="${leadId}">Reopen (return to follow-up)</button>
          </div>
        </div>
      `;
    }

    // Call history only applies to real family_leads rows (not incomplete-
    // intake partials, which live in a different table with no call log).
    if (phaseId !== 'incomplete') {
      content += `
        <div class="panel-section">
          <h4 class="panel-section-title">Call History</h4>
          <div id="panelCallHistory"></div>
        </div>
        <div class="panel-section">
          <button class="btn secondary" type="button" data-action="remove-lead" data-lead-id="${leadId}">Remove from CRM</button>
        </div>
      `;
    }

    panelContent.innerHTML = content;

    if (phaseId !== 'incomplete') {
      window.AqoonCallHistory?.renderInto(document.getElementById('panelCallHistory'), leadId);
    }

    // Bind action buttons
    panelContent.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const actionLeadId = e.target.dataset.leadId;
        this.handleAction(action, actionLeadId);
      });
    });

    // Show panel
    panel.classList.remove('hidden');
  },

  handleAction(action, leadId) {
    const phaseId = this.selectedFamily?.phaseId;
    const lead = this.selectedFamily?.lead;

    if (action === 'assign-to-me' && phaseId === 'incomplete') {
      // Incomplete-intake records live in family_intake_contacts, not
      // family_leads, so they go through incomplete-intake.js's own
      // assign(), not the generic family_leads update() path.
      const operatorId = sessionStorage.getItem('aqoon_operator_id');
      if (!operatorId) { alert('Sign in with your operator account (not just the shared password) to assign leads to yourself.'); return; }
      if (lead) window.AqoonIncompleteIntake?.assign(lead, operatorId, () => this.closeFamilyPanel());
    } else if (action === 'assign-to-me') {
      this.assignToOperator(leadId);
    } else if (action === 'edit-intake' && phaseId === 'incomplete') {
      // Incomplete-intake records live in a different table (family_intake_contacts)
      // than real family_leads rows, so they need incomplete-intake.js's own
      // "finish this partial" flow, not the interview drawer.
      this.closeFamilyPanel();
      if (lead) window.AqoonIncompleteIntake?.open(lead);
    } else if (action === 'delete-intake' && phaseId === 'incomplete') {
      if (lead) window.AqoonIncompleteIntake?.remove(lead, () => this.closeFamilyPanel());
    } else if (action === 'log-outcome-incomplete' && phaseId === 'incomplete') {
      // Logging an outcome here only ever records the attempt against the
      // still-incomplete intake (log_call) - it never creates a family_leads
      // row or moves the queue by itself. Only "spoke to them" hands off to
      // Finish intake, since that's the one action that's actually allowed
      // to create the case and move it to First contact.
      window.AqoonCallOutcomes?.openForIntake(leadId, lead?.name || 'Client', () => {
        this.closeFamilyPanel();
        if (lead) window.AqoonIncompleteIntake?.open(lead);
      });
    } else if (action === 'log-outcome') {
      window.AqoonCallOutcomes?.openForLead(leadId, lead?.name || 'Family');
    } else if (action === 'call-incomplete' && phaseId === 'incomplete') {
      // Dialing alone must not create a contact case or move this out of the
      // Incomplete intake queue - nothing has actually happened yet (no
      // answer, no outcome). Only Log call outcome does that, atomically
      // with the outcome it records, so the queue never shows a case that's
      // "moved on" with no call history to show for it.
      window.AqoonCallOutcomes?.callLead(lead?.id, lead?.name || 'Client', lead?.phone || '');
    } else if (action === 'start-interview') {
      this.closeFamilyPanel();
      window.openInterview(leadId);
    } else if (action === 'mark-resolved') {
      // Unlike delete-intake/remove-lead, this used to fire with no
      // confirmation and no symmetric "reopen" action once resolved - a
      // mis-click had no cheap way back.
      if (!confirm('Mark ' + (lead?.name || 'this family') + ' resolved? This moves them out of the active queues.')) return;
      window.AqoonApp?.updateLead(leadId, {status: 'resolved'}).then(() => this.closeFamilyPanel());
    } else if (action === 'reopen-case') {
      window.AqoonApp?.updateLead(leadId, {status: 'contacted', journey_stage: 'guide'})
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not reopen this case.'));
    } else if (action === 'return-to-first-contact') {
      window.AqoonApp?.updateLead(leadId, {status: 'new', journey_stage: 'reach'})
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not return this case to first contact.'));
    } else if (action === 'remove-lead') {
      window.AqoonCrmManage?.confirmDelete(leadId, lead?.name || 'this family', () => this.closeFamilyPanel());
    }
  },

  assignToOperator(leadId) {
    // Uses the same generic 'update' action app.js's updateLead() already calls
    // successfully — family-leads-admin's update handler already accepts
    // assigned_operator_id directly, so no separate endpoint/action is needed.
    const operatorId = sessionStorage.getItem('aqoon_operator_id');
    if (!operatorId) {
      alert('Sign in with your operator account (not just the shared password) to assign leads to yourself.');
      return;
    }
    if (!window.AqoonApp?.updateLead) return;
    window.AqoonApp.updateLead(leadId, { assigned_operator_id: operatorId })
      .then(() => this.closeFamilyPanel())
      .catch(err => console.error('Assignment error:', err));
  },

  closeFamilyPanel() {
    const panel = document.getElementById('familyPanel');
    panel.classList.add('hidden');
    this.selectedFamily = null;
  },

  operatorLabel(operatorId) {
    if (!operatorId) return 'Unassigned';
    const name = window.AqoonOperators?.nameFor(operatorId);
    return name ? ('✓ ' + name) : '✓ Assigned';
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fi-FI', { month: 'short', day: 'numeric' });
  },

  callOutcomeLabel(outcome) {
    return { reached: 'Spoke to them', no_answer: 'No answer', busy: 'Busy', call_later: 'Call back later' }[outcome] || outcome;
  },

  escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  bindEvents() {
    // Close panel button
    const closeBtn = document.getElementById('closeFamilyPanel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeFamilyPanel());
    }

    // Close panel when clicking outside (on mobile)
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('familyPanel');
      if (panel && !panel.classList.contains('hidden')) {
        if (e.target.closest('.family-panel') === panel && e.target === panel) {
          this.closeFamilyPanel();
        }
      }
    });
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for app.js's first load() to populate window.AqoonApp.leads/.partials
  setTimeout(() => CrmQueues.init(), 500);
});

// Export for use by other modules
window.CrmQueues = CrmQueues;