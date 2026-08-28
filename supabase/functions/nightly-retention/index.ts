// AQOON — nightly retention job
// Runs once a day via Supabase scheduled trigger.
// Each cleanup runs independently so one failure does not block the others.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "supabase_env_missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results: Record<string, unknown> = {
    started_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.rpc("cleanup_old_interaction_events");
    if (error) throw error;
    results.interaction_events_cleanup = data;
  } catch (err) {
    results.interaction_events_error = err instanceof Error ? err.message : String(err);
  }

  try {
    const { data, error } = await supabase.rpc("cleanup_pending_erasure_users");
    if (error) throw error;
    results.pending_erasure_cleanup = data;
  } catch (err) {
    results.pending_erasure_error = err instanceof Error ? err.message : String(err);
  }

  try {
    const { data, error } = await supabase.rpc("cleanup_family_intake_data");
    if (error) throw error;
    results.family_intake_cleanup = data;
  } catch (err) {
    results.family_intake_error = err instanceof Error ? err.message : String(err);
  }

  results.completed_at = new Date().toISOString();
  console.log("[AQOON] nightly-retention complete:", JSON.stringify(results));

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});

