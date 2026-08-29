# AQOON System Testing Playbook

**Purpose:** Step-by-step guide to testing complete user journeys through the Family CRM system  
**Created:** 2026-08-29  
**Status:** Ready for Manual Testing  
**Framework:** Comprehensive + Systematic + Non-repetitive

---

## Overview

This playbook guides you through testing 7 complete data flows with 4 test profiles. Each test:
- Starts with intake/CRM appearance
- Follows data through the system
- Verifies correct data surfaces in UI
- Takes screenshots at key moments
- Documents results in `workspaces/audits/e2e-testing/`

**Key rule:** Tests are documented. Don't repeat what's already been tested. Check `audit-index.md` first.

---

## Test Profiles

Choose a profile based on the data flow you want to test. Each profile represents a different stage in the family journey.

### Profile A: New Family (Unfinished Intake)
**Use for testing:** Intake→CRM flow, Phase 1 appearance, basic CRM display  
**Test data:**
- Name: Ahmed Family
- Phone: +358 50 123 4567
- Needs: School information, language help
- City: Helsinki
- Status in CRM: "Unfinished Intake" (Phase 1)

**What to verify:**
- [ ] Family appears in CRM within 5 seconds of form submit
- [ ] Status shows "Unfinished Intake" (Phase 1)
- [ ] Phone is masked in UI
- [ ] Needs are displayed correctly
- [ ] Can click family to open context panel
- [ ] Family details display in context panel

---

### Profile B: Contacted (First Interview Ready)
**Use for testing:** Interview→Phase transition, Timeline events, Phase 2 display  
**Test data:**
- Name: Maria Silva
- Phone: +358 40 234 5678
- Needs: Daycare options
- City: Vantaa
- Status in CRM: "Contacted" (Phase 2)

**What to verify:**
- [ ] Family shows in Phase 2: "First Interview"
- [ ] Timeline shows "First Interview" event
- [ ] Can see interview questions relevant to "daycare"
- [ ] After saving interview, status updates correctly
- [ ] Timeline shows the saved interview event
- [ ] Family moves to Phase 3 or 4 (depending on follow-up needs)

---

### Profile C: Active Case (Plan Created)
**Use for testing:** Case plan→phase transition, plan status enrichment, "Awaiting Outcome" phase  
**Test data:**
- Name: Laura Kowalski
- Phone: +358 44 345 6789
- Needs: Employment support, relocation
- City: Espoo
- Case plan: Options ready (plan_status='options_ready')
- Status in CRM: "Active Cases" (Phase 4)

**What to verify:**
- [ ] Family shows in Phase 4: "Active Cases"
- [ ] Context panel shows case plan details
- [ ] Case plan title displays correctly
- [ ] Plan status shows as "Options ready"
- [ ] Timeline shows "Case Plan Created" or "Case Plan Updated" event
- [ ] crm-lifecycle-data enrichment is working (_case_plan_status field)

---

### Profile D: Awaiting Decision (Outcome Pending)
**Use for testing:** Outcome phase, case state tracking, resolution path  
**Test data:**
- Name: Fatima Hassan
- Phone: +358 45 456 7890
- Needs: Housing assistance
- City: Helsinki
- Case plan status: Awaiting outcome
- Status in CRM: "Awaiting Outcome" (Phase 5)

**What to verify:**
- [ ] Family shows in Phase 5: "Awaiting Outcome"
- [ ] Case plan shows plan_status='awaiting_outcome'
- [ ] Can log call outcomes while waiting
- [ ] Timeline shows follow-up attempts and call history
- [ ] Call history section displays calls made during this phase
- [ ] Outcome badge shows correct color (green/red/purple)

---

## Data Flow Tests

### Data Flow 1: Intake → CRM Appearance

**What this tests:** Family submits public intake form, data immediately appears in CRM tracker

**Test Duration:** 5-10 minutes  
**Test Profile:** Use Profile A (New Family)

#### Steps:

