import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;

let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!instance) {
    instance = createClient(supabaseUrl, publicAnonKey);
  }
  return instance;
}
