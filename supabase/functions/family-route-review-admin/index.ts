import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGIN = "https://aqoon.live";
const PASSWORD_HASH = "67541863bd267f78446b60b489625bdd452dca1bd003fa1e620dd98de2fb6c6d";
const headers = () => ({ "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "content-type, x-tracker-password, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const objectOrEmpty = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
async function sha(value: string) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); }

Deno.serve(async (request) => {
  const responseHeaders = headers();
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: responseHeaders });
  const url = Deno.env.get("SUPABASE_URL"), serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return new Response(JSON.stringify({ error: "server_config" }), { status: 500, headers: responseHeaders });
  const db = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const legacyPassword = request.headers.get("x-tracker-password") || "";
  const passwordOk = Boolean(legacyPassword) && await sha(legacyPassword) === PASSWORD_HASH;
  let operatorId: string | null = null;
  if (!passwordOk) {
    const token = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (token) { const { data, error } = await db.auth.getUser(token); if (!error && data.user) { const { data: operator } = await db.from("operators").select("id").eq("auth_user_id", data.user.id).maybeSingle(); operatorId = operator?.id || null; } }
  }
  if (!passwordOk && !operatorId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });
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
  const { data: interview, error: interviewError } = await db.from("family_interviews").select("id").eq("lead_id", leadId).eq("status", "completed").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (interviewError) return new Response(JSON.stringify({ error: "db_error", detail: interviewError.message }), { status: 500, headers: responseHeaders });
  if (!interview) return new Response(JSON.stringify({ error: "first_interview_required" }), { status: 409, headers: responseHeaders });
  const { data: route, error: routeError } = await db.from("knowledge_routes").select("id,source_ids,verification_state,recheck_after").eq("route_key", routeKey).maybeSingle();
  if (routeError) return new Response(JSON.stringify({ error: "db_error", detail: routeError.message }), { status: 500, headers: responseHeaders });
  if (!route || route.verification_state !== "verified" || (route.recheck_after && new Date(route.recheck_after).getTime() <= Date.now())) return new Response(JSON.stringify({ error: "route_not_currently_verified" }), { status: 409, headers: responseHeaders });
  const matchStatus = ["confirmed_match", "possible_must_confirm", "does_not_fit"].includes(body.match_status) ? body.match_status : "possible_must_confirm";
  const review = { family_lead_id: leadId, interview_id: interview.id, route_id: route.id, operator_id: operatorId || cleanText(body.operator_id, 80), status: "ready_for_review", match_status: matchStatus, facts_used: objectOrEmpty(body.facts_used), missing_fields: Array.isArray(body.missing_fields) ? body.missing_fields : [], conflicting_criteria: Array.isArray(body.conflicting_criteria) ? body.conflicting_criteria : [], source_ids: route.source_ids || [], recommended_next_action: cleanText(body.recommended_next_action, 2500), updated_at: new Date().toISOString() };
  const { data: existing, error: existingError } = await db.from("family_match_runs").select("id").eq("family_lead_id", leadId).eq("interview_id", interview.id).eq("route_id", route.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existingError) return new Response(JSON.stringify({ error: "db_error", detail: existingError.message }), { status: 500, headers: responseHeaders });
  const query = existing ? db.from("family_match_runs").update(review).eq("id", existing.id) : db.from("family_match_runs").insert(review);
  const { data, error } = await query.select().single();
  if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
  return new Response(JSON.stringify({ match_run: data }), { headers: responseHeaders });
});
