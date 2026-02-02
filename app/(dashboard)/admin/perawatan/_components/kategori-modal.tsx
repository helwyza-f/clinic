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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FolderPlus } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface KategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function KategoriModal({
  isOpen,
  onClose,
  onRefresh,
}: KategoriModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const nama_kategori = formData.get("nama_kategori") as string;
    const deskripsi = formData.get("deskripsi") as string;

    try {
      const { error } = await supabase
        .from("kategori_perawatan")
        .insert([{ nama_kategori, deskripsi }]);

      if (error) throw error;

      toast.success("Kategori baru berhasil ditambahkan!");
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>Tambah Kategori Perawatan</DialogTitle>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-8 text-white">
          <div className="flex items-center gap-3">
            <FolderPlus className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-widest">
              Master Kategori
            </h2>
          </div>
          <p className="text-white/70 text-[10px] font-bold mt-2 uppercase tracking-tighter">
            Pengelompokan layanan medis klinik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nama Kategori
            </Label>
            <Input
              name="nama_kategori"
              placeholder="Contoh: SKINBOOSTER"
              className="rounded-2xl border-slate-100 h-12 focus:ring-[#959cc9]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Deskripsi Singkat
            </Label>
            <Textarea
              name="deskripsi"
              placeholder="Jelaskan secara singkat jenis perawatan ini..."
              className="rounded-2xl border-slate-100 min-h-[100px] focus:ring-[#959cc9]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-clinic-gradient text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#959cc9]/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "SIMPAN KATEGORI"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
