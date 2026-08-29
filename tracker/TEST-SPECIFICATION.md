# Phase F: Test Specification

Complete testing specification for the comprehensive system overhaul (Phases A-E).

## Test Categories

### 1. Module Syntax Validation (Already Automated in CI)

**CI Check:** `.github/workflows/site-qa.yml`

Validates all new modules parse without syntax errors:
- crm-phase-navigation.js ✓
- crm-lifecycle-data.js ✓
- crm-context-panel.js ✓
- crm-call-history.js ✓
- crm-lifecycle-timeline.js ✓
- operator-dashboard.js ✓
- operator-analytics.js ✓

**Status:** Passing

---

### 2. Module Load Order Tests

**File:** `tests/tracker-module-load-order.test.js`

Tests that modules load in correct dependency order:
- operator-identity.js (sets meId)
- crm-phase-navigation.js (defines PHASES)
- crm-context-panel.js (creates panel DOM)
- crm-call-history.js (patches context panel)
- crm-lifecycle-timeline.js (patches context panel)
- operator-dashboard.js (patches renderCRM)
- operator-analytics.js (patches renderCRM)
- operator-crm-filters.js (uses operator-identity)
- app.js (main app - last)

**Test Cases:**
1. All window.* exports are defined in correct order
2. Patching functions are applied before app.js loads
3. No circular dependencies between modules
4. Session storage values are preserved across modules

---

### 3. Phase Navigation Tests

**File:** `tests/crm-phase-navigation.test.js`

**Test Cases:**

#### 3.1 Phase Definitions
- [ ] PHASES object has 6 keys: incomplete, first, followup, active, awaiting, resolved
- [ ] Each phase has `label` and `filter` function
- [ ] Filter functions return boolean values
- [ ] Phase counts match filtered lead counts

#### 3.2 Operator Scope Filtering
- [ ] "All Families" scope shows all leads
- [ ] "Assigned to me" scope shows only assigned_operator_id === meId()
- [ ] "Unassigned" scope shows only !assigned_operator_id leads
- [ ] Scope changes re-render phase tabs correctly
- [ ] Phase counts update when scope changes

#### 3.3 UI Rendering
- [ ] Phase nav container renders with correct class
- [ ] Operator scope buttons render (3 buttons)
- [ ] Phase tabs render (6 buttons)
- [ ] Active phase button has "on" class
- [ ] Count badges display correct numbers

---

### 4. Lifecycle Data Enrichment Tests

**File:** `tests/crm-lifecycle-data.test.js`

**Test Cases:**

#### 4.1 Data Loading
- [ ] loadLifecycleData fetches from family-case-lifecycle-admin
- [ ] Batch request includes all lead IDs
- [ ] Response parsing handles missing plans array
- [ ] Cache expires after 60 seconds
- [ ] Subsequent calls use cache without API request

#### 4.2 Data Enrichment
- [ ] enrichLeads attaches _case_plan_status to leads
- [ ] enrichLeads attaches _case_plan_id to leads
- [ ] enrichLeads attaches _case_events array to leads
- [ ] Missing lifecycle data defaults to null/_case_events=[]
- [ ] enrichLeads preserves original lead properties

#### 4.3 API Error Handling
- [ ] Network errors log warning, don't throw
- [ ] JSON parse errors handled gracefully
- [ ] Invalid response status skips cache update
- [ ] Repeated failures don't spam console

---

### 5. Context Panel Tests

**File:** `tests/crm-context-panel.test.js`

**Test Cases:**

#### 5.1 Panel DOM
- [ ] Panel element renders with id="crmContextPanel"
- [ ] Overlay element renders with id="crmContextOverlay"
- [ ] Panel starts hidden (translateX(100%))
- [ ] Close button exists and is clickable

#### 5.2 Panel Opening
- [ ] openContextPanel(leadId) adds "open" class
- [ ] Overlay becomes clickable/visible
- [ ] Panel slides in with correct animation
- [ ] Content renders family data correctly

