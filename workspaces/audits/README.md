# AQOON System Audits & Testing Archive

> **Archive notice (2 Sep 2026):** reports below preserve what was observed on their stated date. They are not current operating instructions. In particular, the shared-password, six-phase, fixed test-profile and fixed asset-count material is superseded by `.claude/skills/e2e-testing/SKILL.md`, `tracker/CONTEXT.md` and the newest dated audit in `docs/qa/`.

## Purpose
Central repository for all system testing, audits, and quality assurance work. Prevents duplicate testing and ensures comprehensive coverage of all features.

## Directory Structure

```
audits/
├─ README.md (this file)
├─ audit-index.md (master index of all tests)
├─ coverage-checklist.md (what's been tested)
├─ e2e-testing/
│  ├─ 2026-08-29_intake-flow_profile-a.md
│  ├─ 2026-08-29_phase-navigation_all-scopes.md
│  ├─ 2026-08-29_context-panel_profile-b.md
│  └─ ... (test results with screenshots)
├─ data-flows/
│  ├─ intake-to-crm-flow.md
│  ├─ interview-to-phase-mapping.md
│  ├─ call-history-data-flow.md
│  └─ lifecycle-timeline-events.md
├─ bug-reports/
│  ├─ 2026-08-29_critical-field-name.md (FIXED)
│  ├─ 2026-08-29_function-arguments.md (FIXED)
│  └─ 2026-08-29_cache-expiry.md (FIXED)
├─ performance-baseline/
│  ├─ page-load-times.md
│  ├─ api-latency.md
│  └─ bundle-size.md
└─ regression-tests/
   ├─ critical-path.md
   ├─ module-integration.md
   └─ edge-cases.md
```

## Testing Status

### Phase 1: Critical Bug Fixes (COMPLETE) ✓
- [x] Field name mismatch (plan.status vs plan.plan_status)
- [x] Function arguments bugs ($ function)
- [x] Cache expiry tracking (per-lead TTL)
- [x] Error display (API failures show in UI)
- [x] Global function conflicts (renamed to avoid)

**Date Completed:** 2026-08-29  
**Files Modified:** 3 (crm-lifecycle-data.js, crm-call-history.js, crm-lifecycle-timeline.js)

### Phase 2: Smoke Testing (IN PROGRESS)
- [ ] Page loads without JS errors
- [ ] Login/unlock works
- [ ] Dashboard renders
- [ ] Tab navigation works
- [ ] No console errors

### Phase 3: Data Flow Testing (PENDING)
- [ ] Intake form → CRM flow
- [ ] First interview → timeline
- [ ] Case plan → phase transition
- [ ] Call outcome → history/timeline

### Phase 4: Phase Navigation Testing (PENDING)
- [ ] 6 phases display correctly
- [ ] Operator scope works (All/Assigned/Unassigned)
- [ ] Phase filtering is accurate
- [ ] Counts update dynamically

### Phase 5: Context Panel Testing (PENDING)
- [ ] Panel opens on click
- [ ] Shows family info
- [ ] Call history loads
- [ ] Timeline renders
- [ ] Close works (button + overlay)

### Phase 6: End-to-End Flows (PENDING)
- [ ] Complete intake flow
- [ ] Complete interview flow
- [ ] Complete follow-up flow
- [ ] Case plan creation flow

### Phase 7: Analytics & Metrics (PENDING)
- [ ] Dashboard pulse metrics
- [ ] Analytics funnel
- [ ] Operator scope filtering
- [ ] SLA calculations

### Phase 8: Edge Cases & Error Handling (PENDING)
- [ ] No data states
- [ ] Network failures
- [ ] Large datasets (1000+ families)
- [ ] Rapid user interactions

## Coverage Checklist

### Core Features
- [x] 6-phase navigation system (IMPLEMENTED)
- [x] Operator scope selector (IMPLEMENTED)
- [x] Context panel (IMPLEMENTED)
- [x] Call history viewer (IMPLEMENTED)
- [x] Timeline visualization (IMPLEMENTED)
- [x] Edge Function actions (IMPLEMENTED)
- [ ] TESTED (PENDING)

### Data Sources
- [x] family_leads table (USED)
- [x] family_interviews table (USED)
- [x] family_case_plans table (USED)
- [x] family_case_events table (USED)
- [x] family_call_log table (USED)
- [x] family_interview_revisions table (READY)
- [ ] TESTED (PENDING)

### API Actions
- [x] batch_list (IMPLEMENTED)
- [x] get_call_history (IMPLEMENTED)
- [x] get_timeline (IMPLEMENTED)
- [x] get_consent (IMPLEMENTED)
- [x] get_revisions (IMPLEMENTED)
- [ ] TESTED (PENDING)

### User Workflows
- [ ] New family intake
- [ ] First interview
- [ ] Follow-up scheduling
- [ ] Case plan management
- [ ] Call logging
- [ ] Analytics review
- [ ] Operator reassignment

### Device/Browser Support
- [ ] Desktop (1280x1024)
- [ ] Tablet (768x1024)
- [ ] Mobile (320x568)
- [ ] Chrome
- [ ] Firefox
- [ ] Safari

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] ARIA labels
- [ ] Focus indicators

## Test Result Templates

### End-to-End Test
Each test file should include:
```markdown
# Test: [Name]
**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Profile:** [A/B/C/D]
**Status:** PASS / FAIL

## Scenario
[What you're testing]

## Steps
1. Step 1
2. Step 2
...

## Results
### Data Accuracy
- Expected: [X]
- Actual: [X]
- Status: PASS/FAIL

### UX Quality
- [Observation 1]
- [Observation 2]

### Performance
- Page load: Xms
- API latency: Xms

### Bugs Found
1. Bug description
2. Severity: Critical/High/Medium/Low

## Screenshots
[filename: description]

## Notes
[Any other observations]
```

## How to Use This Archive

### Finding Previous Tests
1. Check `audit-index.md` for test name
2. Look in relevant subdirectory by date
3. Review results before running similar test
4. Note any known issues

### Adding New Tests
1. Use template above
2. Save as `YYYY-MM-DD_test-name_profile-x.md`
3. Place in appropriate subdirectory
4. Update `audit-index.md` with link
5. Update `coverage-checklist.md` with results

### Tracking Regression
1. Check `regression-tests/critical-path.md`
2. If test passed before but fails now, it's a regression
3. Document in bug-reports/ with "REGRESSION" label
4. Find what changed since last pass

## Key Metrics

### Test Coverage Goal: 100%
- Modules: 14 (7 JS + 4 CSS + 2 docs + 1 skill) → 100%
- Features: 8 major → [% TESTED]
- Data flows: 4 major → [% TESTED]
- User workflows: 6 → [% TESTED]

### Bug Metrics
- Critical bugs found: 8
- Critical bugs fixed: 8
- High priority fixes: 3
- All fixes before launch: YES

### Performance Baseline
- Page load: target <2s
- API calls: target <500ms
- Phase filter: target <100ms
- Context panel open: target <300ms (animation)

## Next Steps

1. **This Week:**
   - [ ] Complete smoke testing
   - [ ] Run data flow tests
   - [ ] Test phase navigation
   - [ ] Test context panel

2. **Next Week:**
   - [ ] Full end-to-end flows
   - [ ] Analytics verification
   - [ ] Edge cases
   - [ ] Performance profiling

3. **Launch Prep:**
   - [ ] Accessibility audit
   - [ ] Mobile testing
   - [ ] Browser compatibility
   - [ ] Production smoke test

---

**Archive Started:** 2026-08-29  
**Last Updated:** 2026-08-29  
**Status:** ACTIVE - Testing in progress
