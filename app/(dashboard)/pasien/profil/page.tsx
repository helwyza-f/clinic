"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Fingerprint,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ProfilPasienPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("pasien")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      setProfile(data);
    }
    setLoading(false);
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      full_name: formData.get("full_name"),
      nik: formData.get("nik"),
      no_telepon: formData.get("no_telepon"),
    };

    // PERBAIKAN: Gunakan 'auth_user_id' karena di skema tabel pasien
    // kolom tersebut adalah Primary Key Anda
    const { error } = await supabase
      .from("pasien")
      .update(payload)
      .eq("auth_user_id", profile.auth_user_id); // Ganti dari profile.id

    if (!error) {
      toast.success("Profil berhasil diperbarui!");
      fetchProfile();
    } else {
      // Log ini akan membantu Anda melihat jika ada kendala RLS
      console.error("Update Error:", error.message);
      toast.error("Gagal: " + error.message);
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="text-center py-20 text-pink-500 font-bold">
        Memuat profil...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-3xl bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-100">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-pink-900 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-pink-600/70 text-sm font-medium italic">
            Lengkapi data diri Anda untuk mempermudah pendaftaran medis.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card className="border-pink-100 shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-pink-50/30 border-b border-pink-50 px-8 py-6">
            <CardTitle className="text-sm font-black text-pink-900 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Informasi
              Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Field Nama */}
              <div className="space-y-2">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Nama Lengkap
                </Label>
                <Input
                  name="full_name"
                  defaultValue={profile?.full_name}
                  required
                  className="border-pink-100 focus:ring-pink-400 py-6"
                />
              </div>

              {/* Field NIK */}
              <div className="space-y-2">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5" /> NIK (KTP)
                </Label>
                <Input
                  name="nik"
                  defaultValue={profile?.nik}
                  placeholder="16 Digit NIK Anda"
                  required
                  className="border-pink-100 focus:ring-pink-400 py-6"
                />
              </div>

              {/* Field Email (Read Only) */}
              <div className="space-y-2 opacity-60">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input
                  value={profile?.email}
                  readOnly
                  className="border-pink-100 bg-slate-50 py-6 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 italic mt-1">
                  *Email tidak dapat diubah
                </p>
              </div>

              {/* Field Telepon */}
              <div className="space-y-2">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Nomor Telepon
                </Label>
                <Input
                  name="no_telepon"
                  defaultValue={profile?.no_telepon}
                  required
                  className="border-pink-100 focus:ring-pink-400 py-6"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updating}
              className="w-full md:w-fit bg-pink-600 hover:bg-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
