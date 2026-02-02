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
  Sparkles,
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

    const { error } = await supabase
      .from("pasien")
      .update(payload)
      .eq("auth_user_id", profile.auth_user_id);

    if (!error) {
      toast.success("Profil berhasil diperbarui!");
      fetchProfile();
    } else {
      toast.error("Gagal: " + error.message);
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
        <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Memuat Profil...
        </p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header Profile - Mobile Friendly */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 px-2 text-center sm:text-left">
        <div className="relative group">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#959cc9] to-[#d9c3b6] flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-white">
            <User className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
            <Sparkles className="w-3 h-3 text-[#d9c3b6] fill-[#d9c3b6]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            Pengaturan Akun
          </h1>
          <p className="text-slate-400 text-xs font-medium italic mt-2">
            Kelola identitas medis Anda untuk layanan yang lebih cepat.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 px-1">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d9c3b6]" /> Identitas
              Terverifikasi
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Field Nama */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Nama Lengkap Pasien
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
                  <Input
                    name="full_name"
                    defaultValue={profile?.full_name}
                    required
                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-[#959cc9]/20 font-bold text-sm"
                  />
                </div>
              </div>

              {/* Field NIK */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  NIK (Sesuai KTP)
                </Label>
                <div className="relative group">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
                  <Input
                    name="nik"
                    defaultValue={profile?.nik}
                    placeholder="16 digit nomor kependudukan"
                    required
                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-[#959cc9]/20 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Field Email (Read Only) */}
                <div className="space-y-3 opacity-60">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Email Terdaftar
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      value={profile?.email}
                      readOnly
                      className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-100 cursor-not-allowed font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Field Telepon */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    WhatsApp / Telepon
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
                    <Input
                      name="no_telepon"
                      defaultValue={profile?.no_telepon}
                      required
                      className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-[#959cc9]/20 font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full h-16 bg-gradient-to-r from-[#959cc9] to-[#b0b8e3] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Menyingkronkan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Perbarui Profil
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </form>

      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] pt-4">
        D&apos;Aesthetic Member Protection System
      </p>
    </div>
  );
}
