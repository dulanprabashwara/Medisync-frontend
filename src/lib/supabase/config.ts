export class SupabaseConfigurationError extends Error {
  constructor() {
    super(
      "Supabase authentication is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new SupabaseConfigurationError();
  }
  return { url, key };
}
