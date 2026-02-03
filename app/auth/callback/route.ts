import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/update-password";

  if (code) {
    const supabase = await createClient();

    // Tukarkan kode menjadi session aktif
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika sukses, arahkan ke halaman ganti password
      return NextResponse.redirect(`${origin}${next}`);
    }

    // DEBUG: Cek error di console server jika gagal
    console.error("Auth Callback Error:", error.message);
  }

  // Jika gagal, arahkan ke login dengan pesan error yang Anda alami sekarang
  return NextResponse.redirect(
    `${origin}/auth/login?error=session_invalid_or_expired`,
  );
}
