# End-to-End System Testing Skill

## Purpose
Systematic testing of the AQOON Family CRM tracker through complete user journeys. Ensures data flows correctly from intake → CRM → lifecycle management → analytics, and validates UX across all phases.

## What This Tests
- **Intake Flow:** Family enters data through public form
- **CRM Processing:** Data appears in tracker with correct classification
- **Phase Navigation:** Families move through 6 lifecycle phases correctly  
- **Context Panel:** Family details, call history, timeline render correctly
- **Data Integrity:** Info from intake matches tracker display
- **Operator Workflow:** Scoped views work (All/Assigned/Unassigned)
- **UX Quality:** Questions make sense, UI is clear, flow is logical

## Testing Levels

### Level 1: Smoke Test (15 min)
- [x] Page loads without JS errors
- [x] Login works
- [x] Dashboard appears
- [x] Can navigate tabs (Dashboard, CRM, Analytics, Sales)

### Level 2: Data Flow Test (30 min)
- [ ] Create test family via intake form
- [ ] Verify data appears in CRM within 5 seconds
- [ ] Data has correct status/needs classification
- [ ] Can click family to open context panel
- [ ] Call history shows (or "no calls" if new)
- [ ] Timeline shows intake event

### Level 3: Phase Navigation Test (20 min)
- [ ] 6 phases display with correct counts
- [ ] Operator scope selector works (All/Assigned/Unassigned)
- [ ] Filtering by phase shows only correct families
- [ ] Phase counts update when family status changes

### Level 4: Context Panel Deep Dive (25 min)
- [ ] Family info displays completely
- [ ] Can scroll through sections
- [ ] Close button works
- [ ] Overlay click closes panel
- [ ] Multiple opens/closes work
- [ ] Different families show different data

### Level 5: Interview & Follow-up Flow (30 min)
- [ ] Start first interview (if available)
- [ ] Questions match family needs
- [ ] Save interview
- [ ] Family moves to "First Interview" phase
- [ ] Timeline shows interview event
- [ ] Can schedule follow-up

### Level 6: Analytics & Metrics (15 min)
- [ ] Dashboard pulse metrics match phase counts
- [ ] Analytics tab shows correct funnel
- [ ] Operator scope filters apply to analytics
- [ ] SLA clock shows correctly

### Level 7: Edge Cases (20 min)
- [ ] No calls recorded (timeline/call history graceful)
- [ ] Multiple rapid opens of context panel
- [ ] Network failure handling
- [ ] Very long names/notes truncate correctly

## Test Data Profiles

### Profile A: New Family (Testing "Unfinished Intake")
```
Name: Ahmed Family
Phone: +358 50 123 4567
Needs: School information, language help
City: Helsinki
```

### Profile B: Contacted (Testing "First Interview")  
```
Name: Maria Silva
Phone: +358 40 234 5678
Needs: Daycare options
City: Vantaa
Status: Contacted (ready for interview)
```

### Profile C: Active Case (Testing "Active Cases")
```
Name: Laura Kowalski
Phone: +358 44 345 6789
Needs: Employment support, relocation
City: Espoo
Case plan: Options ready
```

### Profile D: Awaiting Decision
```
Name: Fatima Hassan
Phone: +358 45 456 7890
Needs: Housing assistance
City: Helsinki
Case plan status: Awaiting outcome
```

## Test Execution Checklist

### Before Testing
- [ ] Fresh browser session (clear cache)
- [ ] Localhost or staging (not production)
- [ ] Test Supabase DB (or mock data)
- [ ] Screenshot tool ready
- [ ] Note-taking tool open

### During Each Test
- [ ] Record what you do (step by step)
- [ ] Take screenshot at key moments
- [ ] Note any unexpected behavior
- [ ] Check browser console for errors
- [ ] Verify data matches between forms

### After Each Test
- [ ] Save screenshots with descriptive names
- [ ] Document results in test log
- [ ] List any bugs found
- [ ] Note UX issues or confusing flows
- [ ] Suggest improvements

