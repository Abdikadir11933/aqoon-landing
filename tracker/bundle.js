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
function renderDashboard(){const active=leads.filter(x=>x.status!=='resolved'),urgent=active.filter(operationalUrgent).sort((a,b)=>priority(a)-priority(b)||String(a.created_at).localeCompare(String(b.created_at))),fresh=leads.filter(x=>x.status==='new'&&!operationalUrgent(x)),waiting6=active.filter(x=>x.status==='new'&&(Date.now()-new Date(x.created_at).getTime())>=216e5);$('dashNew').textContent=fresh.length;$('dashDue').textContent=urgent.length;$('dashNewList').innerHTML=fresh.slice(0,3).map(x=>'<div class="dash-row"><span>'+esc(x.name)+'</span><strong>'+esc(x.main_need||'')+'</strong></div>').join('');$('dashDueList').innerHTML=urgent.slice(0,3).map(x=>'<div class="dash-row"><span>'+esc(x.name)+'</span><strong>'+esc(sla(x)?.label||'FOLLOW-UP')+'</strong></div>').join('');$('todayDate').textContent=new Intl.DateTimeFormat('en',{weekday:'long',day:'2-digit',month:'short'}).format(new Date()).toUpperCase();$('updatedAt').textContent='Live data · updated '+new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit'}).format(new Date());$('todayHeadline').textContent=partials.length?partials.length+' incomplete intake'+(partials.length===1?' needs':'s need')+' recovery':waiting6.length?waiting6.length+' families have waited 6+ hours':urgent.length?urgent.length+' families need attention today':active.length+' active families';const ring=$('todayRing');ring.querySelector('span').textContent=active.length;const urgentN=Math.min(active.length,urgent.length),total=Math.max(1,leads.length),safe=Math.max(0,(active.length-urgentN)/total*100),risk=Math.max(safe,Math.min(96,safe+urgentN/total*100));ring.style.background='conic-gradient(var(--t) 0 '+safe+'%,var(--sand) '+safe+'% '+risk+'%,var(--r) '+risk+'% 100%)';const clock=$('slaClock');clock.querySelectorAll('.clock-marker').forEach(x=>x.remove());active.filter(x=>sla(x)).sort((a,b)=>sla(a).left-sla(b).left).slice(0,5).forEach(x=>{const s=sla(x),m=document.createElement('div');m.className='clock-marker '+(s.kind==='overdue'?'overdue':s.left<=6?'critical':s.kind);m.style.left=Math.max(2,Math.min(98,Math.max(0,s.left)/48*100))+'%';m.innerHTML='<b>'+esc(s.kind==='overdue'?'late':Math.max(1,Math.ceil(s.left))+'h')+'</b><i title="'+esc(x.name)+'">'+esc((x.name||'?')[0].toUpperCase())+'</i>';clock.appendChild(m)});const order=['reach','guide','start','retention','referral'],labels={reach:'Reach',guide:'Contact',start:'Match',retention:'Support',referral:'Referral',resolved:'Resolved'},stages=countBy(active,'journey_stage');stages.resolved=leads.filter(x=>x.status==='resolved').length;$('dashStage').textContent=Object.entries(stages).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';$('dashStages').innerHTML='';$('stageStrip').innerHTML=[...order,'resolved'].map(k=>'<div class="pipeline-seg '+k+'" style="flex:'+Math.max(.35,stages[k]||0)+'" title="'+labels[k]+': '+(stages[k]||0)+'">'+(stages[k]||'')+'</div>').join('');$('pipelineLabels').innerHTML=[...order,'resolved'].map(k=>'<span>'+labels[k]+'</span>').join('');$('pipelineTitle').textContent='Where the '+leads.length+' families are';const leak=biggestLeak();$('dashLeak').textContent=leak?leak.lost:'—';$('dashLeakText').textContent=leak?leak.from+' → '+leak.to:'Not enough current data yet';$('dashLeakMini').innerHTML=leak?'<p>'+leak.loss_rate+'% dropped here</p>':'';const next=[...partials.map(x=>({name:x.name,phone:x.phone,city:'Incomplete intake',main_need:'Recover request',critical:true})),...urgent.map(x=>Object.assign({critical:true},x)),...fresh].slice(0,3);$('doNext').innerHTML=next.map(x=>'<div class="next-row '+(x.critical?'critical':'')+'"><div><strong>'+esc(x.name)+'</strong><small>'+esc([x.city,x.main_need].filter(Boolean).join(' · '))+'</small></div><div class="next-row-actions"><a href="tel:'+esc(x.phone)+'">Call</a>'+(x.id?'<button type="button" class="next-log-btn" data-log-lead="'+esc(x.id)+'" data-log-name="'+esc(x.name)+'">Log</button>':'')+'</div></div>').join('')||'<div class="empty">Nothing urgent right now.</div>';renderLeadSpark()}
function updateLead(id,patch){return api(Object.assign({action:'update',id},patch)).then(d=>{const i=leads.findIndex(x=>x.id===id);if(i>=0)leads[i]=Object.assign({},leads[i],d.lead);renderAll();window.dispatchEvent(new Event('dataUpdated'))}).catch(e=>err(e.message))}
function funnelData(){const f=analytics.flow||{};return[{label:'Started form',v:f.started||0},{label:'Contact screen',v:f.contact_view||0},{label:'Started typing',v:f.contact_started||0},{label:'Contact saved',v:f.contact_saved||0},{label:'Completed request',v:f.completed||0}]}
function funnelHtml(){const a=funnelData(),max=a[0]?.v||1;return a.map((x,i)=>{const prev=i?a[i-1].v:null,rate=prev?Math.round(x.v/prev*100):100;return'<div class="frow"><span>'+esc(x.label)+(i?'<small>'+rate+'% of previous</small>':'')+'</span><div class="track"><div class="bar" style="width:'+Math.max(x.v?3:0,Math.round(x.v/max*100))+'%"></div></div><strong>'+x.v+'</strong></div>'}).join('')}
function trafficChart(rows,byDay){if(!rows?.length){$('trafficChart')?.style.removeProperty('--hour-cols');return'<div class="empty">No traffic in this period yet.</div>'}const max=Math.max(...rows.map(x=>x.sessions),1),label=byDay?fmtDay:fmtHour,step=Math.max(1,Math.ceil(rows.length/10));const chart=$('trafficChart');if(chart)chart.style.setProperty('--hour-cols',String(rows.length));return rows.map((x,i)=>'<div class="tcol" title="'+esc(fmt(x.bucket))+': '+x.sessions+' sessions"><div class="tbar" style="height:'+Math.max(2,Math.round(x.sessions/max*100))+'%"></div><small>'+(i%step===0?esc(label(x.bucket)):'')+'</small></div>').join('')}
function renderAnalytics(){const a=analytics,f=a.flow||{},r=a.flow_rates||{},active=leads.filter(x=>x.status!=='resolved'),first=active.filter(x=>x.status==='new'),six=first.filter(x=>Date.now()-new Date(x.created_at).getTime()>=216e5),follow=active.filter(due),stages=countBy(active,'journey_stage');$('aVisitors').textContent=a.unique_visitors||0;$('aSessions').textContent=a.sessions||0;$('aViews').textContent=a.page_views||0;$('aLeadRecords').textContent=a.lead_records_in_range||0;if($('aLeadRecordsNew'))$('aLeadRecordsNew').textContent=a.new_lead_records_in_range?' ('+a.new_lead_records_in_range+' new)':'';$('aCompleted').textContent=f.completed||0;$('aConv').textContent=(r.session_to_completed||0)+'%';$('hFirstContact').textContent=first.length;$('hSixHours').textContent=six.length;$('hIncomplete').textContent=partials.length;$('hFollowups').textContent=follow.length;$('healthInsight').textContent=partials.length?'Recover the '+partials.length+' saved contact'+(partials.length===1?'':'s')+' first, then call the longest-waiting new families.':first.length?'First contact is the operational bottleneck: '+first.length+' families have not yet been marked contacted.':'No first-contact backlog. Work the due follow-ups next.';const total=Math.max(1,leads.length);$('journeyHealth').innerHTML=['reach','guide','start','retention','referral'].map(k=>'<span class="'+k+'" style="flex:'+Math.max(.25,stages[k]||0)+'" title="'+k+': '+(stages[k]||0)+'">'+(stages[k]||'')+'</span>').join('')+'<span class="resolved" style="flex:'+Math.max(.25,leads.filter(x=>x.status==='resolved').length)+'" title="resolved: '+leads.filter(x=>x.status==='resolved').length+'">'+(leads.filter(x=>x.status==='resolved').length||'')+'</span>';$('flowSince').textContent='Current multi-need phone-first form. Each stage counts distinct sessions.';$('fullFunnel').innerHTML=funnelHtml();const val=f.validation_error||0;$('validationNote').classList.toggle('hidden',!val);$('validationNote').innerHTML=val?'<strong>'+val+' session'+(val===1?'':'s')+' hit contact validation.</strong> '+(f.contact_saved?Math.min(val,f.contact_saved):0)+' or more may still have recovered; validation is diagnostic, not a funnel stage.':'';const leak=biggestLeak();$('bigLeak').textContent=leak?leak.lost:'—';$('bigLeakText').textContent=leak?leak.from+' → '+leak.to:'Not enough data yet';$('bigLeakRate').textContent=leak?leak.loss_rate+'% of that stage dropped here.':'';const trend=a.traffic_trend?.length?a.traffic_trend:a.hourly_24h;$('trafficChart').innerHTML=trafficChart(trend,!!a.traffic_trend?.length);if($('trafficSub'))$('trafficSub').textContent=a.traffic_trend?.length?'Last '+(a.days||30)+' days':'Last 24 hours';$('sources').innerHTML=bars(a.sources);$('needs').innerHTML=bars(a.needs);$('cities').innerHTML=bars(a.cities);if($('devices'))$('devices').innerHTML=bars(a.devices);$('journeys').innerHTML=(a.recent||[]).map(j=>'<div class="jrow"><span>'+esc(fmt(j.last_seen))+'</span><span>'+esc(j.device||'unknown')+'</span><span><strong>'+esc(j.stage||'viewed')+'</strong></span><span>'+esc(j.source||'direct')+'</span><span>'+esc([j.city,j.need,j.sub].filter(Boolean).join(' · ')||'—')+'</span></div>').join('')||'<div class="empty">No journeys yet.</div>';const d=a.definitions||{};$('definitions').innerHTML=Object.entries(d).map(([k,v])=>'<p><strong>'+esc(k.replaceAll('_',' '))+':</strong> '+esc(v)+'</p>').join('')+'<p><strong>Lead tracking coverage:</strong> '+(a.tracked_lead_records||0)+' CRM leads have an analytics session ID; '+(a.untracked_lead_records||0)+' do not.</p>'}
const BASE=[{k:'goal',q:'What exactly does she want to achieve?',t:'text'},{k:'deadline',q:'When does she need this by?',t:'date'},{k:'finland_time',q:'How long has she lived in Finland?',t:'select',o:['Under 1 year','1–5 years','5+ years']},{k:'jobseeker',q:'Is she registered as a jobseeker?',t:'select',o:['Yes','No','Not sure']},{k:'work_status',q:'What is her current situation?',t:'select',o:['Unemployed','Working full-time','Working part-time','At home with children','Student','Other']}];
const Q={daycare:[{k:'child_age',q:'How old is the child?',t:'number'},{k:'start_date',q:'When should daycare start?',t:'date'},{k:'has_place',q:'What is the current daycare situation?',t:'select',o:['No place','Municipal place','Private place','In queue']},{k:'applied',q:'Has she already applied?',t:'select',o:['No','Yes','Not sure']},{k:'reason',q:'Why is daycare needed now?',t:'select',o:['Work','Studies','Finnish/integration course','Family need','Other']},{k:'area',q:'Preferred area / neighbourhood?',t:'text'},{k:'private_ok',q:'Are private/service-voucher options okay?',t:'select',o:['Yes','No','Explain first']}],hobby:[{k:'child_age',q:'Child age / school grade?',t:'text'},{k:'area',q:'Neighbourhood?',t:'text'},{k:'interest',q:'What does the child like?',t:'select',o:['Football/sports','Swimming','Dance','Art/music','Coding/gaming','Not sure','Other']},{k:'cost',q:'Does it need to be free?',t:'select',o:['Must be free','Small fee okay','Not sure']},{k:'travel',q:'How far can the family travel?',t:'text'}],school_child:[{k:'child_age',q:'Child age and grade?',t:'text'},{k:'school',q:'Which school?',t:'text'},{k:'concern',q:'What is the main concern?',t:'select',o:['Finnish / S2','Reading/writing','Maths','Behaviour/concentration','Bullying','Special support','Wilma / communication','Other']},{k:'school_support',q:'Has the school already discussed support?',t:'select',o:['Yes','No','Not sure']},{k:'message',q:'Is there a Wilma message, meeting or decision?',t:'select',o:['Yes','No']}],education:[...BASE,{k:'finnish',q:'Current Finnish level?',t:'select',o:['Almost none','Basic','Daily life','Intermediate','Not sure']},{k:'education',q:'Highest education completed?',t:'text'},{k:'documents',q:'Are certificates/diplomas available?',t:'select',o:['Yes','No','Some']},{k:'childcare',q:'Does childcare affect studying?',t:'select',o:['Yes','No']},{k:'education_goal',q:'What is the education goal?',t:'select',o:['Learn Finnish','YKI','First qualification','Vocational school','Return to school','Higher education / own field','Not sure']}],work:[...BASE,{k:'experience',q:'What work has she done before?',t:'text'},{k:'wanted_job',q:'What work does she want now?',t:'text'},{k:'finnish',q:'Current Finnish level?',t:'select',o:['Almost none','Basic','Daily life','Intermediate','Not sure']},{k:'cv',q:'What is the CV status?',t:'select',o:['Updated','Old','No CV']},{k:'cards',q:'What work cards / certificates does she have?',t:'text'},{k:'barrier',q:'What is the biggest barrier right now?',t:'select',o:['Language','CV/application','No Finnish experience','No qualification','Childcare','Transport','Not sure where to apply','Other']},{k:'training',q:'Is she open to training for a new field?',t:'select',o:['Yes','No','Maybe']}],general:[...BASE,{k:'details',q:'Tell me a little more about the situation.',t:'text'}]};
function route(x){const s=(x.sub_need||'').toLowerCase(),m=(x.main_need||'').toLowerCase();if(s.includes('xannaano')||s.includes('päivä'))return'daycare';if(s.includes('harr')||s.includes('ciyaar'))return'hobby';if(s.includes('dugsi')&&m.includes('carr'))return'school_child';if(m.includes('waxbar')||s.includes('finnish')||s.includes('yki')||s.includes('shahaad'))return'education';if(m.includes('shaq')||s.includes('shaq')||s.includes('tababar'))return'work';return'general'}
function openInterview(id){activeLead=leads.find(x=>x.id===id);if(!activeLead)return;answers={};window.AqoonInterview.activeLead=activeLead;window.AqoonInterview.currentAnswers=answers;$('dName').textContent='First interview · '+activeLead.name;$('dMeta').textContent=[activeLead.city,activeLead.main_need,activeLead.sub_need].filter(Boolean).join(' · ');$('iUrgency').value=activeLead.urgency||'normal';$('iNextAction').value=activeLead.latest_interview?.next_action||'';$('iFollow').value=activeLead.next_follow_up_at?new Date(new Date(activeLead.next_follow_up_at).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'';const ru=$('iRelevantUpdatesOk'),of=$('iOutcomeFollowupOk');if(ru)ru.value=activeLead.consent_relevant_updates_ok===true?'Yes':activeLead.consent_relevant_updates_ok===false?'No':'';if(of)of.value=activeLead.consent_outcome_followup_ok===true?'Yes':activeLead.consent_outcome_followup_ok===false?'No':'';$('iNotes').value='';$('noteSuggestions')?.classList.add('hidden');$('promptWrap').classList.add('hidden');$('questions').innerHTML='';$('drawer').classList.remove('hidden')}
window.openInterview=openInterview;
function qHtml(q){if(q.t==='select')return'<div class="question"><label>'+esc(q.q)+'</label><div class="choice-row" data-key="'+q.k+'">'+q.o.map(o=>'<button type="button" class="choice" data-value="'+esc(o)+'">'+esc(o)+'</button>').join('')+'</div></div>';return'<div class="question"><label>'+esc(q.q)+'</label><input data-key="'+q.k+'" type="'+(q.t||'text')+'"></div>'}
function bindQ(){$('questions').querySelectorAll('input').forEach(i=>i.oninput=()=>answers[i.dataset.key]=i.value);$('questions').querySelectorAll('.choice-row').forEach(r=>r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');answers[r.dataset.key]=b.dataset.value}))}
function likelyPrograms(lead){const city=(lead.city||'').toLowerCase(),type=route(lead);return programs.filter(p=>{const pc=(p.city||'').toLowerCase(),cat=(p.category||'').toLowerCase(),cityOk=!pc||pc==='finland'||pc===city,typeOk=type==='work'?/(work|employment|youth)/.test(cat):type==='education'?/(education|language|integration|work)/.test(cat):type==='hobby'?/hobby/.test(cat):type==='daycare'?/(daycare|integration_parent|language_parent)/.test(cat):true;return cityOk&&typeOk}).slice(0,8)}
function answerLines(ans){const labels=Object.fromEntries(activeQuestions.map(q=>[q.k,q.q]));return Object.entries(ans).map(([k,v])=>'- '+(labels[k]||k)+': '+v).join('\n')||'- No interview answers recorded.'}
function programLines(ps){return ps.length?ps.map(p=>'- '+p.name+' | Organisation: '+(p.organisation||'unknown')+' | City: '+(p.city||'Finland')+' | Audience: '+(p.audience||'not recorded')+' | Need match: '+(p.pain_match||'not recorded')+' | Status: '+(p.application_status||p.status||'unknown')+' | Deadline: '+(p.deadline||'none recorded')+' | Last verified: '+(p.last_verified_at||'unknown')+' | Official source: '+(p.source_url||'none')).join('\n'):'- No pre-matched programme. Search official sources from scratch.'}
function makePrompt(lead,ans,notes){const ps=likelyPrograms(lead),follow=$('iFollow').value?new Date($('iFollow').value).toISOString():(lead.next_follow_up_at||'not scheduled');return `AQOON FAMILY CASE — COMPREHENSIVE DEEP-RESEARCH BRIEF\n\nPURPOSE\nUse this structured first-call information to find the best practical next route for this family. I need a decision-ready answer for the next call, not a generic list.\n\nCASE CONTEXT\nCase ID: ${lead.id}\nCity: ${lead.city||'unknown'}\nOriginal request: ${lead.main_need||'unknown'} / ${lead.sub_need||'unknown'}\nAge group: ${lead.age_group||'not recorded'}\nInterview route: ${route(lead)}\nCurrent AQOON journey stage: ${lead.journey_stage||'reach'}\nUrgency: ${$('iUrgency').value}\nNext follow-up: ${follow}\nOriginal source: ${lead.utm_source||lead.referrer_host||lead.source||'unknown'}\n\nFIRST-CALL ANSWERS\n${answerLines(ans)}\n${notes?'\nCaller notes: '+notes:''}\n\nCURRENT AQOON PROGRAMME-DATABASE CANDIDATES\nTreat these as leads to verify, not guaranteed matches:\n${programLines(ps)}\n\nINTERNAL AQOON CONTEXT — SEARCH FIRST WHEN AVAILABLE\nUse connected/uploaded AQOON files and prior research where relevant, especially the evidence bank, messaging matrix, family-journey playbook, Pilke and Vantaa pilot material, internal/open-programmes.md, internal/first-call-questionnaires.md, the latest Finland Programme Watch findings and the private programme registry. Use them for context and discovery, never as proof that current eligibility or deadlines are unchanged.\n\nDEEP-RESEARCH TASK\n1. Diagnose the exact situation and identify missing facts that materially change the route.\n2. Search current primary official sources comprehensively: relevant municipality, Työmarkkinatori / Job Market Finland, Kela, Opintopolku / Studyinfo, OPH, InfoFinland and the actual programme/provider page.\n3. Verify every serious candidate today: target group, city/residency rules, status conditions, language level, cost, availability, application method, deadline, official contact and exact link.\n4. Classify routes as CONFIRMED MATCH, POSSIBLE — AUTHORITY/PROVIDER MUST CONFIRM, or DOES NOT FIT.\n5. Recommend ONE best route first. Give at most two alternatives only if genuinely useful.\n6. Give the exact next action for the next 48 hours, in order.\n7. List missing documents/facts.\n8. Flag deadlines and timing risks.\n9. Tell me what to say/do on the next AQOON call and recommend a follow-up date.\n10. End with a short natural Somali explanation I can say or send.\n11. End with CRM UPDATE: journey_stage, urgency, next_follow_up_at, best programme/service, organisation, official link and possible partner organisation.\n12. End with WATCHLIST: what may change and should be re-checked by the recurring programme/deadline monitor.\n\nQUALITY & SAFETY\n- Prefer current official primary sources and cite factual eligibility/deadline/process claims.\n- Never guarantee Kela benefits, legal eligibility, admission, employment or programme acceptance.\n- If current official sources conflict with AQOON files/database, current official information wins and state the discrepancy.\n- Avoid repeating the person’s phone number or unnecessary identifying information.\n- Be comprehensive in research but concise and prioritized in the final recommendation.`}
function saveInterview(){if(!activeLead)return;const notes=$('iNotes').value.trim(),nextAction=$('iNextAction').value.trim(),follow=$('iFollow').value?new Date($('iFollow').value).toISOString():null,prompt=makePrompt(activeLead,answers,notes),summary='Goal: '+(answers.goal||activeLead.sub_need||activeLead.main_need)+'; '+Object.entries(answers).slice(0,7).map(([k,v])=>k+': '+v).join('; ')+(notes?'; Notes: '+notes:'');$('saveInterview').disabled=true;api({action:'save_interview',lead_id:activeLead.id,interview_type:route(activeLead),answers,summary,research_prompt:prompt,next_action:nextAction||null,next_follow_up_at:follow,urgency:$('iUrgency').value,status:'completed'}).then(()=>{$('promptBox').textContent=prompt;$('promptWrap').classList.remove('hidden');window.AqoonCaseLifecycle?.logInterviewCompleted?.(activeLead.id);return load()}).catch(e=>err(e.message)).finally(()=>$('saveInterview').disabled=false)}
window.saveInterview=saveInterview;
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{tab(b.dataset.go)});
$('login').onsubmit=e=>{e.preventDefault();password=$('password').value;api({action:'ping'}).then(()=>{sessionStorage.setItem('aqoon_tracker_password',password);$('lock').classList.add('hidden');$('app').classList.remove('hidden');load()}).catch(()=>$('loginErr').textContent='Password not accepted.')};
$('refresh').onclick=load;$('logout').onclick=lock;$('closeDrawer').onclick=()=>$('drawer').classList.add('hidden');$('saveInterview').onclick=saveInterview;$('copyPrompt').onclick=()=>{navigator.clipboard?.writeText($('promptBox').textContent);$('copyPrompt').textContent='Copied ✓'};
$('days').onchange=()=>api({action:'analytics',days:Number($('days').value)}).then(a=>{analytics=a;renderDashboard();renderAnalytics();correctValidationNote()});
const saved=sessionStorage.getItem('aqoon_tracker_password');if(saved){password=saved;api({action:'ping'}).then(()=>{$('lock').classList.add('hidden');$('app').classList.remove('hidden');load()}).catch(lock)}else $('password').focus();
setInterval(()=>{if(password&&!document.hidden)load()},60000);document.addEventListener('visibilitychange',()=>{if(password&&!document.hidden)load()});
})();

