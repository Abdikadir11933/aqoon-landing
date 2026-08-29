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
    // Get families from window.leads (populated by app.js)
    const leads = window.leads || [];

    // Map internal stages to our phases
    const phaseMap = {
      'incomplete': (lead) => !lead.latest_interview_id && lead.intake_started,
      'first_contact': (lead) => lead.latest_interview_id && lead.current_phase === 'phase_2',
      'in_progress': (lead) => lead.current_phase === 'phase_3' || lead.current_phase === 'phase_4',
      'resolved': (lead) => lead.current_phase === 'phase_5' || lead.current_phase === 'phase_6'
    };

    const filter = phaseMap[phaseId];
    if (!filter) return [];

    return leads
      .filter(filter)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
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
            <span class="family-item-operator">${family.assigned_operator_id ? '✓ Assigned' : 'Unassigned'}</span>
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
    const lead = (window.leads || []).find(l => l.id === leadId);
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
          <div class="panel-info-value">${lead.assigned_operator_id ? '✓ Assigned' : 'Unassigned'}</div>
        </div>
      </div>
    `;

    // Phase-specific actions
    if (phaseId === 'incomplete') {
      content += `
        <div class="panel-section assign-operator">
          <label class="assign-label">Assign this intake to yourself?</label>
          <div class="assign-buttons">
            <button class="btn primary" data-action="assign-to-me" data-lead-id="${leadId}">Assign to me</button>
            <button class="btn secondary" data-action="edit-intake" data-lead-id="${leadId}">Edit intake</button>
          </div>
        </div>
      `;
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
    }

    panelContent.innerHTML = content;

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
    const lead = (window.leads || []).find(l => l.id === leadId);
    if (!lead) return;

    if (action === 'assign-to-me') {
      this.assignToOperator(leadId);
    } else if (action === 'edit-intake') {
      window.openInterview(lead);
    } else if (action === 'start-interview') {
      window.openInterview(lead);
    }
  },

  assignToOperator(leadId) {
    // Call Edge Function to assign lead to current operator
    const operatorId = window.AqoonOperator?.id;
    if (!operatorId) {
      alert('You must be signed in to assign leads');
      return;
    }

    fetch('/.netlify/functions/family-leads-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign_operator',
        lead_id: leadId,
        operator_id: operatorId
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          alert('Error: ' + data.error);
          return;
        }
        // Update local state and re-render
        const lead = (window.leads || []).find(l => l.id === leadId);
        if (lead) lead.assigned_operator_id = operatorId;
        this.renderQueues();
        this.closeFamilyPanel();
      })
      .catch(err => console.error('Assignment error:', err));
  },

  closeFamilyPanel() {
    const panel = document.getElementById('familyPanel');
    panel.classList.add('hidden');
    this.selectedFamily = null;
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
  // Wait for app.js to initialize window.leads
  setTimeout(() => CrmQueues.init(), 500);
});

// Export for use by other modules
window.CrmQueues = CrmQueues;
