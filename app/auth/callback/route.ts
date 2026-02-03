import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Ambil parameter 'next' dari URL, default ke root jika tidak ada
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Tukarkan 'code' PKCE dari email menjadi session aktif
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, arahkan ke halaman tujuan (update-password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika terjadi kegagalan sistem, kembalikan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/auth/login?error=session_invalid`);
}
