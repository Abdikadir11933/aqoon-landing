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
  style.textContent='.operator-pill{position:fixed;top:8px;right:8px;z-index:40;background:#fff;border:1px solid var(--l,#e9e5dc);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700;color:var(--n,#0a1a30);box-shadow:0 4px 12px rgba(16,42,70,.08);cursor:pointer;display:flex;align-items:center;gap:6px}.operator-pill.hidden{display:none}.operator-pill .dot{width:7px;height:7px;border-radius:50%;background:var(--t,#13b9aa);flex:0 0 auto}.operator-badge-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0}.op-tag{background:var(--c,#f0ece3);color:var(--n,#0a1a30);border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700}.op-tag-empty{background:#fee9e5;color:#9f4038}.op-touch{font-size:9px;color:var(--m,#7a8290)}.op-claim{border:0;background:var(--t,#13b9aa);color:#052c27;border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer}.pill-operator{color:#5a7d78;font-weight:700}.operator-auth{display:grid;gap:8px;margin-top:2px}.operator-auth input{width:100%;border:1px solid var(--l,#e9e5dc);border-radius:12px;padding:11px 12px;font-size:14px}.operator-auth-btn{border:0;background:var(--n,#0a1a30);color:#fff;border-radius:12px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;margin-top:2px}.operator-error{color:#9f4038;font-size:11px;min-height:14px}.operator-switch{text-align:center;margin-top:12px;font-size:11px;color:var(--m,#7a8290)}.operator-switch a{color:var(--t,#0c8c80);font-weight:700;cursor:pointer;text-decoration:underline}.operator-hr{border:0;border-top:1px solid var(--l,#e9e5dc);margin:14px 0}.operator-options{display:grid;gap:8px;margin:4px 0 6px}.operator-choice{border:1px solid var(--l,#e9e5dc);background:var(--p,#f8f5ee);border-radius:13px;padding:13px;font-weight:700;font-size:14px;color:var(--n,#0a1a30);cursor:pointer}.operator-choice:hover{border-color:var(--t,#13b9aa)}.operator-choice.on{border-color:var(--t,#13b9aa);background:var(--t,#13b9aa);color:#052c27}';
  document.head.appendChild(style);
}

function ensurePill(){
  if(document.getElementById('operatorPill'))return;
  const pill=document.createElement('button');
  pill.type='button';pill.id='operatorPill';pill.className='operator-pill hidden';
  pill.title='Sign out';
  pill.onclick=()=>{if(confirm('Sign out of AQOON?'))signOut()};
  document.body.appendChild(pill);
}
function renderPill(){
  const pill=document.getElementById('operatorPill');if(!pill)return;
  const appEl=document.getElementById('app');
  const visible=appEl&&!appEl.classList.contains('hidden');
  pill.classList.toggle('hidden',!visible);
  const name=meName();
  pill.innerHTML=name?('<span class="dot"></span>Acting as <b>'+esc(name)+'</b> · sign out'):'';
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