1. **Open public intake form**
   - Navigate to the intake form (check CONTEXT.md for URL)
   - Screenshot: form is visible

2. **Fill out intake form with Profile A data**
   - Name: Ahmed Family
   - Phone: +358 50 123 4567
   - Needs: Check boxes for "School information" and "language help"
   - City: Helsinki (dropdown)
   - Screenshot: form filled out

3. **Submit intake form**
   - Click Submit button
   - Screenshot: success message shown
   - Note: timestamp of form submission

4. **Switch to CRM tab**
   - Wait 5 seconds
   - Open tracker at `/tracker/`
   - Unlock with test credentials
   - Screenshot: tracker loaded

5. **Verify family appears in CRM**
   - Look for "Ahmed Family" or phone number in family list
   - Check status shows "Unfinished Intake"
   - Check Phase 1 counter incremented
   - Screenshot: family card visible in CRM

6. **Click family card to open context panel**
   - Click on Ahmed Family card
   - Wait for context panel to slide in
   - Screenshot: context panel open showing family details

7. **Verify context panel contents**
   - [ ] Family name displays
   - [ ] Phone is masked (shows partial: +358 50 ••• 4567)
   - [ ] Needs show: "School information", "language help"
   - [ ] City shows: Helsinki
   - [ ] Primary need is highlighted
   - [ ] Status shows: "Unfinished Intake"
   - Screenshot: full context panel visible

#### Expected Results:
- Family appears in CRM within 5 seconds ✓ or ✗
- All intake form data displays correctly ✓ or ✗
- No data mismatches ✓ or ✗
- Context panel loads complete information ✓ or ✗

#### Document in: `2026-08-29_data-flow-intake-to-crm_profile-a.md`

---

### Data Flow 2: First Interview → Phase Transition

**What this tests:** Complete interview, family status changes, timeline updates, phase moves forward

**Test Duration:** 15-20 minutes  
**Test Profile:** Use Profile B (Contacted)

#### Steps:

1. **Locate Profile B family in CRM**
   - Open tracker
   - Navigate to Phase 2: "First Interview" tab
   - Find "Maria Silva" in family list
   - Screenshot: family card visible in correct phase

2. **Open context panel for Profile B**
   - Click on Maria Silva card
   - Wait for context panel to load
   - Screenshot: context panel open

3. **Check Timeline section**
   - Scroll to Timeline section in context panel
   - Note existing events
   - Screenshot: current timeline

4. **Start first interview**
   - Look for "Start Interview" or similar button
   - Click to open interview questions
   - Screenshot: interview form appears

5. **Answer interview questions**
   - Answer each question relevant to "Daycare options" need
   - Questions should be matched to family needs (not generic)
   - Fill in all required fields
   - Screenshot: answers visible

6. **Save interview**
   - Click Save button
   - Wait 2 seconds for form submission
   - Screenshot: save confirmation or page update

7. **Verify family_leads status updated**
   - Look for status change in context panel or CRM list
   - Status should change to next phase (Phase 3 or Phase 4)
   - Refresh page if needed
   - Screenshot: updated status displayed

8. **Check Timeline updated**
   - Scroll to Timeline section again
   - New "First Interview" event should appear at top
   - Event should show date/time of interview save
   - Screenshot: timeline with new event

9. **Verify Phase count updated**
   - Go back to main CRM view
   - Check Phase count badges
   - Phase 2 count should have decreased by 1 (family moved forward)
   - Phase 3 or 4 count should have increased by 1
   - Screenshot: updated phase counts

#### Expected Results:
- Interview form presents relevant questions ✓ or ✗
- Interview saves successfully ✓ or ✗
- family_leads status updates to next phase ✓ or ✗
- Timeline shows interview event with correct date/time ✓ or ✗
- Phase counts update correctly ✓ or ✗
- No data inconsistencies ✓ or ✗

#### Document in: `2026-08-29_data-flow-interview-to-phase_profile-b.md`

---

