import { createClient } from "npm:@supabase/supabase-js@2";
import { requireOperator } from "../_shared/operator-auth.ts";

const ORIGIN = "https://aqoon.live";
const headers = () => ({
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
});
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;

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

  let body: any = {};
  try { body = await request.json(); } catch { /* invalid JSON handled below */ }
  const leadId = text(body.lead_id, 80);
  if (!leadId) return new Response(JSON.stringify({ error: "missing_lead_id" }), { status: 400, headers: responseHeaders });

  if (body.action === "list") {
    const { data, error } = await db.from("family_interview_revisions")
      .select("id,interview_id,revision_number,captured_at,status,urgency,next_action,next_follow_up_at,interview_schema_version")
      .eq("lead_id", leadId).order("captured_at", { ascending: false }).limit(50);
    if (error) return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ revisions: data || [] }), { headers: responseHeaders });
  }

  if (body.action === "restore") {
    if (body.confirm_restore !== true) return new Response(JSON.stringify({ error: "restore_confirmation_required" }), { status: 400, headers: responseHeaders });
    const revisionId = text(body.revision_id, 80);
    if (!revisionId) return new Response(JSON.stringify({ error: "missing_revision_id" }), { status: 400, headers: responseHeaders });
    const { data: revision, error: revisionError } = await db.from("family_interview_revisions").select("*").eq("id", revisionId).eq("lead_id", leadId).maybeSingle();
    if (revisionError || !revision) return new Response(JSON.stringify({ error: "revision_not_found", detail: revisionError?.message }), { status: 404, headers: responseHeaders });
    const { data, error } = await db.from("family_interviews").update({
      answers: revision.answers,
      summary: revision.summary,
      research_prompt: revision.research_prompt,
      next_follow_up_at: revision.next_follow_up_at,
      next_action: revision.next_action,
      urgency: revision.urgency,
      status: revision.status,
      interview_schema_version: revision.interview_schema_version,
      operator_id: operatorId,
      updated_at: new Date().toISOString(),
    }).eq("id", revision.interview_id).eq("lead_id", leadId).select("id,lead_id,interview_type,updated_at").maybeSingle();
    if (error || !data) return new Response(JSON.stringify({ error: "restore_failed", detail: error?.message }), { status: 500, headers: responseHeaders });
    return new Response(JSON.stringify({ interview: data, restored_revision_id: revisionId }), { headers: responseHeaders });
  }
  return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: responseHeaders });
});
