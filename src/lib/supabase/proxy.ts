import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function refreshSupabaseSession(request: NextRequest) {
  let config: ReturnType<typeof getSupabaseConfig>;
  try {
    config = getSupabaseConfig();
  } catch {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Session refresh must not hold every page navigation indefinitely when the
  // auth service or network is temporarily unavailable. Client auth can retry.
  try {
    await Promise.race([
      supabase.auth.getClaims(),
      new Promise<void>((resolve) => setTimeout(resolve, 8_000)),
    ]);
  } catch {
    // Continue with the current cookies; protected pages still validate through
    // Supabase and the API before showing role-specific data.
  }
  return response;
}