#### 5.3 Panel Closing
- [ ] closeContextPanel() removes "open" class
- [ ] Panel slides out
- [ ] Overlay becomes non-clickable
- [ ] Clicking overlay closes panel
- [ ] Close button closes panel

#### 5.4 Content Rendering
- [ ] Family name displays correctly
- [ ] Status badge shows correct label
- [ ] Primary need displays
- [ ] Location and contact info display
- [ ] Case status badge shows when applicable
- [ ] Recent activity section renders

---

### 6. Call History Tests

**File:** `tests/crm-call-history.test.js`

**Test Cases:**

#### 6.1 Call Loading
- [ ] loadCallHistory fetches from family-case-lifecycle-admin
- [ ] Request includes correct lead_id
- [ ] Response parsing handles missing calls
- [ ] Cache expires after 60 seconds

#### 6.2 Call Display
- [ ] Calls display in reverse chronological order (newest first)
- [ ] Shows up to 10 most recent calls
- [ ] Each call displays: date, time, duration, outcome, operator
- [ ] Call notes display when present
- [ ] "No calls recorded" message when empty

#### 6.3 Outcome Badges
- [ ] "reached" → "Connected" with green badge
- [ ] "no_answer" → "No Answer" with red badge
- [ ] "call_later" → "Scheduled" with purple badge
- [ ] "attempted" → "Attempted" with blue badge
- [ ] Unknown outcomes show gray badge

#### 6.4 Integration with Context Panel
- [ ] Call history section appends to context panel
- [ ] Loads when context panel opens
- [ ] Updates when context panel switches leads

---

### 7. Lifecycle Timeline Tests

**File:** `tests/crm-lifecycle-timeline.test.js`

**Test Cases:**

#### 7.1 Timeline Rendering
- [ ] Timeline displays up to 20 events
- [ ] Events sorted newest first
- [ ] Connector lines render between events
- [ ] Colored markers show event type

#### 7.2 Event Types
- [ ] first_interview → teal marker
- [ ] follow_up_interview → teal marker
- [ ] call_completed → green marker
- [ ] call_no_answer → red marker
- [ ] case_plan_created → purple marker
- [ ] case_plan_updated → purple marker
- [ ] case_status_changed → orange marker
- [ ] intake_completed → green marker
- [ ] resolution_submitted → green marker
- [ ] note_added → gray marker

#### 7.3 Timeline Content
- [ ] Event label displays correctly
- [ ] Event date/time formats properly
- [ ] Event description displays when present
- [ ] Empty state shows "No activity recorded"

---

### 8. Operator Dashboard Tests

**File:** `tests/operator-dashboard.test.js`

**Test Cases:**

#### 8.1 Pulse Metrics
- [ ] pulseIncomplete shows partial leads count
- [ ] pulseFirst shows new leads count (excluding overdue)
- [ ] pulseFollowup shows leads with overdue follow-ups
- [ ] pulseActive shows leads in progress (excluding due)
- [ ] Metrics update when phase/scope changes

#### 8.2 Operator Scope Filtering
- [ ] "All Families" scope shows all counts
- [ ] "Assigned to me" scope filters by assigned_operator_id
- [ ] "Unassigned" scope shows unassigned leads
- [ ] Counts re-calculate on scope change

#### 8.3 Dashboard Headlines
- [ ] "All families today" when scope=all
- [ ] "My work today" when scope=mine
- [ ] "Unassigned families today" when scope=unassigned
- [ ] Uses operator name from session storage if available

---

### 9. Operator Analytics Tests

**File:** `tests/operator-analytics.test.js`

**Test Cases:**

#### 9.1 Analytics Filtering
- [ ] All journeys visible when scope=all
- [ ] Only assigned journeys visible when scope=mine
- [ ] Only unassigned journeys visible when scope=unassigned
- [ ] Analytics header updates with scope label

#### 9.2 Tab Visibility
- [ ] Analytics filters update when tab switches to visible
- [ ] No updates when switching to hidden tab
- [ ] MutationObserver watches for tab visibility changes

