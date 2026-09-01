export function cityMatches(scope, city) {
  if (!scope) return true;
  if (!city) return false;
  const target = String(city).toLowerCase().trim();
  return String(scope).toLowerCase().split(/[\/,|;]/).map(value => value.trim()).filter(Boolean)
    .some(value => value === target || value.startsWith(target + " ") || target.startsWith(value + " "));
}

export function buildDemandRows({ leads = [], needs = [], plans = [], futureOpportunities = [], nowMs = Date.now() } = {}) {
  const leadMap = new Map(leads.map(lead => [lead.id, lead]));
  const matchedNeedIds = new Set(plans.filter(plan => plan.plan_status !== "research").map(plan => plan.family_need_id));
  const demandMap = new Map();
  for (const need of needs) {
    const lead = leadMap.get(need.source_lead_id);
    if (!lead) continue;
    const household = need.household_id || lead.household_id || need.source_lead_id;
    const key = `${household}:${need.need_domain}`;
    const row = { household_key: String(household), need_domain: need.need_domain || "general", city: lead.city || null, interview_status: lead.interview_status || null, interest_state: "stated_need", matched: matchedNeedIds.has(need.id) };
    const old = demandMap.get(key);
    if (!old || (!old.matched && row.matched)) demandMap.set(key, row);
  }
  for (const opportunity of futureOpportunities) {
    if (opportunity.contact_permission_status !== "granted" || (opportunity.earliest_contact_at && new Date(opportunity.earliest_contact_at).getTime() > nowMs)) continue;
    const lead = leadMap.get(opportunity.family_lead_id);
    if (!lead) continue;
    const household = lead.household_id || opportunity.family_lead_id;
    const key = `${household}:${opportunity.need_domain}`;
    if (demandMap.has(key)) continue;
    demandMap.set(key, { household_key: String(household), need_domain: opportunity.need_domain || "general", city: lead.city || null, interview_status: lead.interview_status || null, interest_state: "ready_future", matched: ["offered", "accepted"].includes(opportunity.status) });
  }
  return [...demandMap.values()];
}

export function demandAggregate(rows = []) {
  const unmatched = rows.filter(row => !row.matched);
  const byDomain = {}, byCity = {}, byInterest = {};
  const byDomainCityMap = new Map();
  for (const row of unmatched) {
    const domain = row.need_domain || "general", city = row.city || "Unspecified";
    byDomain[domain] = (byDomain[domain] || 0) + 1;
    byCity[city] = (byCity[city] || 0) + 1;
    byInterest[row.interest_state] = (byInterest[row.interest_state] || 0) + 1;
    const key = `${domain}|${city}`, existing = byDomainCityMap.get(key);
    if (existing) existing.count += 1;
    else byDomainCityMap.set(key, { domain, city, count: 1 });
  }
  return {
    total_active: rows.length,
    total_unmatched: unmatched.length,
    by_domain: byDomain,
    by_city: byCity,
    by_interest_state: byInterest,
    by_domain_city: [...byDomainCityMap.values()].sort((a, b) => b.count - a.count).slice(0, 40),
    metric_contract: { denominator: "active stated needs plus due permission-granted future interest", dedupe_unit: "household + need_domain", matched_definition: "selected route or later plan stage; offered/accepted future interest" },
  };
}

export function opportunityDemand(rows = [], domain = null, city = null, interest = null) {
  if (!domain) return null;
  const matching = rows.filter(row => row.need_domain === domain && cityMatches(city, row.city) && (interest === "stated_need" ? row.interest_state === "stated_need" : interest === "ready_future" ? row.interest_state === "ready_future" : true));
  return { total: matching.length, past_interview: matching.filter(row => row.interview_status === "completed").length, ready_future: matching.filter(row => row.interest_state === "ready_future").length };
}
