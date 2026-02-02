"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPasienWithAuth } from "@/app/actions/pasien";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Plus,
  Mail,
  Lock,
  User,
  Sparkles,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BirthDatePicker } from "@/components/birth-date-picker";
import { format, parseISO } from "date-fns";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function PasienModal({
  onRefresh,
  data,
}: {
  onRefresh: () => void;
  data?: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const isEdit = !!data;

  const [birthDate, setBirthDate] = useState<Date | undefined>(
    data?.tanggal_lahir ? parseISO(data.tanggal_lahir) : undefined,
  );

  useEffect(() => {
    if (data?.tanggal_lahir) setBirthDate(parseISO(data.tanggal_lahir));
  }, [data]);

  const resetForm = () => {
    if (!isEdit) {
      setBirthDate(undefined);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!birthDate) return toast.error("Tanggal lahir wajib diisi");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    if (rawData.nik && String(rawData.nik).length !== 16) {
      setLoading(false);
      return toast.error("NIK harus berjumlah 16 digit");
    }

    const payload = {
      full_name: rawData.full_name,
      nik: rawData.nik,
      no_telepon: rawData.no_telepon,
      tanggal_lahir: format(birthDate, "yyyy-MM-dd"),
      jenis_kelamin: rawData.jenis_kelamin,
      alamat: rawData.alamat,
      email: rawData.email,
      password: rawData.password,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("pasien")
        .update({
          full_name: payload.full_name,
          nik: payload.nik,
          no_telepon: payload.no_telepon,
          tanggal_lahir: payload.tanggal_lahir,
          jenis_kelamin: payload.jenis_kelamin,
          alamat: payload.alamat,
        })
        .eq("auth_user_id", data.auth_user_id);

      if (!error) {
        toast.success("Profil pasien diperbarui");
        setOpen(false);
        onRefresh();
      } else {
        toast.error("Gagal update: " + error.message);
      }
    } else {
      const result = await createPasienWithAuth(payload);
      if (result.success) {
        toast.success("Pasien & Akun berhasil didaftarkan");
        setOpen(false);
        onRefresh();
      } else {
        toast.error(result.error, {
          icon: <AlertCircle className="text-red-500 w-4 h-4" />,
        });
      }
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
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
            <Plus className="w-4 h-4" /> Tambah Pasien
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Kredensial Pasien</DialogTitle>
        </VisuallyHidden.Root>

        {/* Header - Diperkecil paddingnya */}
        <div className="bg-clinic-gradient p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter leading-none">
                {isEdit ? "Edit Profil" : "Registrasi Pasien"}
              </h2>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1 italic">
                D&apos;Aesthetic Database Portal
              </p>
            </div>
          </div>
        </div>

        {/* Form Body - Custom Scrollbar dan Spacing diperketat */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-[#d9c3b6] scrollbar-track-transparent"
        >
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
              Nama Lengkap
            </Label>
            <Input
              name="full_name"
              defaultValue={data?.full_name}
              required
              className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 transition-all uppercase text-xs"
            />
          </div>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                  Email Login
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="email@pasien.com"
                    className="h-11 pl-9 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <Input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••"
                    className="h-11 pl-9 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                NIK (16 Digit)
              </Label>
              <Input
                name="nik"
                type="number"
                defaultValue={data?.nik}
                placeholder="16 Digit NIK"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs tracking-widest"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                No. WhatsApp
              </Label>
              <Input
                name="no_telepon"
                defaultValue={data?.no_telepon}
                placeholder="0812..."
                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                Tanggal Lahir
              </Label>
              <BirthDatePicker
                value={birthDate}
                onChange={setBirthDate}
                className="h-11 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
                Gender
              </Label>
              <Select
                name="jenis_kelamin"
                defaultValue={data?.jenis_kelamin}
                required
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:ring-[#959cc9]/30 text-xs uppercase">
                  <SelectValue placeholder="PILIH..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem
                    value="Laki-laki"
                    className="py-2.5 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Laki-laki
                  </SelectItem>
                  <SelectItem
                    value="Perempuan"
                    className="py-2.5 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Perempuan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.15em]">
              Alamat Lengkap
            </Label>
            <Textarea
              name="alamat"
              defaultValue={data?.alamat}
              required
              className="rounded-xl bg-slate-50/50 border-slate-100 font-medium focus:ring-[#959cc9]/30 min-h-[80px] p-4 text-xs leading-relaxed uppercase"
              placeholder="..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clinic-gradient h-16 text-white font-black uppercase rounded-2xl shadow-xl shadow-[#959cc9]/30 transition-all active:scale-[0.98] disabled:grayscale tracking-[0.3em] text-xs flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {isEdit ? "SIMPAN PERUBAHAN" : "DAFTARKAN PASIEN"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tambahan style inline untuk scrollbar agar benar-benar cantik */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d9c3b6;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
