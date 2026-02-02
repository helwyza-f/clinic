"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
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
    // 1. Validasi Pre-Check: Pastikan NIK belum terdaftar sebelum membuat Auth User
    if (nik) {
      const { data: existingNik } = await supabaseAdmin
        .from("pasien")
        .select("auth_user_id")
        .eq("nik", nik)
        .maybeSingle();

      if (existingNik)
        return { success: false, error: "NIK sudah terdaftar di sistem." };
    }

    // 2. Daftarkan di Supabase Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "pasien" },
      });

    if (authError) return { success: false, error: authError.message };

    // 3. Update data profil tambahan
    // Menggunakan timeout singkat/retry jika trigger handle_new_user lambat merender baris
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
      // Rollback: Hapus user login jika gagal menyimpan data profil
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
