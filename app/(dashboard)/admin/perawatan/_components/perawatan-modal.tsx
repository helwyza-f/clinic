"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function PerawatanModal({ isOpen, onClose, kategoris }: any) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const payload = {
      nama_perawatan: formData.get("nama"),
      kategori_id: formData.get("kategori"),
      harga_normal: Number(formData.get("harga_normal")),
      harga_promo: Number(formData.get("harga_promo")),
      is_active: true,
    };

    const { error } = await supabase.from("perawatan").insert([payload]);
    if (!error) {
      toast.success("Tindakan Medis Berhasil Ditambahkan!");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>Tambah Perawatan</DialogTitle>
        </VisuallyHidden.Root>
        <div className="bg-clinic-gradient p-8 text-white uppercase font-black tracking-widest text-sm">
          Input Layanan Baru
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Nama Perawatan
            </Label>
            <Input
              name="nama"
              placeholder="Contoh: Booster Lips"
              className="rounded-2xl h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Kategori
            </Label>
            <Select name="kategori" required>
              <SelectTrigger className="rounded-2xl h-12">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoris.map((k: any) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Harga Normal
              </Label>
              <Input
                name="harga_normal"
                type="number"
                placeholder="600000"
                className="rounded-2xl h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Harga Promo
              </Label>
              <Input
                name="harga_promo"
                type="number"
                placeholder="310000"
                className="rounded-2xl h-12"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clinic-gradient text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg"
          >
            {loading ? "Menyimpan..." : "Simpan Layanan"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
