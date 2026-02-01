"use server";

import { createClient } from "@supabase/supabase-js";

// Inisialisasi client admin khusus server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function createDokterWithAuth(formData: any) {
  const { email, password, nama_dokter, spesialis } = formData;

  // 1. Daftarkan di Supabase Auth (Langsung Aktif)
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

  if (authError) return { error: authError.message };

  // 2. Hubungkan ke tabel profil dokter
  const { error: dbError } = await supabaseAdmin.from("dokter").insert([
    {
      nama_dokter,
      spesialis,
      email,
      auth_user_id: authUser.user.id, // ID unik dari login masuk ke sini
    },
  ]);

  if (dbError) {
    // Jika simpan profil gagal, hapus user login-nya (biar tidak error saat coba lagi)
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return { error: dbError.message };
  }

  return { success: true };
}