// ---- visual-v3.js ----
(()=>{'use strict';
const $=id=>document.getElementById(id);
function nav(){const items={dashboard:['⌂','Today'],crm:['♡','Families'],analytics:['↗','Analytics'],sales:['◎','Sales']};Object.entries(items).forEach(([key,value])=>{const b=document.querySelector('.tab[data-tab="'+key+'"]');if(b)b.innerHTML='<span>'+value[0]+'</span>'+value[1]})}
function enhanceFunnel(){const rows=[...document.querySelectorAll('#fullFunnel .frow')];if(!rows.length)return;rows.forEach(r=>r.querySelectorAll('.drop-note').forEach(x=>x.remove()));const vals=rows.map(r=>Number(r.querySelector('strong')?.textContent)||0);rows.forEach((r,i)=>{if(i>=rows.length-1)return;const from=vals[i],to=vals[i+1],lost=Math.max(0,from-to),rate=from?Math.round(lost/from*100):0;const d=document.createElement('div');d.className='drop-note '+(!lost?'neutral':'');d.textContent=lost?'-'+lost+' lost · '+rate+'%':'no loss';r.appendChild(d)});enhanceTraffic()}
function enhanceTraffic(){const cols=[...document.querySelectorAll('#trafficChart .tcol')];if(!cols.length)return;let best=null,bestN=-1;cols.forEach(c=>{const m=(c.getAttribute('title')||'').match(/:\s*(\d+)\s+sessions/i),n=m?Number(m[1]):0;if(n>bestN){bestN=n;best=c}});const peak=$('trafficPeak');if(peak&&best){const label=best.querySelector('small')?.textContent||'';peak.textContent='peak '+label}}
function controls(){document.querySelectorAll('#periodSwitch [data-days]').forEach(b=>b.onclick=()=>{const d=b.dataset.days,sel=$('days');if(!sel)return;sel.value=d;document.querySelectorAll('#periodSwitch button').forEach(x=>x.classList.toggle('on',x===b));sel.dispatchEvent(new Event('change',{bubbles:true}))});document.querySelectorAll('.breakdown-tabs [data-breakdown]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.breakdown-tabs button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.breakdown-pane').forEach(p=>p.classList.toggle('hidden',p.dataset.pane!==b.dataset.breakdown))})}
function watch(){const funnel=$('fullFunnel'),traffic=$('trafficChart');if(funnel)new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.frow')||n.querySelector?.('.frow')))))requestAnimationFrame(enhanceFunnel)}).observe(funnel,{childList:true});if(traffic)new MutationObserver(()=>requestAnimationFrame(enhanceTraffic)).observe(traffic,{childList:true})}
nav();controls();watch();setTimeout(()=>{enhanceFunnel();enhanceTraffic()},500);
})();