### Data Flow 3: Case Plan → Phase Transition

**What this tests:** Case plan creation, _case_plan_status enrichment, correct phase assignment

**Test Duration:** 10-15 minutes  
**Test Profile:** Use Profile C (Active Case)

#### Steps:

1. **Locate Profile C family in CRM**
   - Open tracker
   - Navigate to Phase 4: "Active Cases" tab
   - Find "Laura Kowalski" in list
   - Screenshot: family card visible

2. **Open context panel for Profile C**
   - Click Laura Kowalski card
   - Wait for context panel to load
   - Screenshot: context panel

3. **Check Current Case Plan**
   - In context panel, look for Case Plan section
   - Should show: "Options ready"
   - Screenshot: case plan details visible

4. **Verify _case_plan_status enrichment**
   - In browser developer tools, open Network tab
   - Go to console and run: `window.leads.find(l => l.id === '[laura-id]')`
   - Check if lead object has `_case_plan_status` property
   - Value should be: "options_ready"
   - Screenshot: console showing enriched lead object

5. **Verify family is in correct phase**
   - Family should be in Phase 4: "Active Cases"
   - This is determined by crm-lifecycle-data.js enrichment
   - Double-check: go to Dashboard → Family Journey pipeline
   - Laura should appear in "Active Cases" section
   - Screenshot: phase assignment correct

6. **Check Timeline for case plan events**
   - In context panel, scroll to Timeline
   - Should show "Case Plan Created" or "Case Plan Updated" event
   - Event date should be reasonable (recent)
   - Screenshot: timeline with plan event

7. **Create a new case plan (optional advanced test)**
   - If no plan exists, create one
   - Click "Create Case Plan" or similar
   - Set plan_status='options_ready'
   - Save plan
   - Wait 2 seconds for enrichment
   - Verify family stays in Phase 4 or moves correctly
   - Screenshot: new plan created

#### Expected Results:
- Case plan displays in context panel ✓ or ✗
- _case_plan_status is correctly enriched ✓ or ✗
- Family appears in correct phase (Phase 4) ✓ or ✗
- Timeline shows case plan events ✓ or ✗
- plan_status field is 'options_ready' not 'status' ✓ or ✗

#### Document in: `2026-08-29_data-flow-case-plan-to-phase_profile-c.md`

---

### Data Flow 4: Call → History & Timeline

**What this tests:** Call outcome recording, history display, timeline aggregation

**Test Duration:** 10-15 minutes  
**Test Profile:** Any profile (or create new for this test)

#### Steps:

1. **Select a family to log call for**
   - Pick any family from CRM (any phase)
   - Or use Profile A/B/C/D
   - Click to open context panel
   - Screenshot: context panel open

2. **Check initial call history**
   - Scroll to "Call History" section in context panel
   - Note current calls (if any)
   - Screenshot: initial call history (or empty state)

3. **Log a call outcome**
   - Look for "Log Call" or "Call Outcome" button
   - Click to open call outcome modal/form
   - Select outcome: "Reached" (or "No Answer" to test different outcome color)
   - Add optional notes: "Discussed daycare options, family agreed to apply"
   - Screenshot: call outcome form filled

4. **Save call outcome**
   - Click Save button
   - Wait 2 seconds for data to process
   - Screenshot: after save

5. **Verify call appears in Call History**
   - Scroll to Call History section
   - New call should appear at top (most recent)
   - Check call details:
     - [ ] Date/time correct (should be now or very recent)
     - [ ] Outcome badge shows "Reached" (green) or "No Answer" (red)
     - [ ] Operator name displays correctly
     - [ ] Notes display if provided
   - Screenshot: call in history

6. **Verify family_call_log was updated**
   - Open browser Network tab
   - Look for API call to get_call_history
   - Verify response includes new call
   - Screenshot: network tab showing API response

7. **Check Timeline for call event**
   - Scroll to Timeline section
   - New call event should appear
   - Event type should be "Call Completed" or "Call No Answer"
   - Event should show outcome color matching badge
   - Screenshot: timeline with call event

