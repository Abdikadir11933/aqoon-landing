(()=>{'use strict';
const END='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin';
const REVIEW='https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-route-review-admin';
const $=id=>document.getElementById(id);let leadId='',timer=null,lastCandidates=[];
const style=document.createElement('style');style.textContent='.route-preview{background:#eef9f7;border:1px solid #cbe7e4;border-radius:14px;padding:12px;margin:0 0 10px}.route-preview-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px}.route-preview-head span{display:block;font-size:9px;letter-spacing:.08em;color:#36746d;font-weight:800}.route-preview-head strong{display:block;font-size:12px;margin-top:2px}.route-card{background:#fff;border:1px solid #d6ebe7;border-radius:11px;padding:11px;margin-top:8px}.route-card h3{font-size:12px;margin:4px 0 8px}.route-card p,.route-card li,.route-card small{font-size:10px;line-height:1.45}.route-card p{margin:6px 0}.route-card ol{margin:7px 0 8px;padding-left:18px}.route-card a{color:#0c8c80}.route-kicker{font-size:9px;color:#36746d;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.route-conflict{color:#a43f39!important}.route-disclosure{background:#fff5df;padding:7px;border-radius:8px;color:#77521b!important}.route-review-row{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}.route-review-row button{flex:1;min-width:90px;font-size:9px;font-weight:700;padding:6px 4px;border-radius:8px;border:1px solid #d6ebe7;background:#f6fbfa;color:#245c56;cursor:pointer}.route-review-row button:hover{background:#e6f4f1}.route-review-row button[data-review="confirmed_match"]{border-color:#3a9b8a;color:#1f6e62}.route-review-row button[data-review="does_not_fit"]{border-color:#d97560;color:#a43f39}.route-review-status{font-size:9px;color:#36746d;font-weight:700;margin-top:6px}';document.head.appendChild(style);
function password(){return sessionStorage.getItem('aqoon_tracker_password')||''}
function authToken(){return sessionStorage.getItem('aqoon_auth_token')||''}
async function api(body){const headers={'Content-Type':'application/json','x-tracker-password':password()},token=authToken();if(token)headers.Authorization='Bearer '+token;const r=await fetch(END,{method:'POST',headers,body:JSON.stringify(body),cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.detail||d.error||'Could not load route preview');return d}
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
// AqoonApp still holds the pre-save interview_status until its background
// refresh completes. The server has already accepted the interview, so use
// that confirmed save to run the authoritative match_preview immediately.
window.addEventListener('aqoon:interview-saved',async event=>{
  const detail=event.detail||{};
  if(!detail.lead?.id)return;
  leadId=detail.lead.id;
  try{render(await api({action:'match_preview',lead_id:leadId,answers:detail.answers||{}}))}
  catch(error){const el=host();if(el)el.innerHTML='<p class="route-conflict">'+esc(error.message)+'</p>'}
});
window.AqoonRoutePreview={getCandidates:()=>lastCandidates.map(candidate=>({...candidate}))};
// The preview is read-only. Re-rendering it on every keystroke/choice causes
// mobile scroll jumps and spends a request while the operator is still
// answering. Use the explicit Refresh button (or post-save open) instead.
})();