// ---- crm-reactive.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const $=id=>document.getElementById(id);
let busy=false,timer=null;
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(body){const p=password();if(!p)return null;const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':p},body:JSON.stringify(body),cache:'no-store'});if(!r.ok)return null;return r.json()}
function ensureStrip(){const host=document.querySelector('#analytics .analytics-summary');if(!host)return null;let strip=$('crmStateStrip');if(strip)return strip;strip=document.createElement('div');strip.id='crmStateStrip';strip.className='crm-state-strip';const secondary=host.querySelector('.secondary-kpis');if(secondary)secondary.insertAdjacentElement('afterend',strip);else host.appendChild(strip);return strip}
function renderStates(leads){const strip=ensureStrip();if(!strip)return;const all=leads||[],waiting=all.filter(x=>x.status==='new').length,contacted=all.filter(x=>x.status==='contacted').length,resolved=all.filter(x=>x.status==='resolved'||x.journey_stage==='resolved').length,active=all.filter(x=>x.status!=='resolved'&&x.journey_stage!=='resolved').length;strip.innerHTML='<div><span>Active</span><strong>'+active+'</strong></div><div><span>Waiting</span><strong>'+waiting+'</strong></div><div><span>Contacted</span><strong>'+contacted+'</strong></div><div><span>Resolved</span><strong>'+resolved+'</strong></div>'}
async function sync(){if(busy)return;busy=true;try{const d=await api({action:'list'});if(d&&Array.isArray(d.leads))renderStates(d.leads)}finally{busy=false}}
function scheduleSync(delay=450){clearTimeout(timer);timer=setTimeout(async()=>{const refresh=$('refresh');if(refresh)refresh.click();await sync()},delay)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-contacted],[data-resolve],[data-stage],#saveInterview');if(!b)return;scheduleSync(b.id==='saveInterview'?850:500)},true);
const app=$('app');if(app)new MutationObserver(()=>{if(!app.classList.contains('hidden'))sync()}).observe(app,{attributes:true,attributeFilter:['class']});
const analytics=$('analytics');if(analytics)new MutationObserver(()=>{if(!analytics.classList.contains('hidden'))sync()}).observe(analytics,{attributes:true,attributeFilter:['class']});
setTimeout(sync,700);
})();

