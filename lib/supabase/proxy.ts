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

  // 1. Identifikasi User & Role dari Metadata
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Ambil role dengan fallback 'pasien' agar tidak terjadi rute /undefined
  const role = user?.user_metadata?.role || "pasien";

  // Debugging log untuk memastikan role terbaca di server
  // if (user) console.log("Role Detected:", role);

  const isDashboardRoute =
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dokter") ||
    url.pathname.startsWith("/pasien");

  // 2. Logika Proteksi Dashboard
  if (isDashboardRoute) {
    // Jika tidak ada user, tendang ke login
    if (!user) {
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Hanya redirect jika user mencoba mengakses folder yang BUKAN miliknya
    // Ini mencegah loop jika user sudah berada di folder yang benar
    if (!url.pathname.startsWith(`/${role}`)) {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
  }

  // 3. Cegah User yang sudah login masuk kembali ke halaman Auth
  if (user && url.pathname.startsWith("/auth")) {
    url.pathname = `/${role}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
