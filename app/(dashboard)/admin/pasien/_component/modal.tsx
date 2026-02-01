"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPasienWithAuth } from "@/app/actions/pasien"; // Impor action baru
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
import { Edit, Plus, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    if (isEdit) {
      // Update Profil Saja (Gunakan auth_user_id sesuai Primary Key tabel pasien Anda)
      const { error } = await supabase
        .from("pasien")
        .update({
          full_name: rawData.full_name,
          nik: rawData.nik,
          no_telepon: rawData.no_telepon,
          tanggal_lahir: rawData.tanggal_lahir,
          jenis_kelamin: rawData.jenis_kelamin,
          alamat: rawData.alamat,
        })
        .eq("auth_user_id", data.auth_user_id);

      if (!error) {
        toast.success("Profil diperbarui");
        setOpen(false);
        onRefresh();
      } else {
        toast.error(error.message);
      }
    } else {
      // Pendaftaran Baru (Auth + Profil)
      const result = await createPasienWithAuth(rawData);
      if (result.success) {
        toast.success("Pasien & Akun Login berhasil dibuat!");
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
          <Button variant="ghost" size="icon" className="text-pink-600">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-pink-500 hover:bg-pink-600 gap-2">
            <Plus className="w-4 h-4" /> Tambah Pasien
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-pink-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pink-900">
            {isEdit ? "Edit Data Pasien" : "Daftarkan Akun Pasien Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label>Nama Lengkap</Label>
            <Input
              name="full_name"
              defaultValue={data?.full_name}
              required
              className="border-pink-100"
            />
          </div>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Login
                </Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="pasien@email.com"
                  className="border-pink-100"
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Password
                </Label>
                <Input
                  name="password"
                  type="password"
                  required
                  placeholder="******"
                  className="border-pink-100"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>NIK</Label>
              <Input
                name="nik"
                defaultValue={data?.nik}
                className="border-pink-100"
              />
            </div>
            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input
                name="no_telepon"
                defaultValue={data?.no_telepon}
                className="border-pink-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tanggal Lahir</Label>
              <Input
                name="tanggal_lahir"
                type="date"
                defaultValue={data?.tanggal_lahir}
                required
                className="border-pink-100"
              />
            </div>
            <div className="grid gap-2">
              <Label>Jenis Kelamin</Label>
              <Select
                name="jenis_kelamin"
                defaultValue={data?.jenis_kelamin}
                required
              >
                <SelectTrigger className="border-pink-100">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Textarea
              name="alamat"
              defaultValue={data?.alamat}
              required
              className="border-pink-100 h-20"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 py-6"
          >
            {loading
              ? "Memproses..."
              : isEdit
                ? "Simpan Perubahan"
                : "Daftarkan Pasien & Akun"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
