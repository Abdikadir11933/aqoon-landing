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

function enhance(){
  const root=document.querySelector(QUESTIONS);
  if(!root)return;
  enhanceBarrier(root);
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
