const test = require('node:test');
const assert = require('node:assert/strict');

test('specific child request wins over the broad Carruur iyo skuul category', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  const domains = needDomainsForLead({
    main_need: 'Carruur iyo skuul',
    sub_need: 'Päiväkoti ama xannaano',
    age_group: 'under7',
  });
  assert.deepEqual(domains, ['daycare']);
  assert.equal(domains.includes('school'), false);
  assert.equal(domains.includes('family_finances'), false);
});

test('child registration uses the recorded child stage to select the route family', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  assert.deepEqual(needDomainsForLead({ main_need: 'Carruur iyo skuul', sub_need: 'Codsi ama diiwaangelin', age_group: 'under7' }), ['daycare']);
  assert.deepEqual(needDomainsForLead({ main_need: 'Carruur iyo skuul', sub_need: 'Codsi ama diiwaangelin', age_group: 'over7' }), ['school']);
});

test('adult education maps to education knowledge rather than work knowledge', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  assert.deepEqual(needDomainsForLead({ main_need: 'Waxbarasho', sub_need: 'Barashada Finnish-ka' }), ['education']);
  assert.deepEqual(needDomainsForLead({ main_need: 'Waxbarasho', sub_need: 'Ammatillinen koulutus' }, { current_study: 'Vocational' }), ['education', 'education_current_student']);
});

test('work cases only add benefit or education knowledge when that need is explicit', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  const lead = { main_need: 'Shaqo', sub_need: 'Shaqo raadis' };
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Studying' }), ['work']);
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Working' }), ['work']);
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Unemployed / seeking work' }), ['work']);
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Unemployed / seeking work', work_search_scope: 'Work plus training options' }), ['work', 'education']);
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Unemployed / seeking work', apprenticeship: 'Yes' }), ['work', 'education']);
  assert.deepEqual(needDomainsForLead(lead, { primary_situation: 'Unemployed / seeking work', cross_service_needs_all: ['Kela / benefits'] }), ['work']);
});

test('future and cross-service signals never activate matching by themselves', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  const lead = { main_need: 'Shaqo', sub_need: 'Shaqo raadis' };
  assert.deepEqual(needDomainsForLead(lead, {
    household_children: ['Under 3'],
    caregiver_future_goal: ['Finnish / education later'],
    cross_service_needs_all: ['Kela / benefits', 'Programmes / training'],
  }), ['work']);
});

test('additional needs are included without borrowing the primary scenario answers', async () => {
  const { needDomainsForLead } = await import('../supabase/functions/_shared/route-domain-selector.mjs');
  const domains = needDomainsForLead({
    main_need: 'Carruur iyo skuul',
    sub_need: 'Päiväkoti ama xannaano',
    age_group: 'under7',
    additional_needs: [{ main_need: 'Waxbarasho', sub_need: 'YKI' }],
  });
  assert.deepEqual(domains, ['daycare', 'education']);
});

test('jobseeker status is not accepted as a general work-status alias', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const admin = fs.readFileSync(path.join(__dirname, '..', 'supabase/functions/family-leads-admin/index.ts'), 'utf8');
  assert.match(admin, /work_status: \["work_status", "main_status", "primary_situation"\]/);
  assert.match(admin, /main_status: \["main_status", "work_status", "primary_situation"\]/);
  assert.doesNotMatch(admin, /work_status:\s*\[[^\]]*jobseeker_active/);
  assert.doesNotMatch(admin, /main_status:\s*\[[^\]]*jobseeker_active/);
});
