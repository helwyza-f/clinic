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
  Activity,
  Stethoscope,
  ChevronRight,
  Quote,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function DetailRekamMedisModal({ data }: { data: any }) {
  const tindakans = data.detail_tindakan || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full bg-[#959cc9]/10 text-[#959cc9] hover:bg-[#959cc9] hover:text-white transition-all shadow-sm border border-[#959cc9]/20"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      {/* FIX: Membatasi max-h agar tidak menutupi status bar mobile */}
      <DialogContent className="w-[92%] sm:max-w-[420px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none max-h-[85vh] flex flex-col translate-y-[-50%] sm:translate-y-[-50%]">
        <VisuallyHidden.Root>
          <DialogTitle>Detail Medis</DialogTitle>
        </VisuallyHidden.Root>

        {/* 1. Header Tetap (Sticky Header) */}
        <div className="bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] p-6 text-white text-center shadow-md flex-shrink-0">
          <Stethoscope className="w-6 h-6 mx-auto mb-2 opacity-60" />
          <h2 className="text-lg font-black uppercase tracking-[0.15em] leading-none">
            Arsip Medis
          </h2>
          <p className="text-[9px] font-bold opacity-80 uppercase mt-1 tracking-[0.2em]">
            Patient Health Record
          </p>
        </div>

        {/* 2. Scrollable Area - Internal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          {/* Info Dokter & Layanan */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Dokter
              </span>
              <span className="text-[12px] font-black text-slate-900 uppercase">
                dr. {data.reservasi?.dokter?.nama_dokter?.split(",")[0]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Layanan
              </span>
              <div className="flex items-center gap-1.5 text-[#d9c3b6]">
                <CalendarDays className="w-3 h-3" />
                <span className="text-[12px] font-black uppercase">
                  {format(new Date(data.reservasi.tanggal), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Hasil Diagnosa */}
          <div className="space-y-2.5">
            <Label className="text-[9px] font-black uppercase text-[#959cc9] tracking-[0.3em] ml-1">
              Hasil Diagnosa
            </Label>
            <div className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-lg text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {data.diagnosa || "Menunggu Hasil Pemeriksaan"}
            </div>
          </div>

          {/* Tindakan Medis */}
          <div className="space-y-2.5">
            <Label className="text-[9px] font-black uppercase text-[#959cc9] tracking-[0.3em] ml-1">
              Tindakan Medis
            </Label>
            <div className="flex flex-wrap gap-2">
              {tindakans.length > 0 ? (
                tindakans.map((t: any) => (
                  <Badge
                    key={t.id}
                    className="bg-white text-slate-700 border-slate-100 px-3 py-1.5 flex items-center gap-2 rounded-xl shadow-sm border"
                  >
                    <Activity className="w-3 h-3 text-[#d9c3b6]" />
                    <span className="text-[9px] font-black uppercase tracking-tight">
                      {t.perawatan?.nama_perawatan}
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-[10px] text-slate-400 font-bold uppercase italic px-4 py-2 bg-slate-50 rounded-xl">
                  Konsultasi Umum
                </span>
              )}
            </div>
          </div>

          {/* Instruksi Rawat */}
          <div className="space-y-2.5">
            <Label className="text-[9px] font-black uppercase text-[#959cc9] tracking-[0.3em] ml-1">
              Instruksi Rawat
            </Label>
            <div className="p-5 bg-white border-2 border-dashed border-[#d9c3b6]/20 rounded-[1.5rem] text-[10px] text-slate-500 font-bold italic leading-relaxed relative">
              <Quote className="w-4 h-4 text-[#d9c3b6]/20 absolute top-2 right-2" />
              <div className="pr-2 uppercase tracking-tight">
                {data.catatan_tambahan ||
                  "Silakan lanjutkan perawatan harian sesuai arahan dokter saat sesi medis."}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Tetap (Sticky Footer) */}
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100 flex-shrink-0">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
            Official Medical Archive
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