// ---- interview-match.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin',$=id=>document.getElementById(id);
let C={lead:null,routes:[],programs:[]};
const O={yn:['Yes','No','Not sure'],job:['Yes – active','Registered, active status not sure','No','Not sure'],lvl:['Almost none','Basic','Daily life','Intermediate','Advanced','Not sure']};
function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}async function api(b){const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify(b),cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
const low=v=>String(v||'').toLowerCase();
function rt(n){const m=low(n.main_need),s=low(n.sub_need);if(m.includes('shaq')&&(s.includes('ganacsi')||s.includes('business')))return'entrepreneurship';if(m.includes('carr')&&(s.includes('xannaano')||s.includes('päivä')||s.includes('esiopetus')||s.includes('diiwaangelin')))return'daycare';if(m.includes('carr')&&(s.includes('dugsi')||s.includes('taageerada ilmaha')))return'school_child';if(m.includes('carr')&&(s.includes('ciyaar')||s.includes('hobby')))return'hobby';if(m.includes('waxbar')||s.includes('finnish')||s.includes('yki')||s.includes('shahaad'))return'education';if(m.includes('shaq'))return'work';if(m.includes('barnaamij')&&(s.includes('adeeg')||s.includes('taageero')))return'service_support';if(m.includes('barnaamij'))return'program';return'general'}
function needs(l){return[{main_need:l.main_need,sub_need:l.sub_need,age_group:l.age_group},...(Array.isArray(l.additional_needs)?l.additional_needs:[])].filter(Boolean)}function routes(l){return[...new Set(needs(l).map(rt))]}
const F={
core:[['client_age','Exact age of the adult/client?','number',null,1],['home_municipality','Is the intake city their registered kotikunta?','select',O.yn,1]],
work:[['jobseeker_active','Is job search currently active in local employment services / Työmarkkinatori?','select',O.job,1],['unemployment_duration','How long unemployed?','select',['Not unemployed','Under 3 months','3–6 months','6–12 months','12–24 months','24+ months','Not sure'],1],['employment_plan','Current employment plan with employment services?','select',O.yn,1],['integration_plan','Active kotoutumissuunnitelma?','select',O.yn],['right_to_work_known','Right to work for the target jobs already confirmed/known?','select',['Yes','No','Not sure – verify'],1],['palkkatuki','Has employment services written/said that palkkatuki may apply?','select',['Written/confirmed by employment services','Said it may be possible','No','Not sure'],1],['availability','Realistic work times?','multi',['Full-time','Part-time','Day','Evening','Night','Weekend'],1],['start_when','When can they start?','select',['Immediately','Within 2 weeks','Within 1 month','Later'],1],['travel_limit','Travel limit?','select',['Own city','Capital region / nearby','~30 min','~60 min','Flexible'],1],['childcare_limit','Childcare constraint?','select',['None','Daytime only','Need childcare/daycare first','Other / not sure'],1],['work_tryout','Open to työkokeilu if employment services agrees?','select',['Yes','No','Maybe']],['apprenticeship','Open to oppisopimus?','select',['Yes','No','Maybe']]],
entrepreneurship:[['business_stage','Business stage?','select',['Idea','Planning/business plan','Registered, not full-time','Part-time operating','Full-time already started','Not sure'],1],['fulltime_started','Has full-time business already started/expanded to full-time?','select',O.yn,1],['business_idea','What does the business sell and to whom?','text',null,1],['business_plan','Business plan status?','select',['Ready','Draft','Not started','Not sure'],1],['business_numbers','Profitability/income-cost calculations done?','select',O.yn,1],['starttiraha','Starttiraha status?','select',['Applied','Discussed with employment services','Not yet','Not sure'],1],['business_start','Planned full-time start date?','date'],['business_help','Help needed?','multi',['Business plan','Calculations','Starttiraha','Y-tunnus/registration','Permits','Financing','Customers/sales','Training'],1]],
education:[['integration_plan','Active kotoutumissuunnitelma?','select',O.yn],['literacy','Reading/writing with Latin alphabet?','select',['Comfortable','Some difficulty','Major difficulty','Not sure'],1],['basic_school','Basic education/equivalent completed?','select',O.yn,1],['current_study','Current study/course?','select',['No','Finnish course','Integration training','Vocational','Other','Not sure'],1],['study_language','Possible study languages?','multi',['Finnish','English','Swedish','Not sure'],1],['study_load','Possible study format?','multi',['Full-time','Part-time','Day','Evening','Online/hybrid'],1],['study_travel','Travel limit for studies?','select',['Own city','Capital region / nearby','~30 min','~60 min','Flexible'],1],['study_start','Desired start?','select',['ASAP','This autumn','This spring','Within 6 months','Flexible'],1],['yki_purpose','If YKI matters, purpose?','select',['Citizenship','Work','Study','Professional requirement','Personal','Not relevant/not sure']],['yki_level','If YKI matters, target level?','select',['Basic','Intermediate','Advanced','Not sure','Not relevant']]],
daycare:[['home_municipality','Is intake city the child’s registered municipality?','select',O.yn,1],['care_goal','Need?','select',['Päiväkoti','Esiopetus','Esiopetus + daycare','Application help','Not sure'],1],['care_schedule','Required care times?','multi',['Weekday full-day','Weekday part-day','Early morning','Evening','Night','Weekend'],1],['application_date','If already applied, application date?','date'],['sudden_need','Is the need genuinely sudden/unforeseen?','select',O.yn,1],['all_guardians','Are all guardians unavailable during needed hours for work/study/accepted reason?','select',O.yn],['urgent_proof','If urgent route: written proof available?','select',['Yes','No','Not sure','Not relevant'],1],['care_options','Options family can consider?','multi',['Municipal','Private','Palveluseteli','Family daycare','No preference'],1],['cost_priority','Cost constraint?','select',['Lowest-cost needed','Private possible depending fee','Cost not main constraint','Not sure'],1],['support_arrangement','Support/accessibility arrangement provider must confirm?','select',['No','Yes – confirm','Not sure / discuss separately'],1]],
hobby:[['grade','School grade?','select',['1','2','3','4','5','6','7','8','9','Other/not sure'],1],['school_name','School name?','text',null,1],['home_municipality','Is intake city the child’s municipality?','select',O.yn,1],['days','Possible days?','multi',['Mon','Tue','Wed','Thu','Fri','Weekend','Flexible'],1],['hobby_time','Possible time?','select',['After school','Late afternoon','Evening','Flexible'],1],['other_school','Can child attend a group at another school if allowed?','select',O.yn,1],['hobby_language','Instruction languages okay?','multi',['Finnish','English','Swedish','Any/not important']],['accessibility','Accessibility/support need organiser must confirm?','select',['No','Yes – confirm','Not sure']],['registration','Already tried to register?','select',['No','Waiting','Group full','Registered','Not sure']]],
school_child:[['grade','Current grade/year?','text',null,1],['home_municipality','Is intake city the child’s municipality?','select',O.yn,1],['born_finland','Was the child born in Finland?','select',O.yn,1],['fin_school_time','Time in Finnish school/esiopetus?','select',['Not started','<6 months','6–12 months','1–2 years','2+ years','Not sure'],1],['school_route','Current route?','select',['Valmistava','Basic education','Esiopetus','TUVA','Not sure'],1],['child_finnish','Finnish for learning?','select',['Very little','Basic everyday','Some lessons','Mostly comfortable','Not sure'],1],['s2','Currently S2?','select',O.yn,1],['support_tried','What support already tried/discussed?','multi',['Group support','Extra/remedial teaching','S2','Pupil-specific support','Special teacher/small group','Meeting only','Nothing','Not sure'],1],['support_decision','Assessment/decision for pupil-specific support?','select',['Decision exists','Assessment started','No','Not sure'],1],['school_deadline','Upcoming meeting/deadline/transition date?','text'],['school_goal','What should happen next?','multi',['Understand current support','Ask for meeting','Check S2/valmistava','Start/review support','Understand Wilma/decision','Other'],1]],
program:[['jobseeker_active','Active jobseeker?','select',O.job,1],['integration_plan','Active kotoutumissuunnitelma?','select',O.yn,1],['integration_assessment','Integration/skills service-needs assessment done?','select',O.yn],['residence_status','Valid residence permit/right of residence or pending extension known?','select',['Yes','No','Not sure – authority must verify'],1],['first_permit_time','Time since first residence permit/right-of-residence registration?','select',['<1 year','1–3 years','3+ years','Not sure'],1],['finnish_match','Finnish level?','select',O.lvl,1],['literacy','Reading/writing with Latin alphabet?','select',['Comfortable','Some difficulty','Major difficulty','Not sure'],1],['parent_status','Caring for children at home?','select',['No','Child under 3','Child 3–6','School-age child','Not sure'],1],['kotihoidon_tuki','If home parent: receiving kotihoidon tuki?','select',['Yes','No','Not sure','Not relevant']],['program_goal','Programme should help with?','multi',['Finnish','Employment','Job search','Vocational training','Qualification','Entrepreneurship','Digital skills','Finnish society','Parent/family','Community/social'],1],['program_time','Participation times?','multi',['Weekday day','Evening','Weekend','Part-time only','Full-time possible','Online'],1],['program_childcare','Need childcare to participate?','select',['No','Yes – must be provided','Family can arrange','Not sure'],1],['program_cost','Cost possible?','select',['Must be free','Small fee okay','Paid okay','Not sure'],1],['program_travel','Travel limit?','select',['Own city','Capital region/nearby','~60 min','Online preferred','Flexible'],1]],
service_support:[['service_area','Which system owns the issue?','select',['Kela','Employment services/Työmarkkinatori','Migri','Municipality','Päiväkoti/school','Housing','Contract/bill','Other','Not sure'],1],['case_status','Case stage?','select',['Not started','Applied','More information requested','Decision received','Payment/service changed/stopped','Deadline/appeal period running','Not sure'],1],['decision_date','Decision/letter date?','date'],['response_deadline','Visible reply/document/appeal deadline?','text'],['support_goal','Help needed?','multi',['Understand letter/decision','Find official form/page','Prepare application','Know requested documents','Contact correct authority','Prepare questions','Understand next step'],1],['authority_contacted','Authority already contacted?','select',O.yn,1]],
general:[['known_service','Known authority/service/programme?','text'],['already_tried','What has already been tried?','text']]
};
function addFields(rs){const host=$('questions'),existing=new Set([...host.querySelectorAll('[data-key]')].map(x=>x.dataset.key)),adult=rs.some(r=>['work','education','entrepreneurship','program','service_support','general'].includes(r)),workContext=[['primary_situation','What is the person’s main situation right now?','select',['Studying','Working','Unemployed / seeking work','Other / mixed','Not sure'],1],['work_intent','What kind of work are they looking for?','select',['Part-time','Full-time','Both','Occasional / flexible','Not sure'],1],['study_path','What are they studying?','select',['Peruskoulu / basic education','Aikuisten perusopetus','Lukio or vocational','Higher education','Course / other','Not sure'],1]],sets=[...(adult?[F.core]:[]),...(rs.includes('work')?[workContext]:[]),...rs.map(r=>F[r]||F.general)];sets.flat().forEach(f=>{if(existing.has(f[0]))return;const d=document.createElement('div');d.className='question match-extra';d.dataset.matchRequired=f[4]?'1':'0';d.dataset.branch=f[0]==='study_path'?'student':['jobseeker_active','unemployment_duration','employment_plan','integration_plan','palkkatuki','work_tryout'].includes(f[0])?'jobseeker':'';d.innerHTML='<label>'+f[1]+(f[4]?' <small style="color:#0A8F89">needed for matching</small>':'')+'</label>'+control(f);host.appendChild(d);existing.add(f[0])});applyWorkContext()}
function control(f){const[k,q,t,o]=f;if(t==='select'||t==='multi')return'<div class="choice-row '+(t==='multi'?'match-multi':'')+'" data-key="'+k+'">'+o.map(v=>'<button type="button" class="choice" data-value="'+v.replace(/"/g,'&quot;')+'">'+v+'</button>').join('')+'</div>';return'<input data-key="'+k+'" type="'+(t||'text')+'">'}
function applyWorkContext(){const situation=document.querySelector('#questions [data-key="primary_situation"] .choice.on')?.dataset.value||'',student=situation==='Studying';document.querySelectorAll('#questions .match-extra[data-branch="student"]').forEach(x=>x.classList.toggle('hidden',!student));document.querySelectorAll('#questions .match-extra[data-branch="jobseeker"]').forEach(x=>x.classList.toggle('hidden',student))}
function bindExtras(){document.querySelectorAll('#questions .match-extra .choice-row').forEach(r=>r.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{if(r.classList.contains('match-multi'))b.classList.toggle('on');else{r.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on')}applyWorkContext()}))}
function collect(){const a={};document.querySelectorAll('#questions input[data-key],#questions textarea[data-key]').forEach(x=>{if(x.value.trim())a[x.dataset.key]=x.value.trim()});document.querySelectorAll('#questions .choice-row[data-key]').forEach(r=>{const on=[...r.querySelectorAll('.choice.on')].map(x=>x.dataset.value);if(on.length)a[r.dataset.key]=r.classList.contains('match-multi')?on:on[0]});return a}
function labels(){const m={};document.querySelectorAll('#questions .question').forEach(q=>{const k=q.querySelector('[data-key]')?.dataset.key;if(k)m[k]=q.querySelector('label')?.textContent.replace('needed for matching','').trim()||k});return m}
function missing(a){return[...document.querySelectorAll('#questions .match-extra[data-match-required="1"]:not(.hidden)')].filter(q=>{const k=q.querySelector('[data-key]')?.dataset.key,v=a[k];return !v||(Array.isArray(v)&&!v.length)})}
function candidates(){const city=low(C.lead.city);return(C.programs||[]).filter(p=>{const pc=low(p.city),cat=low(p.category);return(!pc||pc==='finland'||pc===city)&&C.routes.some(r=>({work:/work|employment|training|youth/,education:/education|language|integration|training/,entrepreneurship:/business|entrepreneur/,daycare:/daycare|parent|family/,hobby:/hobby/,school_child:/school|education/,program:/integration|language|employment|education|parent|women|youth/,service_support:/service|integration|employment|family/,general:/.*/}[r]||/.*/).test(cat))}).slice(0,5)}
function routeTask(r){return({work:'Find current real jobs plus only relevant employment programmes/training. Match job requirements, Finnish/English, experience, cards, hours, travel, childcare and start date. Työkokeilu requires jobseeker status + agreement in the employment plan + employment-authority assessment. Palkkatuki is employer support based on the unemployed jobseeker’s service need; never claim eligibility without employment-services assessment.',entrepreneurship:'Find current business guidance/training/starttiraha route. Verify that starttiraha is applied for before starting/expanding full-time business and that the local employment authority assesses entrepreneurship capability/profitability. Never promise it.',education:'Find current Finnish/YKI/vocational/TUVA/labour-market-training routes matching language, prior education, certificates, schedule, childcare, travel and start timing. Admission criteria are provider-specific. For YKI verify current OPH registration/test terms and target level.',daycare:'Use the child’s municipality first. Match päiväkoti/esiopetus/municipal/private/palveluseteli route, start date and schedule. Urgent route must satisfy the municipality’s current sudden/unforeseen rules and proof requirements; never promise a two-week place.',hobby:'Match current city/school hobby groups by grade, school, age, interest, cost, schedule and travel. Check current registration/open-space status.',school_child:'Use current municipality + OPH rules for S2, valmistava and learning support. Match age/grade, time in Finnish school, birthplace rule where relevant, Finnish level, support already tried and current assessment/decision. Do not diagnose or promise a support decision.',program:'Search active municipal/integration/employment/education/NGO/hanke options. Match kotikunta, age, workforce/jobseeker status, integration status, language/literacy, parent/childcare situation, time, cost, travel and referral/intake rules.',service_support:'Identify the responsible authority first and the exact official next step. Explain process, documents and deadlines, but do not determine Kela/Migri/legal entitlement or predict the decision.',general:'First identify the responsible official system/service, then research that route.'})[r]}
function prompt(a){const L=labels(),ans=Object.entries(a).map(([k,v])=>'- '+(L[k]||k)+': '+(Array.isArray(v)?v.join(', '):v)).join('\n'),req=needs(C.lead).map((n,i)=>'- '+(i?'Additional':'Primary')+': '+n.main_need+' / '+n.sub_need).join('\n'),ps=candidates().map(p=>'- '+p.name+' | '+(p.organisation||'')+' | '+(p.city||'Finland')+' | '+(p.application_status||p.status||'unknown')+' | deadline '+(p.deadline||'unknown')+' | '+(p.source_url||'')).join('\n')||'- none';let x=`AQOON FAMILY CASE — CRITERIA-MATCHED RESEARCH\n\nGOAL\nFind the best CURRENT job/programme/training/service route for this exact person. Treat interview answers as filters, not decoration. Do not give a generic list.\n\nCASE\nID: ${C.lead.id}\nCity: ${C.lead.city||'unknown'}\nJourney stage: ${C.lead.journey_stage||'reach'}\nUrgency: ${$('iUrgency').value}\n\nNEEDS\n${req}\n\nROUTES\n${C.routes.map(r=>'- '+r).join('\n')}\n\nFIRST-INTERVIEW ANSWERS\n${ans}\n${$('iNotes').value.trim()?'\nCaller notes: '+$('iNotes').value.trim():''}\n\nROUTE RULES\n${C.routes.map((r,i)=>(i+1)+'. '+r.toUpperCase()+': '+routeTask(r)).join('\n')}\n\nINTERNAL AQOON CANDIDATES — discovery only, must re-verify\n${ps}\n\nRESEARCH METHOD\n1. Search current primary sources first: responsible municipality/employment area, Työmarkkinatori, Kela, Opintopolku/Studyinfo, OPH, Migri only when right-to-work/residence is relevant, and the actual provider/employer page.\n2. For jobs, search current employer pages/reputable vacancies and verify each posting’s requirements.\n3. Check every serious candidate against relevant criteria: municipality/residence, age/grade, jobseeker/work status, integration plan/service status, language/literacy, education/qualification, experience/cards/licences, schedule, childcare, travel, cost/pay, referral/authority approval, application status, deadline and start date.\n4. If a material criterion is unknown or discretionary, do NOT call it confirmed.\n\nMATCH LABELS\nCONFIRMED MATCH = current source shows the recorded criteria fit and no material criterion is missing.\nPOSSIBLE — MUST CONFIRM = promising but a material criterion is unknown/discretionary/provider-or-authority assessed.\nDOES NOT FIT = a current criterion clearly conflicts.\n\nOUTPUT\nA. Case diagnosis and the criteria that actually decide the route.\nB. Missing facts still needed and why they matter.\nC. ONE best route first.\nD. Current matches table: label | job/programme/service | why fit | criteria verified | still unverified | city | cost/pay | deadline/status | exact next action | current source.\n- Work case: up to 10 serious current jobs + up to 5 useful programmes/trainings if genuinely available; do not pad.\n- Education/programme case: strongest 5–10 current options if they genuinely fit.\n- Daycare/school/support: prioritize correct official route and actionable options over quantity.\nE. Important excluded routes and exact reason.\nF. Numbered application/action plan.\nG. What AQOON should ask/say on the next call + follow-up timing.\nH. Short natural Somali explanation; keep familiar Finnish system terms such as Kela, päiväkoti, YKI and Työmarkkinatori when useful.\nI. CRM update: journey_stage, urgency, follow-up, best route/organisation/source.\nJ. Watchlist: changing deadlines/openings/availability/rules.\n\nSAFETY\nAQOON is independent and does not make authority/provider/employer decisions. Never promise Kela benefit, legal/right-to-work result, palkkatuki, daycare place, school support, admission, job, starttiraha or programme acceptance. Cite current sources for eligibility/deadline/process claims. Do not infer sensitive facts; mark them MUST CONFIRM. Do not repeat phone number or unnecessary PII.`;return x.length>15500?x.slice(0,14800)+'\n\nKeep all safety rules above and verify current official sources.':x}
// The queue that opened this interview built its whole list from the same
// leads/programs already sitting in window.AqoonApp - re-fetching both here
// (previously two full 'list'/'programs' round-trips on every single open)
// was pure network wait for data already in memory, and a likely
// contributor to interviews feeling slow to open.
function enhance(id){try{const lead=(window.AqoonApp?.leads||[]).find(x=>x.id===id);if(!lead)return;C={lead,routes:routes(lead),programs:window.AqoonApp?.programs||[]};if(C.routes.includes('entrepreneurship'))['wanted_job','cv','cards','barrier','training'].forEach(k=>document.querySelector('#questions [data-key="'+k+'"]')?.closest('.question')?.remove());addFields(C.routes);bindExtras();$('dMeta').textContent=[lead.city,lead.main_need,lead.sub_need,'Interview topics: '+C.routes.join(' + ')].filter(Boolean).join(' · ');$('saveInterview').textContent='Save first interview & prepare research brief';$('saveInterview').onclick=save}catch(e){$('err').textContent=e.message;$('err').classList.remove('hidden')}}
async function save(){const a=collect(),miss=missing(a);if(miss.length){$('err').textContent='Complete matching fields first: '+miss.slice(0,4).map(x=>x.querySelector('label').textContent).join(' · ');$('err').classList.remove('hidden');miss[0].scrollIntoView({behavior:'smooth',block:'center'});return}const b=$('saveInterview');b.disabled=true;try{const pr=prompt(a),follow=$('iFollow').value?new Date($('iFollow').value).toISOString():null;const ru=$('iRelevantUpdatesOk')?.value,of=$('iOutcomeFollowupOk')?.value,savedAnswers={...a};if(ru)savedAnswers.relevant_updates_ok=ru;if(of)savedAnswers.outcome_followup_ok=of;await api({action:'save_interview',lead_id:C.lead.id,interview_type:C.routes.join('+'),answers:savedAnswers,summary:'Routes: '+C.routes.join(', ')+'; matching criteria: '+Object.keys(a).length,research_prompt:pr,next_follow_up_at:follow,urgency:$('iUrgency').value,status:'completed'});$('promptBox').textContent=pr;$('promptWrap').classList.remove('hidden');$('err').textContent='';$('err').classList.add('hidden');setTimeout(()=>$('refresh')?.click(),300)}catch(e){$('err').textContent=e.message;$('err').classList.remove('hidden')}finally{b.disabled=false}}
// This used to trigger only off clicking a [data-interview] element - the
// old lead-card UI's interview button. The queue redesign calls
// window.openInterview(id) directly with no such element ever existing in
// the DOM, so enhance() (which builds every actual question field and
// rewires the save button) has never once fired since that redesign
// shipped: every interview opened through the new UI showed an empty
// question area. Hooked the same way interview-context.js already does.
const originalOpenForMatch=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForMatch)originalOpenForMatch.call(this,id);
  enhance(id);
};
})();

// ---- interview-match-preview.js ----
(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const REVIEW='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-route-review-admin';
const $=id=>document.getElementById(id);let leadId='',timer=null,lastCandidates=[];
const style=document.createElement('style');style.textContent='.route-preview{background:#eef9f7;border:1px solid #cbe7e4;border-radius:14px;padding:12px;margin:0 0 10px}.route-preview-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px}.route-preview-head span{display:block;font-size:9px;letter-spacing:.08em;color:#36746d;font-weight:800}.route-preview-head strong{display:block;font-size:12px;margin-top:2px}.route-card{background:#fff;border:1px solid #d6ebe7;border-radius:11px;padding:11px;margin-top:8px}.route-card h3{font-size:12px;margin:4px 0 8px}.route-card p,.route-card li,.route-card small{font-size:10px;line-height:1.45}.route-card p{margin:6px 0}.route-card ol{margin:7px 0 8px;padding-left:18px}.route-card a{color:#0c8c80}.route-kicker{font-size:9px;color:#36746d;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.route-conflict{color:#a43f39!important}.route-disclosure{background:#fff5df;padding:7px;border-radius:8px;color:#77521b!important}.route-review-row{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}.route-review-row button{flex:1;min-width:90px;font-size:9px;font-weight:700;padding:6px 4px;border-radius:8px;border:1px solid #d6ebe7;background:#f6fbfa;color:#245c56;cursor:pointer}.route-review-row button:hover{background:#e6f4f1}.route-review-row button[data-review="confirmed_match"]{border-color:#3a9b8a;color:#1f6e62}.route-review-row button[data-review="does_not_fit"]{border-color:#d97560;color:#a43f39}.route-review-status{font-size:9px;color:#36746d;font-weight:700;margin-top:6px}';document.head.appendChild(style);
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
async function api(body){const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password()},body:JSON.stringify(body),cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.detail||d.error||'Could not load route preview');return d}
// family-route-review-admin isn't covered by operator-identity.js's global
// fetch patch (only /family-leads-admin and /ops-admin are), same gap
// worked around elsewhere in this file's sibling modules.
async function reviewApi(body){const headers={'Content-Type':'application/json','x-tracker-password':password()},token=authToken();if(token)headers.Authorization='Bearer '+token;const r=await fetch(REVIEW,{method:'POST',headers,body:JSON.stringify(body),cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.detail||d.error||'Could not save review');return d}
function host(){let el=$('routePreview');if(el)return el;const notes=document.querySelector('#drawer .interview-capture');if(!notes)return null;el=document.createElement('section');el.id='routePreview';el.className='route-preview';el.setAttribute('aria-live','polite');notes.before(el);return el}
function answers(){const out={};document.querySelectorAll('#questions input[data-key],#questions textarea[data-key]').forEach(x=>{if(x.value.trim())out[x.dataset.key]=x.value.trim()});document.querySelectorAll('#questions .choice-row[data-key]').forEach(row=>{const selected=[...row.querySelectorAll('.choice.on')].map(x=>x.dataset.value);if(selected.length)out[row.dataset.key]=row.classList.contains('match-multi')?selected:selected[0]});return out}
function label(key,criteria){return criteria.find(x=>x.field_key===key)?.label||key.replaceAll('_',' ')}
const INPUTS={child_age_or_birth_date:['Child date of birth','date'],permanent_vantaa_residence_context:['Is the child/family permanently resident in Vantaa?','select'],preferred_provider_or_area:['Preferred private daycare or area','text'],preferred_area:['Preferred daycare or area','text'],income_statement_status:['Can the family complete the official income statement?','select'],guardian_or_care_responsibility:['Is the caller a parent, guardian or responsible caregiver?','select'],youngest_child_age:['Age of the youngest child','select'],municipal_ece_status:['Does the child attend municipal early childhood education?','select'],same_child_parental_or_private_daycare_allowance:['Is parental/private day care allowance paid for this same child?','select'],finland_residence_or_employment_context:['Finland residence or employment context','text'],desired_start_date:['Desired care start date','date'],main_status:['Current main status (employed, unemployed, studying, etc.)','text'],earnings_related_status:['Currently receiving earnings-related unemployment allowance?','select'],current_earned_income:['Current earned income, if any','text'],other_income_context:['Other income the family currently has','text'],planned_unemployment_date:['Planned/expected date of becoming unemployed, if known'],household_income_context:['Does the household have a low-income situation that makes a paid hobby difficult?','select'],hobby_support_need:['Is the child looking for a paid, guided hobby?','select'],support_need_description:['What learning or participation support should the organiser assess?','text'],education_support_need:['What study-support or individual-plan issue should the education provider assess?','text']};
function addMissing(candidates){const questions=$('questions');if(!questions)return;const keys=[...new Set(candidates.flatMap(c=>c.missing_fields||[]))];keys.forEach(key=>{if(!INPUTS[key]||questions.querySelector('[data-key="'+key+'"]'))return;const[label,type]=INPUTS[key],box=document.createElement('div');box.className='question match-extra';if(type==='select'){const options=key==='youngest_child_age'?['Under 3','3 or older','Not sure']:['Yes','No','Not sure'];box.innerHTML='<label>'+label+' <small style="color:#0A8F89">needed for matching</small></label><div class="choice-row" data-key="'+key+'">'+options.map(v=>'<button type="button" class="choice" data-value="'+v+'">'+v+'</button>').join('')+'</div>';box.querySelectorAll('.choice').forEach(button=>button.onclick=()=>{box.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));button.classList.add('on')})}else box.innerHTML='<label>'+label+' <small style="color:#0A8F89">needed for matching</small></label><input data-key="'+key+'" type="'+type+'">';questions.appendChild(box)})}
function esc(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function reviewRow(routeKey){return '<div class="route-review-row" data-route-key="'+esc(routeKey)+'">'+
  '<button type="button" data-review="confirmed_match">Confirm match</button>'+
  '<button type="button" data-review="possible_must_confirm">Possible — must confirm</button>'+
  '<button type="button" data-review="does_not_fit">Does not fit</button>'+
  '</div><p class="route-review-status" data-review-status hidden></p>'}
function render(data){const el=host();if(!el)return;lastCandidates=data.candidates||[];addMissing(lastCandidates);const cards=lastCandidates.map(c=>{const title=c.route_key.replace(/^route\./,'').replaceAll('.',' · '),status=c.match_status==='does_not_fit'?'Does not fit from known facts':'Possible — must confirm',miss=c.missing_fields?.length?'<p><strong>Ask next:</strong> '+c.missing_fields.map(k=>esc(label(k,c.criteria||[]))).join(' · ')+'</p>':'<p><strong>Next:</strong> review the authority/provider confirmation.</p>',conf=c.conflicting_criteria?.length?'<p class="route-conflict">'+c.conflicting_criteria.map(esc).join(' ')+'</p>':'',steps=(c.steps||[]).slice(0,2).map(s=>'<li>'+esc(s)+'</li>').join(''),sources=(c.sources||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noreferrer">'+esc(s.title||'Official source')+'</a>').join(' · '),disclosure=c.partner_disclosure_required?'<p class="route-disclosure">Partner/provider relationship must be disclosed before a referral.</p>':'';return '<article class="route-card"><div class="route-kicker">'+status+'</div><h3>'+esc(title)+'</h3>'+conf+miss+'<ol>'+steps+'</ol>'+disclosure+'<small>'+sources+'</small>'+reviewRow(c.route_key)+'</article>'}).join('');el.classList.remove('hidden');el.innerHTML='<div class="route-preview-head"><div><span>Verified route preview</span><strong>Read-only — not an eligibility decision</strong></div><button type="button" class="btn secondary" id="refreshRoutePreview">Refresh</button></div>'+(cards||'<p class="muted">No verified route is mapped to this need yet.</p>');$('refreshRoutePreview')?.addEventListener('click',load);
  el.querySelectorAll('.route-review-row button').forEach(btn=>btn.addEventListener('click',()=>saveReview(btn)))}
async function saveReview(btn){
  const row=btn.closest('.route-review-row'),routeKey=row.dataset.routeKey,matchStatus=btn.dataset.review,candidate=lastCandidates.find(c=>c.route_key===routeKey);
  if(!candidate||!leadId)return;
  const status=row.nextElementSibling;
  row.querySelectorAll('button').forEach(b=>b.disabled=true);
  if(status){status.hidden=false;status.classList.remove('route-conflict');status.textContent='Saving…'}
  try{
    await reviewApi({action:'save_review',lead_id:leadId,route_key:routeKey,match_status:matchStatus,missing_fields:candidate.missing_fields||[],conflicting_criteria:candidate.conflicting_criteria||[],facts_used:answers()});
    if(status)status.textContent='Saved to case timeline ✓';
  }catch(error){
    if(status){status.classList.add('route-conflict');status.textContent=error.message||'Could not save review'}
  }finally{
    row.querySelectorAll('button').forEach(b=>b.disabled=false);
  }
}
function interviewCompleted(){return (window.AqoonApp?.leads||[]).find(l=>l.id===leadId)?.interview_status==='completed'}
async function load(){
  if(!leadId)return;const el=host();if(!el)return;
  // match_preview is server-gated on a completed interview (by design - a
  // route match must never be produced from raw intake); on every other
  // open this used to fetch anyway and show the raw "first_interview_required"
  // error string to the operator. Skip the fetch and say why instead.
  if(!interviewCompleted()){el.classList.remove('hidden');el.innerHTML='<p class="muted">Verified route preview appears here once this first interview is saved.</p>';return}
  el.classList.remove('hidden');el.innerHTML='<p class="muted">Checking current verified routes…</p>';try{render(await api({action:'match_preview',lead_id:leadId,answers:answers()}))}catch(error){el.innerHTML='<p class="route-conflict">'+esc(error.message)+'</p>'}}
function schedule(){clearTimeout(timer);timer=setTimeout(load,350)}
// Same fix as interview-match.js: this only ever triggered off clicking a
// [data-interview] element, which the queue redesign never creates.
const originalOpenForPreview=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForPreview)originalOpenForPreview.call(this,id);
  leadId=id||'';
  $('routePreview')?.remove();
  setTimeout(load,450);
};
// The preview is read-only. Re-rendering it on every keystroke/choice causes
// mobile scroll jumps and spends a request while the operator is still
// answering. Use the explicit Refresh button (or post-save open) instead.
})();

// ---- interview-form-enhancements.js ----
(()=>{'use strict';
const QUESTIONS='#questions';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const PILOT_DEPTH_MODULE_ENABLED=false;
let evidenceLoadedAt=0;

function wireChoiceRow(row){
  if(!row||row.dataset.wired==='1')return;
  row.dataset.wired='1';
  row.querySelectorAll('.choice').forEach(button=>{
    button.onclick=()=>{
      if(row.classList.contains('match-multi')) button.classList.toggle('on');
      else { row.querySelectorAll('.choice').forEach(x=>x.classList.remove('on')); button.classList.add('on'); }
    };
  });
}
function enhanceBarrier(root){
  const row=root.querySelector('.choice-row[data-key="barrier"]');
  if(!row||row.dataset.multiEnhanced==='1')return;
  row.dataset.multiEnhanced='1';row.classList.add('match-multi');row.dataset.wired='0';wireChoiceRow(row);
}
function addConditionNote(root,key,label){
  const row=root.querySelector('.choice-row[data-key="'+key+'"]');if(!row)return;
  const question=row.closest('.question');if(!question||question.querySelector('[data-key="'+key+'_notes"]'))return;
  const wrap=document.createElement('div');wrap.style.marginTop='10px';
  wrap.innerHTML='<label style="display:block;font-size:13px;margin-bottom:6px">'+label+'</label><input data-key="'+key+'_notes" type="text" placeholder="e.g. only if paid / depends on terms">';question.appendChild(wrap);
}
function addChoiceQuestion(root,key,label,values,{multi=false,note=''}={}){
  if(root.querySelector('[data-key="'+key+'"]'))return;
  const q=document.createElement('div');q.className='question match-extra evidence-question';
  q.innerHTML='<label>'+label+'</label><div class="choice-row '+(multi?'match-multi':'')+'" data-key="'+key+'">'+values.map(v=>'<button type="button" class="choice" data-value="'+v.replace(/"/g,'&quot;')+'">'+v+'</button>').join('')+'</div>'+(note?'<small class="muted" style="display:block;margin-top:8px">'+note+'</small>':'');
  root.appendChild(q);wireChoiceRow(q.querySelector('.choice-row'));
}
function addTextQuestion(root,key,label,{type='text',placeholder='',note=''}={}){
  if(root.querySelector('[data-key="'+key+'"]'))return;
  const q=document.createElement('div');q.className='question match-extra evidence-question';
  q.innerHTML='<label>'+label+'</label><input data-key="'+key+'" type="'+type+'" '+(type==='number'?'min="0" inputmode="numeric" ':'')+'placeholder="'+placeholder.replace(/"/g,'&quot;')+'">'+(note?'<small class="muted" style="display:block;margin-top:8px">'+note+'</small>':'');root.appendChild(q);
}
function addSection(root,id,title,subtitle){
  if(root.querySelector('[data-evidence-section="'+id+'"]'))return;
  const s=document.createElement('div');s.className='question match-extra evidence-section';s.dataset.evidenceSection=id;
  s.innerHTML='<label style="font-size:17px">'+title+'</label>'+(subtitle?'<small class="muted" style="display:block;margin-top:5px">'+subtitle+'</small>':'');root.appendChild(s);
}
function routeReady(root){return !!root.querySelector('[data-key="client_age"],[data-key="care_goal"],[data-key="grade"],[data-key="business_stage"],[data-key="service_area"],[data-key="known_service"]');}
function addJobSearchProfile(root){
  const anchor=root.querySelector('.choice-row[data-key="jobseeker_active"]');if(!anchor||root.querySelector('[data-key="job_search_profile"]'))return;
  const anchorQuestion=anchor.closest('.question');if(!anchorQuestion)return;
  const question=document.createElement('div');question.className='question match-extra';
  question.innerHTML='<label>Työnhakuprofiili published? <small style="color:#0A8F89">new rule from 1.9.2026</small></label><div class="choice-row" data-key="job_search_profile"><button type="button" class="choice" data-value="Published">Published</button><button type="button" class="choice" data-value="Not published">Not published</button><button type="button" class="choice" data-value="Not yet applicable">Not yet applicable</button><button type="button" class="choice" data-value="Not sure">Not sure</button></div><small class="muted" style="display:block;margin-top:8px">From 1 Sep 2026 publishing and keeping the profile published is generally required when the obligation applies. New jobseekers usually have 15 working days after job search starts. If job search started before 1 Sep, the obligation normally begins at the next työnhakukeskustelu, followed by 15 working days. Exceptions exist; missing the profile deadline does not itself end job search or unemployment security.</small>';
  anchorQuestion.insertAdjacentElement('afterend',question);wireChoiceRow(question.querySelector('.choice-row'));
}
function addCoreEvidence(root){
  if(!routeReady(root))return;
  addSection(root,'acquisition','Quick evidence check','Ask naturally. These fields let AQOON prove where demand came from, what families already knew, and whether one first need opens other needs.');
  addChoiceQuestion(root,'aqoon_discovery','How did they first find AQOON?',['TikTok video','TikTok comment/DM','Friend or family','WhatsApp','Google / website','In person','Other / not sure']);
  addChoiceQuestion(root,'prior_awareness','Before AQOON, did they know this option/service existed?',['Yes – knew it','Had heard of it but did not understand','No','Not sure']);
  addChoiceQuestion(root,'self_navigation','Without AQOON, would they have known what to do next?',['Yes','Maybe / partly','No','Not sure']);
  addChoiceQuestion(root,'access_barriers','What was stopping them from acting before?',['Did not know it existed','Did not understand eligibility','Language','Form / digital system','Cost assumption','Did not know where to start','Fear / trust / consequences','Transport','Childcare / timing','No one to ask','Other'],{multi:true});
  addChoiceQuestion(root,'other_needs_discovered','Anything else they want help with after this first issue?',['Work','School','Daycare','Hobbies','Finnish / education','Kela / benefits','Programmes','Housing','Letters / forms','Nothing else now'],{multi:true,note:'Key cross-need measure. Do not force extra needs; record only what the family raises or confirms.'});
  addChoiceQuestion(root,'outcome_followup_ok','Okay for AQOON to check later what happened?',['Yes','No','Not sure']);
}
function addHobbyEvidence(root){
  if(!routeReady(root)||!root.querySelector('[data-key="hobby_time"]')||root.querySelector('[data-evidence-section="hobby-proof"]'))return;
  addSection(root,'hobby-proof','Hobby / Vantaa proof','Short questions for aggregate pilot reporting. Ask only what fits naturally.');
  addTextQuestion(root,'eligible_children_count','How many children in this family are in grades 1–9?',{type:'number',placeholder:'e.g. 2',note:'Needed to report target-group children, not only family contacts.'});
  addChoiceQuestion(root,'eligible_grades','Which grades are those children in?',['1','2','3','4','5','6','7','8','9'],{multi:true});
  addChoiceQuestion(root,'parent_hobby_attitude','How does the parent generally feel about regular hobbies for children?',['Very positive','Positive if practical / easy','Neutral','Hesitant / has concerns','Not a priority now','Not sure']);
  addChoiceQuestion(root,'hobby_before','Was the child already doing a regular hobby before this?',['Yes','No','Stopped recently','Not sure']);
  addChoiceQuestion(root,'harrastusten_vantaa_awareness','Before AQOON, had they heard of Harrastusten Vantaa / Harrastamisen Suomen malli?',['Yes – knew it','Had heard the name only','No','Not sure']);
  addChoiceQuestion(root,'hobby_free_awareness','Before AQOON, did they know these groups can be free?',['Yes','No','Not sure']);
  addChoiceQuestion(root,'hobby_registration_help','How much help do they need with registration?',['None – can do it alone','Link/explanation is enough','Need help while filling it','Need to do it together','Not sure'],{note:'Only ask if a Vantaa hobby need was already confirmed (vantaa_hobbies_possible_need = Yes/Maybe above) — this measures how much hands-on support to give, not whether the need exists.'});
  addChoiceQuestion(root,'hobby_main_barrier','Main reason the child was not already participating?',['Did not know about it','Could not find suitable activity','Registration was difficult','Group full / no place','Transport','Schedule','Language','Cost assumption','Child not interested','Parent not sure / trust','Other','Not applicable']);
  addChoiceQuestion(root,'hobby_outcome_stage','Where is this hobby case now?',['Need confirmed','Link / options sent','Registration started','Registered','Child started','No suitable place / group full','Waiting / follow-up','Did not proceed']);
  addChoiceQuestion(root,'hobby_persistence','Later follow-up: is the child still participating?',['Follow-up not due','Yes – still attending','Changed group/activity','Stopped','Never started','Not known yet']);
}
function addDaycareEvidence(root){
  if(!routeReady(root)||!root.querySelector('[data-key="care_goal"]')||root.querySelector('[data-evidence-section="daycare-proof"]'))return;
  addSection(root,'daycare-proof','Daycare decision proof','Keep this quick. These fields refresh the Pilke evidence and track the new funnel to a real start.');
  addChoiceQuestion(root,'daycare_child_age','Child age?',['Under 1','1','2','3','4','5','6','School-age / other','Not sure']);
  addChoiceQuestion(root,'daycare_current_state','Current situation before this call?',['Child at home','Municipal application / waiting','Municipal daycare','Private daycare','Changing daycare','Future need only','Not sure']);
  addChoiceQuestion(root,'private_daycare_awareness','Before AQOON, did they know private daycare could be a realistic option?',['Yes – understood it','Had heard of private daycare but assumed it was not for us','No','Not sure']);
  addChoiceQuestion(root,'private_daycare_cost_belief','Before AQOON, what did they think private daycare would cost per month?',['Same / similar to municipal','0–100 €','100–300 €','300–500 €','500–1,000 €','Over 1,000 €','Did not know']);
  addChoiceQuestion(root,'private_daycare_consider','If the real fee, location and place fit, would they consider private daycare?',['Yes','Maybe','No','Already chose private']);
  addChoiceQuestion(root,'daycare_priorities','What matters most when choosing daycare?',['Close to home','Language / bilingual','Educational focus','Fast place / start date','Price','Opening hours','Sibling / friends','Trust / recommendation','Other'],{multi:true});
  addChoiceQuestion(root,'application_steps_known','Before AQOON, did they understand the application steps needed for the route they want?',['Yes','Partly','No','Not sure']);
  addChoiceQuestion(root,'private_route_parallel_steps_awareness','Before AQOON, did they know a private-daycare route may require a separate provider application plus municipality/Kela steps?',['Yes','No','Not sure','Not applicable to this route'],{note:'Exact process varies by municipality; this records awareness, not a universal rule.'});
  addChoiceQuestion(root,'daycare_application_help','How much application help do they need?',['Can do it alone','Explanation / links are enough','Need help while filling it','Need to do it together','Not sure']);
  addChoiceQuestion(root,'daycare_action_stage','Where is this daycare case now?',['Exploring options','Private daycare chosen','Application steps explained','Application started','Application submitted','Place confirmed','Child started','Waiting / follow-up','Did not proceed']);
}
function countField(interviews,key){
  const c={};let n=0;interviews.forEach(i=>{const v=i.answers&&i.answers[key];if(v===undefined||v===null||v==='')return;n++;(Array.isArray(v)?v:[v]).forEach(x=>{const k=String(x);c[k]=(c[k]||0)+1;});});return {n,c};
}
function numericSum(interviews,key){return interviews.reduce((s,i)=>{const n=Number(i.answers&&i.answers[key]);return s+(Number.isFinite(n)&&n>0?n:0);},0);}
function rows(title,data,max=8){
  const entries=Object.entries(data.c).sort((a,b)=>b[1]-a[1]).slice(0,max),peak=entries.length?Math.max(...entries.map(e=>Number(e[1])||0)):1;
  return '<div style="margin-top:14px"><strong>'+title+'</strong><small class="muted" style="margin-left:6px">n='+data.n+'</small>'+(entries.length?'<div class="bars" style="margin-top:8px">'+entries.map(([k,v])=>'<div class="bar-row"><span>'+k+'</span><div class="bar-track"><i style="width:'+Math.max(6,Math.round(Number(v)/peak*100))+'%"></i></div><strong>'+v+'</strong></div>').join('')+'</div>':'<p class="sub">No recorded answers yet.</p>')+'</div>';
}
function latestInterviews(list){const m=new Map();(list||[]).filter(i=>i.status==='completed').forEach(i=>{const old=m.get(i.lead_id);if(!old||String(i.updated_at)>String(old.updated_at))m.set(i.lead_id,i);});return [...m.values()];}
function ensureEvidenceCard(){
  if(document.getElementById('interviewEvidenceCard'))return document.getElementById('interviewEvidenceCard');
  const analytics=document.querySelector('.analytics-view'),anchor=analytics?.querySelector('.breakdown-card');if(!analytics||!anchor)return null;
  const card=document.createElement('details');card.className='command-card';card.id='interviewEvidenceCard';
  card.innerHTML='<summary>Interview evidence & pilot questions</summary><p class="sub">Live aggregate of completed first interviews. No family names or phone numbers are shown here.</p><div id="interviewEvidenceBody"><p class="sub">Open to load.</p></div>';
  anchor.insertAdjacentElement('afterend',card);card.addEventListener('toggle',()=>{if(card.open)loadEvidence(false)});return card;
}
async function loadEvidence(force=false){
  const card=ensureEvidenceCard(),body=document.getElementById('interviewEvidenceBody');if(!card||!body)return;
  if(!force&&evidenceLoadedAt&&Date.now()-evidenceLoadedAt<30000)return;const pw=sessionStorage.getItem('aqoon_tracker_password')||'';if(!pw)return;
  body.innerHTML='<p class="sub">Loading interview evidence…</p>';
  try{
    const r=await fetch(ADMIN,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw},body:JSON.stringify({action:'list'}),cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.detail||d.error||'Request failed');
    const ints=latestInterviews(d.interviews||[]),leads=d.leads||[];
    const hobby=ints.filter(i=>i.answers&&(i.answers.harrastusten_vantaa_awareness!==undefined||i.answers.hobby_registration_help!==undefined||i.answers.hobby_outcome_stage!==undefined));
    const daycare=ints.filter(i=>i.answers&&(i.answers.private_daycare_awareness!==undefined||i.answers.private_daycare_consider!==undefined||i.answers.daycare_action_stage!==undefined));
    const grades=countField(hobby,'grade'),grade19=Object.entries(grades.c).filter(([k])=>/^[1-9]$/.test(k)).reduce((s,[,v])=>s+Number(v),0),targetChildren=numericSum(hobby,'eligible_children_count');
    const stages={};leads.forEach(l=>{const k=l.journey_stage||'reach';stages[k]=(stages[k]||0)+1;});
    body.innerHTML='<div class="analytics-secondary" style="margin-top:12px"><span>Completed evidence interviews <strong>'+ints.filter(i=>i.answers&&i.answers.aqoon_discovery!==undefined).length+'</strong></span><span>Hobby/Vantaa <strong>'+hobby.length+'</strong></span><span>Daycare <strong>'+daycare.length+'</strong></span></div>'+
      rows('How families first found AQOON',countField(ints,'aqoon_discovery'))+rows('Prior awareness of the entry service/opportunity',countField(ints,'prior_awareness'))+rows('Would they have known the next step without AQOON?',countField(ints,'self_navigation'))+rows('Barriers before contact',countField(ints,'access_barriers'))+rows('Additional needs discovered',countField(ints,'other_needs_discovered'))+
      '<hr style="border:0;border-top:1px solid #eee;margin:20px 0"><strong>Hobby / Vantaa reporting</strong><p class="sub">Recorded main-child grades 1–9: <b>'+grade19+'</b> · Total grade 1–9 children explicitly counted in families: <b>'+targetChildren+'</b></p>'+rows('Parent attitude to regular hobbies',countField(hobby,'parent_hobby_attitude'))+rows('Harrastusten Vantaa awareness',countField(hobby,'harrastusten_vantaa_awareness'))+rows('Knew groups can be free',countField(hobby,'hobby_free_awareness'))+rows('Registration-help intensity',countField(hobby,'hobby_registration_help'))+rows('Main participation barrier',countField(hobby,'hobby_main_barrier'))+rows('Current hobby case stage',countField(hobby,'hobby_outcome_stage'))+rows('Persistence follow-up',countField(hobby,'hobby_persistence'))+
      '<hr style="border:0;border-top:1px solid #eee;margin:20px 0"><strong>Daycare / Pilke evidence refresh</strong>'+rows('Private daycare awareness before AQOON',countField(daycare,'private_daycare_awareness'))+rows('Prior private-daycare cost belief',countField(daycare,'private_daycare_cost_belief'))+rows('Would consider private daycare if fit',countField(daycare,'private_daycare_consider'))+rows('Daycare decision priorities',countField(daycare,'daycare_priorities'))+rows('Understood application steps before AQOON',countField(daycare,'application_steps_known'))+rows('Knew route may have parallel provider + municipality/Kela steps',countField(daycare,'private_route_parallel_steps_awareness'))+rows('Application-help intensity',countField(daycare,'daycare_application_help'))+rows('Current daycare case stage',countField(daycare,'daycare_action_stage'))+rows('Current CRM journey stages',{n:leads.length,c:stages});
    evidenceLoadedAt=Date.now();
  }catch(e){body.innerHTML='<p class="sub">Could not load interview evidence: '+String(e.message||e)+'</p>';}
}
function enhance(){
  const root=document.querySelector(QUESTIONS);if(!root)return;enhanceBarrier(root);addJobSearchProfile(root);addConditionNote(root,'work_tryout','Työkokeilu notes / conditions');addConditionNote(root,'apprenticeship','Oppisopimus notes / conditions');if(PILOT_DEPTH_MODULE_ENABLED){addCoreEvidence(root);addHobbyEvidence(root);addDaycareEvidence(root);}root.querySelectorAll('.choice-row').forEach(wireChoiceRow);if(PILOT_DEPTH_MODULE_ENABLED)ensureEvidenceCard();
}
const observer=new MutationObserver(()=>enhance());
const start=()=>{const root=document.querySelector(QUESTIONS);if(root)observer.observe(root,{childList:true,subtree:true});enhance();if(PILOT_DEPTH_MODULE_ENABLED)ensureEvidenceCard();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
// enhance() also runs via the MutationObserver above whenever #questions
// gains children (e.g. once interview-match.js populates it), so this was
// a redundant, now-broken second trigger - fixed for clarity, not because
// it was the only path.
const originalOpenForEnhancements=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForEnhancements)originalOpenForEnhancements.call(this,id);
  setTimeout(enhance,80);
};
document.addEventListener('click',e=>{if(!PILOT_DEPTH_MODULE_ENABLED)return;if(e.target.closest('[data-tab="analytics"]'))setTimeout(()=>{ensureEvidenceCard();loadEvidence(false)},250);if(e.target.closest('#refresh'))setTimeout(()=>loadEvidence(true),350);},false);
})();

// ---- interview-smart-notes.js ----
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

// ---- interview-answers-restore.js ----
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

// ---- case-lifecycle.js ----
(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const END_HISTORY='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-interview-history-admin';
const $=id=>document.getElementById(id);
let leadId='',plans=[],events=[],revisions=[],busy=false;
const style=document.createElement('style');
style.textContent='.case-lifecycle{background:#fff;border:1px solid var(--l);border-radius:14px;padding:13px;margin-top:12px}.case-lifecycle h3{font-size:12px;margin:0 0 9px}.case-lifecycle .muted{font-size:11px}.plan-card{background:var(--p);border:1px solid var(--l);border-radius:11px;padding:10px;margin-bottom:9px}.plan-card strong{display:block;font-size:12px}.plan-card small{display:block;color:var(--m);font-size:10px;margin-top:3px}.plan-status{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--td);background:#eef9f7;border-radius:999px;padding:3px 8px;margin-top:6px}.plan-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.plan-actions button{border:0;border-radius:9px;background:var(--c);color:var(--n);padding:8px 10px;font-size:10px;font-weight:700}.plan-actions button.primary{background:var(--n);color:#fff}.plan-actions button.danger{background:#fde9e6;color:#92372f}.new-plan-row{display:flex;gap:6px;margin-top:6px}.new-plan-row input{flex:1}.new-plan-row button{border:0;border-radius:9px;background:var(--n);color:#fff;padding:0 13px;font-size:11px;font-weight:700}.case-events{margin-top:9px;font-size:10px;color:var(--m)}.case-events div{padding:4px 0;border-top:1px solid var(--l)}.case-revisions{margin-top:9px}.revision-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--l);font-size:10px}.revision-row button{border:0;border-radius:8px;background:var(--c);color:var(--n);padding:5px 9px;font-size:9px;font-weight:700}.case-lifecycle-error{color:#92372f;font-size:10px;margin-top:6px}';
document.head.appendChild(style);
const PLAN_LABELS={research:'Researching options',options_ready:'Options ready to present',action_in_progress:'Action in progress',awaiting_outcome:'Waiting on authority/provider decision',persistence_check:'Response received — confirming outcome',resolved:'Resolved',closed_unresolved:'Closed — no resolution'};
const EVENT_LABELS={interview_completed:'First interview completed',research_completed:'Research completed',options_presented:'Options presented to family',plan_selected:'Plan selected',official_action_started:'Application/registration submitted',official_response_received:'Authority/provider responded',persistence_confirmed:'Outcome confirmed still active',case_resolved:'Case resolved',case_closed_unresolved:'Case closed without resolution',follow_up_attempted:'Follow-up attempted'};
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function api(url,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':password()},body:JSON.stringify(body),cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}
function host(){let el=$('caseLifecycle');if(el)return el;const actions=document.querySelector('#drawer .interview-actions');if(!actions)return null;el=document.createElement('section');el.id='caseLifecycle';el.className='case-lifecycle';actions.after(el);return el}
function activePlan(){return plans.find(p=>p.plan_status!=='resolved'&&p.plan_status!=='closed_unresolved')||null}
function reasonFor(plan){const ev=events.find(e=>e.case_plan_id===plan.id&&e.event_type==='case_closed_unresolved');return ev?.note||''}
function planCard(plan){
  const status=PLAN_LABELS[plan.plan_status]||plan.plan_status,terminal=plan.plan_status==='resolved'||plan.plan_status==='closed_unresolved';
  const buttons=[];
  if(!terminal){
    if(plan.plan_status!=='awaiting_outcome'&&plan.plan_status!=='persistence_check')buttons.push('<button type="button" data-lc-action="submitted" data-lc-id="'+esc(plan.id)+'">Submitted — waiting on decision</button>');
    if(plan.plan_status==='awaiting_outcome')buttons.push('<button type="button" data-lc-action="responded" data-lc-id="'+esc(plan.id)+'">Authority/provider responded</button>');
    buttons.push('<button type="button" class="primary" data-lc-action="resolve" data-lc-id="'+esc(plan.id)+'">Resolve</button>');
    buttons.push('<button type="button" class="danger" data-lc-action="close" data-lc-id="'+esc(plan.id)+'">Close — no resolution</button>');
  }
  const reason=plan.plan_status==='closed_unresolved'?reasonFor(plan):'';
  return '<article class="plan-card"><strong>'+esc(plan.title||'Case plan')+'</strong>'+(plan.next_action?'<small>'+esc(plan.next_action)+'</small>':'')+(plan.next_follow_up_at?'<small>Next: '+esc(fmt(plan.next_follow_up_at))+'</small>':'')+'<span class="plan-status">'+esc(status)+'</span>'+(reason?'<small><strong>Closed:</strong> '+esc(reason)+'</small>':'')+(buttons.length?'<div class="plan-actions">'+buttons.join('')+'</div>':'')+'</article>';
}
function eventsHtml(){const recent=events.slice(0,6);if(!recent.length)return'';return '<div class="case-events">'+recent.map(e=>'<div>'+esc(fmt(e.occurred_at))+' · '+esc(EVENT_LABELS[e.event_type]||e.event_type)+'</div>').join('')+'</div>'}
function revisionsHtml(){if(!revisions.length)return'';return '<div class="case-revisions"><small class="muted">Interview edit history</small>'+revisions.map(r=>'<div class="revision-row"><span>Rev '+esc(r.revision_number)+' · '+esc(fmt(r.captured_at))+'</span><button type="button" data-lc-restore="'+esc(r.id)+'">Restore</button></div>').join('')+'</div>'}
function render(){
  const el=host();if(!el)return;
  const plan=activePlan(),otherPlans=plans.filter(p=>p!==plan);
  el.innerHTML='<h3>Case plan</h3>'+(plan?planCard(plan):'<p class="muted">No active case plan yet.</p><div class="new-plan-row"><input id="newPlanTitle" type="text" placeholder="e.g. Apply for private daycare voucher"><button type="button" id="newPlanBtn">Start plan</button></div>')+(otherPlans.length?'<p class="muted" style="margin-top:9px">'+otherPlans.length+' earlier plan'+(otherPlans.length===1?'':'s')+' on this family.</p>':'')+eventsHtml()+revisionsHtml()+'<p class="case-lifecycle-error hidden" id="caseLifecycleError"></p>';
  $('newPlanBtn')?.addEventListener('click',createPlan);
  el.querySelectorAll('[data-lc-action]').forEach(b=>b.onclick=()=>runAction(b.dataset.lcAction,b.dataset.lcId));
  el.querySelectorAll('[data-lc-restore]').forEach(b=>b.onclick=()=>restore(b.dataset.lcRestore));
}
function fail(message){const box=$('caseLifecycleError');if(box){box.textContent=message;box.classList.remove('hidden')}}
async function load(){
  if(!leadId)return;
  try{
    const[lc,hist]=await Promise.all([api(END_LIFECYCLE,{action:'list',lead_id:leadId}),api(END_HISTORY,{action:'list',lead_id:leadId}).catch(()=>({revisions:[]}))]);
    plans=lc.plans||[];events=lc.events||[];revisions=hist.revisions||[];
    render();
  }catch(error){const el=host();if(el)el.innerHTML='<h3>Case plan</h3><p class="case-lifecycle-error">'+esc(error.message)+'</p>'}
}
async function createPlan(){
  const title=($('newPlanTitle')?.value||'').trim();
  if(!title)return fail('Add a short plan title first.');
  if(busy)return;busy=true;
  try{await api(END_LIFECYCLE,{action:'save_plan',lead_id:leadId,title});await load()}
  catch(error){fail(error.message==='first_interview_required'?'Save the first interview above before starting a case plan.':error.message)}
  finally{busy=false}
}
async function submitPlanUpdate(plan,overrides){
  return api(END_LIFECYCLE,{action:'save_plan',lead_id:leadId,id:plan.id,title:plan.title,official_decision_maker:plan.official_decision_maker,selected_option:plan.selected_option,plan_status:overrides.plan_status||plan.plan_status,next_action:'next_action'in overrides?overrides.next_action:plan.next_action,next_follow_up_at:'next_follow_up_at'in overrides?overrides.next_follow_up_at:plan.next_follow_up_at});
}
async function runAction(action,planId){
  if(busy)return;
  const plan=plans.find(p=>p.id===planId);if(!plan)return;
  busy=true;
  try{
    if(action==='submitted'){
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'official_action_started'});
      await submitPlanUpdate(plan,{plan_status:'awaiting_outcome'});
    }else if(action==='responded'){
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'official_response_received'});
      await submitPlanUpdate(plan,{plan_status:'persistence_check'});
    }else if(action==='resolve'){
      const note=(prompt('What was the outcome? Include the agreed plan, who confirmed it, and any evidence or follow-up needed.')||'').trim();
      if(!note)return;
      if(!confirm('Mark this case plan resolved and save the outcome note?'))return;
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'case_resolved',note});
      await submitPlanUpdate(plan,{plan_status:'resolved'});
    }else if(action==='close'){
      const reason=(prompt('Why is this case plan closing without a resolution? (e.g. family unreachable, withdrew, no longer eligible)')||'').trim();
      if(!reason)return;
      if(!confirm('Close this case plan without a resolution?'))return;
      await api(END_LIFECYCLE,{action:'log_event',lead_id:leadId,case_plan_id:plan.id,event_type:'case_closed_unresolved',note:reason});
      await submitPlanUpdate(plan,{plan_status:'closed_unresolved'});
    }
    await load();
  }catch(error){fail(error.message)}
  finally{busy=false}
}
async function restore(revisionId){
  if(busy||!revisionId)return;
  if(!confirm('Restore this earlier interview version? The current answers will be replaced (this does not delete history).'))return;
  busy=true;
  try{
    await api(END_HISTORY,{action:'restore',lead_id:leadId,revision_id:revisionId,confirm_restore:true});
    $('refresh')?.click();
    await load();
  }catch(error){fail(error.message)}
  finally{busy=false}
}
const originalOpenForLifecycle=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForLifecycle)originalOpenForLifecycle.call(this,id);
  leadId=id||'';
  setTimeout(load,450);
};
window.AqoonCaseLifecycle={logInterviewCompleted:id=>id?api(END_LIFECYCLE,{action:'log_event',lead_id:id,event_type:'interview_completed'}).catch(()=>{}):Promise.resolve()};
})();

