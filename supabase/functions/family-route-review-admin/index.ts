import { createClient } from "npm:@supabase/supabase-js@2";
import { requireOperator } from "../_shared/operator-auth.ts";

const ORIGIN = "https://aqoon.live";
const headers = () => ({ "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const objectOrEmpty = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const REASON_CODES = new Set(["criterion_conflict", "wrong_need", "family_preference", "provider_unavailable", "information_outdated", "duplicate_route", "other"]);

Deno.serve(async (request) => {
  const responseHeaders = headers();
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: responseHeaders });
  const url = Deno.env.get("SUPABASE_URL"), serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return new Response(JSON.stringify({ error: "server_config" }), { status: 500, headers: responseHeaders });
  const db = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = await requireOperator(request, db);
  if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });
  const operatorId = auth.operator.id;
  let body: any = {}; try { body = await request.json(); } catch { /* handled below */ }
  const leadId = cleanText(body.lead_id, 80), action = String(body.action || "");

  if (action === "learning_summary") {
    const { data, error } = await db.from("knowledge_feedback_signals")
      .select("id,reason_code,criterion_fields,review_status,created_at,updated_at,knowledge_routes(route_key,need_domain,verification_state,recheck_after)")
      .in("review_status", ["pending_review", "accepted"])
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    const grouped = new Map<string, any>();
    for (const row of data || []) {
      const route: any = (row as any).knowledge_routes || {};
      const fields = Array.isArray(row.criterion_fields) ? [...row.criterion_fields].sort() : [];
      const key = [route.route_key || "unknown", row.reason_code, fields.join("|")].join("::");
      const current = grouped.get(key) || {
        route_key: route.route_key || "unknown",
        need_domain: route.need_domain || "general",
        reason_code: row.reason_code,
        criterion_fields: fields,
        review_status: row.review_status,
        affected_cases: 0,
        signal_ids: [],
        first_seen_at: row.created_at,
        last_seen_at: row.updated_at,
        route_verification_state: route.verification_state || null,
        route_recheck_after: route.recheck_after || null,
      };
      current.affected_cases += 1;
      current.signal_ids.push(row.id);
      if (row.review_status === "accepted") current.review_status = "accepted";
      if (String(row.updated_at) > String(current.last_seen_at)) current.last_seen_at = row.updated_at;
      grouped.set(key, current);
    }
    const groups = [...grouped.values()].sort((a, b) => b.affected_cases - a.affected_cases || String(a.first_seen_at).localeCompare(String(b.first_seen_at)));
    return new Response(JSON.stringify({
      pending_signals: (data || []).filter((row: any) => row.review_status === "pending_review").length,
      accepted_signals: (data || []).filter((row: any) => row.review_status === "accepted").length,
      groups,
    }), { headers: responseHeaders });
  }

  if (action === "review_feedback") {
    const signalId = cleanText(body.signal_id, 80), decision = cleanText(body.decision, 40), note = cleanText(body.review_note, 2000);
    if (!signalId || !decision || !note) return new Response(JSON.stringify({ error: "missing_feedback_review_fields" }), { status: 400, headers: responseHeaders });
    const { data, error } = await db.rpc("aqoon_review_route_feedback_signal", {
      p_signal_id: signalId,
      p_operator_id: operatorId,
      p_decision: decision,
      p_review_note: note,
      p_official_sources_checked: body.official_sources_checked === true,
      p_knowledge_change_reference: cleanText(body.knowledge_change_reference, 500),
    });
    if (error) {
      const known = ["invalid_feedback_decision", "feedback_review_note_required", "official_source_check_required", "knowledge_change_reference_required", "feedback_signal_not_reviewable"].find((code) => error.message?.includes(code));
      return new Response(JSON.stringify({ error: known || "db_error", ...(known ? {} : { detail: error.message }) }), { status: known === "feedback_signal_not_reviewable" ? 409 : known ? 400 : 500, headers: responseHeaders });
    }
    return new Response(JSON.stringify({ feedback_signal: data }), { headers: responseHeaders });
  }

  if (!leadId) return new Response(JSON.stringify({ error: "missing_lead_id" }), { status: 400, headers: responseHeaders });

  if (action === "list") {
    const { data, error } = await db.from("family_match_runs").select("id,status,match_status,missing_fields,conflicting_criteria,recommended_next_action,reviewed_at,created_at,knowledge_routes(route_key,need_domain)").eq("family_lead_id", leadId).order("created_at", { ascending: false }).limit(100);
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ match_runs: data || [] }), { headers: responseHeaders });
  }

  if (action !== "save_review") return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: responseHeaders });
  const routeKey = cleanText(body.route_key, 240);
  if (!routeKey) return new Response(JSON.stringify({ error: "missing_route_key" }), { status: 400, headers: responseHeaders });
  // Fast boundary check for a clear 409; the transactional RPC repeats and
  // locks this invariant before it writes anything.
  const { data: interview, error: interviewError } = await db.from("family_interviews").select("id").eq("lead_id", leadId).eq("status", "completed").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (interviewError) return new Response(JSON.stringify({ error: "db_error", detail: interviewError.message }), { status: 500, headers: responseHeaders });
  if (!interview) return new Response(JSON.stringify({ error: "first_interview_required" }), { status: 409, headers: responseHeaders });
  const matchStatus = ["confirmed_match", "possible_must_confirm", "does_not_fit"].includes(body.match_status) ? body.match_status : "possible_must_confirm";
  const reasonCode = cleanText(body.reason_code, 80);
  if (matchStatus === "does_not_fit" && (!reasonCode || !REASON_CODES.has(reasonCode))) return new Response(JSON.stringify({ error: "feedback_reason_required" }), { status: 400, headers: responseHeaders });
  const criterionFields = Array.isArray(body.criterion_fields) ? body.criterion_fields.filter((value: unknown) => typeof value === "string").map((value: string) => value.trim().slice(0, 120)).filter(Boolean).slice(0, 30) : [];
  const { data, error } = await db.rpc("aqoon_save_route_review", {
    p_lead_id: leadId,
    p_operator_id: operatorId,
    p_route_key: routeKey,
    p_match_status: matchStatus,
    p_facts_used: objectOrEmpty(body.facts_used),
    p_missing_fields: Array.isArray(body.missing_fields) ? body.missing_fields : [],
    p_conflicting_criteria: Array.isArray(body.conflicting_criteria) ? body.conflicting_criteria : [],
    p_recommended_next_action: cleanText(body.recommended_next_action, 2500),
    p_reason_code: reasonCode,
    p_criterion_fields: criterionFields,
  });
  if (error) {
    const known = ["lead_not_found", "first_interview_required", "route_not_currently_verified", "invalid_match_status", "invalid_review_payload", "feedback_reason_required", "too_many_criterion_fields"].find((code) => error.message?.includes(code));
    const status = known === "lead_not_found" ? 404 : known === "first_interview_required" || known === "route_not_currently_verified" ? 409 : known ? 400 : 500;
    return new Response(JSON.stringify({ error: known || "db_error", ...(known ? {} : { detail: error.message }) }), { status, headers: responseHeaders });
  }
  return new Response(JSON.stringify(data || {}), { headers: responseHeaders });
});
