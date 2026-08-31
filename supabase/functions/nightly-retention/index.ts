// AQOON — manual retention maintenance endpoint.
// The nightly schedule itself runs inside Postgres (see the matching migration)
// so no public HTTP token is needed. This endpoint remains available only to
// authenticated AQOON operators for a manual maintenance run.

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

Deno.serve(async (req) => {
  const h = headers();
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: h });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return new Response(JSON.stringify({ error: "supabase_env_missing" }), { status: 500, headers: h });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  if (!await requireOperator(req, supabase)) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: h });

  const results: Record<string, unknown> = { started_at: new Date().toISOString() };

  for (const [key, rpc] of [
    ["interaction_events_cleanup", "cleanup_old_interaction_events"],
    ["pending_erasure_cleanup", "cleanup_pending_erasure_users"],
    ["family_intake_cleanup", "cleanup_family_intake_data"],
  ] as const) {
    try {
      const { data, error } = await supabase.rpc(rpc);
      if (error) throw error;
      results[key] = data;
    } catch (err) {
      results[key + "_error"] = err instanceof Error ? err.message : String(err);
    }
  }

  try {
    const { count, error } = await supabase.from("family_intake_rate_limits").delete({ count: "exact" }).lt("bucket_start", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    results.rate_limit_cleanup = { deleted: count || 0 };
  } catch (err) {
    results.rate_limit_error = err instanceof Error ? err.message : String(err);
  }

  results.completed_at = new Date().toISOString();
  console.log("[AQOON] retention maintenance complete:", JSON.stringify(results));
  return new Response(JSON.stringify(results), { status: 200, headers: h });
});