## Data Flow Mapping

### Intake → CRM
```
Family submits intake form
     ↓
Data saved to family_leads (status='partial')
     ↓
CRM lists new family as "Unfinished Intake"
     ↓
Operator clicks family
     ↓
Context panel shows family details
```

### First Interview → Lifecycle
```
Operator starts interview
     ↓
Questions presented based on family needs
     ↓
Interview saved to family_interviews (status='completed')
     ↓
family_leads.status updated to 'contacted'
     ↓
Timeline shows "First Interview" event
     ↓
Family moves to "First Interview" phase in CRM
```

### Case Plan → Phases
```
Operator creates case plan
     ↓
Saved to family_case_plans (plan_status='options_ready')
     ↓
family_lifecycle_data enriches lead with _case_plan_status
     ↓
CRM phase filters recognize "Awaiting Outcome"
     ↓
Family moves to "Awaiting Outcome" phase
```

### Call → History & Timeline
```
Operator records call outcome
     ↓
Saved to family_call_log
     ↓
Call history module fetches via get_call_history action
     ↓
Displays in context panel with outcome badge
     ↓
Timeline shows "Call Completed"/"Call No Answer" event
```

## Known Issues to Test For

1. **Field Name Mismatch (FIXED)** - Was using plan.status instead of plan.plan_status
2. **Function Arguments Bug (FIXED)** - $ function was using ...arguments incorrectly
3. **Cache Expiry (FIXED)** - Now tracks per-lead TTL
4. **Error Display (FIXED)** - Now shows error message if API fails

## What to Look For

### UX Quality
- [ ] Is wording clear and natural?
- [ ] Do questions make sense for this family?
- [ ] Are buttons/links easy to find?
- [ ] Can you complete flow without confusion?
- [ ] Are icons/colors intuitive?

### Data Accuracy
- [ ] Does entered data appear correctly in tracker?
- [ ] Are dates formatted consistently?
- [ ] Are phone numbers masked appropriately?
- [ ] Do calculations (SLA, cycle time) seem right?

### Performance
- [ ] Pages load within 2 seconds?
- [ ] Phase filters respond instantly?
- [ ] Context panel opens smoothly?
- [ ] No "freezing" or lag?

### Error Handling
- [ ] Bad network shows error message (not blank)?
- [ ] Can recover from errors?
- [ ] Are error messages helpful?
- [ ] No 500 errors without message?

## Audit Storage

Test results are stored in `/workspaces/audits/e2e-testing/` with format:
```
YYYY-MM-DD_test-name_profile-a.md
├─ Test date & tester name
├─ Profile tested
├─ Steps executed
├─ Screenshots
├─ Bugs found
├─ UX observations
└─ Data flow verified
```

## Pass/Fail Criteria

### Must Pass (MVP)
- ✓ No JavaScript errors on page load
- ✓ Login/unlock works
- ✓ Family data appears in CRM
- ✓ Context panel opens and shows data
- ✓ Phase navigation displays
- ✓ Operator scope filtering works
- ✓ Call history renders (or shows empty gracefully)
- ✓ Timeline shows events

### Nice to Have (Polish)
- Loading states while fetching
- Smooth animations
- Keyboard navigation
- Responsive on all screen sizes
- Accessibility features work

## Running Tests

```bash
# Start local server
python3 -m http.server 8000

# In browser:
# 1. Navigate to http://localhost:8000/tracker
# 2. Log in with test password
# 3. Follow test scripts from TESTING.md
# 4. Document results
```

## Continuous Improvement

After each test run:
1. Update this file with any new findings
2. Archive test results (screenshots + notes)
3. Note patterns in bug reports
4. Suggest improvements for next phase
5. Add new test cases if gaps found

---

**Last Updated:** 2026-08-29  
**Bugs Fixed:** 8 (critical field names, cache, error display)  
**Ready for Testing:** YES
