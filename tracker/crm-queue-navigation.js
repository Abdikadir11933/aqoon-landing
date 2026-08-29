/* Family CRM Queue-Based Navigation */

const CrmQueues = {
  phases: [
    { id: 'incomplete', label: 'Incomplete intake', color: 'navy' },
    { id: 'first_contact', label: 'Ready for interview', color: 'teal' },
    { id: 'in_progress', label: 'Awaiting outcome', color: 'cream' },
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
      .map(family => `
        <div class="family-item" data-lead-id="${family.id}" data-phase="${phaseId}">
          <p class="family-item-name">${family.name || 'Unnamed'}</p>
          <div class="family-item-meta">
            <span class="family-item-operator">${this.operatorLabel(family.assigned_operator_id)}</span>
            <span class="family-item-time">${this.formatDate(family.created_at)}</span>
          </div>
        </div>
      `)
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
    let content = `
      <div class="panel-section">
        <h4 class="panel-section-title">Family Info</h4>
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
      </div>
    `;
    const attrib = window.AqoonOperators?.attribFor(leadId);
    const lastTouchedName = attrib?.last_actor_id ? window.AqoonOperators?.nameFor(attrib.last_actor_id) : '';
    if (lastTouchedName) {
      content += `<p style="font-size:11px;color:var(--m);margin:-16px 0 16px">Last touched by ${lastTouchedName}</p>`;
    }

    // Phase-specific actions
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
    } else if (phaseId === 'first_contact') {
      content += `
        <div class="panel-section contact-actions">
          <h4 class="panel-section-title">Contact this family</h4>
          <div class="assign-buttons">
            <a class="btn primary" href="tel:${lead.phone || ''}" data-call-lead="${leadId}" data-call-name="${lead.name || 'Family'}">Call</a>
            <button class="btn secondary" data-action="record-reached" data-lead-id="${leadId}">Contacted</button>
          </div>
          <div class="assign-buttons contact-follow-up-actions">
            <button class="btn secondary" data-action="record-no-answer" data-lead-id="${leadId}">No answer</button>
            <button class="btn secondary" data-action="record-call-later" data-lead-id="${leadId}">Call later</button>
          </div>
          <p class="contact-action-note">Call opens the phone and then asks for the outcome. “No answer” sets a 24-hour follow-up; “Call later” asks for the exact time.</p>
        </div>
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign interview to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">Start interview</button>
          </div>
        </div>
      `;
    } else if (phaseId === 'in_progress') {
      content += `
        <div class="panel-section contact-actions">
          <h4 class="panel-section-title">Contact this family</h4>
          <div class="assign-buttons">
            <a class="btn primary" href="tel:${lead.phone || ''}" data-call-lead="${leadId}" data-call-name="${lead.name || 'Family'}">Call</a>
            <button class="btn secondary" data-action="record-reached" data-lead-id="${leadId}">Contacted</button>
          </div>
          <div class="assign-buttons contact-follow-up-actions">
            <button class="btn secondary" data-action="record-no-answer" data-lead-id="${leadId}">No answer</button>
            <button class="btn secondary" data-action="record-call-later" data-lead-id="${leadId}">Call later</button>
          </div>
        </div>
        <div class="panel-section assign-operator">
          <label class="assign-label">Case still open</label>
          <div class="assign-buttons">
            <button class="btn secondary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="start-interview" data-lead-id="${leadId}">Review interview</button>
            <button class="btn primary" data-action="mark-resolved" data-lead-id="${leadId}">Mark resolved</button>
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
    } else if (action === 'start-interview' || action === 'edit-intake') {
      this.closeFamilyPanel();
      window.openInterview(leadId);
    } else if (action === 'mark-resolved') {
      window.AqoonApp?.updateLead(leadId, {status: 'resolved'}).then(() => this.closeFamilyPanel());
    } else if (action === 'record-reached' || action === 'record-no-answer') {
      const outcome = action === 'record-reached' ? 'reached' : 'no_answer';
      window.AqoonCallOutcomes?.recordForLead(leadId, outcome)
        .then(() => this.closeFamilyPanel())
        .catch(err => alert(err.message || 'Could not record the call outcome.'));
    } else if (action === 'record-call-later') {
      window.AqoonCallOutcomes?.openForLead(leadId, lead?.name || 'Family', 'call_later');
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
