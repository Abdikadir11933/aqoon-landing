(() => {
  'use strict';

  const data = window.PORTFOLIO;
  const main = document.getElementById('main');
  const progress = document.getElementById('reading-progress');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const number = index => String(index + 1).padStart(2, '0');
  const external = (label, url) => /^(https:\/\/|mailto:)/.test(url)
    ? `<a href="${esc(url)}"${url.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}${url.startsWith('https:') ? ' <span aria-hidden="true">↗</span>' : ''}</a>` : '';
  const links = items => items?.length ? `<div class="link-row">${items.map(([label, url]) => external(label, url)).join('')}</div>` : '';
  const stage = p => `<span class="stage">${esc(p.stage)}</span>`;
  const title = text => { document.title = text ? `${text} | ${data.name}` : `${data.name} | Projects & portfolio`; };

  // Process explanations describe the implemented work. The portfolio does not
  // simulate customer records, product usage or results.
  const processes = data.processes;

  let selected = 0;
  const processSelections = new Map();

  function processFigure(id, context) {
    const process = processes[id];
    if (!process) return '';
    const key = `${context}-${id}`;
    const active = processSelections.get(key) ?? 0;
    const item = process.steps[active];
    return `<figure class="process" data-process="${key}" data-project="${id}">
      <figcaption>${esc(process.title)}</figcaption>
      <div class="process-steps" role="group" aria-label="${esc(process.title)}">
        ${process.steps.map(([label], index) => `<button type="button" data-step="${index}" aria-pressed="${index === active}" aria-controls="${key}-detail"><span class="step-number">${number(index)}</span><span>${esc(label)}</span></button>`).join('')}
      </div>
      <div class="process-detail" id="${key}-detail" aria-live="polite" aria-atomic="true"><span class="detail-number" aria-hidden="true">${number(active)}</span><div><h3>${esc(item[1])}</h3><p>${esc(item[2])}</p></div></div>
    </figure>`;
  }

  function selectedProject() {
    const p = data.projects[selected];
    return `<div class="panel-heading"><span class="project-number">${number(selected)}</span><p class="eyebrow">${esc(p.category)}</p></div>
      <h2 id="selected-project-title">${esc(p.title)}</h2>
      <p class="project-summary">${esc(p.summary)}</p>
      <dl class="project-facts"><div><dt>My part</dt><dd>${esc(p.role)}</dd></div><div><dt>Where it stands</dt><dd>${esc(p.stage)}</dd></div></dl>
      ${processFigure(p.id, 'overview')}
      <a class="story-link" href="#project/${esc(p.id)}"><span>The problem, the work and what I learned</span><strong>Read the story <span aria-hidden="true">→</span></strong></a>`;
  }

  function work() {
    title();
    return `<section class="work-layout" aria-label="Introduction and selected work">
      <div class="work-rail">
        <div class="intro"><p class="eyebrow">Helsinki, Finland / Portfolio</p><h1>I'm Abducadir.<br><span>${esc(data.headline)}</span></h1><p>${esc(data.intro)}</p><p class="positioning">${esc(data.positioning)}</p></div>
        <div class="project-picker"><h2 class="eyebrow" id="work-title">Selected work</h2><div class="project-selector" role="group" aria-labelledby="work-title">${data.projects.map((p, index) => `<button type="button" data-select="${index}" aria-pressed="${index === selected}" aria-controls="project-overview"><span>${number(index)}</span><strong>${esc(p.title)}</strong><span class="select-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div>
        <div class="rail-links"><a class="button" href="#about">About me</a><a class="text-link" href="mailto:aligureabducadir@gmail.com">Get in touch <span aria-hidden="true">↗</span></a></div>
      </div>
      <section class="project-overview" id="project-overview" tabindex="-1" aria-labelledby="selected-project-title">${selectedProject()}</section>
    </section>
    <section class="closing-strip"><div><h2>More things I've tried.</h2><p>${esc(data.otherIntro)}</p></div><a class="button button-light" href="#other">Browse other work <span aria-hidden="true">→</span></a></section>`;
  }

  function block(b, index) {
    return `<section class="story-section" id="story-${index}">${b.heading ? `<h2>${esc(b.heading)}</h2>` : ''}${b.text ? `<p>${esc(b.text)}</p>` : ''}</section>`;
  }

  function projectPage(id) {
    const index = data.projects.findIndex(item => item.id === id);
    const p = data.projects[index];
    if (!p) {
      title('Project not found');
      return `<section class="page-intro"><h1>Project not found.</h1><p>This link does not match a project in the portfolio.</p><a href="#work">Return to selected work</a></section>`;
    }
    selected = index;
    title(p.title);
    const next = data.projects[(index + 1) % data.projects.length];
    return `<article class="case-page"><a class="back-link" href="#work"><span aria-hidden="true">←</span> Selected work</a>
      <header class="case-head"><div class="panel-heading"><span class="project-number">${number(index)}</span><p class="eyebrow">${esc(p.category)}</p></div><h1>${esc(p.title)}</h1><p class="deck">${esc(p.subtitle)}</p><div class="case-meta">${stage(p)}<span>${esc(p.steps)}</span></div></header>
      <div class="case-layout"><div class="story">${p.blocks.map((b, i) => `${block(b, i)}${i === 1 ? processFigure(p.id, 'story') : ''}`).join('')}
        <a class="story-link next-story" href="#project/${esc(next.id)}"><span>Next project</span><strong>${esc(next.title)} <span aria-hidden="true">→</span></strong></a>
      </div><aside class="case-aside" aria-label="Project details"><div class="aside-box"><h2>My part</h2><p>${esc(p.role)}</p><h2>Built with</h2><ul>${p.tools.map(tool => `<li>${esc(tool)}</li>`).join('')}</ul>${links(p.links)}${p.sourceNote ? `<p class="note">${esc(p.sourceNote)}</p>` : ''}</div></aside></div>
    </article>`;
  }

  function otherWork() {
    title('Other work');
    return `<header class="page-intro"><p class="page-label">Other work</p><h1>Smaller ideas.<br>Room to try things.</h1><p>${esc(data.otherIntro)}</p></header>
      ${data.otherGroups.map(group => `<section class="repo-group" aria-labelledby="${esc(group.id)}"><h2 id="${esc(group.id)}">${esc(group.title)}</h2><div class="other-entries">${group.entries.map(entry => `<article class="other-entry" id="other-${esc(entry.id)}"><header><h3>${esc(entry.title)}</h3>${stage(entry)}</header><div><p>${esc(entry.text)}</p>${links(entry.links)}</div></article>`).join('')}</div></section>`).join('')}
      <a class="back-link other-back" href="#work"><span aria-hidden="true">←</span> Back to selected work</a>`;
  }

  function about() {
    title('About');
    const a = data.about;
    return `<header class="page-intro"><p class="page-label">About / Experience</p><h1>${esc(a.title)}</h1><p>${esc(a.intro)}</p></header>
      <div class="about-layout"><article><section class="about-section"><h2>How I work</h2><p>${esc(a.approach)}</p></section>
      <section class="about-section"><h2>Experience I bring</h2>${a.experience.map(e => `<div class="experience-item"><h3>${esc(e.title)}</h3><p class="period">${esc(e.period)}</p><p>${esc(e.text)}</p></div>`).join('')}</section>
      <section class="about-section"><h2>What I'm studying</h2><p>${esc(a.education)}</p></section>
      <section class="about-section looking-for"><h2>What I'm looking for</h2><p>${esc(a.lookingFor)}</p>${links(a.links)}</section></article>
      <aside class="about-facts" aria-label="About me at a glance"><dl>${a.facts.map(([label, value]) => `<div class="fact"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}<div class="fact"><dt>Portfolio</dt><dd><a href="/portfolio/Abducadir_Aligure_Portfolio.pdf" download>Download the portfolio PDF <span aria-hidden="true">↓</span></a></dd></div></dl></aside></div>`;
  }

  function updateProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.max(0, Math.min(1, window.scrollY / height)) : 0})`;
  }

  function render() {
    const route = location.hash.slice(1) || 'work';
    if (route === 'main') { main.focus(); return; }
    const briefIds = data.otherGroups.flatMap(group => group.entries.map(entry => entry.id));
    if (route === 'repositories' || (route.startsWith('project/') && briefIds.includes(route.slice(8)))) {
      location.replace('#other');
      return;
    }
    if (['project/aroossync', 'project/oivaguard', 'project/nitrate'].includes(route)) {
      location.replace('#work');
      return;
    }
    let nav = 'work';
    if (route === 'other') { main.innerHTML = otherWork(); nav = 'other'; }
    else if (route === 'about') { main.innerHTML = about(); nav = 'about'; }
    else if (route.startsWith('project/')) main.innerHTML = projectPage(route.slice(8));
    else main.innerHTML = work();
    document.querySelectorAll('[data-nav]').forEach(a => a.getAttribute('data-nav') === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    main.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: 'instant'});
    updateProgress();
  }

  main.addEventListener('click', event => {
    const picker = event.target.closest('[data-select]');
    if (picker) {
      selected = Number(picker.dataset.select);
      main.querySelectorAll('[data-select]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.select) === selected)));
      document.getElementById('project-overview').innerHTML = selectedProject();
      // Keep the next action near the selected project on a small screen.
      if (window.matchMedia('(max-width: 760px)').matches) {
        const overview = document.getElementById('project-overview');
        overview.focus({preventScroll: true});
        overview.scrollIntoView({block: 'start', behavior: 'instant'});
      }
      updateProgress();
      return;
    }
    const step = event.target.closest('[data-step]');
    if (!step) return;
    const figure = step.closest('[data-process]');
    const active = Number(step.dataset.step);
    const item = processes[figure.dataset.project].steps[active];
    processSelections.set(figure.dataset.process, active);
    figure.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === active)));
    document.getElementById(`${figure.dataset.process}-detail`).innerHTML = `<span class="detail-number" aria-hidden="true">${number(active)}</span><div><h3>${esc(item[1])}</h3><p>${esc(item[2])}</p></div>`;
    updateProgress();
  });

  // Native buttons support Tab, Enter and Space. Arrow keys also move within
  // each related group without giving buttons incomplete tab semantics.
  main.addEventListener('keydown', event => {
    const button = event.target.closest('[data-select], [data-step]');
    if (!button || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const selector = button.hasAttribute('data-select') ? '[data-select]' : '[data-step]';
    const group = button.closest('[role="group"]');
    const buttons = [...group.querySelectorAll(selector)];
    const current = buttons.indexOf(button);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next].focus();
  });

  let scrollFrame = false;
  window.addEventListener('scroll', () => {
    if (!scrollFrame) {
      scrollFrame = true;
      requestAnimationFrame(() => { updateProgress(); scrollFrame = false; });
    }
  }, {passive: true});
  window.addEventListener('resize', updateProgress);
  window.addEventListener('hashchange', render);
  render();
})();
