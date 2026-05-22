import { createClient } from "@supabase/supabase-js";

// Throw only in the browser. During build/SSR, `process.env.NEXT_PUBLIC_*`
// may not be injected (e.g. preview deploys without env, static prerender of
// /_not-found). Using placeholder strings here is safe because createClient
// doesn't make network calls on construction — the page that actually needs
// Supabase will surface the runtime error when it tries to call .auth.*().
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.invalid";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

if (typeof window !== "undefined") {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase config: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
}

export const supabase = createClient(url, anonKey);
