import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Mengarahkan ke halaman update-password setelah sesi aktif
  const next = searchParams.get("next") ?? "/auth/update-password";

  if (code) {
    const supabase = await createClient();

    // Proses krusial: Tukarkan 'auth_code' menjadi session resmi
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, cookie session otomatis tertanam di browser
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Log error jika pertukaran kode gagal
    console.error("Auth Exchange Error:", error.message);
  }

  // Jika gagal atau kode tidak ada, kembalikan ke login dengan pesan informatif
  return NextResponse.redirect(
    `${origin}/auth/login?error=session_invalid_or_expired`,
  );
}
