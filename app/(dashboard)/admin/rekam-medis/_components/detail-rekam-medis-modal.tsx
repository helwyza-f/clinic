"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Quote,
  Activity,
  Eye,
  Stethoscope,
  CalendarDays,
  FileText,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface DetailRekamMedisModalProps {
  data: any;
}

export function DetailRekamMedisModal({ data }: DetailRekamMedisModalProps) {
  const tindakans = data.detail_tindakan || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Trigger Button dengan Teks & Ikon */}
        <Button
          variant="ghost"
          className="text-[#959cc9] hover:bg-[#959cc9]/10 gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl px-5 h-10 border border-[#959cc9]/20 shadow-sm active:scale-95"
        >
          <Eye className="w-4 h-4" /> LIHAT ARSIP
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[94%] sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none animate-in zoom-in-95 duration-300">
        <VisuallyHidden.Root>
          <DialogTitle>Arsip Medis Digital</DialogTitle>
        </VisuallyHidden.Root>

        {/* Premium Gradient Header - Sesuai Palette */}
        <div className="bg-gradient-to-r from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] p-8 text-white relative border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-3.5 bg-black/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-[0.15em] leading-none">
                Ringkasan Medis
              </h2>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.3em] mt-2 italic">
                Official Clinical Record
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content dengan Smooth Scrollbar */}
        <div
          className={cn(
            "p-8 space-y-8 max-h-[70vh] overflow-y-auto",
            "scrollbar-thin",
            "[&::-webkit-scrollbar]:w-[5px]",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "hover:[&::-webkit-scrollbar-thumb]:bg-[#d9c3b6] transition-colors",
          )}
        >
          {/* Patient & Session Header */}
          <section className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100 space-y-5 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-md text-[#959cc9] border border-slate-50">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                    Nama Pasien
                  </p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {data.pasien?.full_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Tanggal Sesi
                </p>
                <div className="flex items-center gap-2 text-[#d9c3b6]">
                  <CalendarDays className="w-4 h-4" />
                  <p className="text-[12px] font-black uppercase tracking-tighter text-slate-800">
                    {data.reservasi?.tanggal
                      ? format(new Date(data.reservasi.tanggal), "dd MMM yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-[#959cc9] opacity-70" />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                  dr. {data.reservasi?.dokter?.nama_dokter || "Tenaga Ahli"}
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] font-black uppercase text-slate-400 border-slate-200 bg-white px-3 py-0.5 rounded-lg"
              >
                REF: {data.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
          </section>

          {/* Diagnosis Section */}
          <div className="space-y-4">
            <Label className="text-[11px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-2 leading-none flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Diagnosa & Analisa
            </Label>
            <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Stethoscope className="w-12 h-12 text-slate-900" />
              </div>
              <p className="text-[12px] font-black text-slate-700 leading-relaxed uppercase tracking-tight italic relative z-10">
                {data.diagnosa === "Menunggu Pemeriksaan"
                  ? "ANALISA MEDIS BELUM DIRILIS OLEH DOKTER"
                  : `"${data.diagnosa}"`}
              </p>
            </div>
          </div>

          {/* Treatment Log */}
          <div className="space-y-4">
            <Label className="text-[11px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-2 leading-none flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Tindakan Medis
            </Label>
            <div className="flex flex-wrap gap-3">
              {tindakans.length > 0 ? (
                tindakans.map((t: any) => (
                  <div
                    key={t.id}
                    className="bg-white text-slate-800 border-2 border-slate-50 px-5 py-3 flex items-center gap-3 shadow-md rounded-2xl hover:border-[#d9c3b6]/50 transition-all cursor-default"
                  >
                    <Activity className="w-4 h-4 text-[#d9c3b6]" />
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {t.perawatan?.nama_perawatan}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] italic px-6 py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  Konsultasi Umum Standar
                </span>
              )}
            </div>
          </div>

          {/* Clinical Instructions */}
          <div className="space-y-4 pb-4">
            <Label className="text-[11px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-2 leading-none flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Instruksi Rawat
            </Label>
            <div className="p-7 bg-[#fdfcfb] border-2 border-dashed border-[#d9c3b6]/30 rounded-[2rem] text-[12px] text-slate-600 font-bold italic leading-loose relative shadow-sm">
              <Quote className="w-8 h-8 text-[#d9c3b6]/10 absolute top-3 right-3 rotate-12" />
              <div className="pr-4 uppercase tracking-tighter">
                {data.catatan_tambahan ||
                  "Silakan lanjutkan perawatan harian sesuai arahan verbal yang disampaikan dokter."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal: Terang & Elegan */}
        <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em]">
            D&apos;Aesthetic Intelligence Portal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