// ---- scenario-learning.js ----
(()=>{'use strict';
const ADMIN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const SCEN='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-scenario-admin';
let activeLeadId=null,capturedAnswers={},tries=0,current=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function pw(){return sessionStorage.getItem('aqoon_tracker_password')||''}
async function call(url,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-tracker-password':pw()},body:JSON.stringify(body),cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.error||'Request failed');return d}
function collect(){const a={};document.querySelectorAll('#questions input[data-key],#questions textarea[data-key],#questions select[data-key]').forEach(x=>{const v=String(x.value||'').trim();if(v)a[x.dataset.key]=v});document.querySelectorAll('#questions .choice-row[data-key]').forEach(r=>{const on=[...r.querySelectorAll('.choice.on')].map(x=>x.dataset.value).filter(Boolean);if(on.length)a[r.dataset.key]=r.classList.contains('match-multi')?on:on[0]});return a}
function ensureUI(){const wrap=$('promptWrap');if(!wrap)return null;let box=$('scenarioResult');if(!box){box=document.createElement('div');box.id='scenarioResult';box.className='notice';box.style.margin='0 0 10px';wrap.insertBefore(box,$('promptBox'))}let cap=$('scenarioCapture');if(!cap){cap=document.createElement('details');cap.id='scenarioCapture';cap.style.marginTop='10px';cap.innerHTML='<summary style="cursor:pointer;font-weight:700">After deep research: save it to AQOON</summary><p class="muted" style="font-size:12px;margin:8px 0">Paste the completed deep-research answer here. AQOON will store only the reusable verified scenario knowledge, not the family name or phone number.</p><textarea id="scenarioResearchPaste" rows="7" placeholder="Paste the completed deep-research answer"></textarea><button class="btn teal" id="saveScenarioResearch" type="button" style="width:100%;margin-top:8px">Save verified research to AQOON</button><div id="scenarioSaveMsg" class="muted" style="font-size:12px;margin-top:7px"></div>';wrap.appendChild(cap);$('saveScenarioResearch').onclick=saveResearch}return box}
function plain(v){if(v==null)return'';if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);if(Array.isArray(v))return v.map(x=>'• '+plain(x)).join('\n');return Object.entries(v).map(([k,x])=>k.replaceAll('_',' ')+': '+plain(x)).join('\n')}
function sourceText(s){return(s||[]).map(x=>{if(typeof x==='string')return x;return [x.title,x.url].filter(Boolean).join(' — ')}).join('\n')}
function researchContract(){return `\n\nAQOON KNOWLEDGE-CAPTURE REQUIREMENT\nBefore researching, treat this as a reusable scenario rather than a one-off family story. Verify current official primary sources. Do not include the family's name, phone number, exact address, or other unnecessary identifying details in reusable knowledge.\n\nAt the VERY END of the research answer include exactly this machine-readable block, with real verified content:\nAQOON_SCENARIO_JSON\n\`\`\`json\n{\n  "title": "short reusable scenario title",\n  "verified_answer": {\n    "summary": "the answer AQOON can safely reuse for the same scenario",\n    "next_steps": ["ordered practical next steps"],\n    "conditions": ["facts that must be true for this answer to apply"],\n    "must_confirm": ["things an authority/provider must still decide or confirm"]\n  },\n  "official_sources": [\n    {"title":"official source name","url":"https://...","checked_at":"YYYY-MM-DD"}\n  ],\n  "operator_guidance": {\n    "ask_next": ["only questions that materially change the route"],\n    "do_not_assume": ["eligibility/outcomes AQOON must not promise"]\n  },\n  "recheck_after": "YYYY-MM-DD"\n}\n\`\`\`\nUse a sensible recheck date based on volatility; current programmes, deadlines, fees and eligibility rules should be rechecked sooner.`}
function render(m,originalPrompt,interviewId){const box=ensureUI();if(!box)return;current={scenario:m.scenario,interviewId,matchStatus:m.match_status};const copy=$('copyPrompt'),prompt=$('promptBox'),cap=$('scenarioCapture');if(m.match_status==='matched'&&m.scenario){box.innerHTML='<strong>✓ AQOON already knows this scenario.</strong><p style="margin:5px 0 0">A current verified answer was found. Reuse it instead of starting research from zero.</p>'+(m.scenario.last_verified_at?'<p class="muted" style="font-size:12px;margin:5px 0 0">Verified '+esc(new Date(m.scenario.last_verified_at).toLocaleDateString('fi-FI'))+(m.scenario.recheck_after?' · recheck by '+esc(new Date(m.scenario.recheck_after).toLocaleDateString('fi-FI')):'')+'</p>':'');prompt.textContent='VERIFIED REUSABLE AQOON ANSWER\n\n'+plain(m.scenario.verified_answer)+'\n\nOFFICIAL SOURCES\n'+sourceText(m.scenario.official_sources)+'\n\nOPERATOR GUIDANCE\n'+plain(m.scenario.operator_guidance);if(copy)copy.textContent='Copy verified answer';if(cap)cap.classList.add('hidden');return}
const stale=m.match_status==='possible_match';box.innerHTML=stale?'<strong>↻ Similar scenario found, but it needs rechecking.</strong><p style="margin:5px 0 0">Use the old knowledge as a starting point, then verify what changed.</p>':'<strong>＋ New reusable scenario.</strong><p style="margin:5px 0 0">Deep research will create the first verified answer, so the next matching family can reuse it.</p>';if(prompt&&!prompt.textContent.includes('AQOON KNOWLEDGE-CAPTURE REQUIREMENT'))prompt.textContent=(originalPrompt||prompt.textContent)+researchContract();if(copy)copy.textContent='Copy complete research brief';if(cap)cap.classList.remove('hidden')}
function parseBlock(t){const m=t.match(/AQOON_SCENARIO_JSON\s*```(?:json)?\s*([\s\S]*?)```/i);if(m)return JSON.parse(m[1]);const s=t.trim();if(s.startsWith('{')&&s.endsWith('}'))return JSON.parse(s);throw Error('The research answer is missing the AQOON_SCENARIO_JSON block. Copy the full completed research answer.')}
async function saveResearch(){if(!current?.scenario?.id||!current.interviewId)return;const btn=$('saveScenarioResearch'),msg=$('scenarioSaveMsg'),report=String($('scenarioResearchPaste')?.value||'').trim();if(!report){msg.textContent='Paste the completed research first.';return}btn.disabled=true;msg.textContent='Saving and verifying structure…';try{const structured=parseBlock(report);const d=await call(SCEN,{action:'save_research',scenario_id:current.scenario.id,interview_id:current.interviewId,report,structured});msg.textContent='Saved ✓ This scenario is now reusable.';render({match_status:'matched',scenario:d.scenario},'',current.interviewId)}catch(e){msg.textContent=e.message}finally{btn.disabled=false}}
async function sync(){const wrap=$('promptWrap'),prompt=$('promptBox');if(!activeLeadId||!wrap||wrap.classList.contains('hidden')||!prompt?.textContent){if(tries++<8)setTimeout(sync,350);return}tries=0;const original=prompt.textContent;try{const d=await call(ADMIN,{action:'list'}),lead=(d.leads||[]).find(x=>x.id===activeLeadId),interview=lead?.latest_interview||(d.interviews||[]).find(x=>x.lead_id===activeLeadId);if(!lead||!interview)return;const m=await call(SCEN,{action:'match_scenario',lead_id:activeLeadId,interview_id:interview.id,route:interview.interview_type,answers:capturedAnswers,research_prompt:original});render(m,original,interview.id)}catch(e){const box=ensureUI();if(box){box.innerHTML='<strong>Interview saved.</strong><p style="margin:5px 0 0">Scenario matching could not finish: '+esc(e.message)+'. The existing tracker flow is unchanged.</p>'}}}
const originalOpenForScenario=window.openInterview;
window.openInterview=function(id){
  if(originalOpenForScenario)originalOpenForScenario.call(this,id);
  activeLeadId=id||null;current=null;
  const old=$('scenarioResult');if(old)old.remove();
  const cap=$('scenarioCapture');if(cap)cap.remove();
};
document.addEventListener('click',e=>{if(e.target.closest('#saveInterview')){capturedAnswers=collect();tries=0;setTimeout(sync,450)}},true);
})();

