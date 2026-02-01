"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Save, History, Eye } from "lucide-react";

export function RekamMedisModal({
  data,
  onRefresh,
  viewOnly = false,
}: {
  data: any;
  onRefresh: () => void;
  viewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Ambil data rekam medis yang sudah ada jika dalam mode viewOnly
  const existingData = data.rekam_medis?.[0] || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (viewOnly) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      reservasi_id: data.id,
      pasien_id: data.pasien_id,
      diagnosa: formData.get("diagnosa"),
      tindakan: formData.get("tindakan"),
      catatan_tambahan: formData.get("catatan"),
    };

    const { error } = await supabase.from("rekam_medis").insert([payload]);

    if (!error) {
      toast.success("Rekam medis berhasil disimpan!");
      setOpen(false);
      onRefresh();
    } else {
      toast.error("Gagal menyimpan: " + error.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {viewOnly ? (
          <Button
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50 gap-2 text-xs font-bold"
          >
            <Eye className="w-4 h-4" /> Lihat Detail
          </Button>
        ) : (
          <Button className="bg-pink-500 hover:bg-pink-600 gap-2 h-9 text-xs font-bold shadow-sm">
            <FileText className="w-4 h-4" /> Isi Rekam Medis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-pink-900 flex items-center gap-2 border-b pb-4">
            <History className="w-5 h-5 text-pink-500" />
            {viewOnly ? "Detail Rekam Medis" : "Input Medis"}:{" "}
            {data.pasien?.full_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="grid gap-2">
            <Label className="font-bold text-pink-900 text-xs">DIAGNOSA</Label>
            <Textarea
              name="diagnosa"
              defaultValue={existingData.diagnosa}
              readOnly={viewOnly}
              placeholder="Masukkan diagnosa dokter..."
              required
              className="border-pink-100 focus:ring-pink-400 min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-pink-900 text-xs">
              TINDAKAN / TREATMENT
            </Label>
            <Textarea
              name="tindakan"
              defaultValue={existingData.tindakan}
              readOnly={viewOnly}
              placeholder="Tindakan yang diberikan..."
              required
              className="border-pink-100 focus:ring-pink-400 min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-pink-900 text-xs font-medium italic opacity-70">
              Catatan Tambahan
            </Label>
            <Textarea
              name="catatan"
              defaultValue={existingData.catatan_tambahan}
              readOnly={viewOnly}
              className="border-pink-100 min-h-[60px]"
            />
          </div>

          {!viewOnly && (
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 gap-2 py-6 font-bold shadow-lg"
            >
              <Save className="w-5 h-5" />{" "}
              {loading ? "Menyimpan..." : "Simpan Rekam Medis"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
