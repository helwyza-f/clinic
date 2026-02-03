"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
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
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
  HeartPulse,
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
  // Mengambil data rekam medis pertama dari array relasi
  const existingRM = data?.rekam_medis?.[0];

  useEffect(() => {
    if (open) {
      if (existingRM) {
        setDiagnosa(
          existingRM.diagnosa === "Menunggu Pemeriksaan"
            ? ""
            : existingRM.diagnosa,
        );
        // Perbaikan: Memastikan catatan_tambahan sinkron ke state saat modal dibuka
        setCatatan(existingRM.catatan_tambahan || "");
        setSelectedTindakans(
          existingRM.detail_tindakan?.map((dt: any) => ({
            value: dt.perawatan?.id,
            label: dt.perawatan?.nama_perawatan,
            rawHarga: dt.harga_saat_ini || 0,
          })) || [],
        );
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
              description: `Rate: Rp ${(p.harga_promo || p.harga_normal).toLocaleString("id-ID")}`,
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

        await supabase
          .from("detail_tindakan")
          .delete()
          .eq("rekam_medis_id", rmId);

        if (selectedTindakans.length > 0) {
          const detailPayload = selectedTindakans.map((t) => ({
            rekam_medis_id: rmId,
            perawatan_id: t.value,
            harga_saat_ini: t.rawHarga || 0,
          }));
          await supabase.from("detail_tindakan").insert(detailPayload);
        }
      }
      toast.success("Arsip medis diperbarui.");
      setOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem.");
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
            className="text-[#959cc9] hover:bg-slate-50 gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl border border-slate-100 h-9 px-4"
          >
            <Eye className="w-3.5 h-3.5" /> Lihat Arsip
          </Button>
        ) : (
          <Button className="bg-[#959cc9] hover:bg-[#868db8] text-white gap-2 h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
            <FileText className="w-3.5 h-3.5 text-[#d9c3b6]" /> Rekam Medis
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[850px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Medical Intelligence Hub</DialogTitle>
        </VisuallyHidden.Root>

        {/* Header Premium: Lavender Gold Contrast */}
        <div className="bg-gradient-to-r from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] p-7 lg:px-10 text-white relative border-b border-white/10 shadow-lg">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                <HeartPulse className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
                  {viewOnly ? "Arsip Digital Pasien" : "Pemeriksaan Medis"}
                </h2>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-black/20 text-white border-none font-black text-[9px] px-3 py-0.5 rounded-lg uppercase tracking-widest backdrop-blur-sm">
                    {data?.pasien?.full_name || "Pasien"}
                  </Badge>
                  {/* Perbaikan: Menggunakan optional chaining dan fallback agar tidak error slice */}
                  <span className="text-[10px] font-bold text-white/70 uppercase">
                    ID: {data?.id ? data.id.slice(-6).toUpperCase() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-[#d9c3b6]" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Official Medical Log
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            "p-8 lg:p-10 max-h-[75vh] overflow-y-auto no-scrollbar",
            "lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0 space-y-8",
          )}
        >
          {/* Section 1: Diagnosa & Tindakan */}
          <div className="space-y-8 lg:border-r lg:border-slate-100 lg:pr-10">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-900 ml-1 tracking-[0.2em] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#959cc9]" /> Diagnosa
                Klinis
              </Label>
              <Textarea
                value={diagnosa}
                onChange={(e) => setDiagnosa(e.target.value)}
                readOnly={viewOnly}
                required
                placeholder="Deskripsi temuan klinis..."
                className="border-slate-200 rounded-2xl min-h-[180px] bg-slate-50/50 p-5 text-[13px] font-black text-slate-900 focus:ring-[#959cc9]/20 transition-all uppercase leading-relaxed placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#959cc9]" /> Rencana
                Tindakan
              </Label>
              {!viewOnly && (
                <SearchableSelect
                  options={perawatanOptions}
                  value=""
                  onChange={addTindakan}
                  placeholder="Cari Perawatan..."
                  className="h-11 text-xs rounded-xl border-slate-200"
                />
              )}
              <div className="flex flex-wrap gap-2.5">
                {selectedTindakans.length > 0 ? (
                  selectedTindakans.map((t) => (
                    <Badge
                      key={t.value}
                      className="bg-white text-slate-900 border-2 border-slate-50 px-4 py-2 flex items-center gap-3 shadow-md rounded-xl hover:border-[#959cc9]/40 transition-all group"
                      onClick={() => removeTindakan(t.value)}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d9c3b6]" />
                      <span className="text-[10px] font-black uppercase">
                        {t.label}
                      </span>
                      {!viewOnly && (
                        <X className="w-3.5 h-3.5 text-red-400 opacity-0 group-hover:opacity-100 transition-all" />
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-300 italic py-2 uppercase tracking-widest px-2">
                    Tidak ada tindakan spesifik
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Instruksi & Verifikasi */}
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-900 ml-1 tracking-[0.2em] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#959cc9]" /> Instruksi
                After-Care
              </Label>
              <Textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                readOnly={viewOnly}
                placeholder="Catatan perawatan mandiri pasien..."
                className="border-slate-200 rounded-2xl min-h-[180px] bg-slate-50/50 p-5 text-[13px] font-black text-slate-900 focus:ring-[#959cc9]/20 transition-all uppercase leading-relaxed placeholder:text-slate-300"
              />
            </div>

            <div className="p-7 bg-[#fdfcfb] rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col gap-5 shadow-inner">
              <div className="flex items-center gap-3 opacity-90">
                <ClipboardCheck className="w-5 h-5 text-[#959cc9]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                  Verified Clinical Record
                </span>
              </div>

              {!viewOnly ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-[#959cc9] h-14 text-white font-black uppercase rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-[0.3em] text-[10px]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#d9c3b6]" /> Update
                      Database
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white/60 p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    Arsip Terverifikasi Sistem
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100 shadow-inner">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.8em]">
            D&apos;Aesthetic Intelligence Records
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
