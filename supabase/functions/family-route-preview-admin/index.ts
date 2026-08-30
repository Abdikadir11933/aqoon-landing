// Deployed but not called from the tracker UI - family-leads-admin's
// match_preview action (wired to interview-match-preview.js) is the live
// route-preview path. Left in place rather than removed/repurposed since
// it is unclear whether anything outside this repo depends on it; do not
// wire a second caller to this function without confirming it should
// replace, not duplicate, match_preview.
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGIN = "https://aqoon.live";
const PASSWORD_HASH = "67541863bd267f78446b60b489625bdd452dca1bd003fa1e620dd98de2fb6c6d";
const headers = () => ({ "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "content-type, x-tracker-password, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
async function sha(value: string) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
function domainsFor(text: string) {
  const domains: string[] = [];
  // The first production seed uses practical domains (daycare, school,
  // hobby, work); the research corpus uses the broader labels in comments.
  // Keep both here while the deterministic knowledge import is completed.
  if (/daycare|p.v.k|xannaano|esiopetus|varhaiskasvatus/.test(text)) domains.push("daycare", "family_finances", "early_childhood");
  if (/school|skuul|dugsi|s2|valmistava/.test(text)) domains.push("school", "school_age");
  if (/hobby|ciyaar|harrastus/.test(text)) domains.push("hobby", "school_age");
  if (/education|waxbar|finnish|yki|shahaad|language|apprentice/.test(text)) domains.push("adult_education", "work");
  if (/work|shaq|employment|job/.test(text)) domains.push("work", "income_and_unemployment", "employment");
  if (/support|adeeg|taageero|wellbeing|vamma|kuntou|omaisho|senior|kriis/.test(text)) domains.push("wellbeing");
  if (/housing|debt|dayn|asum|perhe|family|elatus|starttiraha|business|ganacsi/.test(text)) domains.push("housing_debt_family");
  if (/program|barnaamij|hanke|grant|avustus/.test(text)) domains.push("live_programme");
  return domains.length ? domains : ["general"];
}

Deno.serve(async (request) => {
  const responseHeaders = headers();
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: responseHeaders });
  const url = Deno.env.get("SUPABASE_URL"), serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return new Response(JSON.stringify({ error: "server_config" }), { status: 500, headers: responseHeaders });
  const db = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const legacyPassword = request.headers.get("x-tracker-password") || "";
  const passwordOk = Boolean(legacyPassword) && await sha(legacyPassword) === PASSWORD_HASH;
  if (!passwordOk) {
    const token = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });
    const { data: operator } = await db.from("operators").select("id").eq("auth_user_id", data.user.id).maybeSingle();
    if (!operator) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: responseHeaders });
  }
  let body: any = {}; try { body = await request.json(); } catch { /* handled below */ }
  const leadId = typeof body.lead_id === "string" ? body.lead_id.trim() : "";
  if (!leadId) return new Response(JSON.stringify({ error: "missing_lead_id" }), { status: 400, headers: responseHeaders });
  const { data: lead, error: leadError } = await db.from("family_leads").select("city,main_need,sub_need,additional_needs").eq("id", leadId).maybeSingle();
  if (leadError || !lead) return new Response(JSON.stringify({ error: "lead_not_found" }), { status: 404, headers: responseHeaders });
  const domains = domainsFor(JSON.stringify([lead.main_need, lead.sub_need, lead.additional_needs || []]).toLowerCase());
  const { data: routes, error: routeError } = await db.from("knowledge_routes").select("id,route_key,need_domain,required_inputs,blocking_inputs,steps,source_ids,partner_disclosure_required,recheck_after,knowledge_criteria(label,criterion_type,field_key)").in("need_domain", domains).eq("verification_state", "verified").limit(50);
  if (routeError) return new Response(JSON.stringify({ error: "db_error", detail: routeError.message }), { status: 500, headers: responseHeaders });
  const now = Date.now(), answers = body.answers && typeof body.answers === "object" ? body.answers : {}, city = String(lead.city || "").toLowerCase();
  const active = (routes || []).filter((route: any) => !route.recheck_after || new Date(route.recheck_after).getTime() > now);
  const sourceIds = [...new Set(active.flatMap((route: any) => route.source_ids || []))];
  const { data: sources, error: sourceError } = sourceIds.length ? await db.from("knowledge_sources").select("id,canonical_url,title,recheck_after,verification_state").in("id", sourceIds) : { data: [], error: null };
  if (sourceError) return new Response(JSON.stringify({ error: "db_error", detail: sourceError.message }), { status: 500, headers: responseHeaders });
  const sourceById = new Map((sources || []).map((source: any) => [source.id, source]));
  const valueFor = (key: string) => answers[key] || (key === "city" ? city : "");
  const candidates = active.map((route: any) => {
    const missing = (route.required_inputs || []).filter((key: string) => !valueFor(key));
    const sourceIssues = (route.source_ids || []).filter((id: string) => {
      const source: any = sourceById.get(id);
      return !source || source.verification_state !== "verified" || (source.recheck_after && new Date(source.recheck_after).getTime() <= now);
    });
    return { route_key: route.route_key, match_status: "possible_must_confirm", missing_fields: missing, conflicting_criteria: sourceIssues.length ? ["One or more supporting sources need a current check."] : [], criteria: (route.knowledge_criteria || []).map((criterion: any) => ({ label: criterion.label, type: criterion.criterion_type, field_key: criterion.field_key })), steps: route.steps || [], partner_disclosure_required: Boolean(route.partner_disclosure_required), sources: (route.source_ids || []).map((id: string) => sourceById.get(id)).filter(Boolean).map((source: any) => ({ title: source.title, url: source.canonical_url })) };
  });
  return new Response(JSON.stringify({ preview_mode: "read_only", domains, candidates }), { headers: responseHeaders });
});
