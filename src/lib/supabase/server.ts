import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for Server Components / route handlers.
// Uses the public anon key for read-only access to public marketing data
// (listings, team). RLS policies must allow anonymous SELECT on those tables.
// The service-role key is intentionally NOT used here to avoid leaking
// elevated access into rendered pages.
export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
