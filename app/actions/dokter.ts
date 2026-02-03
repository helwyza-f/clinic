"use server";

import { createClient } from "@supabase/supabase-js";

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

  // 1. Daftarkan di Supabase Auth dengan Metadata Role
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: "dokter",
        full_name: nama_dokter,
      },
    });

  if (authError) return { error: authError.message };

  const userId = authUser.user.id;

  try {
    // 2. Gunakan UPSERT alih-alih INSERT untuk tabel Profiles
    // Upsert akan memperbarui jika data sudah ada, sehingga mencegah error "duplicate key"
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        full_name: nama_dokter,
        username: email.split("@")[0],
        role: "dokter",
      },
      { onConflict: "id" }, // Menangani konflik jika ID sudah ada
    );

    if (profileError) throw profileError;

    // 3. Hubungkan ke tabel dokter menggunakan UPSERT juga
    const { error: dbError } = await supabaseAdmin.from("dokter").upsert(
      {
        nama_dokter,
        spesialis,
        email,
        auth_user_id: userId,
      },
      { onConflict: "email" }, // Mencegah duplikasi berdasarkan email dokter
    );

    if (dbError) throw dbError;

    return { success: true };
  } catch (error: any) {
    // Jika masih gagal, kita hapus user Auth agar admin bisa mencoba daftar ulang dari nol
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: error.message || "Gagal sinkronisasi data" };
  }
}