// ---- interview-context.js ----
(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let contextOpen=false;

const style=document.createElement('style');
style.textContent=`.interview-context{background:#f5f3f1;border:1px solid #e4dfd3;border-radius:14px;padding:12px;margin-bottom:12px}.context-summary{font-size:12px;line-height:1.5;color:#555}.context-summary strong{display:block;margin:8px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#333}.context-prompt{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px;margin:6px 0;font-size:11px;line-height:1.4;max-height:120px;overflow-y:auto;color:#556;font-family:monospace}.context-timeline{font-size:10px;color:#687;margin:6px 0 0}.context-timeline div{padding:4px 0;border-top:1px solid #ede9e2}.context-button{width:100%;border:0;background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px 10px;text-align:left;font-size:12px;font-weight:600;color:#333;cursor:pointer;margin-top:8px}.context-button:hover{background:#f9f8f6}.context-button.on{background:#e6f4f1;border-color:#3a9b8a}`;
document.head.appendChild(style);

function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}

function render(lead){
  const host=$('interview-context-panel');
  if(!host||!lead)return;

  const summary=lead.latest_interview?.summary||'';
  const prompt=lead.latest_interview?.research_prompt||'';
  const nextAction=lead.latest_interview?.next_action||'';

  // A first interview has intake data, but no previous interview context.
  // Showing a context button here implies that we know more than we do.
  if(!summary&&!prompt&&!nextAction){host.innerHTML='';host.classList.add('hidden');return}
  host.classList.remove('hidden');

  let html='<div class="interview-context">';
  html+='<button type="button" class="context-button '+(contextOpen?'on':'')+'">Previous interview & research</button>';

  if(contextOpen){
    if(summary){
      html+='<div class="context-summary">';
      html+='<strong>Previous interview</strong>';
      html+='<div>'+esc(summary)+'</div>';
      if(nextAction){
        html+='<strong style="margin-top:10px">Next action</strong>';
        html+='<div>'+esc(nextAction)+'</div>';
      }
      html+='</div>';
    }
    if(prompt){
      html+='<strong style="display:block;margin:10px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#333">Research brief</strong>';
      html+='<div class="context-prompt">'+esc(prompt.slice(0,800))+(prompt.length>800?'…':'')+'</div>';
    }
  }
  html+='</div>';

  host.innerHTML=html;
  host.querySelector('.context-button')?.addEventListener('click',toggle);
}

