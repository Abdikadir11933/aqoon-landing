/* AQOON shared JS. Kaikki moduulit ovat data-attribuuttiohjattuja ja
   alustuvat vain jos kohde löytyy sivulta. Natiivit <details> eivät tarvitse
   mitään täältä. Sivujen on toimittava luettavina myös ilman tätä tiedostoa. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Reveal ─────────────────────────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .12 });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4 * 70) + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Hampurilaisvalikko ─────────────────────────────────────── */
  var nav = document.getElementById('nav');
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks = document.getElementById('nav-links');
  if (nav && hamburger && navLinks) {
    var setMenu = function (open) {
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      navLinks.classList.toggle('open', open);
    };
    hamburger.addEventListener('click', function () {
      setMenu(!hamburger.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        setMenu(false);
        hamburger.focus();
      }
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ── Avaa kaikki / Sulje kaikki [data-toggle-all] ───────────
     Ohjaa kaikkia sivun details-lohkoja. Ilman JS:ää nappi on
     piilotettu, koska se ei tekisi mitään. */
  document.querySelectorAll('[data-toggle-all]').forEach(function (btn) {
    var stack = document.getElementById(btn.getAttribute('aria-controls'));
    if (!stack) return;
    var panels = Array.prototype.slice.call(stack.querySelectorAll('details'));
    if (!panels.length) return;

    var sync = function () {
      var allOpen = panels.every(function (d) { return d.open; });
      btn.textContent = allOpen ? 'Sulje kaikki' : 'Avaa kaikki';
      return allOpen;
    };

    btn.addEventListener('click', function () {
      var open = !sync();
      panels.forEach(function (d) { d.open = open; });
      sync();
    });
    panels.forEach(function (d) { d.addEventListener('toggle', sync); });
    sync();
  });

  /* ── Askelvalitsin [data-stepper] ───────────────────────────── */
  document.querySelectorAll('[data-stepper]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-step]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-step-panel]'));
    if (!tabs.length || !panels.length) return;

    var select = function (key, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-step') === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) t.focus();
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('data-step-panel') !== key;
      });
    };

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t.getAttribute('data-step'), false); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next.getAttribute('data-step'), true); }
      });
    });

    /* Ilman JS:ää kaikki paneelit ovat näkyvissä. JS ottaa ohjat vasta tässä. */
    select(tabs[0].getAttribute('data-step'), false);
  });

  /* ── Avattavat kortit [data-cards] ──────────────────────────── */
  document.querySelectorAll('[data-cards]').forEach(function (grid) {
    var toggles = Array.prototype.slice.call(grid.querySelectorAll('[data-card-toggle]'));
    if (!toggles.length) return;

    var closeAll = function () {
      toggles.forEach(function (b) {
        var body = document.getElementById(b.getAttribute('aria-controls'));
        b.setAttribute('aria-expanded', 'false');
        if (b.closest('.este')) b.closest('.este').classList.remove('is-open');
        if (body) body.hidden = true;
      });
      grid.classList.remove('has-open');
    };

    closeAll();

    toggles.forEach(function (btn) {
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      if (!body) return;
      btn.addEventListener('click', function () {
        var wasOpen = btn.getAttribute('aria-expanded') === 'true';
        closeAll();
        if (!wasOpen) {
          btn.setAttribute('aria-expanded', 'true');
          if (btn.closest('.este')) btn.closest('.este').classList.add('is-open');
          body.hidden = false;
          grid.classList.add('has-open');
        }
      });
    });
  });

  /* ── Kahden totuuden liuku [data-parallax-pair] ─────────────
     Sarakkeet liukuvat toisiaan kohti ja niiden alla olevat viivat
     kasvavat. Puhtaasti koristeellinen: ei aja mobiilissa eikä
     reduced motion -tilassa, ja sisältö on ilman sitä täysin luettava. */
  var pair = document.querySelector('[data-parallax-pair]');
  if (pair) {
    var left = pair.querySelector('[data-parallax="left"]');
    var right = pair.querySelector('[data-parallax="right"]');
    var barL = pair.querySelector('[data-parallax="bar-left"]');
    var barR = pair.querySelector('[data-parallax="bar-right"]');
    if (left && right) {
      var ticking = false;
      var apply = function () {
        ticking = false;
        if (reduceMotion.matches || window.innerWidth < 860) {
          left.style.transform = ''; right.style.transform = '';
          if (barL) barL.style.transform = '';
          if (barR) barR.style.transform = '';
          return;
        }
        var r = pair.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (window.innerHeight * 0.9 - r.top) / (r.height + window.innerHeight * 0.5)));
        var shift = Math.round(p * 40);
        left.style.transform = 'translateX(' + shift + 'px)';
        right.style.transform = 'translateX(' + (-shift) + 'px)';
        var grow = 'scaleX(' + (0.75 + p * 0.25) + ')';
        if (barL) barL.style.transform = grow;
        if (barR) barR.style.transform = grow;
      };
      var onScroll = function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(apply); }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      apply();
    }
  }

  /* ── Etusivun palvelupolku [data-family-journey] ─────────────
     Perhe kulkee vain käyttäjän valitsemaan vaiheeseen. Liike on yksi
     rauhallinen siirtymä, ei automaattinen esitys. */
  var journey = document.querySelector('[data-family-journey]');
  if (journey) {
    var journeyStage = journey.querySelector('.journey-stage');
    var journeyCopy = journey.querySelector('.journey-copy');
    var journeyTabs = Array.prototype.slice.call(journey.querySelectorAll('[data-journey-step]'));
    var journeyCopies = Array.prototype.slice.call(journey.querySelectorAll('[data-journey-copy]'));
    var journeyIndex = 0;
    var journeyCopyTimer = null;

    var showJourneyCopy = function (index) {
      journeyCopies.forEach(function (copy, i) { copy.hidden = i !== index; });
    };

    var selectJourney = function (index, focus, animate) {
      journeyIndex = (index + journeyTabs.length) % journeyTabs.length;
      journeyStage.style.setProperty('--journey-index', journeyIndex);
      journeyStage.style.setProperty('--journey-progress', (journeyIndex * 25) + '%');
      journeyTabs.forEach(function (tab, i) {
        var active = i === journeyIndex;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (active && focus) tab.focus();
      });

      if (journeyCopyTimer) window.clearTimeout(journeyCopyTimer);
      if (animate && !reduceMotion.matches && journeyCopy) {
        journeyCopy.classList.add('is-changing');
        journeyCopyTimer = window.setTimeout(function () {
          showJourneyCopy(journeyIndex);
          window.requestAnimationFrame(function () {
            journeyCopy.classList.remove('is-changing');
          });
        }, 150);
      } else {
        showJourneyCopy(journeyIndex);
        if (journeyCopy) journeyCopy.classList.remove('is-changing');
      }
    };

    journeyTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        selectJourney(i, false, true);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = journeyTabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          selectJourney(next, true, true);
        }
      });
    });

    /* Ilman JS:ää kaikki viisi selitystä näkyvät. JS tiivistää näkymän. */
    selectJourney(0, false, false);
  }
})();
