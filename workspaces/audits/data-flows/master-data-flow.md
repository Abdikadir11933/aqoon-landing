# Master Data Flow Map

## Complete System Data Lifecycle

```
PUBLIC INTAKE FORM (/caawi)
         ↓
    [Phone / Web]
         ↓
    family_leads (status='partial')
         ↓
    ├→ family_funnel_events (analytics)
    │
    └→ TRACKER CRM
         ↓
    Phase 1: Unfinished Intake
         ↓
    OPERATOR REVIEW & FIRST INTERVIEW
         ↓
    family_interviews (status='completed')
    family_interview_revisions (backup)
    family_leads (status='contacted')
    family_case_events (event_type='interview_completed')
         ↓
    └→ Timeline shows: "First Interview" event
    └→ Context panel updates
    └→ Family moves to Phase 2: First Interview
         ↓
    ├→ family_case_plans (plan_status='research')
    │       ↓
    │  Operator researches options
    │       ↓
    │  family_case_plans (plan_status='options_ready')
    │  family_case_events (event_type='options_presented')
    │       ↓
    │  └→ Timeline shows: "Case Plan Created/Updated"
    │  └→ Family moves to Phase 3: Follow-ups or 4: Active Cases
    │
    ├→ family_case_interactions (record calls/emails)
    │       ↓
    │  family_case_events (event_type='follow_up_attempted')
    │       ↓
    │  └→ Timeline shows: "Follow-up Attempted"
    │
    ├→ family_call_log (outcome recorded)
    │       ↓
    │  family_leads (last_call_outcome, last_call_at)
    │  family_case_events (event_type='follow_up_attempted')
    │       ↓
    │  └→ Call History panel fetches via get_call_history
    │  └→ Timeline shows: "Call Completed" / "Call No Answer"
    │  └→ Outcome badge colored (green/red/purple)
    │
    └→ DECISION / OUTCOME
            ↓
    family_case_plans (plan_status='action_in_progress')
            ↓
    family_case_events (event_type='official_action_started')
            ↓
    └→ Phase 5: Awaiting Outcome
            ↓
    [Waiting for authority response]
            ↓
    family_case_events (event_type='official_response_received')
            ↓
    family_case_plans (plan_status='persistence_check')
            ↓
    Phase 6: Follow-up / Verification
            ↓
    [Success path:]
    family_case_plans (plan_status='resolved')
    family_case_events (event_type='case_resolved')
            ↓
    └→ Phase 7: Resolved
    └→ Dashboard shows as completed
    └→ Timeline shows: "Resolution Submitted"
    
    [Or unsuccessful path:]
    family_case_plans (plan_status='closed_unresolved')
    family_case_events (event_type='case_closed_unresolved')
            ↓
    └→ Still Phase 7: Resolved (closed)
    └→ Timeline shows: "Case Closed Unresolved"

            ↓
    FUTURE OPPORTUNITIES
    
    family_future_opportunities (detected during interview)
            ↓
    [Wait for contact window + consent]
            ↓
    └→ Operator contacts with opportunity
    └→ Loops back to First Interview (new case plan)
```

## Detailed Flow by Component

### Flow 1: Intake → CRM Appearance

**When:** Family submits phone/web form  
**Duration:** <5 seconds

```
family_leads.INSERT
├─ id: uuid
├─ phone: masked
├─ status: 'partial'  ← Unfinished Intake phase
├─ needs: ['daycare', 'language']
├─ city: 'Helsinki'
└─ created_at: now()
        ↓
TRACKER Displays:
    Phase: "Unfinished Intake" (1/6)
    Pulse: 1 incomplete intake
    Card shows: Phone, City, Needs (truncated)
```

**Test:** Family enters form → Appears in CRM within 5s  
**Verify:** Status is 'partial', Phase shows correctly

---

### Flow 2: First Interview → Phase Transition

**When:** Operator saves completed interview  
**Duration:** <2 seconds

```
family_interviews.INSERT
├─ id: uuid
├─ lead_id: [family_lead_id]
├─ status: 'completed'
├─ operator_id: [current operator]
├─ answers: {...questions answered...}
└─ created_at: now()
        ↓
family_interview_revisions.INSERT (backup)
        ↓
family_leads.UPDATE
├─ status: 'contacted'  ← Phase 2: First Interview
└─ updated_at: now()
        ↓
family_case_events.INSERT
├─ event_type: 'interview_completed'
├─ created_by: [operator_id]
└─ note: [interview summary if any]
        ↓
TRACKER Updates:
    └─ Timeline: Shows "First Interview" event
    └─ Phase count: Phase 2 +1
    └─ Family moves to Phase 2
```

