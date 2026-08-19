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
