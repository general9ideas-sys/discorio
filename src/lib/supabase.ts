import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "./env";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (isDemoMode()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