**Test:** Complete interview → Family moves to Phase 2  
**Verify:** Timeline shows interview event, status updated, phase changed

---

### Flow 3: Case Plan → Awaiting Outcome Phase

**When:** Operator creates/updates case plan  
**Duration:** <1 second

```
family_case_plans.INSERT/UPDATE
├─ id: uuid
├─ family_lead_id: [family_lead_id]
├─ plan_status: 'research'  ← Initial
│   ↓ (or 'options_ready', 'action_in_progress', 'awaiting_outcome')
├─ title: "Apply for daycare via municipality"
└─ created_at: now()
        ↓
crm-lifecycle-data.js ENRICHES lead:
    lead._case_plan_status = plan.plan_status
    lead._case_plan_id = plan.id
        ↓
CRM FILTERS by phase:
    Phase 5: "Awaiting Outcome"
        ↓ (shows only leads where _case_plan_status === 'awaiting_outcome')
        
TRACKER Updates:
    └─ If plan_status='awaiting_outcome':
       └─ Family moves to Phase 5
    └─ Dashboard: "Awaiting Outcome" count updates
    └─ Timeline: Shows "Case Plan Created/Updated"
```

**Test:** Create case plan with 'awaiting_outcome' → Family in Phase 5  
**Verify:** _case_plan_status enriched correctly, phase filter works

---

### Flow 4: Call Logged → History & Timeline

**When:** Operator records call outcome  
**Duration:** <1 second

```
family_call_log.INSERT
├─ family_lead_id: [family_lead_id]
├─ operator_id: [current operator]
├─ outcome: 'reached'  ← or 'no_answer', 'call_later'
├─ notes: "Discussed options, will call back Tuesday"
└─ created_at: now()
        ↓
family_leads.UPDATE
├─ last_call_outcome: 'reached'
├─ last_call_at: now()
└─ updated_at: now()
        ↓
family_case_events.INSERT (optional)
├─ event_type: 'follow_up_attempted'
└─ created_by: [operator_id]
        ↓
FRONTEND (when context panel open):
        ↓
crm-call-history.js calls get_call_history(lead_id)
        ↓
Edge Function family-case-lifecycle-admin:
├─ SELECT * FROM family_call_log
├─ WHERE family_lead_id = lead_id
├─ ORDER BY created_at DESC
├─ LIMIT 10
└─ JOIN operators table for display_name
        ↓
Response: [{id, created_at, outcome, operator_name, notes}, ...]
        ↓
Context Panel Displays:
    Call History Section:
    ├─ Date: "Aug 29"
    ├─ Outcome badge: "Connected" (green)
    ├─ Operator: "Abducadir"
    ├─ Time: "10:30 AM"
    ├─ Duration: "5m 30s"
    └─ Notes: "Discussed options..."
        ↓
Timeline also shows:
    ├─ Event: "Call Completed"
    ├─ Date/Time: "Aug 29, 10:30 AM"
    └─ Color: Green (call_completed event type)
```

**Test:** Log call → Appears in history & timeline  
**Verify:** Outcome color correct, operator shows, notes display

---

### Flow 5: Operator Scope Filtering

**When:** Operator selects scope in phase nav  
**Duration:** Instant (filter only)

```
crm-phase-navigation.js detects scope change:
    Scope: "All" / "Assigned to me" / "Unassigned"
        ↓
APPLIES FILTER to current phase:
    
    All:
    └─ Shows all families in phase (no filter)
    
    Assigned to me:
    └─ Filter: family_leads.assigned_operator_id === meId
    └─ Count: Shows only assigned count
    └─ Dashboard headline: "My work today"
    
    Unassigned:
    └─ Filter: family_leads.assigned_operator_id IS NULL
    └─ Count: Shows unassigned count
    └─ Dashboard headline: "Unassigned families today"
        ↓
TRACKER Updates:
    ├─ Phase counts update
    ├─ Family list filters
    ├─ Dashboard metrics update
    ├─ Analytics journeys filter
    └─ All scoped views respect selection
```

**Test:** Change scope → Metrics & lists update  
**Verify:** Counts change, families filtered correctly, persists across tabs

---

### Flow 6: Timeline Aggregation

**When:** Context panel opens  
**Duration:** <500ms (fetches all 3 tables)

