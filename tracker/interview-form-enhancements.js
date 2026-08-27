(()=>{'use strict';
const QUESTIONS='#questions';

function enhanceBarrier(root){
  const row=root.querySelector('.choice-row[data-key="barrier"]');
  if(!row||row.dataset.multiEnhanced==='1')return;
  row.dataset.multiEnhanced='1';
  row.classList.add('match-multi');
  row.querySelectorAll('.choice').forEach(button=>{
    button.onclick=()=>button.classList.toggle('on');
  });
}

function addConditionNote(root,key,label){
  const row=root.querySelector('.choice-row[data-key="'+key+'"]');
  if(!row)return;
  const question=row.closest('.question');
  if(!question||question.querySelector('[data-key="'+key+'_notes"]'))return;
  const wrap=document.createElement('div');
  wrap.style.marginTop='10px';
  wrap.innerHTML='<label style="display:block;font-size:13px;margin-bottom:6px">'+label+'</label><input data-key="'+key+'_notes" type="text" placeholder="e.g. only if paid / depends on terms">';
  question.appendChild(wrap);
}

function addJobSearchProfile(root){
  const anchor=root.querySelector('.choice-row[data-key="jobseeker_active"]');
  if(!anchor||root.querySelector('[data-key="job_search_profile"]'))return;
  const anchorQuestion=anchor.closest('.question');
  if(!anchorQuestion)return;
  const question=document.createElement('div');
  question.className='question match-extra';
  question.innerHTML='<label>Työnhakuprofiili published? <small style="color:#0A8F89">new rule from 1.9.2026</small></label><div class="choice-row" data-key="job_search_profile"><button type="button" class="choice" data-value="Published">Published</button><button type="button" class="choice" data-value="Not published">Not published</button><button type="button" class="choice" data-value="Not yet applicable">Not yet applicable</button><button type="button" class="choice" data-value="Not sure">Not sure</button></div><small class="muted" style="display:block;margin-top:8px">From 1 Sep 2026 publishing and keeping the profile published becomes part of job search when the obligation applies. New jobseekers generally get 15 working days; existing jobseekers usually enter the obligation at their next employment-services interaction after the change.</small>';
  anchorQuestion.insertAdjacentElement('afterend',question);
  question.querySelectorAll('.choice').forEach(button=>{
    button.onclick=()=>{
      question.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));
      button.classList.add('on');
    };
  });
}

function enhance(){
  const root=document.querySelector(QUESTIONS);
  if(!root)return;
  enhanceBarrier(root);
  addJobSearchProfile(root);
  addConditionNote(root,'work_tryout','Työkokeilu notes / conditions');
  addConditionNote(root,'apprenticeship','Oppisopimus notes / conditions');
}

const observer=new MutationObserver(()=>enhance());
const start=()=>{
  const root=document.querySelector(QUESTIONS);
  if(root)observer.observe(root,{childList:true,subtree:true});
  enhance();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
document.addEventListener('click',e=>{if(e.target.closest('[data-interview]'))setTimeout(enhance,80)},false);
})();
