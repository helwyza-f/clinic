import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Menggunakan getUser() untuk keamanan ekstra pada rute terproteksi
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const role = user?.user_metadata?.role; // Pastikan role disimpan di metadata saat Sign Up

  // 1. CEK SESSION UNTUK HALAMAN /AUTH (Login/Register)
  // Jika sudah ada session, arahkan ke dashboard masing-masing
  if (user && url.pathname.startsWith("/auth")) {
    url.pathname = `/${role || "pasien"}`;
    return NextResponse.redirect(url);
  }

  // 2. PROTEKSI WILAYAH BERDASARKAN ROLE
  if (user) {
    // Blokir Pasien masuk ke Admin atau Dokter
    if (url.pathname.startsWith("/admin") && role !== "admin") {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
    // Blokir Dokter masuk ke Admin
    if (url.pathname.startsWith("/dokter") && role !== "dokter") {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
    // Blokir Admin masuk ke Pasien (Opsional)
    if (url.pathname.startsWith("/pasien") && role !== "pasien") {
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }
  }

  // 3. PROTEKSI DASHBOARD JIKA BELUM LOGIN
  const isDashboardRoute =
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dokter") ||
    url.pathname.startsWith("/pasien");
  // url.pathname.startsWith("/protected");

  if (!user && isDashboardRoute) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