```
crm-lifecycle-timeline.js calls get_timeline(lead_id)
        ↓
Edge Function fetches:
    
    1. FROM family_case_events
       └─ WHERE family_lead_id = lead_id
       └─ ORDER BY created_at DESC
       
    2. FROM family_interviews
       └─ WHERE lead_id = lead_id
       └─ ORDER BY created_at DESC
       
    3. FROM family_call_log
       └─ WHERE family_lead_id = lead_id
       └─ ORDER BY created_at DESC
        ↓
AGGREGATES into single sorted array:
    [
      {created_at, event_type: 'interview_completed', description, ...},
      {created_at, event_type: 'call_completed', description, ...},
      {created_at, event_type: 'case_plan_created', description, ...},
      ...
    ]
        ↓
FRONTEND RENDERS (sorted by date, newest first):
    
    Timeline Section in Context Panel:
    ├─ Event marker (colored dot)
    ├─ Event type: "First Interview" / "Call Completed" / etc.
    ├─ Date/Time: "Aug 29, 10:30 AM"
    ├─ Operator: "Abducadir"
    ├─ Description: From event notes
    └─ Vertical line connecting events
        ↓
    Shows up to 20 events
    Scrolls if more exist
```

**Test:** Open context panel → Timeline shows all events  
**Verify:** Events in correct order, types correct, dates accurate

---

### Flow 7: Dashboard Metrics Update

**When:** Phase count changes OR scope selected  
**Duration:** <500ms

```
operator-dashboard.js patches renderCRM:
        ↓
Calculates pulse metrics based on current leads:
    
    Incomplete (Phase 1):
    └─ Count leads where status='partial'
    
    First Contact (Phase 2):
    └─ Count leads where status='contacted' AND no interview completed
    
    Follow-ups Due (Phase 3):
    └─ Count leads where next_follow_up_at <= now()
    
    Active Cases (Phase 4):
    └─ Count leads where has case plan AND status !== 'resolved'
        ↓
APPLIES SCOPE FILTER:
    
    All:
    └─ No filter
    
    Assigned:
    └─ Filter: assigned_operator_id === meId
    
    Unassigned:
    └─ Filter: assigned_operator_id IS NULL
        ↓
UPDATES DASHBOARD:
    ├─ 4 pulse metrics (numbers update)
    ├─ Dashboard headline (All/My/Unassigned)
    ├─ Status ring (total families today)
    └─ SLA clock (oldest first contact)
```

**Test:** Status changes → Pulse metrics update  
**Verify:** Counts accurate, scope filters apply, headline updates

---

## Performance Notes

### API Call Latencies (Target <500ms)

| Action | Data Fetched | Source | Cache TTL |
|--------|--------------|--------|-----------|
| batch_list | 1000 leads + plans | family_case_plans | 60s |
| get_call_history | 10 calls per lead | family_call_log | 60s |
| get_timeline | 50 events per lead | 3 tables (aggregate) | 30s |
| get_consent | 2 fields per lead | family_leads | 3600s |
| get_revisions | 50 revisions per lead | family_interview_revisions | 300s |

### Module Load Times (Target <100ms each)

- crm-phase-navigation.js: ~5ms
- crm-lifecycle-data.js: ~10ms
- crm-context-panel.js: ~8ms
- crm-call-history.js: ~7ms
- crm-lifecycle-timeline.js: ~9ms
- operator-dashboard.js: ~6ms
- operator-analytics.js: ~6ms

**Total New Modules:** ~51ms (acceptable for MVP)

---

## Data Integrity Checks

### What Gets Validated

✓ Phone numbers (masked in UI)  
✓ Email addresses (hidden in UI)  
✓ Date/time fields (ISO 8601)  
✓ Plan status enums (only valid values)  
✓ Event type enums (only valid types)  
✓ Operator IDs exist (JOIN with operators table)  
✓ Lead exists (WHERE clause checks)

### What Needs Better Validation

⚠ Interview answers JSON (currently unvalidated)  
⚠ Case plan metadata JSON (currently unvalidated)  
⚠ Event data JSON (currently unvalidated)  
⚠ Consent expiry (dates not validated for future)  

---

## Error Paths

### Network Failure
```
fetch fails
    ↓
JSON parse fails (catch block)
    ↓
Show error: "Failed to load [section]. Please try again."
    ↓
Data not updated (stale cache continues)
```

### Missing Data
```
API returns {}
    ↓
Conditional render (data || [])
    ↓
Show: "No calls recorded" / "No activity"
    ↓
Graceful degradation (no crash)
```

### Slow Network
```
fetch takes >5s
    ↓
Content area blank (no timeout)
    ↓
Eventually loads or shows error
    ⚠ Could add timeout (not implemented yet)
```

---

## Data Retention

### Live/Editable
- family_leads (status, assigned_operator_id, dates)
- family_case_plans (plan_status, dates)
- family_case_interactions (can be edited)

### Immutable/Audited
- family_interviews (no edit after save)
- family_interview_revisions (captures all changes)
- family_case_events (no edit)
- family_call_log (permanent record)

---

**Document Created:** 2026-08-29  
**Last Updated:** 2026-08-29  
**Ready for Testing:** YES
