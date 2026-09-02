(function(){
  'use strict';
  var button=document.querySelector('[data-menu-toggle]');
  var nav=document.querySelector('[data-mobile-nav]');
  if(!button||!nav)return;
  var label=button.querySelector('span');
  function setOpen(open){
    button.setAttribute('aria-expanded',open?'true':'false');
    nav.hidden=!open;
    if(label)label.textContent=open?'Sulje':'Valikko';
  }
  button.addEventListener('click',function(){setOpen(button.getAttribute('aria-expanded')!=='true');});
  nav.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){setOpen(false);});});
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});
  window.matchMedia('(min-width:901px)').addEventListener('change',function(event){if(event.matches)setOpen(false);});
})();
