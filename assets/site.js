(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var menu = document.querySelector('[data-menu]');
  var links = document.querySelector('[data-nav-links]');
  if (menu && links) {
    var setMenu = function (open) {
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      links.classList.toggle('open', open);
    };
    menu.addEventListener('click', function () {
      setMenu(menu.getAttribute('aria-expanded') !== 'true');
    });
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { setMenu(false); menu.focus(); }
    });
  }

  /* Sideways card lists. Without controls the only hint that a list scrolls
     is a half-cut card, and the cards are full width on purpose, so there is
     no hint at all. Attach arrows and a position counter, but only while the
     list actually overflows - on wide screens the columns are all visible. */
  var CAROUSELS = '.method-flow,.tool-grid,.finding-grid,.collaboration-steps,.package-grid';
  document.querySelectorAll(CAROUSELS).forEach(function (list) {
    var items = Array.prototype.slice.call(list.children);
    if (items.length < 2) return;

    var bar = document.createElement('div');
    bar.className = 'carousel-bar';
    bar.hidden = true;
    bar.innerHTML =
      '<button type="button" class="carousel-btn" data-dir="-1" aria-label="Edellinen">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<p class="carousel-count" aria-hidden="true"><b>1</b> / ' + items.length + '</p>' +
      '<button type="button" class="carousel-btn" data-dir="1" aria-label="Seuraava">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    list.insertAdjacentElement('afterend', bar);

    var prev = bar.querySelector('[data-dir="-1"]');
    var next = bar.querySelector('[data-dir="1"]');
    var count = bar.querySelector('.carousel-count b');

    /* Track the index rather than deriving it from scrollLeft on every
       click: mid-animation the scroll position is stale, which made every
       press land one card behind. Reading it back is only for resyncing
       after the reader swipes by hand. */
    var index = 0;

    var nearest = function () {
      var i = 0, best = Infinity, left = list.scrollLeft;
      items.forEach(function (item, n) {
        var d = Math.abs(item.offsetLeft - list.offsetLeft - left);
        if (d < best) { best = d; i = n; }
      });
      return i;
    };

    var paint = function () {
      var scrollable = list.scrollWidth - list.clientWidth > 4;
      bar.hidden = !scrollable;
      if (!scrollable) return;
      count.textContent = index + 1;
      prev.disabled = index <= 0;
      next.disabled = index >= items.length - 1;
    };

    /* Jump straight to the card. Mandatory snap with scroll-snap-stop:always
       cancels a programmatic smooth scroll partway and springs back to where
       it started, so an animated scroll here is unreliable. Landing on the
       card immediately always works and reads fine on a snapping list. */
    var goTo = function (n) {
      index = Math.min(items.length - 1, Math.max(0, n));
      var target = items[index];
      if (!target) return;
      list.scrollLeft = target.offsetLeft - list.offsetLeft;
      paint();
    };

    bar.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-dir]');
      if (btn) goTo(index + (+btn.dataset.dir));
    });

    var settle = null;
    list.addEventListener('scroll', function () {
      window.clearTimeout(settle);
      settle = window.setTimeout(function () { index = nearest(); paint(); }, 120);
    }, { passive: true });
    window.addEventListener('resize', function () { index = nearest(); paint(); }, { passive: true });
    paint();
  });

  document.querySelectorAll('[data-route-widget]').forEach(function (widget) {
    var tabs = Array.prototype.slice.call(widget.querySelectorAll('[data-route-tab]'));
    var panels = Array.prototype.slice.call(widget.querySelectorAll('[data-route-panel]'));
    var panelWrap = widget.querySelector('.route-panels');
    var timer = null;

    if (!tabs.length || tabs.length !== panels.length) return;

    var showPanel = function (index) {
      panels.forEach(function (panel, panelIndex) {
        panel.hidden = panelIndex !== index;
      });
    };

    var keepSelectionInView = function () {
      if (window.innerWidth > 720) return;
      widget.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    };

    var select = function (index, focus, animate) {
      index = (index + tabs.length) % tabs.length;
      widget.style.setProperty('--step', index);
      widget.style.setProperty('--progress', (index * 25) + '%');

      tabs.forEach(function (tab, tabIndex) {
        var active = tabIndex === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (active && focus) tab.focus();
      });

      if (timer) window.clearTimeout(timer);
      if (animate && panelWrap && !reducedMotion.matches) {
        panelWrap.classList.add('is-changing');
        timer = window.setTimeout(function () {
          showPanel(index);
          window.requestAnimationFrame(function () {
            panelWrap.classList.remove('is-changing');
          });
        }, 150);
      } else {
        showPanel(index);
        if (panelWrap) panelWrap.classList.remove('is-changing');
      }
      if (animate) window.setTimeout(keepSelectionInView, 170);
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { select(index, false, true); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index - 1;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(next, true, true);
        }
      });
    });

    select(0, false, false);
  });
})();
