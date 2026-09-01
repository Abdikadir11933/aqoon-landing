(()=>{'use strict';
const SUPABASE_URL='https://qxracwbsyfibcelasxbs.supabase.co';
const LEADS_END=SUPABASE_URL+'/functions/v1/family-leads-admin';
const OPS_END=SUPABASE_URL+'/functions/v1/ops-admin';
const ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cmFjd2JzeWZpYmNlbGFzeGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDEyMDYsImV4cCI6MjA5Mzk3NzIwNn0.RuLR2jqsRYN1vLEfa4u_wFpVRp-LRd6yP-5bCNXZyDg';
const MUTATING_LEAD_ACTIONS=new Set(['save_interview','interview_save','record_call_outcome','update']);
const MUTATING_OPS_ACTIONS=new Set(['save_opportunity','delete_opportunity','add_activity','save_event','delete_event']);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let operators=[],opById={},leadAttrib={},oppRecords={},badgeTimer=null,pickerMode='signin',refreshPromise=null;

function meId(){return sessionStorage.getItem('aqoon_operator_id')||''}
function meName(){return sessionStorage.getItem('aqoon_operator_name')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
function authHeaders(){const token=authToken();return Object.assign({'Content-Type':'application/json'},token?{Authorization:'Bearer '+token}:{})}
window.AqoonAuthHeaders=authHeaders;
function setMe(id,name){sessionStorage.setItem('aqoon_operator_id',id);sessionStorage.setItem('aqoon_operator_name',name);renderPill();scheduleBadgeRefresh()}
function setAuthSession(token,refresh){if(token)sessionStorage.setItem('aqoon_auth_token',token);if(refresh)sessionStorage.setItem('aqoon_auth_refresh_token',refresh)}
function clearMe(){sessionStorage.removeItem('aqoon_operator_id');sessionStorage.removeItem('aqoon_operator_name');sessionStorage.removeItem('aqoon_auth_token');sessionStorage.removeItem('aqoon_auth_refresh_token')}
function nameFor(id){if(!id)return'';const o=opById[id];return o?o.display_name:''}

// The Tracker unlocks only after Supabase Auth has produced a valid JWT
// linked to an active AQOON operator.
function unlockWithSession(){location.reload()}
function signOut(){clearMe();location.reload()}

async function authRequest(path,body){
  const r=await fetch(SUPABASE_URL+path,{method:'POST',headers:{'Content-Type':'application/json',apikey:ANON_KEY},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error_description||d.msg||d.error||'Could not sign in');
  return d;
}
async function authSignIn(email,password){return authRequest('/auth/v1/token?grant_type=password',{email,password})}
async function authSignUp(email,password){return authRequest('/auth/v1/signup',{email,password})}
async function authRecover(email){return authRequest('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/tracker/'),{email})}
async function authUpdatePassword(token,password){
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{method:'PUT',headers:{'Content-Type':'application/json',apikey:ANON_KEY,Authorization:'Bearer '+token},body:JSON.stringify({password})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error_description||d.msg||d.error||'Could not update password');
  return d;
}
function readRecoverySession(){
  const p=new URLSearchParams(location.hash.replace(/^#/,''));
  if(p.get('type')!=='recovery'||!p.get('access_token'))return null;
  const session={access_token:p.get('access_token'),refresh_token:p.get('refresh_token')||''};
  history.replaceState(null,'',location.pathname+location.search);
  return session;
}
const recoverySession=readRecoverySession();
function tokenExpiresSoon(token){try{const raw=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),padded=raw+'='.repeat((4-raw.length%4)%4),payload=JSON.parse(atob(padded));return !payload.exp||payload.exp*1000<=Date.now()+60000}catch{return true}}
async function refreshAuthSession(force=false){
  const current=authToken();
  if(!force&&current&&!tokenExpiresSoon(current))return current;
  const refresh=sessionStorage.getItem('aqoon_auth_refresh_token')||'';
  if(!refresh)return current;
  if(!refreshPromise)refreshPromise=authRequest('/auth/v1/token?grant_type=refresh_token',{refresh_token:refresh}).then(session=>{if(!session.access_token)throw new Error('Session refresh failed');setAuthSession(session.access_token,session.refresh_token);return session.access_token}).finally(()=>{refreshPromise=null});
  try{return await refreshPromise}catch{return current}
}
async function whoami(token){
  const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'whoami'})});
  return r.json().catch(()=>({}));
}
async function claimOperator(token,operatorId){
  const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'claim_operator',operator_id:operatorId})});
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