8. **Test multiple outcomes (optional)**
   - Log another call with outcome "No Answer"
   - Verify red badge appears in history
   - Log call with outcome "Call Later"
   - Verify purple badge appears in history
   - Screenshot: multiple call outcomes visible

#### Expected Results:
- Call outcome form appears and is usable ✓ or ✗
- Call data saves without errors ✓ or ✗
- family_call_log record created ✓ or ✗
- Call history section updates with new call ✓ or ✗
- Outcome badge color correct (green/red/purple) ✓ or ✗
- Timeline shows call event ✓ or ✗
- Operator name displays correctly ✓ or ✗

#### Document in: `2026-08-29_data-flow-call-to-history_profile-[x].md`

---

### Data Flow 5: Operator Scope Filtering

**What this tests:** All/Assigned/Unassigned filtering works correctly

**Test Duration:** 10-15 minutes  
**Test Profile:** N/A (tests filtering logic, not specific family)

#### Steps:

1. **Navigate to CRM tab**
   - Open tracker
   - Go to Family CRM tab
   - Screenshot: CRM view

2. **Find scope selector**
   - Look for dropdown or toggle showing "All", "Assigned to me", "Unassigned"
   - Should be near phase navigation or top of family list
   - Screenshot: scope selector visible

3. **Test "All" scope (default)**
   - Select "All"
   - Look at family count in Phase 1
   - Note the count (e.g., "5 families")
   - Screenshot: all families view

4. **Test "Assigned to me" scope**
   - Select "Assigned to me"
   - Family count should decrease (fewer families assigned to current operator)
   - Only families with assigned_operator_id = current user should show
   - All phase counts should be filtered
   - Dashboard headline should change to "My work today" or similar
   - Screenshot: assigned scope view

5. **Test "Unassigned" scope**
   - Select "Unassigned"
   - Only families with no assigned_operator_id should show
   - Phase counts should show only unassigned families
   - Dashboard headline should change to "Unassigned families today"
   - Screenshot: unassigned scope view

6. **Verify counts are accurate**
   - "All" count should equal sum of all other scopes
   - Switching between scopes should update dashboard metrics
   - Pulse metrics (incomplete, first contact, follow-ups, active) should all filter correctly
   - Screenshot: metrics comparison

7. **Verify scope persists across tabs**
   - While in "Assigned to me" scope, switch to Analytics tab
   - Switch back to Family CRM tab
   - Scope should still be "Assigned to me"
   - Families should still be filtered
   - Screenshot: scope persisted

8. **Test reassigning a family**
   - In "Unassigned" scope, find an unassigned family
   - Assign it to current operator
   - Immediately, family should disappear from "Unassigned" view
   - Switch to "Assigned to me" - family should appear
   - Switch to "All" - family should still be there
   - Screenshot: family assignment updated

#### Expected Results:
- Scope selector is visible and functional ✓ or ✗
- "All" shows complete family list ✓ or ✗
- "Assigned to me" correctly filters by current operator ✓ or ✗
- "Unassigned" shows only unassigned families ✓ or ✗
- Phase counts update correctly for each scope ✓ or ✗
- Dashboard metrics respect scope filter ✓ or ✗
- Scope persists across tab switches ✓ or ✗

#### Document in: `2026-08-29_operator-scope-filtering_all-scopes.md`

---

### Data Flow 6: Timeline Aggregation

**What this tests:** Timeline collects events from 3 tables, sorts chronologically, displays with correct icons/colors

**Test Duration:** 10-15 minutes  
**Test Profile:** Use Profile C (has multiple events: interview, plan, calls)

#### Steps:

1. **Open context panel for Profile C**
   - Find Laura Kowalski
   - Click to open context panel
   - Screenshot: context panel

2. **Scroll to Timeline section**
   - Find "Activity Timeline" section
   - Note all visible events
   - Screenshot: full timeline visible

