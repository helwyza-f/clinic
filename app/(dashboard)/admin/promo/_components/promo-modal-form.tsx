"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Loader2, Upload, Sparkles } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function PromoModalForm({
  isOpen,
  onClose,
  onRefresh,
}: PromoModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [ctaText, setCtaText] = useState("Booking Sekarang");
  const [file, setFile] = useState<File | null>(null);

  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return toast.error("Judul dan Gambar wajib diisi!");

    setLoading(true);
    try {
      // 1. Upload Gambar ke Bucket 'banners'
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Dapatkan Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("banners").getPublicUrl(fileName);

      // 3. Simpan Metadata ke Tabel 'promos'
      const { error: dbError } = await supabase.from("promos").insert([
        {
          title,
          image_url: publicUrl,
          cta_text: ctaText,
          is_active: true,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("Konten Promo Berhasil Diterbitkan!");
      resetForm();
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error("Gagal mengunggah: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCtaText("Booking Sekarang");
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none p-0 overflow-hidden bg-white shadow-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>Tambah Konten Promo Baru</DialogTitle>
          <DialogDescription>
            Formulir untuk mengunggah banner promo klinik.
          </DialogDescription>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 fill-white" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Terbitkan Promo
            </h2>
          </div>
          <p className="text-white/80 text-xs font-medium italic">
            Aset visual akan tampil otomatis di portal pasien & beranda.
          </p>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Judul Konten (Internal)
            </Label>
            <Input
              placeholder="Contoh: Jantastic Januari 55%"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border-slate-100 h-12 focus:ring-[#959cc9]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Teks Tombol (CTA)
            </Label>
            <Select onValueChange={setCtaText} defaultValue={ctaText}>
              <SelectTrigger className="rounded-2xl border-slate-100 h-12">
                <SelectValue placeholder="Pilih Teks Tombol" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="Booking Sekarang">
                  Booking Sekarang
                </SelectItem>
                <SelectItem value="Lihat Detail">Lihat Detail</SelectItem>
                <SelectItem value="Ambil Promo">Ambil Promo</SelectItem>
                <SelectItem value="Konsultasi Gratis">
                  Konsultasi Gratis
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              File Banner (Rasio 4:5 Disarankan)
            </Label>
            <div className="relative group">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="promo-file"
              />
              <label
                htmlFor="promo-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-100 rounded-2xl cursor-pointer group-hover:bg-slate-50 transition-all"
              >
                {file ? (
                  <div className="text-xs font-bold text-[#959cc9] truncate max-w-[200px]">
                    {file.name}
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-300 mb-2" />
                    <span className="text-[10px] font-bold text-slate-400">
                      KLIK UNTUK UNGGAH GAMBAR
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl font-bold text-slate-400"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-clinic-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#959cc9]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Publish Sekarang"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
