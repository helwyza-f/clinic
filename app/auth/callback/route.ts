import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Ambil parameter 'next' dari URL, default ke dashboard jika tidak ada
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Tukarkan 'code' menjadi session aktif
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, arahkan ke halaman ganti password (update-password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/auth/login?error=session_invalid`);
}
