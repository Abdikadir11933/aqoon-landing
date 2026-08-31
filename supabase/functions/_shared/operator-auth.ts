import { createClient } from "npm:@supabase/supabase-js@2";

type OperatorAuth = {
  user: { id: string; email?: string | null };
  operator: { id: string; display_name: string };
};

export function bearerToken(request: Request) {
  return (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1] || null;
}

export async function authenticatedUser(request: Request, db: ReturnType<typeof createClient>) {
  const token = bearerToken(request);
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return !error && data.user ? data.user : null;
}

// The Tracker is private: a valid Supabase session alone is not enough.
// It must belong to an active AQOON operator record.
export async function requireOperator(request: Request, db: ReturnType<typeof createClient>): Promise<OperatorAuth | null> {
  const user = await authenticatedUser(request, db);
  if (!user) return null;
  const { data: operator } = await db
    .from("operators")
    .select("id,display_name")
    .eq("auth_user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  return operator ? { user, operator } : null;
}
