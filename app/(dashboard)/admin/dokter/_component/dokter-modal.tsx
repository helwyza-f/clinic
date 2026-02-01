"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createDokterWithAuth } from "@/app/actions/dokter"; // Import Server Action
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
import { Edit, UserPlus, Mail, Lock, User, Briefcase } from "lucide-react";
import { toast } from "sonner";

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
      // Logika Update Profil Biasa
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
      // Panggil Server Action untuk registrasi Auth + Simpan DB
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-600">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-pink-500 hover:bg-pink-600 gap-2 shadow-md">
            <UserPlus className="w-4 h-4" /> Tambah Dokter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-pink-900">
            {isEdit ? "Edit Profil Dokter" : "Daftarkan Akun Dokter"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi profil dokter."
              : "Buat akun login sekaligus data profil dokter."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Nama Dokter
            </Label>
            <Input
              name="nama_dokter"
              defaultValue={data?.nama_dokter}
              required
              placeholder="Contoh: dr. Eny"
              className="border-pink-100"
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email (Untuk Login)
            </Label>
            <Input
              name="email"
              type="email"
              defaultValue={data?.email}
              required
              placeholder="email@daesthetic.com"
              className="border-pink-100"
            />
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password Sementara
              </Label>
              <Input
                name="password"
                type="password"
                required
                placeholder="Masukkan password login"
                className="border-pink-100"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Spesialis
            </Label>
            <Input
              name="spesialis"
              defaultValue={data?.spesialis || "Estetika"}
              required
              className="border-pink-100"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 py-6"
          >
            {loading
              ? "Sedang Memproses..."
              : isEdit
                ? "Simpan Perubahan"
                : "Daftarkan Dokter & Akun"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
