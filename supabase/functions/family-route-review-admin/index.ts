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
