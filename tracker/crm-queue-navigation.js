/* Family CRM Queue-Based Navigation */

const CrmQueues = {
  phases: [
    { id: 'incomplete', label: 'Incomplete intake', color: 'navy' },
    { id: 'first_contact', label: 'First contact', color: 'teal' },
    { id: 'in_progress', label: 'Interview follow-up', color: 'cream' },
    { id: 'resolved', label: 'Resolved', color: 'cream' }
  ],

  expandedPhase: null,
  selectedFamily: null,

  init() {
    this.renderQueues();
    this.bindEvents();

    // Re-render when data updates
    window.addEventListener('dataUpdated', () => this.renderQueues());
  },

  renderQueues() {
    const grid = document.getElementById('crmQueuesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.phases.forEach(phase => {
      const families = this.getFamiliesByPhase(phase.id);
      const card = document.createElement('div');
      card.className = 'queue-card';
      card.dataset.phase = phase.id;

      const isExpanded = this.expandedPhase === phase.id;

      card.innerHTML = `
        <div class="queue-header" data-phase="${phase.id}">
          <h3>${phase.label}</h3>
          <span class="queue-count">${families.length}</span>
        </div>
        <div class="queue-content ${isExpanded ? '' : 'hidden'}" id="content-${phase.id}">
          <div class="family-list" id="list-${phase.id}"></div>
        </div>
      `;

      // Header click toggles expansion
      const header = card.querySelector('.queue-header');
      header.addEventListener('click', () => this.toggleQueue(phase.id));

      grid.appendChild(card);

      // Render families if expanded
      if (isExpanded) {
        this.renderFamiliesInPhase(phase.id, families);
      }
    });
  },

  toggleQueue(phaseId) {
    // Close other queues
    if (this.expandedPhase !== phaseId) {
      const previousContent = document.getElementById(`content-${this.expandedPhase}`);
      if (previousContent) previousContent.classList.add('hidden');
    }

    // Toggle current queue
    const content = document.getElementById(`content-${phaseId}`);
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      this.expandedPhase = phaseId;

      // Render families if not already rendered
      const list = document.getElementById(`list-${phaseId}`);
      if (list.innerHTML === '') {
        const families = this.getFamiliesByPhase(phaseId);
        this.renderFamiliesInPhase(phaseId, families);
      }
    } else {
      content.classList.add('hidden');
      this.expandedPhase = null;
    }
  },

  getFamiliesByPhase(phaseId) {
    // Get families from window.AqoonApp (populated by app.js)
    const leads = window.AqoonApp?.leads || [];
    const partials = window.AqoonApp?.partials || [];

    let families = [];

    if (phaseId === 'incomplete') {
      // Incomplete intake forms (from partials array)
      families = partials;
    } else if (phaseId === 'first_contact') {
      // Families with status 'new' (ready for first contact)
      families = leads.filter(x => x.status === 'new');
    } else if (phaseId === 'in_progress') {
      // Families with status 'contacted' (awaiting outcome/next steps)
      families = leads.filter(x => x.status === 'contacted');
    } else if (phaseId === 'resolved') {
      // Families with status 'resolved'
      families = leads.filter(x => x.status === 'resolved');
    }

    // Sort by creation date (oldest first per user requirement)
    return families.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  renderFamiliesInPhase(phaseId, families) {
    const list = document.getElementById(`list-${phaseId}`);
    if (!list) return;

    if (families.length === 0) {
      list.innerHTML = '<div class="queue-empty">No families in this queue</div>';
      return;
    }

    list.innerHTML = families
      .map(family => {
        const need = [family.city, family.main_need, family.sub_need].filter(Boolean).join(' · ');
        return `
        <div class="family-item" data-lead-id="${family.id}" data-phase="${phaseId}">
          <p class="family-item-name">${family.name || 'Unnamed'}</p>
          ${need ? `<p style="font-size:11px;color:var(--muted);margin:2px 0 0">${this.escapeHtml(need)}</p>` : ''}
          <div class="family-item-meta">
            <span class="family-item-operator">${this.operatorLabel(family.assigned_operator_id)}</span>
            <span class="family-item-time">${this.formatDate(family.created_at)}</span>
          </div>
        </div>
      `;
      })
      .join('');

    // Bind click handlers
    list.querySelectorAll('.family-item').forEach(item => {
      item.addEventListener('click', () => {
        const leadId = item.dataset.leadId;
        const phase = item.dataset.phase;
        this.openFamilyPanel(leadId, phase);
      });
    });
  },

  // Single call workflow reused across all three contactable phases: a Call
  // action plus one button that opens the AqoonCallOutcomes dialog, which
  // holds the actual outcome choices (Spoke to them / No answer / Busy /
  // Call back later) and a note field. Replaces what used to be three
  // near-identical 4-button grids, one of which (Contacted/No answer) fired
  // immediately with no note and no dialog, while Call later alone opened it.
  contactActionsHtml(leadId, lead, isIncomplete) {
    const name = lead.name || (isIncomplete ? 'this person' : 'this family');
    const callButton = isIncomplete
      ? `<button class="btn primary" data-action="call-incomplete" data-lead-id="${leadId}">Call</button>`
      : `<a class="btn primary" href="tel:${lead.phone || ''}" data-call-lead="${leadId}" data-call-name="${name}">Call</a>`;
    const logAction = isIncomplete ? 'log-outcome-incomplete' : 'log-outcome';
    const note = isIncomplete
      ? 'Logging what happened never moves this on its own. Only Finish intake — filling in city, need and specifics — moves them to First contact.'
      : 'Call opens the phone and asks for the outcome when you return, or log it directly — spoke to them, no answer, busy, or call back later.';
    return `
      <div class="panel-section contact-actions">
        <h4 class="panel-section-title">Contact ${isIncomplete ? 'this person' : 'this family'}</h4>
        <div class="call-workflow-row">
          ${callButton}
          <button class="btn secondary" data-action="${logAction}" data-lead-id="${leadId}">Log call outcome</button>
        </div>
        <p class="contact-action-note">${note}</p>
      </div>
    `;
  },

  openFamilyPanel(leadId, phaseId) {
    const leads = window.AqoonApp?.leads || [];
    const partials = window.AqoonApp?.partials || [];
    const lead = leads.find(l => l.id === leadId) || partials.find(l => l.id === leadId);
    if (!lead) return;

    this.selectedFamily = { lead, phaseId };
    const panel = document.getElementById('familyPanel');
    const panelName = document.getElementById('panelFamilyName');
    const panelContent = document.getElementById('panelContent');

    panelName.textContent = lead.name || 'Unnamed';

    // Build panel content based on phase
    const needLine = [lead.city, lead.main_need, lead.sub_need].filter(Boolean).join(' · ');
    let content = `
      <details class="panel-section family-info-collapsed">
        <summary class="panel-section-title">Family Info</summary>
        ${needLine ? `<div class="panel-info">
          <div class="panel-info-label">Need</div>
          <div class="panel-info-value">${this.escapeHtml(needLine)}</div>
        </div>` : ''}
        <div class="panel-info">
          <div class="panel-info-label">Phone</div>
          <div class="panel-info-value">${lead.phone || '—'}</div>
        </div>
        <div class="panel-info">
          <div class="panel-info-label">Submitted</div>
          <div class="panel-info-value">${this.formatDate(lead.created_at)}</div>
        </div>
        <div class="panel-info">
          <div class="panel-info-label">Current operator</div>
          <div class="panel-info-value">${this.operatorLabel(lead.assigned_operator_id)}</div>
        </div>
      </details>
    `;
    const attrib = window.AqoonOperators?.attribFor(leadId);
    const lastTouchedName = attrib?.last_actor_id ? window.AqoonOperators?.nameFor(attrib.last_actor_id) : '';
    if (lastTouchedName) {
      content += `<p style="font-size:11px;color:var(--m);margin:-16px 0 16px">Last touched by ${lastTouchedName}</p>`;
    }

    // Phase-specific actions. Assign-to-me comes first (decide ownership),
    // then the contact/call workflow, so an operator claims a case before
    // acting on it rather than acting on something nobody owns yet.
    if (phaseId === 'incomplete') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign this intake to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="edit-intake" data-lead-id="${leadId}">Finish intake</button>
            <button class="btn secondary" data-action="delete-intake" data-lead-id="${leadId}">Delete</button>
          </div>
          <p style="font-size:11px;color:var(--muted);margin-top:8px">Assignment carries over automatically once the intake is finished and the family moves to the interview queue.</p>
        </div>
      `;
      if (lead.last_call_outcome) {
        content += `
          <div class="panel-section">
            <h4 class="panel-section-title">Last call</h4>
            <p style="font-size:13px;color:var(--ink);margin:0">${this.callOutcomeLabel(lead.last_call_outcome)} · ${this.formatDate(lead.last_call_at)}</p>
            ${lead.last_call_notes ? `<p style="font-size:12px;color:var(--muted);margin:4px 0 0">${this.escapeHtml(lead.last_call_notes)}</p>` : ''}
          </div>
        `;
      }
      content += this.contactActionsHtml(leadId, lead, true);
    } else if (phaseId === 'first_contact') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign interview to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">Start interview</button>
          </div>
        </div>
      `;
      if (lead.interview_status === 'completed' && lead.latest_interview) {
        const interview = lead.latest_interview;
        const recap = interview.summary || 'Interview saved — review the recorded answers.';
        const brief = interview.research_prompt || '';
        const routeLine = interview.interview_type ? interview.interview_type.split('+').join(' · ') : '';
        content += `
          <div class="panel-section interview-recap">
            <h4 class="panel-section-title">First interview recap</h4>
            ${routeLine ? `<p class="contact-action-note"><strong>Topics:</strong> ${this.escapeHtml(routeLine)}</p>` : ''}
            <p class="interview-recap-summary">${this.escapeHtml(recap)}</p>
            ${interview.next_action ? `<p class="contact-action-note"><strong>Next action:</strong> ${this.escapeHtml(interview.next_action)}</p>` : ''}
            ${brief ? `<details class="interview-recap-brief"><summary>Research brief & evidence links</summary><pre>${this.escapeHtml(brief.slice(0, 1600))}${brief.length > 1600 ? '\\n…' : ''}</pre></details>` : ''}
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">View full interview</button>
          </div>
        `;
      }
      content += this.contactActionsHtml(leadId, lead, false);
    } else if (phaseId === 'in_progress') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">${lead.interview_status === 'completed' ? 'Interview complete' : 'Interview still required'}</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">${lead.interview_status === 'completed' ? 'Review interview' : 'Start first interview'}</button>
            ${lead.interview_status === 'completed' ? '<button class="btn primary" data-action="start-interview" data-lead-id="' + leadId + '">Open follow-up workspace</button>' : '<button class="btn secondary" data-action="return-to-first-contact" data-lead-id="' + leadId + '">Return to first contact</button>'}
          </div>
          ${lead.interview_status === 'completed' ? '' : '<p class="contact-action-note">This legacy case reached the follow-up queue without a completed interview. Return it to First contact before continuing.</p>'}
        </div>
      `;
      content += this.contactActionsHtml(leadId, lead, false);
    } else if (phaseId === 'resolved') {
      // Resolving used to be a one-way door - no action here offered a way
      // back if a case was resolved by mistake or needs to reopen.
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Resolved</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="reopen-case" data-lead-id="${leadId}">Reopen (return to follow-up)</button>
          </div>
        </div>
      `;
    }

    // Call history only applies to real family_leads rows (not incomplete-
    // intake partials, which live in a different table with no call log).
    if (phaseId !== 'incomplete') {
      content += `
        <div class="panel-section">
          <h4 class="panel-section-title">Call History</h4>
          <div id="panelCallHistory"></div>
        </div>
        <div class="panel-section">
          <button class="btn secondary" type="button" data-action="remove-lead" data-lead-id="${leadId}">Remove from CRM</button>
        </div>
      `;
    }

    panelContent.innerHTML = content;

    if (phaseId === 'in_progress' && lead.interview_status === 'completed') {
      this.renderDecisionBrief(panelContent, lead);
    }
    if (phaseId === 'resolved') {
      this.renderResolvedSummary(panelContent, lead);
    }

    if (phaseId !== 'incomplete') {
      window.AqoonCallHistory?.renderInto(document.getElementById('panelCallHistory'), leadId);
    }

    // Bind action buttons
    panelContent.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const actionLeadId = e.target.dataset.leadId;
        this.handleAction(action, actionLeadId);
      });
    });

    // Show panel
    panel.classList.remove('hidden');
  },

  renderDecisionBrief(panelContent, lead) {
    const interview = lead.latest_interview || {};
    const answers = interview.answers && typeof interview.answers === 'object' ? interview.answers : {};
    const route = interview.interview_type ? interview.interview_type.split('+').join(' · ') : 'Interview complete';
    const context = ['case_subject','current_situation','immediate_goal','child_stage','household_schedule','primary_situation','work_intent','study_path','availability','start_when','travel_limit']
      .filter(k => answers[k]).map(k => this.escapeHtml(String(answers[k]))).join(' · ');
    const brief = document.createElement('section');
    brief.className = 'panel-section decision-brief';
    brief.innerHTML = `<h4 class="panel-section-title">Decision brief</h4>
      <p class="decision-brief-route"><strong>${this.escapeHtml(route)}</strong></p>
      <p class="decision-brief-summary">${this.escapeHtml(interview.summary || 'Interview saved. Research recommendation is still being prepared.')}</p>
      ${context ? `<p class="decision-brief-context"><strong>Situation:</strong> ${context}</p>` : ''}
      ${interview.next_action ? `<p class="decision-brief-next"><strong>Next action:</strong> ${this.escapeHtml(interview.next_action)}</p>` : '<p class="decision-brief-next muted">Next action not recorded yet.</p>'}
      <details class="decision-brief-evidence"><summary>Evidence and research brief</summary><div class="decision-brief-evidence-body"><p class="muted">Loading current case evidence…</p></div></details>`;
    panelContent.prepend(brief);
    const password = sessionStorage.getItem('aqoon_tracker_password') || '';
    fetch('https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin', {
      method:'POST', headers:{'Content-Type':'application/json','x-tracker-password':password},
      body:JSON.stringify({action:'list',lead_id:lead.id}), cache:'no-store'
    }).then(r=>r.json()).then(data=>{
      const box=brief.querySelector('.decision-brief-evidence-body');
      if(!box)return;
      const plan=(data.plans||[]).find(p=>!['resolved','closed_unresolved'].includes(p.plan_status)) || (data.plans||[])[0];
      const run=(data.match_runs||[])[0];
      const option=plan?.selected_option&&typeof plan.selected_option==='object'&&Object.keys(plan.selected_option).length?plan.selected_option:null;
      const links=(interview.research_prompt||'').match(/https?:\/\/[^\s)]+/g)||[];
      box.innerHTML=(plan?`<p><strong>Plan:</strong> ${this.escapeHtml(plan.title||'Case plan')} · ${this.escapeHtml(plan.plan_status||'research')}${plan.next_action?' · '+this.escapeHtml(plan.next_action):''}</p>`:'<p class="muted">No case plan has been created yet.</p>')+
        (run?.recommended_next_action?`<p><strong>Matched next action:</strong> ${this.escapeHtml(run.recommended_next_action)}</p>`:'')+
        (option?.title?`<p><strong>Verified evidence:</strong> ${this.escapeHtml(option.title)}</p>`:'<p class="muted">No verified decision has been recorded yet.</p>')+
        (links.length?'<p><strong>Sources:</strong> '+links.slice(0,3).map(u=>`<a href="${this.escapeHtml(u)}" target="_blank" rel="noreferrer">Official source</a>`).join(' · ')+'</p>':'')+
        (interview.research_prompt?`<details><summary>Raw research brief</summary><pre>${this.escapeHtml(interview.research_prompt.slice(0,1600))}${interview.research_prompt.length>1600?'\n…':''}</pre></details>`:'');
      const existing=panelContent.querySelector('.follow-up-plan');
      if(existing)existing.remove();
      const follow=document.createElement('section');
      follow.className='panel-section follow-up-plan';
      follow.innerHTML='<h4 class="panel-section-title">Follow-up case plan</h4>'+
        (plan?'<p><strong>'+this.escapeHtml(plan.title||'Case plan')+'</strong></p><p class="contact-action-note">Status: '+this.escapeHtml(plan.plan_status||'research')+(plan.next_action?' · Next: '+this.escapeHtml(plan.next_action):'')+'</p>':'<p class="muted">No plan has been started yet. Open the follow-up workspace to create one after reviewing the research.</p>')+
        '<button type="button" class="btn secondary" data-action="start-interview" data-lead-id="'+this.escapeHtml(lead.id)+'">Open follow-up workspace</button>';
      panelContent.insertBefore(follow,panelContent.querySelector('.contact-actions'));
      follow.querySelector('[data-action="start-interview"]')?.addEventListener('click',()=>{this.closeFamilyPanel();window.openInterview(lead.id)});
    }).catch(()=>{});
  },

  renderResolvedSummary(panelContent, lead) {
    const summary = document.createElement('section');
    summary.className = 'panel-section resolved-outcome';
    summary.innerHTML = '<h4 class="panel-section-title">Resolution summary</h4><p class="muted">Loading the latest case outcome…</p>';
    panelContent.querySelector('.assign-operator')?.insertAdjacentElement('afterend', summary);
    const password = sessionStorage.getItem('aqoon_tracker_password') || '';
    fetch('https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-tracker-password': password},
      body: JSON.stringify({action: 'list', lead_id: lead.id}),
      cache: 'no-store'
    }).then(r => r.json()).then(data => {
      const terminal = (data.events || []).filter(e => ['case_resolved', 'case_closed_unresolved'].includes(e.event_type)).sort((a, b) => String(b.occurred_at || b.created_at || '').localeCompare(String(a.occurred_at || a.created_at || '')))[0];
      const plan = (data.plans || []).sort((a, b) => String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || '')))[0];
      const option = plan?.selected_option && typeof plan.selected_option === 'object' && Object.keys(plan.selected_option).length ? plan.selected_option : null;
      const title = plan?.title || 'Case resolved';
      const note = terminal?.note || lead.notes || '';
      summary.innerHTML = '<h4 class="panel-section-title">Resolution summary</h4>' +
        '<p><strong>Plan:</strong> ' + this.escapeHtml(title) + (plan?.plan_status ? ' · ' + this.escapeHtml(plan.plan_status) : '') + '</p>' +
        (note ? '<p><strong>Outcome:</strong> ' + this.escapeHtml(note) + '</p>' : '<p class="muted">No outcome note was recorded.</p>') +
        (option?.title ? '<p><strong>Evidence:</strong> ' + this.escapeHtml(option.title) + '</p>' : '');
    }).catch(() => {
      summary.innerHTML = '<h4 class="panel-section-title">Resolution summary</h4><p class="muted">Outcome details are temporarily unavailable.</p>';
    });
  },

  handleAction(action, leadId) {
    const phaseId = this.selectedFamily?.phaseId;
    const lead = this.selectedFamily?.lead;

    if (action === 'assign-to-me' && phaseId === 'incomplete') {
      // Incomplete-intake records live in family_intake_contacts, not
      // family_leads, so they go through incomplete-intake.js's own
      // assign(), not the generic family_leads update() path.
      const operatorId = sessionStorage.getItem('aqoon_operator_id');
      if (!operatorId) { alert('Sign in with your operator account (not just the shared password) to assign leads to yourself.'); return; }
      if (lead) window.AqoonIncompleteIntake?.assign(lead, operatorId, () => this.closeFamilyPanel());
    } else if (action === 'assign-to-me') {
      this.assignToOperator(leadId);
    } else if (action === 'edit-intake' && phaseId === 'incomplete') {
      // Incomplete-intake records live in a different table (family_intake_contacts)
      // than real family_leads rows, so they need incomplete-intake.js's own
      // "finish this partial" flow, not the interview drawer.
      this.closeFamilyPanel();
      if (lead) window.AqoonIncompleteIntake?.open(lead);
    } else if (action === 'delete-intake' && phaseId === 'incomplete') {
      if (lead) window.AqoonIncompleteIntake?.remove(lead, () => this.closeFamilyPanel());
    } else if (action === 'log-outcome-incomplete' && phaseId === 'incomplete') {
      // Logging an outcome here only ever records the attempt against the
      // still-incomplete intake (log_call) - it never creates a family_leads
      // row or moves the queue by itself. Only "spoke to them" hands off to
      // Finish intake, since that's the one action that's actually allowed
      // to create the case and move it to First contact.
      window.AqoonCallOutcomes?.openForIntake(leadId, lead?.name || 'Client', () => {
        this.closeFamilyPanel();
        if (lead) window.AqoonIncompleteIntake?.open(lead);
      });
    } else if (action === 'log-outcome') {
      window.AqoonCallOutcomes?.openForLead(leadId, lead?.name || 'Family');
    } else if (action === 'call-incomplete' && phaseId === 'incomplete') {
      // Dialing alone must not create a contact case or move this out of the
      // Incomplete intake queue - nothing has actually happened yet (no
      // answer, no outcome). Only Log call outcome does that, atomically
      // with the outcome it records, so the queue never shows a case that's
      // "moved on" with no call history to show for it.
      window.AqoonCallOutcomes?.callLead(lead?.id, lead?.name || 'Client', lead?.phone || '');
    } else if (action === 'start-interview') {
      this.closeFamilyPanel();
      window.openInterview(leadId);
    } else if (action === 'mark-resolved') {
      // Goes through case-lifecycle.js's resolveActivePlan() - the same
      // log_event + save_plan calls the case-plan panel's own Resolve
      // button uses - instead of writing family_leads.status directly, so
      // every resolution leaves a family_case_events trace and a plan
      // record, whichever screen it was resolved from (ADR 0003 §5 defect
      // #2).
      const note=(prompt('What was the outcome? Include the agreed plan, who confirmed it, and any evidence or follow-up needed.')||'').trim();
      if (!note) return;
      if (!confirm('Mark ' + (lead?.name || 'this family') + ' resolved and save the outcome note?')) return;
      (window.AqoonCaseLifecycle?.resolveActivePlan(leadId, note) || Promise.reject(new Error('Case lifecycle module not loaded.')))
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not resolve this case.'));
    } else if (action === 'reopen-case') {
      const password = sessionStorage.getItem('aqoon_tracker_password') || '';
      fetch('https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'x-tracker-password': password},
        body: JSON.stringify({action: 'log_event', lead_id: leadId, event_type: 'follow_up_attempted', event_data: {source: 'resolved_queue', action: 'reopen'}, note: 'Case reopened from the Resolved queue; follow-up work resumed.'}),
        cache: 'no-store'
      }).then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d.detail || d.error || 'Could not record the reopen event.'))))
        .then(() => {
          if (!window.AqoonApp?.updateLead) throw new Error('CRM update is unavailable; the case was not reopened.');
          return window.AqoonApp.updateLead(leadId, {status: 'contacted', journey_stage: 'guide'});
        })
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not reopen this case.'));
    } else if (action === 'return-to-first-contact') {
      window.AqoonApp?.updateLead(leadId, {status: 'new', journey_stage: 'reach'})
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not return this case to first contact.'));
    } else if (action === 'remove-lead') {
      window.AqoonCrmManage?.confirmDelete(leadId, lead?.name || 'this family', () => this.closeFamilyPanel());
    }
  },

  assignToOperator(leadId) {
    // Uses the same generic 'update' action app.js's updateLead() already calls
    // successfully — family-leads-admin's update handler already accepts
    // assigned_operator_id directly, so no separate endpoint/action is needed.
    const operatorId = sessionStorage.getItem('aqoon_operator_id');
    if (!operatorId) {
      alert('Sign in with your operator account (not just the shared password) to assign leads to yourself.');
      return;
    }
    if (!window.AqoonApp?.updateLead) return;
    window.AqoonApp.updateLead(leadId, { assigned_operator_id: operatorId })
      .then(() => this.closeFamilyPanel())
      .catch(err => console.error('Assignment error:', err));
  },

  closeFamilyPanel() {
    const panel = document.getElementById('familyPanel');
    panel.classList.add('hidden');
    this.selectedFamily = null;
  },

  operatorLabel(operatorId) {
    if (!operatorId) return 'Unassigned';
    const name = window.AqoonOperators?.nameFor(operatorId);
    return name ? ('✓ ' + name) : '✓ Assigned';
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fi-FI', { month: 'short', day: 'numeric' });
  },

  callOutcomeLabel(outcome) {
    return { reached: 'Spoke to them', no_answer: 'No answer', busy: 'Busy', call_later: 'Call back later' }[outcome] || outcome;
  },

  escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  bindEvents() {
    // Close panel button
    const closeBtn = document.getElementById('closeFamilyPanel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeFamilyPanel());
    }

    // Close panel when clicking outside (on mobile)
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('familyPanel');
      if (panel && !panel.classList.contains('hidden')) {
        if (e.target.closest('.family-panel') === panel && e.target === panel) {
          this.closeFamilyPanel();
        }
      }
    });
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for app.js's first load() to populate window.AqoonApp.leads/.partials
  setTimeout(() => CrmQueues.init(), 500);
});

// Export for use by other modules
window.CrmQueues = CrmQueues;
