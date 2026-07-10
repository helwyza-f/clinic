"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createDokterWithAuth } from "@/app/actions/dokter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit,
  UserPlus,
  Mail,
  Lock,
  User,
  Briefcase,
  Sparkles,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function DokterModal({
  onRefresh,
  data,
}: {
  onRefresh: () => void;
  data?: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!data;
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    if (isEdit) {
      const { error } = await supabase
        .from("dokter")
        .update({
          nama_dokter: rawData.nama_dokter,
          spesialis: rawData.spesialis,
          email: rawData.email,
        })
        .eq("id", data.id);

      if (!error) {
        toast.success("Data profil diperbarui");
        setOpen(false);
        onRefresh();
      } else {
        toast.error(error.message);
      }
    } else {
      const result = await createDokterWithAuth(rawData);
      if (result.success) {
        toast.success("Dokter & Akun Login berhasil didaftarkan!");
        setOpen(false);
        onRefresh();
      } else {
        toast.error("Gagal: " + result.error);
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-[#959cc9] hover:bg-slate-50 rounded-xl transition-all"
          >
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <button className="bg-clinic-gradient text-white px-10 py-4 rounded-[1.5rem] font-black text-xs shadow-2xl active:scale-95 transition-all tracking-[0.2em] flex items-center gap-2 uppercase">
            <UserPlus className="w-4 h-4" /> Tambah Dokter
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Kredensial Tenaga Medis</DialogTitle>
          <DialogDescription>
            Input data identitas dan akun login dokter.
          </DialogDescription>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
                {isEdit ? "Update Profil" : "Registrasi Dokter"}
              </h2>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1.5 italic">
                D&apos;Aesthetic Staff Portal
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Nama Tenaga Medis
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <Input
                name="nama_dokter"
                defaultValue={data?.nama_dokter}
                required
                placeholder="dr. Helwiza Fahry"
                className="h-14 pl-11 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 transition-all uppercase text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Alamat Email Otoritas
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <Input
                name="email"
                type="email"
                defaultValue={data?.email}
                required
                placeholder="helwiza@daesthetic.com"
                className="h-14 pl-11 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
                Kata Sandi Akses
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <Input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-14 pl-11 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Spesialisasi Medis
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <Input
                name="spesialis"
                defaultValue={data?.spesialis || "Estetika & Kecantikan"}
                required
                className="h-14 pl-11 rounded-2xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clinic-gradient h-16 text-white font-black uppercase rounded-[1.25rem] shadow-2xl shadow-[#959cc9]/30 transition-all active:scale-[0.98] disabled:grayscale tracking-[0.3em] text-xs flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />{" "}
                {isEdit ? "SIMPAN PERUBAHAN" : "DAFTARKAN DOKTER"}
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
