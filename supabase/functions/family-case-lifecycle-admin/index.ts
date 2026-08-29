import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGIN = "https://aqoon.live";
const PASSWORD_HASH = "67541863bd267f78446b60b489625bdd452dca1bd003fa1e620dd98de2fb6c6d";
const PLAN_STATUSES = new Set(["research", "options_ready", "action_in_progress", "awaiting_outcome", "persistence_check", "resolved", "closed_unresolved"]);
const EVENT_TYPES = new Set(["interview_completed", "research_completed", "options_presented", "plan_selected", "official_action_started", "official_response_received", "persistence_confirmed", "case_resolved", "case_closed_unresolved", "follow_up_attempted"]);
const OPPORTUNITY_STATUSES = new Set(["watching", "ready", "offered", "accepted", "not_interested", "expired", "closed"]);
const CONTACT_PERMISSIONS = new Set(["not_requested", "granted", "declined", "not_needed"]);
const INTERACTION_TYPES = new Set(["first_interview", "research", "options_call", "follow_up_call", "official_update", "outcome_check"]);
const headers = () => ({
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "content-type, x-tracker-password, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
});

const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const objectOrEmpty = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const isoOrNull = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const medianHours = (values: number[]) => {
  const sorted = values.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return Math.round((sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2) * 10) / 10;
};
async function sha(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  const responseHeaders = headers();
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: responseHeaders });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return new Response(JSON.stringify({ error: "server_config" }), { status: 500, headers: responseHeaders });
  const db = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

  const legacyPassword = request.headers.get("x-tracker-password") || "";
  const passwordOk = Boolean(legacyPassword) && await sha(legacyPassword) === PASSWORD_HASH;
  let operatorId: string | null = null;
  if (!passwordOk) {
    const bearer = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
      const { data: userData, error } = await db.auth.getUser(bearer);
      if (!error && userData.user) {
        const { data: operator } = await db.from("operators").select("id").eq("auth_user_id", userData.user.id).maybeSingle();
        operatorId = operator?.id || null;
      }
    }
  }
  if (!passwordOk && !operatorId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });

  let body: any = {};
  try { body = await request.json(); } catch { /* invalid JSON handled as empty request */ }
  const action = String(body.action || "");

  // Batch fetch lifecycle data for multiple leads
  if (action === "batch_list") {
    const leadIds = Array.isArray(body.lead_ids) ? body.lead_ids.filter((id: any) => typeof id === "string") : [];
    if (!leadIds.length) return new Response(JSON.stringify({ lifecycle: [] }), { headers: responseHeaders });

    const { data: plans, error: plansError } = await db
      .from("family_case_plans")
      .select("family_lead_id, id, plan_status")
      .in("family_lead_id", leadIds);

    const { data: events, error: eventsError } = await db
      .from("family_case_events")
      .select("family_lead_id, id, event_type, created_at")
      .in("family_lead_id", leadIds);

    if (plansError || eventsError) {
      const err = plansError || eventsError;
      return new Response(JSON.stringify({ error: "db_error", detail: err?.message }), { status: 500, headers: responseHeaders });
    }

    const lifecycle = leadIds.map((leadId) => ({
      lead_id: leadId,
      plans: (plans || []).filter((p: any) => p.family_lead_id === leadId),
      events: (events || []).filter((e: any) => e.family_lead_id === leadId),
    }));

    return new Response(JSON.stringify({ lifecycle }), { headers: responseHeaders });
  }

  // Aggregate operational health only; this deliberately returns no names,
  // notes or family-level answers and is separate from anonymous web funnel data.
  if (action === "summary") {
    const now = new Date().toISOString();
    const [plans, opportunities, events] = await Promise.all([
      db.from("family_case_plans").select("plan_status,next_follow_up_at").not("plan_status", "in", "(resolved,closed_unresolved)").limit(2000),
      db.from("family_future_opportunities").select("status,earliest_contact_at,contact_permission_status").in("status", ["watching", "ready", "offered"]).limit(2000),
      db.from("family_case_events").select("case_plan_id,event_type,occurred_at").in("event_type", ["interview_completed", "official_action_started", "official_response_received", "persistence_confirmed", "case_resolved"]).order("occurred_at", { ascending: true }).limit(20000),
    ]);
    const error = plans.error || opportunities.error || events.error;
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    const activePlans = plans.data || [], activeOpportunities = opportunities.data || [];
    const eventTimes = new Map<string, Record<string, number>>();
    for (const event of events.data || []) {
      const planId = String(event.case_plan_id || "");
      const timestamp = new Date(String(event.occurred_at || "")).getTime();
      if (!planId || Number.isNaN(timestamp)) continue;
      const row = eventTimes.get(planId) || {};
      if (row[event.event_type] === undefined) row[event.event_type] = timestamp;
      eventTimes.set(planId, row);
    }
    const hoursBetween = (start: string, end: string) => Array.from(eventTimes.values()).flatMap((row) => row[start] !== undefined && row[end] !== undefined ? [(row[end] - row[start]) / 36e5] : []);
    return new Response(JSON.stringify({
      active_cases: activePlans.length,
      options_ready: activePlans.filter((plan: any) => plan.plan_status === "options_ready").length,
      awaiting_outcome: activePlans.filter((plan: any) => plan.plan_status === "awaiting_outcome").length,
      case_follow_ups_due: activePlans.filter((plan: any) => plan.next_follow_up_at && plan.next_follow_up_at <= now).length,
      future_opportunities_ready_with_permission: activeOpportunities.filter((opportunity: any) => opportunity.contact_permission_status === "granted" && opportunity.earliest_contact_at && opportunity.earliest_contact_at <= now).length,
      cycle_time: {
        interview_to_action_cases: hoursBetween("interview_completed", "official_action_started").length,
        interview_to_action_median_hours: medianHours(hoursBetween("interview_completed", "official_action_started")),
        action_to_response_cases: hoursBetween("official_action_started", "official_response_received").length,
        action_to_response_median_hours: medianHours(hoursBetween("official_action_started", "official_response_received")),
        response_to_persistence_cases: hoursBetween("official_response_received", "persistence_confirmed").length,
        response_to_persistence_median_hours: medianHours(hoursBetween("official_response_received", "persistence_confirmed")),
        resolved_cases: Array.from(eventTimes.values()).filter((row) => row.case_resolved !== undefined).length,
      },
    }), { headers: responseHeaders });
  }
  const leadId = cleanText(body.lead_id, 80);
  if (!leadId) return new Response(JSON.stringify({ error: "missing_lead_id" }), { status: 400, headers: responseHeaders });

  // Was documented (an earlier session's own API spec) but never actually
  // implemented - the tracker's call-history viewer called this action for
  // months against an endpoint that returned unknown_action. family_call_log
  // itself has been correctly written to by family-leads-admin's
  // record_call_outcome action all along; only this read side was missing.
  if (action === "get_call_history") {
    const { data, error } = await db.from("family_call_log").select("id,outcome,next_follow_up_at,notes,created_at,operator_id,operators(display_name)").eq("family_lead_id", leadId).order("created_at", { ascending: false }).limit(50);
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    const calls = (data || []).map((row: any) => ({ id: row.id, outcome: row.outcome, next_follow_up_at: row.next_follow_up_at, notes: row.notes, created_at: row.created_at, operator_name: row.operators?.display_name || null }));
    return new Response(JSON.stringify({ calls }), { headers: responseHeaders });
  }

  if (action === "list") {
    const [plans, events, opportunities, matchRuns, interactions] = await Promise.all([
      db.from("family_case_plans").select("*").eq("family_lead_id", leadId).order("updated_at", { ascending: false }),
      db.from("family_case_events").select("*").eq("family_lead_id", leadId).order("occurred_at", { ascending: false }).limit(200),
      db.from("family_future_opportunities").select("*").eq("family_lead_id", leadId).order("earliest_contact_at", { ascending: true, nullsFirst: false }).limit(100),
      db.from("family_match_runs").select("id,status,match_status,recommended_next_action,created_at,knowledge_routes(route_key,need_domain)").eq("family_lead_id", leadId).in("status", ["ready_for_review", "reviewed", "selected"]).order("created_at", { ascending: false }).limit(50),
      db.from("family_case_interactions").select("*").eq("family_lead_id", leadId).order("created_at", { ascending: false }).limit(100),
    ]);
    const error = plans.error || events.error || opportunities.error || matchRuns.error || interactions.error;
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ plans: plans.data || [], events: events.data || [], opportunities: opportunities.data || [], match_runs: matchRuns.data || [], interactions: interactions.data || [] }), { headers: responseHeaders });
  }

  if (action === "save_plan") {
    const planStatus = PLAN_STATUSES.has(body.plan_status) ? body.plan_status : "research";
    const plan = {
      family_lead_id: leadId,
      match_run_id: cleanText(body.match_run_id, 80),
      owner_operator_id: operatorId || cleanText(body.owner_operator_id, 80),
      title: cleanText(body.title, 240),
      official_decision_maker: cleanText(body.official_decision_maker, 500),
      selected_option: objectOrEmpty(body.selected_option),
      plan_status: planStatus,
      next_action: cleanText(body.next_action, 2500),
      next_follow_up_at: isoOrNull(body.next_follow_up_at),
      resolved_at: planStatus === "resolved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (!plan.title) return new Response(JSON.stringify({ error: "missing_title" }), { status: 400, headers: responseHeaders });
    const id = cleanText(body.id, 80);
    if (!id) {
      const { data: interview, error: interviewError } = await db.from("family_interviews").select("id").eq("lead_id", leadId).eq("status", "completed").limit(1).maybeSingle();
      if (interviewError) return new Response(JSON.stringify({ error: "db_error", detail: interviewError.message }), { status: 500, headers: responseHeaders });
      if (!interview) return new Response(JSON.stringify({ error: "first_interview_required" }), { status: 409, headers: responseHeaders });
    }
    const query = id ? db.from("family_case_plans").update(plan).eq("id", id).eq("family_lead_id", leadId) : db.from("family_case_plans").insert(plan);
    const { data, error } = await query.select().single();
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    // A new practical plan means the family has active work again. This is
    // especially important after a previously resolved plan: preserve the
    // old plan and its outcome, but return the family card to an active CRM
    // state instead of leaving it hidden in the resolved queue.
    if (!id) {
      const { error: leadError } = await db.from("family_leads").update({ status: "contacted", updated_at: new Date().toISOString() }).eq("id", leadId);
      if (leadError) console.error("lead_status_update_failed", leadError.message);
    }
    return new Response(JSON.stringify({ plan: data }), { headers: responseHeaders });
  }

  if (action === "log_event") {
    const eventType = String(body.event_type || "");
    if (!EVENT_TYPES.has(eventType)) return new Response(JSON.stringify({ error: "invalid_event_type" }), { status: 400, headers: responseHeaders });
    const payload = {
      family_lead_id: leadId,
      case_plan_id: cleanText(body.case_plan_id, 80),
      operator_id: operatorId || cleanText(body.operator_id, 80),
      event_type: eventType,
      event_data: objectOrEmpty(body.event_data),
      note: cleanText(body.note, 4000),
      occurred_at: isoOrNull(body.occurred_at) || new Date().toISOString(),
    };
    const { data, error } = await db.from("family_case_events").insert(payload).select().single();
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ event: data }), { headers: responseHeaders });
  }

  if (action === "save_opportunity") {
    const status = OPPORTUNITY_STATUSES.has(body.status) ? body.status : "watching";
    const permission = CONTACT_PERMISSIONS.has(body.contact_permission_status) ? body.contact_permission_status : "not_requested";
    const payload = {
      family_lead_id: leadId,
      case_plan_id: cleanText(body.case_plan_id, 80),
      owner_operator_id: operatorId || cleanText(body.owner_operator_id, 80),
      household_scope: ["adult", "child", "household"].includes(body.household_scope) ? body.household_scope : "household",
      need_domain: cleanText(body.need_domain, 120),
      signal_label: cleanText(body.signal_label, 240),
      signal_source: ["family_requested", "operator_observed", "lifecycle_rule", "service_calendar"].includes(body.signal_source) ? body.signal_source : "operator_observed",
      trigger_type: ["age_window", "deadline", "family_request", "operator_follow_up", "seasonal", "other"].includes(body.trigger_type) ? body.trigger_type : "other",
      earliest_contact_at: isoOrNull(body.earliest_contact_at),
      contact_permission_status: permission,
      status,
      note: cleanText(body.note, 2000),
      updated_at: new Date().toISOString(),
    };
    if (!payload.need_domain || !payload.signal_label) return new Response(JSON.stringify({ error: "missing_opportunity_fields" }), { status: 400, headers: responseHeaders });
    const id = cleanText(body.id, 80);
    const query = id ? db.from("family_future_opportunities").update(payload).eq("id", id).eq("family_lead_id", leadId) : db.from("family_future_opportunities").insert(payload);
    const { data, error } = await query.select().single();
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ opportunity: data }), { headers: responseHeaders });
  }

  if (action === "save_interaction") {
    const interactionType = String(body.interaction_type || "");
    const summary = cleanText(body.summary, 6000);
    if (!INTERACTION_TYPES.has(interactionType)) return new Response(JSON.stringify({ error: "invalid_interaction_type" }), { status: 400, headers: responseHeaders });
    if (!summary) return new Response(JSON.stringify({ error: "missing_interaction_summary" }), { status: 400, headers: responseHeaders });
    const payload = {
      family_lead_id: leadId,
      case_plan_id: cleanText(body.case_plan_id, 80),
      operator_id: operatorId || cleanText(body.operator_id, 80),
      interaction_type: interactionType,
      summary,
      structured_data: objectOrEmpty(body.structured_data),
      next_action: cleanText(body.next_action, 2500),
      next_follow_up_at: isoOrNull(body.next_follow_up_at),
    };
    const { data, error } = await db.from("family_case_interactions").insert(payload).select().single();
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ interaction: data }), { headers: responseHeaders });
  }

  if (action === "get_call_history") {
    const { data: calls, error } = await db
      .from("family_call_log")
      .select("id, family_lead_id, created_at, outcome, next_follow_up_at, notes, operator_id, operators(display_name)")
      .eq("family_lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    const formattedCalls = (calls || []).map((call: any) => ({
      id: call.id,
      lead_id: call.family_lead_id,
      created_at: call.created_at,
      call_outcome: call.outcome,
      duration_seconds: 0,
      operator_name: call.operators?.display_name || "Unknown",
      assigned_operator_id: call.operator_id,
      notes: call.notes || "",
    }));
    return new Response(JSON.stringify({ calls: formattedCalls }), { headers: responseHeaders });
  }

  if (action === "get_timeline") {
    const limit = Math.min(Math.max(parseInt(String(body.limit || 50)), 1), 100);
    const offset = Math.max(parseInt(String(body.offset || 0)), 0);

    const { data: caseEvents, error: eventsError } = await db
      .from("family_case_events")
      .select("id, created_at, event_type, note, operator_id, operators(display_name)")
      .eq("family_lead_id", leadId)
      .order("created_at", { ascending: false });

    const { data: interviews, error: interviewsError } = await db
      .from("family_interviews")
      .select("id, created_at, status, operator_id, operators(display_name)")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    const { data: calls, error: callsError } = await db
      .from("family_call_log")
      .select("id, created_at, outcome, operator_id, operators(display_name)")
      .eq("family_lead_id", leadId)
      .order("created_at", { ascending: false });

    if (eventsError || interviewsError || callsError) {
      const err = eventsError || interviewsError || callsError;
      return new Response(JSON.stringify({ error: "db_error", detail: err?.message }), { status: 500, headers: responseHeaders });
    }

    const events: any[] = [];

    (caseEvents || []).forEach((event: any) => {
      events.push({
        id: event.id,
        created_at: event.created_at,
        event_type: event.event_type,
        description: event.note || "",
        created_by: event.operator_id,
        operator_name: event.operators?.display_name || "Unknown",
        metadata: {},
      });
    });

    (interviews || []).forEach((interview: any) => {
      const eventType = interview.status === "completed" ? "first_interview" : "follow_up_interview";
      events.push({
        id: interview.id,
        created_at: interview.created_at,
        event_type: eventType,
        description: `${eventType.replace(/_/g, " ")}`,
        created_by: interview.operator_id,
        operator_name: interview.operators?.display_name || "Unknown",
        metadata: {},
      });
    });

    (calls || []).forEach((call: any) => {
      const eventType = call.outcome === "reached" ? "call_completed" : "call_no_answer";
      events.push({
        id: call.id,
        created_at: call.created_at,
        event_type: eventType,
        description: `Call: ${call.outcome}`,
        created_by: call.operator_id,
        operator_name: call.operators?.display_name || "Unknown",
        metadata: {},
      });
    });

    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const paginatedEvents = events.slice(offset, offset + limit);

    return new Response(JSON.stringify({ events: paginatedEvents }), { headers: responseHeaders });
  }

  if (action === "get_consent") {
    const { data: lead, error: leadError } = await db
      .from("family_leads")
      .select("id, consent_relevant_updates_ok, consent_outcome_followup_ok, consent_recorded_at")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) return new Response(JSON.stringify({ error: "db_error", detail: leadError.message }), { status: 500, headers: responseHeaders });
    if (!lead) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: responseHeaders });

    const consents = [];
    if (lead.consent_relevant_updates_ok !== null) {
      consents.push({
        id: `${leadId}-relevant-updates`,
        lead_id: leadId,
        type: "communication",
        granted: lead.consent_relevant_updates_ok,
        granted_at: lead.consent_recorded_at,
        expires_at: null,
        granted_by: "family_member",
        notes: "Consent for relevant opportunity updates",
      });
    }
    if (lead.consent_outcome_followup_ok !== null) {
      consents.push({
        id: `${leadId}-outcome-followup`,
        lead_id: leadId,
        type: "follow_up",
        granted: lead.consent_outcome_followup_ok,
        granted_at: lead.consent_recorded_at,
        expires_at: null,
        granted_by: "family_member",
        notes: "Consent for outcome follow-up",
      });
    }

    return new Response(JSON.stringify({ consents }), { headers: responseHeaders });
  }

  if (action === "get_revisions") {
    const interviewTypes = String(body.interview_types || "all");
    const { data: revisions, error } = await db
      .from("family_interview_revisions")
      .select("id, lead_id, interview_id, created_at, answers, operator_id, operators(display_name)")
      .eq("lead_id", leadId)
      .order("captured_at", { ascending: false })
      .limit(50);

    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });

    const formattedRevisions = (revisions || []).map((rev: any) => {
      const oldAnswers = rev.answers || {};
      const changes: any[] = [];

      Object.entries(oldAnswers).forEach(([key, value]) => {
        changes.push({
          id: `${rev.id}-${key}`,
          lead_id: rev.lead_id,
          interview_id: rev.interview_id,
          created_at: rev.created_at,
          field_name: key,
          old_value: value,
          new_value: null,
          changed_by: rev.operator_id,
          operator_name: rev.operators?.display_name || "Unknown",
        });
      });

      return changes;
    }).flat();

    return new Response(JSON.stringify({ revisions: formattedRevisions }), { headers: responseHeaders });
  }

  return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: responseHeaders });
});