---

### 10. Browser Compatibility Tests

**File:** `tests/browser-compatibility.test.js`

**Browsers to Test:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

**Test Cases:**
1. CSS Grid works (crm-phases, crm-operator-scope)
2. CSS custom properties (--t, --n, --l, --p, --r)
3. Fixed positioning on mobile (context panel full-width)
4. MutationObserver support
5. Promise support
6. fetch API support
7. sessionStorage support

---

### 11. Mobile Responsiveness Tests

**File:** `tests/mobile-responsiveness.test.js`

**Viewports to Test:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 414px (iPhone 12 Pro Max)
- 768px (iPad)
- 1024px (iPad Pro)

**Test Cases:**
1. **Phase Navigation**
   - [ ] Operator scope buttons stack vertically on mobile
   - [ ] Phase tabs 2-column on mobile

2. **Context Panel**
   - [ ] Full width on mobile
   - [ ] Readable text (min 16px)
   - [ ] Touchable tap targets (min 44x44px)

3. **Call History**
   - [ ] Outcome badge doesn't wrap
   - [ ] Date/time fit on one line

4. **Timeline**
   - [ ] Markers resize on mobile
   - [ ] Connectors remain visible
   - [ ] Text doesn't overflow

---

### 12. Accessibility Tests

**File:** `tests/accessibility.test.js`

**Tests:**
1. All interactive elements have proper ARIA labels
2. Color contrast ratios meet WCAG AA
3. Keyboard navigation works (Tab/Shift+Tab)
4. Focus indicators visible
5. Screen reader announces:
   - Phase tab counts
   - Context panel content
   - Timeline events
   - Call history items
6. Prefers-reduced-motion respected

---

### 13. Performance Tests

**File:** `tests/performance.test.js`

**Metrics:**
1. crm-phase-navigation.js loads < 50ms
2. crm-context-panel.js loads < 50ms
3. crm-call-history.js loads < 30ms
4. crm-lifecycle-timeline.js loads < 30ms
5. operator-dashboard.js loads < 30ms
6. operator-analytics.js loads < 30ms
7. Dashboard renders < 200ms
8. Context panel opens < 300ms
9. Call history fetches/renders < 500ms
10. Timeline renders < 300ms
11. No memory leaks after 100 panel open/close cycles
12. API cache prevents duplicate requests

---

### 14. Edge Case Tests

**File:** `tests/edge-cases.test.js`

**Test Cases:**
1. Zero leads in system
2. Very large lead count (1000+)
3. Leads with missing assigned_operator_id
4. Leads with future follow-up dates
5. Leads with no lifecycle data
6. Leads with no call history
7. Leads with no interview history
8. Empty first names/last names
9. Very long call notes
10. Malformed API responses
11. Rapid scope changes
12. Panel open/close spam

---

## Test Execution Order

1. **CI Syntax Checks** (automated on every commit)
2. **Unit Tests** (module load order, data enrichment)
3. **Component Tests** (phase navigation, context panel, etc.)
4. **Integration Tests** (all modules together in browser)
5. **E2E Tests** (full user workflows)
6. **Performance Tests** (load times, memory usage)
7. **Accessibility Tests** (a11y validation)
8. **Mobile Tests** (various viewports)

---

## Success Criteria

All phases are complete when:

- ✓ CI syntax checks pass
- ✓ Module load order correct (no circular deps)
- ✓ Phase navigation renders correctly
- ✓ Operator scope filtering works
- ✓ Context panel opens/closes smoothly
- ✓ Call history loads and displays
- ✓ Timeline shows all event types
- ✓ Dashboard metrics update correctly
- ✓ Analytics filters update correctly
- ✓ Mobile responsive on all viewports
- ✓ Keyboard navigation works
- ✓ Screen readers announce content
- ✓ Performance metrics met
- ✓ No console errors or warnings
- ✓ No memory leaks
