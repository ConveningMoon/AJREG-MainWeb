"use client";

import { createClient } from "@supabase/supabase-js";

// Browser Supabase client (public anon key). Used for any client-side reads.
// Listings and team data are public, read-only and protected by RLS policies.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
