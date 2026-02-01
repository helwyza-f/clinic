"use server";

import { createClient } from "@supabase/supabase-js";

// Inisialisasi client admin khusus server dengan Service Role Key
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

export async function createPasienWithAuth(formData: any) {
  const {
    email,
    password,
    full_name,
    nik,
    no_telepon,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
  } = formData;

  try {
    // 1. Daftarkan di Supabase Auth (Langsung Aktif tanpa verifikasi email)
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name,
          role: "pasien", // Agar ditangkap trigger handle_new_user()
        },
      });

    if (authError) return { success: false, error: authError.message };

    // 2. Update data profil tambahan di tabel 'pasien'
    // Kita gunakan UPDATE karena trigger handle_new_user() kemungkinan sudah melakukan INSERT awal
    const { error: dbError } = await supabaseAdmin
      .from("pasien")
      .update({
        nik,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon,
        full_name,
        email,
      })
      .eq("auth_user_id", authUser.user.id);

    if (dbError) {
      // Rollback: Hapus user login jika gagal menyimpan data profil tambahan
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