function toggle(){
  contextOpen=!contextOpen;
  // Re-render with open/close state
  const lead=window.AqoonInterview?.activeLead;
  if(lead)render(lead);
}

function attach(lead){
  let host=$('interview-context-panel');
  if(!host){
    // Create panel before #questions
    host=document.createElement('div');
    host.id='interview-context-panel';
    const questions=$('questions');
    questions?.parentNode?.insertBefore(host,questions);
  }
  contextOpen=false;
  render(lead);
}

// Export for other modules first, so files loaded after this one (e.g.
// interview-follow-up-recap.js) can wrap AqoonInterviewContext.attach and
// have that wrapper actually be the thing invoked below - calling the local
// `attach` reference directly would silently bypass any such wrapping.
window.AqoonInterviewContext={render,attach,toggle};

// Hook into interview drawer open
const originalOpen=window.openInterview;
window.openInterview=function(id){
  if(originalOpen)originalOpen.call(this,id);
  // After drawer opens, attach context if we have activeLead
  setTimeout(()=>{
    const activeLead=window.AqoonInterview?.activeLead;
    if(activeLead)window.AqoonInterviewContext.attach(activeLead);
  },50);
};
})();

// ---- interview-follow-up-recap.js ----
(()=>{'use strict';
const END_LIFECYCLE='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin';
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const style=document.createElement('style');
style.textContent=`.interview-recap{background:#f5f3f1;border:1px solid #e4dfd3;border-radius:14px;padding:12px;margin-bottom:12px}.recap-title{font-size:11px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;color:#333;margin-bottom:8px}.recap-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;line-height:1.4}.recap-col{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px}.recap-col strong{display:block;font-size:9px;text-transform:uppercase;color:#556;margin-bottom:4px}.recap-changed{background:#fef6f3;border-left:3px solid #d97560}.recap-timeline{background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px;margin-top:8px;font-size:10px;color:#687}.recap-timeline-item{padding:4px 0;border-top:1px solid #ede9e2}.recap-timeline-item:first-child{border-top:0}.recap-button{width:100%;border:0;background:#fff;border:1px solid #e4dfd3;border-radius:9px;padding:8px 10px;text-align:left;font-size:12px;font-weight:600;color:#333;cursor:pointer;margin-top:8px}.recap-button:hover{background:#f9f8f6}.recap-button.on{background:#e8f4f1;border-color:#3a9b8a}`;
document.head.appendChild(style);

let recapOpen=false,leadData=null;

function fmt(v){if(!v)return'—';try{return new Intl.DateTimeFormat('fi-FI',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}

function valueDisplay(v){if(!v)return'—';if(Array.isArray(v))return v.join(', ');return String(v);}

function buildRecap(firstAnswers,currentAnswers,events){
  const changedKeys=new Set();
  const allKeys=new Set([...Object.keys(firstAnswers||{}),...Object.keys(currentAnswers||{})]);

  const changed={};
  allKeys.forEach(k=>{
    const first=firstAnswers?.[k];
    const current=currentAnswers?.[k];
    if(first!==current){
      changedKeys.add(k);
      changed[k]={first,current};
    }
  });

  let html='<div class="interview-recap">';
  html+='<button type="button" class="recap-button '+(recapOpen?'on':'')+'">← What changed since first interview</button>';

  if(recapOpen){
    if(changedKeys.size){
      html+='<div class="recap-title" style="margin-top:10px">Changes</div>';
      html+='<div class="recap-grid">';
      [...changedKeys].slice(0,4).forEach(k=>{
        const {first,current}=changed[k];
        html+='<div class="recap-col recap-changed">';
        html+='<strong>'+esc(k)+'</strong>';
        html+='<span style="color:#999;font-size:9px;display:block;margin:3px 0">Was: '+esc(valueDisplay(first))+'</span>';
        html+='<span style="font-weight:600">Now: '+esc(valueDisplay(current))+'</span>';
        html+='</div>';
      });
      html+='</div>';
      if(changedKeys.size>4){
        html+='<p style="font-size:10px;color:#887;margin:6px 0 0">+'+(changedKeys.size-4)+' more changes</p>';
      }
    }

    if(events?.length){
      html+='<div class="recap-title" style="margin-top:10px">Actions taken</div>';
      html+='<div class="recap-timeline">';
      events.slice(0,5).forEach(e=>{
        html+='<div class="recap-timeline-item">'+esc(fmt(e.occurred_at))+' · '+esc(e.event_type)+(e.note?': '+esc(e.note):'')+'</div>';
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
      <details class="panel-section family-info-collapsed">
        <summary class="panel-section-title">Family Info</summary>
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
      </details>
    `;
    const attrib = window.AqoonOperators?.attribFor(leadId);
    const lastTouchedName = attrib?.last_actor_id ? window.AqoonOperators?.nameFor(attrib.last_actor_id) : '';
    if (lastTouchedName) {
      content += `<p style="font-size:11px;color:var(--m);margin:-16px 0 16px">Last touched by ${lastTouchedName}</p>`;
    }

    // Follow-up is a decision workspace: put the saved brief before buttons
    // and contact history so the operator sees what the system understood
    // without reopening the interview.
    if (phaseId === 'in_progress' && lead.interview_status === 'completed' && lead.latest_interview) {
      const interview = lead.latest_interview;
      const recap = interview.summary || 'Interview saved — review the recorded answers.';
      const brief = interview.research_prompt || '';
      const answers = interview.answers && typeof interview.answers === 'object' ? interview.answers : {};
      const context = ['primary_situation','work_intent','study_path','availability','start_when','travel_limit']
        .filter(k => answers[k]).map(k => this.escapeHtml(String(answers[k]))).join(' · ');
      const routeLine = interview.interview_type ? interview.interview_type.split('+').join(' · ') : '';
      content += `<div class="panel-section interview-recap interview-recap-primary">
        <h4 class="panel-section-title">Interview summary & suggested plan</h4>
        ${routeLine ? `<p class="contact-action-note"><strong>Topics:</strong> ${this.escapeHtml(routeLine)}</p>` : ''}
        <p class="interview-recap-summary">${this.escapeHtml(recap)}</p>
        ${context ? `<p class="interview-recap-context"><strong>Recorded context:</strong> ${context}</p>` : ''}
        ${interview.next_action ? `<p class="contact-action-note"><strong>Next action:</strong> ${this.escapeHtml(interview.next_action)}</p>` : ''}
        ${brief ? `<details class="interview-recap-brief"><summary>Evidence & research brief</summary><pre>${this.escapeHtml(brief.slice(0, 1600))}${brief.length > 1600 ? '\\n…' : ''}</pre></details>` : ''}
      </div>`;
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
      if (lead.interview_status === 'completed' && lead.latest_interview) {
        const interview = lead.latest_interview;
        const recap = interview.summary || 'Interview saved — review the recorded answers.';
        const brief = interview.research_prompt || '';
        const routeLine = interview.interview_type ? interview.interview_type.split('+').join(' · ') : '';
        content += `
          <div class="panel-section interview-recap">
            <h4 class="panel-section-title">First interview recap</h4>
            ${routeLine ? `<p class="contact-action-note"><strong>Topics:</strong> ${this.escapeHtml(routeLine)}</p>` : ''}
            <p class="interview-recap-summary">${this.escapeHtml(recap)}</p>
            ${interview.next_action ? `<p class="contact-action-note"><strong>Next action:</strong> ${this.escapeHtml(interview.next_action)}</p>` : ''}
            ${brief ? `<details class="interview-recap-brief"><summary>Research brief & evidence links</summary><pre>${this.escapeHtml(brief.slice(0, 1600))}${brief.length > 1600 ? '\\n…' : ''}</pre></details>` : ''}
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">View full interview</button>
          </div>
        `;
      }
      content += this.contactActionsHtml(leadId, lead, false);
    } else if (phaseId === 'in_progress') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">${lead.interview_status === 'completed' ? 'Interview complete' : 'Interview still required'}</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">${lead.interview_status === 'completed' ? 'Review interview' : 'Start first interview'}</button>
            ${lead.interview_status === 'completed' ? '<button class="btn primary" data-action="mark-resolved" data-lead-id="' + leadId + '">Open resolution</button>' : '<button class="btn secondary" data-action="return-to-first-contact" data-lead-id="' + leadId + '">Return to first contact</button>'}
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
      const note=(prompt('What was the outcome? Include the agreed plan, who confirmed it, and any evidence or follow-up needed.')||'').trim();
      if (!note) return;
      if (!confirm('Mark ' + (lead?.name || 'this family') + ' resolved and save the outcome note?')) return;
      window.AqoonApp?.updateLead(leadId, {status: 'resolved', notes: note})
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not resolve this case.'));
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
