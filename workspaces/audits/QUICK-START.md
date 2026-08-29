# Testing Quick Start Guide

**TL;DR:** Follow these 5 steps to start testing and documenting system behavior.

---

## Step 1: Check What's Already Been Tested

Before you test anything, check `audit-index.md`:
- Green checkmarks = Already tested ✓
- Red X marks = Not tested yet
- Don't repeat tests that are already done

**File:** `/workspaces/audits/audit-index.md`

---

## Step 2: Pick a Data Flow to Test

Choose one from the playbook based on what you want to verify:

| Data Flow | Profile | Time | What You Verify |
|-----------|---------|------|-----------------|
| Intake → CRM | Profile A | 5 min | New family appears in tracker |
| Interview → Phase | Profile B | 15 min | Interview saves, phase updates, timeline shows |
| Case Plan → Phase | Profile C | 10 min | Plan status enrichment, correct phase |
| Call → History | Any | 10 min | Call logs appear in history & timeline |
| Operator Scope | Any | 10 min | All/Assigned/Unassigned filtering works |
| Timeline | Profile C | 10 min | Events from 3 tables aggregate correctly |
| Dashboard Metrics | Any | 15 min | Pulse metrics update on status change |

**Reference:** `/workspaces/audits/TESTING-PLAYBOOK.md`

---

## Step 3: Follow the Step-by-Step Guide

Open the testing playbook and follow the numbered steps for your chosen data flow:

1. Go to `TESTING-PLAYBOOK.md`
2. Find your data flow section
3. Copy the test profile's data (phone, needs, etc.)
4. Follow each step exactly
5. Take screenshot at each checkmark
6. Note what actually happened vs. what was expected

**Key:** Screenshot everything. Write down what you see, not what you think should be there.

---

## Step 4: Document Results

After testing, create a result file in this format:

```
/workspaces/audits/e2e-testing/YYYY-MM-DD_data-flow-name_profile-x.md
```

Example: `2026-08-29_intake-to-crm-flow_profile-a.md`

Copy this template:

```markdown
# Test: [Data Flow Name]

**Date:** YYYY-MM-DD  
**Tester:** [Your name]  
**Profile:** [A/B/C/D]  
**Status:** PASS / FAIL

## Scenario
[What you tested]

## Steps Executed
1. Step 1
2. Step 2
...

## Results

### Expected vs Actual
- Item 1: Expected [X], Actual [Y], Status: PASS/FAIL
- Item 2: Expected [X], Actual [Y], Status: PASS/FAIL

## Screenshots
- 01-initial-state.png - describes what's shown
- 02-after-action.png - describes what's shown
- etc.

## Bugs Found
1. Bug title: [description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce

## Notes
[Any observations about UX, performance, data accuracy, etc.]
```

---

## Step 5: Update the Master Index

After documenting results:

1. Open `audit-index.md`
2. Find the test row that matches what you just did
3. Change status from "PENDING" to "COMPLETE"
4. Add result summary and date
5. Save and commit

---

## Where to Find Everything

```
workspaces/audits/
├── QUICK-START.md (this file)
├── TESTING-PLAYBOOK.md (detailed test steps)
├── audit-index.md (master index of all tests)
├── README.md (project overview)
├── data-flows/
│   └── master-data-flow.md (complete system architecture)
└── e2e-testing/
    ├── 2026-08-29_smoke-testing_all-scopes.md (✓ DONE)
    ├── screenshots/
    │   ├── 01-page-load.png
    │   ├── 02-shared-password-form.png
    │   └── 03-after-unlock.png
    └── [your test results here]
```

---

## Quick Commands

**Start local server:**
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/tracker/
```

**Commit test results:**
```bash
git add workspaces/audits/
git commit -m "test: [Data Flow Name] with Profile [X] - [PASS/FAIL]"
git push
```

**Check what's been tested:**
```bash
grep "COMPLETE" workspaces/audits/audit-index.md
```

---

## Testing Rules

✓ **DO:**
- Check audit-index.md before testing
- Follow the playbook step-by-step
- Screenshot at each verification step
- Write down what you actually see
- Document bugs found
- Update audit-index.md when done

✗ **DON'T:**
- Re-test something already marked COMPLETE
- Skip steps to save time
- Assume behavior matches documentation
- Test without screenshots
- Forget to update the master index
- Skip bugs "to fix later"

---

## What to Look For

### Data Accuracy
- Phone numbers are masked (shows partial)
- Dates are formatted consistently
- Status values match expectations
- Family needs display correctly
- Operator names appear correctly

### UX Quality
- Buttons are clickable
- Forms show validation errors clearly
- Panels open/close smoothly
- No blank sections
- Text doesn't overflow

### Timeline & Events
- Events appear in chronological order (newest first)
- Event types have correct icons and colors
- Dates and times are accurate
- No duplicate events

### Performance
- Page loads in <2 seconds
- Clicking buttons responds immediately
- Context panel opens in <1 second
- No "freezing" or lag

---

## When Something Doesn't Work

If you find a bug:

1. **Reproduce it** - Can you make it happen again?
2. **Screenshot it** - Take a screenshot showing the problem
3. **Document steps** - Write exact steps to recreate
4. **Note severity:**
   - Critical = System broken, feature unusable
   - High = Major issue, workaround exists
   - Medium = Feature works but has issues
   - Low = Minor polish/cosmetic issue

5. **Create a bug report:**

```markdown
# Bug: [Title]

**Severity:** Critical / High / Medium / Low

## Description
[What's wrong]

## Steps to Reproduce
1. Do this
2. Then this
3. Expected: X happens
4. Actual: Y happens

## Impact
[What breaks when this happens]

## Screenshot
[bug-screenshot.png]
```

---

## Examples

### ✓ Good Test Result
- All steps followed exactly
- Clear screenshots at each step
- Every expected result documented (pass/fail)
- Bugs noted with severity levels
- Timeline of work clear

### ✗ Poor Test Result
- "Tested everything, works fine"
- No screenshots
- No detail on what was actually verified
- Bugs not documented
- Index not updated

---

## Next Steps

1. **First time testing?**
   - Read TESTING-PLAYBOOK.md
   - Pick Profile A (Intake → CRM flow)
   - Follow all steps exactly
   - Document results carefully

2. **Experienced with system?**
   - Check audit-index.md for gaps
   - Pick untested data flow
   - Run complete test with all profiles
   - Document thoroughly

3. **Found bugs?**
   - Create bug report using template
   - Add to test result documentation
   - Link to bug in audit-index.md
   - Commit with bug label

---

## Success Indicators

You're doing great testing when:
- ✓ Every test is documented before you move to next
- ✓ Audit-index.md is current (updated same day)
- ✓ Screenshots are clear and show the actual state
- ✓ No test is repeated (you checked index first)
- ✓ Bugs are documented with exact reproduction steps
- ✓ UX observations are detailed
- ✓ Both passes AND failures are noted

---

## Questions?

- **How do I test X?** → Check TESTING-PLAYBOOK.md
- **What's been tested?** → Check audit-index.md  
- **How do I report results?** → Use template above
- **What about data privacy?** → Don't include real family names; use profiles A/B/C/D
- **Can I test on production?** → Use test/staging only, never production data

---

## Remember

Testing is not about finding everything perfect. Testing is about:
1. Understanding how the system actually works
2. Documenting what works and what doesn't
3. Catching bugs before users do
4. Making sure data flows correctly
5. Ensuring UX makes sense

**Every test documented is a gift to future testers.** Don't start from scratch. Build on what came before.

---

**Happy Testing!** 🚀

Start with Step 1. You've got this.

