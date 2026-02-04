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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Mengambil role dari metadata yang ditanam saat login
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

    // Pastikan user tidak melompat ke dashboard role lain
    if (!url.pathname.startsWith(`/${role}`)) {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
  }

  // 2. Cegah User login masuk kembali ke halaman Auth (kecuali update-password)
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
