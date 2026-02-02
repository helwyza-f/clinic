"use client";

import { useState, useEffect } from "react";
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
import {
  FileText,
  Save,
  Eye,
  Sparkles,
  Stethoscope,
  Loader2,
  X,
  Activity,
} from "lucide-react";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/searchable-select";
import { Badge } from "@/components/ui/badge";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

export function RekamMedisModal({ data, onRefresh, viewOnly = false }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perawatanOptions, setPerawatanOptions] = useState<SearchableOption[]>(
    [],
  );

  const [selectedTindakans, setSelectedTindakans] = useState<any[]>([]);
  const [diagnosa, setDiagnosa] = useState("");
  const [catatan, setCatatan] = useState("");

  const supabase = createClient();
  const existingRM = data.rekam_medis?.[0];

  useEffect(() => {
    if (open) {
      if (existingRM) {
        setDiagnosa(
          existingRM.diagnosa === "Menunggu Pemeriksaan"
            ? ""
            : existingRM.diagnosa,
        );
        setCatatan(existingRM.catatan_tambahan || "");
        const initialTindakans =
          existingRM.detail_tindakan?.map((dt: any) => ({
            value: dt.perawatan.id,
            label: dt.perawatan.nama_perawatan,
            rawHarga: 0,
          })) || [];
        setSelectedTindakans(initialTindakans);
      }

      const fetchPerawatan = async () => {
        const { data: list } = await supabase
          .from("perawatan")
          .select("id, nama_perawatan, harga_promo, harga_normal")
          .eq("is_active", true);
        if (list) {
          setPerawatanOptions(
            list.map((p) => ({
              value: p.id,
              label: p.nama_perawatan,
              rawHarga: p.harga_promo || p.harga_normal,
              description: `Rp ${(p.harga_promo || p.harga_normal).toLocaleString("id-ID")}`,
            })),
          );
        }
      };
      fetchPerawatan();
    }
  }, [open, existingRM, supabase]);

  const addTindakan = (val: string) => {
    const item = perawatanOptions.find((o) => o.value === val);
    if (item && !selectedTindakans.find((s) => s.value === val)) {
      setSelectedTindakans([...selectedTindakans, item]);
    }
  };

  const removeTindakan = (val: string) => {
    if (viewOnly) return;
    setSelectedTindakans(selectedTindakans.filter((s) => s.value !== val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    setLoading(true);

    try {
      let rmId = existingRM?.id;
      if (rmId) {
        const { error: updateError } = await supabase
          .from("rekam_medis")
          .update({
            diagnosa,
            catatan_tambahan: catatan,
            tindakan:
              selectedTindakans.map((t) => t.label).join(", ") ||
              "Konsultasi Umum",
          })
          .eq("id", rmId);
        if (updateError) throw updateError;
      }

      const { error: deleteError } = await supabase
        .from("detail_tindakan")
        .delete()
        .eq("rekam_medis_id", rmId);
      if (deleteError) throw deleteError;

      if (selectedTindakans.length > 0) {
        const detailPayload = selectedTindakans.map((t) => ({
          rekam_medis_id: rmId,
          perawatan_id: t.value,
          harga_saat_ini: t.rawHarga || 0,
        }));
        const { error: insertError } = await supabase
          .from("detail_tindakan")
          .insert(detailPayload);
        if (insertError) throw insertError;
      }

      toast.success("Rekam medis berhasil diperbarui!");
      setOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {viewOnly ? (
          <Button
            variant="ghost"
            className="text-[#959cc9] hover:bg-slate-50 gap-2 text-xs font-black uppercase tracking-widest transition-all"
          >
            <Eye className="w-4 h-4" /> LIHAT DETAIL
          </Button>
        ) : (
          <Button className="bg-clinic-gradient text-white gap-2 h-11 px-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#959cc9]/20 transition-transform active:scale-95">
            <FileText className="w-4 h-4" /> ISI REKAM MEDIS
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Rekam Medis</DialogTitle>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-10 text-white relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                {viewOnly ? "Detail Rekam Medis" : "Pemeriksaan Dokter"}
              </h2>
              <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1.5 italic">
                {data.pasien?.full_name}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            "p-10 space-y-7 max-h-[75vh] overflow-y-auto",
            "scrollbar-thin",
            "[&::-webkit-scrollbar]:w-[6px]",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "hover:[&::-webkit-scrollbar-thumb]:bg-[#d9c3b6]",
          )}
        >
          <div className="space-y-2.5">
            <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Diagnosa Akhir
            </Label>
            <Textarea
              value={diagnosa}
              onChange={(e) => setDiagnosa(e.target.value)}
              readOnly={viewOnly}
              required
              placeholder="Tuliskan analisa hasil pemeriksaan medis di sini..."
              className="border-slate-100 rounded-2xl min-h-[120px] bg-slate-50/50 p-5 text-sm font-medium focus:ring-[#959cc9]/30 transition-all uppercase leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Tindakan Medis yang Diberikan
            </Label>
            {!viewOnly && (
              <SearchableSelect
                options={perawatanOptions}
                value=""
                onChange={addTindakan}
                placeholder="Cari & Tambah Tindakan..."
                className="h-12 text-sm"
              />
            )}

            <div className="flex flex-wrap gap-2.5 pt-2">
              {selectedTindakans.length > 0 ? (
                selectedTindakans.map((t) => (
                  <Badge
                    key={t.value}
                    className="bg-[#fdfcfb] text-slate-700 border-slate-100 px-4 py-2.5 flex items-center gap-3 shadow-sm rounded-xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer group"
                    onClick={() => removeTindakan(t.value)}
                  >
                    <Activity className="w-4 h-4 text-[#d9c3b6]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {t.label}
                    </span>
                    {!viewOnly && (
                      <X className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] font-bold text-slate-300 italic px-1 uppercase tracking-widest leading-loose">
                  Hanya Konsultasi Rutin (Tanpa Tindakan Khusus).
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Catatan & Instruksi Pasien
            </Label>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              readOnly={viewOnly}
              placeholder="Instruksi perawatan di rumah, penggunaan obat/krim, dll..."
              className="border-slate-100 rounded-2xl min-h-[90px] bg-slate-50/50 p-5 text-sm font-medium focus:ring-[#959cc9]/30 transition-all"
            />
          </div>

          {!viewOnly && (
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-clinic-gradient h-20 text-white font-black uppercase rounded-3xl shadow-2xl shadow-[#959cc9]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 tracking-[0.3em] text-xs"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> SIMPAN REKAM MEDIS
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
