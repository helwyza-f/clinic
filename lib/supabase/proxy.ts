import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasEnvVars) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // KRUSIAL: Bypass middleware jika mengakses rute auth/callback atau auth/confirm
  // Ini mencegah middleware menginterupsi proses verifikasi token/code
  if (
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/auth/confirm")
  ) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  const role = user?.user_metadata?.role || "pasien";

  const isDashboardRoute =
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dokter") ||
    url.pathname.startsWith("/pasien");

  // 1. Logika Proteksi Dashboard
  if (isDashboardRoute) {
    if (!user) {
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    if (!url.pathname.startsWith(`/${role}`)) {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
  }

  // 2. Cegah User login masuk kembali ke halaman login/register (tapi bukan callback)
  if (
    user &&
    url.pathname.startsWith("/auth") &&
    !url.pathname.startsWith("/auth/update-password")
  ) {
    url.pathname = `/${role}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