3. **Verify events from family_case_events table**
   - Look for events like "Case Plan Created", "Case Plan Updated"
   - These should come from family_case_events
   - Each should have correct icon (📋 for plan) and date
   - Screenshot: plan-related events visible

4. **Verify events from family_interviews table**
   - Look for "First Interview" event
   - Should show interview date/time
   - Should have interview icon (📞)
   - Screenshot: interview event visible

5. **Verify events from family_call_log table**
   - Look for "Call Completed" or "Call No Answer" events
   - Should show call outcome as label
   - Should have checkmark (✓) or X (✗) icon
   - Screenshot: call events visible

6. **Verify chronological sort (newest first)**
   - Events should be sorted newest-first (descending by created_at)
   - Top event should be most recent
   - Scroll down - older events should appear
   - Screenshot: chronological order confirmed

7. **Verify event colors match labels**
   - "Call Completed" should be green (#0a9b5c)
   - "Call No Answer" should be red (#c74c4c)
   - "Case Plan" events should be purple (#6b5dab)
   - "Interview" should be teal (#13b9aa)
   - Screenshot: color coding correct

8. **Test "No activity" state (optional)**
   - Find a new family with no events
   - Open context panel
   - Timeline should show "No activity recorded"
   - No errors should appear
   - Screenshot: empty timeline handling

9. **Verify API call to get_timeline**
   - Open browser Network tab
   - Open context panel for Profile C
   - Look for API call to get_timeline
   - Response should contain aggregated events from 3 sources
   - Screenshot: network call visible

#### Expected Results:
- Timeline section loads and displays ✓ or ✗
- Events from family_case_events appear correctly ✓ or ✗
- Events from family_interviews appear correctly ✓ or ✗
- Events from family_call_log appear correctly ✓ or ✗
- Events are sorted chronologically (newest first) ✓ or ✗
- Event icons and colors are correct ✓ or ✗
- get_timeline API returns aggregated data ✓ or ✗
- No duplicate events visible ✓ or ✗

#### Document in: `2026-08-29_timeline-aggregation_profile-c.md`

---

### Data Flow 7: Dashboard Metrics Update

**What this tests:** Pulse metrics calculate correctly, reflect operator scope, update on status changes

**Test Duration:** 15-20 minutes  
**Test Profile:** Any profile that you can change status for

#### Steps:

1. **Navigate to Dashboard**
   - Open tracker
   - Go to Dashboard tab
   - Wait for page to fully load
   - Screenshot: dashboard visible

2. **Note initial pulse metrics**
   - Find the pulse metrics section (4 boxes):
     - "finish intake" count
     - "first contact" count  
     - "follow-ups due" count
     - "active journeys" count
   - Write down each count
   - Screenshot: initial metrics

3. **Switch to "Assigned to me" scope**
   - Find scope selector
   - Switch to "Assigned to me"
   - Watch pulse metrics update (they should change)
   - Counts should decrease or stay same (only assigned families)
   - Note new counts
   - Screenshot: scoped metrics

4. **Switch back to "All" scope**
   - Select "All" scope
   - Pulse metrics should return to original values
   - Screenshot: metrics restored

5. **Test metric update on status change**
   - Go to Family CRM tab
   - Open a family with status "Unfinished Intake" (Phase 1)
   - Screenshot: current status

6. **Complete the intake** (if possible)
   - Save the family's status as "Contacted" (Phase 2)
   - Or move them to next phase
   - Screenshot: status changed

7. **Switch back to Dashboard**
   - Go to Dashboard tab
   - "finish intake" count should have decreased by 1
   - Next phase count should have increased by 1
   - Other metrics may have changed depending on family data
   - Screenshot: updated metrics

8. **Verify metric calculations are correct**
   - Check Phase 1 count: should equal "finish intake" metric (approximately)
   - Check "active journeys" metric: should match families with case plans
   - Check "first contact" metric: should match families in Phase 2
   - Screenshot: metric accuracy verified

9. **Check SLA clock**
   - Find "First-contact clock" widget on dashboard
   - This shows time since oldest family in Phase 2
   - Verify clock updates if you add a new family
   - Screenshot: SLA clock visible

#### Expected Results:
- Dashboard loads without errors ✓ or ✗
- Pulse metrics display for all 4 phases ✓ or ✗
- Scope filtering affects metrics correctly ✓ or ✗
- Metrics update when family status changes ✓ or ✗
- Metric calculations appear accurate ✓ or ✗
- SLA clock is visible and functional ✓ or ✗

#### Document in: `2026-08-29_dashboard-metrics-update_all-scopes.md`

---

## Testing Checklist

Use this to track which tests you've completed:

### Completed Tests
- [x] 2026-08-29: Critical Bug Fixes (8 bugs)
- [x] 2026-08-29: Smoke Testing (page load, login, navigation)

### In Progress
- [ ] Data Flow 1: Intake → CRM (Profile A)
- [ ] Data Flow 2: Interview → Phase (Profile B)
- [ ] Data Flow 3: Case Plan → Phase (Profile C)
- [ ] Data Flow 4: Call → History (Any Profile)
- [ ] Data Flow 5: Operator Scope (All Profiles)
- [ ] Data Flow 6: Timeline (Profile C)
- [ ] Data Flow 7: Dashboard Metrics (Any Profile)

### Next
- [ ] Phase Navigation detailed testing
- [ ] Context Panel deep dive
- [ ] Error handling scenarios
- [ ] Performance measurements
- [ ] Edge cases (no data, very large datasets, etc.)

---

## Quick Reference: Test Data Profiles

| Profile | Name | Phone | Needs | City | Phase | Use For |
|---------|------|-------|-------|------|-------|---------|
| A | Ahmed Family | +358 50 123 4567 | School, Language | Helsinki | 1 | Intake flow |
| B | Maria Silva | +358 40 234 5678 | Daycare | Vantaa | 2 | Interview flow |
| C | Laura Kowalski | +358 44 345 6789 | Employment, Relocation | Espoo | 4 | Case plan flow |
| D | Fatima Hassan | +358 45 456 7890 | Housing | Helsinki | 5 | Outcome flow |

---

## Key Files to Know

- **Data flows:** `/workspaces/audits/data-flows/master-data-flow.md`
- **Edge Functions:** `/supabase/functions/family-case-lifecycle-admin/index.ts`
- **Frontend modules:**
  - `tracker/crm-lifecycle-data.js` (enrichment)
  - `tracker/crm-lifecycle-timeline.js` (timeline rendering)
  - `tracker/crm-call-history.js` (call history panel)
  - `tracker/app.js` (main CRM engine)

---

## How to Report Results

After each test, create a new file in `workspaces/audits/e2e-testing/` with the format:

```
YYYY-MM-DD_data-flow-name_profile-x.md
```

Include:
- Test name and date
- Profile used
- All steps taken
- Screenshots at key moments
- Results (✓ PASS or ✗ FAIL)
- Any bugs found
- UX observations
- Performance notes

Then update `audit-index.md` to mark test as COMPLETE.

---

## Rules to Prevent Redundant Testing

1. **Check audit-index.md first** - Don't re-run tests already documented
2. **Reference existing results** - Link to prior test findings in notes
3. **Document comprehensively** - Future testing relies on your notes
4. **Screenshot everything** - Visual proof prevents re-testing skepticism
5. **Note both passes and failures** - Failed assertions are valuable data

---

## Questions? Next Steps?

If a test doesn't match reality:
1. Note the difference in the test file
2. Update this playbook with findings
3. Check if code has changed since documentation
4. Create a bug report if behavior is wrong
5. Commit both the test results and any playbook updates

---

**Last Updated:** 2026-08-29  
**Next Review:** After completing Level 2 (Data Flow) tests  
**Maintainer:** Testing framework