// Builds the only Tracker access UI: Supabase Auth sign-in/sign-up.
function ensureAuthUI(){
  const box=document.querySelector('.lockbox');
  if(!box||document.getElementById('operatorAuthWrap'))return;
  const wrap=document.createElement('div');
  wrap.id='operatorAuthWrap';
  box.appendChild(wrap);
  renderAuthUI();
}
function renderAuthUI(){
  const wrap=document.getElementById('operatorAuthWrap');
  if(!wrap)return;
  if(pickerMode==='recover'){
    wrap.innerHTML='<form class="operator-auth" id="operatorRecoverForm"><p class="muted">Enter your approved operator email. Supabase will send a private password-reset link.</p><input type="email" id="operatorRecoverEmail" placeholder="Your AQOON email" autocomplete="email" required><div class="operator-error" id="operatorAuthError"></div><button type="submit" class="operator-auth-btn" id="operatorAuthSubmit">Send reset email</button></form><div class="operator-switch"><a id="operatorToSignin">Back to sign in</a></div>';
    document.getElementById('operatorToSignin').onclick=()=>{pickerMode='signin';renderAuthUI()};
    document.getElementById('operatorRecoverForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('operatorRecoverEmail').value.trim(),errEl=document.getElementById('operatorAuthError'),btn=document.getElementById('operatorAuthSubmit');errEl.textContent='';btn.disabled=true;btn.textContent='Sending…';try{await authRecover(email);errEl.style.color='var(--t,#0c8c80)';errEl.textContent='Reset email sent. Open it on this device, then choose a new password.';}catch(ex){errEl.style.color='';errEl.textContent=ex.message||'Could not send the reset email.';}finally{btn.disabled=false;btn.textContent='Send reset email';}};
    return;
  }
  if(pickerMode==='reset'){
    wrap.innerHTML='<form class="operator-auth" id="operatorResetForm"><p class="muted">Choose a new password for your AQOON operator account.</p><input type="password" id="operatorNewPassword" placeholder="New password" autocomplete="new-password" minlength="8" required><input type="password" id="operatorConfirmPassword" placeholder="Confirm new password" autocomplete="new-password" minlength="8" required><div class="operator-error" id="operatorAuthError"></div><button type="submit" class="operator-auth-btn" id="operatorAuthSubmit">Save new password</button></form>';
    document.getElementById('operatorResetForm').onsubmit=async e=>{e.preventDefault();const password=document.getElementById('operatorNewPassword').value,confirmPassword=document.getElementById('operatorConfirmPassword').value,errEl=document.getElementById('operatorAuthError'),btn=document.getElementById('operatorAuthSubmit');errEl.textContent='';if(password!==confirmPassword){errEl.textContent='The passwords do not match.';return}btn.disabled=true;btn.textContent='Saving…';try{await authUpdatePassword(recoverySession.access_token,password);setAuthSession(recoverySession.access_token,recoverySession.refresh_token);const who=await whoami(recoverySession.access_token);if(!who.operator)throw new Error('This account is not an active AQOON operator.');setMe(who.operator.id,who.operator.display_name);unlockWithSession();}catch(ex){errEl.textContent=ex.message||'Could not update the password. Request a new reset email.';}finally{btn.disabled=false;btn.textContent='Save new password';}};
    return;
  }
  if(pickerMode==='signin'||pickerMode==='signup'){
    const isSignup=pickerMode==='signup';
    wrap.innerHTML='<form class="operator-auth" id="operatorAuthForm"><input type="email" id="operatorEmail" placeholder="Your AQOON email" autocomplete="username" required><input type="password" id="operatorPassword" placeholder="Password" autocomplete="'+(isSignup?'new-password':'current-password')+'" minlength="6" required>'+(isSignup?'<div id="operatorSignupOptions" class="operator-options"><p class="muted">Loading…</p></div>':'')+'<div class="operator-error" id="operatorAuthError"></div><button type="submit" class="operator-auth-btn" id="operatorAuthSubmit">'+(isSignup?'Create my account':'Unlock')+'</button></form><div class="operator-switch">'+(isSignup?'Already have an account? <a id="operatorToSignin">Sign in</a>':'<a id="operatorToRecover">Forgot password?</a> · New here? <a id="operatorToSignup">Create an account</a>')+'</div>';
    if(isSignup)document.getElementById('operatorSignupOptions').innerHTML='<p class="muted">Your email must already be approved for an AQOON operator account.</p>';
    document.getElementById('operatorToSignup')?.addEventListener('click',()=>{pickerMode='signup';renderAuthUI()});
    document.getElementById('operatorToSignin')?.addEventListener('click',()=>{pickerMode='signin';renderAuthUI()});
    document.getElementById('operatorToRecover')?.addEventListener('click',()=>{pickerMode='recover';renderAuthUI()});
    document.getElementById('operatorAuthForm').onsubmit=async e=>{
      e.preventDefault();
      const email=document.getElementById('operatorEmail').value.trim(),password=document.getElementById('operatorPassword').value;
      const errEl=document.getElementById('operatorAuthError'),btn=document.getElementById('operatorAuthSubmit');
      errEl.textContent='';
      btn.disabled=true;btn.textContent='Please wait…';
      try{
        const session=isSignup?await authSignUp(email,password):await authSignIn(email,password);
        if(!session.access_token)throw new Error('Check your email to confirm the account, then sign in.');
        setAuthSession(session.access_token,session.refresh_token);
        if(isSignup){
          const claimed=await claimOperator(session.access_token,'');
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
    wrap.innerHTML='<p class="muted">Linking your approved AQOON account…</p><div class="operator-error" id="operatorAuthError"></div>';
    claimOperator(authToken(),'').then(claimed=>{setMe(claimed.operator.id,claimed.operator.display_name);unlockWithSession();}).catch(ex=>{
      const errEl=document.getElementById('operatorAuthError');
      if(errEl)errEl.textContent=ex.message||'This email is not approved for AQOON Tracker.';
    });
  }
}
async function fetchOperators(){
  if(operators.length)return operators;
  try{
    const token=authToken();if(!token)return operators;const r=await fetch(LEADS_END,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'operators'})});
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
    await fetch(OPS_END,{method:'POST',headers:authHeaders(),body:JSON.stringify(Object.assign({},rec,{action:'save_opportunity',owner_operator_id:meId(),operator_id:meId()}))});
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
    const privateEndpoint=['/family-leads-admin','/family-incomplete-admin','/family-case-lifecycle-admin','/family-route-review-admin','/family-route-preview-admin','/family-interview-history-admin','/family-scenario-admin','/family-leads-manage','/ops-admin'].some(path=>url.includes(path));
    const isLeads=url.includes('/family-leads-admin'),isOps=url.includes('/ops-admin');
    if(privateEndpoint&&init&&typeof init.body==='string'){
      try{
        const body=JSON.parse(init.body);
        const operator=meId();
        if(operator&&!('operator_id' in body)&&((isLeads&&MUTATING_LEAD_ACTIONS.has(body.action))||(isOps&&MUTATING_OPS_ACTIONS.has(body.action)))){
          body.operator_id=operator;
          init=Object.assign({},init,{body:JSON.stringify(body)});
        }
        const token=await refreshAuthSession(false);
        if(token)init=Object.assign({},init,{headers:Object.assign({},init.headers,{Authorization:'Bearer '+token})});
      }catch(e){}
    }
    let response=await orig(input,init);
    if(privateEndpoint&&response.status===401&&sessionStorage.getItem('aqoon_auth_refresh_token')){
      const refreshed=await refreshAuthSession(true);
      if(refreshed){
        const retryInit=Object.assign({},init,{headers:Object.assign({},init?.headers,{Authorization:'Bearer '+refreshed})});
        response=await orig(input,retryInit);
      }
    }
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

// #lock is visible from first paint. Wait for app.js's session check before
// deciding whether to show the account form.
function decideInitialAuthUI(){
  if(recoverySession){clearMe();pickerMode='reset';ensureAuthUI();return}
  if(!sessionStorage.getItem('aqoon_auth_token')){showSignIn();return}
  let tries=0;
  const check=()=>{
    const appEl=document.getElementById('app');
    if(appEl&&!appEl.classList.contains('hidden'))return; // auto-login succeeded
    if(!sessionStorage.getItem('aqoon_auth_token')){showSignIn();return} // app.js's lock() ran: ping failed
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
