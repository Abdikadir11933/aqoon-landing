(function(){
  // Nav scroll class
  var nav = document.getElementById('nav');
  if(nav){ window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 20); }); }

  // Reveal animation
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold: .12});
  document.querySelectorAll('.reveal').forEach(function(el, i){
    el.style.transitionDelay = (i % 4 * 70) + 'ms';
    io.observe(el);
  });

  // Hamburger menu
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks  = document.getElementById('nav-links');
  if(hamburger && navLinks){
    hamburger.addEventListener('click', function(){
      var open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      navLinks.classList.toggle('open', open);
    });
    // Close on outside click
    document.addEventListener('click', function(e){
      if(!nav.contains(e.target)){
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
        navLinks.classList.remove('open');
      }
    });
    // Close on nav-link click (mobile)
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
        navLinks.classList.remove('open');
      });
    });
  }
})();
