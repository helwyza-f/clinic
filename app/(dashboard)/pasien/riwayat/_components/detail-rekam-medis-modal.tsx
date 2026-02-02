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

      <DialogContent className="w-[94%] sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Detail Medis</DialogTitle>
        </VisuallyHidden.Root>

        {/* Gradient Header - Sesuai Branding */}
        <div className="bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] p-7 text-white text-center shadow-lg">
          <Stethoscope className="w-7 h-7 mx-auto mb-2 opacity-60" />
          <h2 className="text-xl font-black uppercase tracking-[0.15em] leading-none">
            Arsip Medis
          </h2>
          <p className="text-[10px] font-bold opacity-80 uppercase mt-1.5 tracking-[0.3em]">
            Patient Health Record
          </p>
        </div>

        <div className="p-7 space-y-7 max-h-[68vh] overflow-y-auto scrollbar-thin [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-slate-200">
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Dokter
              </span>
              <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                dr. {data.reservasi?.dokter?.nama_dokter}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Layanan
              </span>
              <div className="flex items-center gap-2 text-[#d9c3b6]">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="text-[13px] font-black uppercase tracking-tight">
                  {format(new Date(data.reservasi.tanggal), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-1">
              Hasil Diagnosa
            </Label>
            <div className="p-6 bg-slate-900 text-white rounded-[1.75rem] shadow-xl text-[11px] font-bold uppercase tracking-widest leading-relaxed border-t border-white/10">
              {data.diagnosa || "Menunggu Hasil Pemeriksaan"}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-1">
              Tindakan Medis
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {tindakans.length > 0 ? (
                tindakans.map((t: any) => (
                  <Badge
                    key={t.id}
                    className="bg-white text-slate-700 border-slate-100 px-4 py-2 flex items-center gap-2.5 rounded-xl shadow-sm border"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#d9c3b6]" />
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      {t.perawatan?.nama_perawatan}
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic px-4 py-2 bg-slate-50 rounded-xl">
                  Konsultasi Umum
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-[#959cc9] tracking-[0.4em] ml-1">
              Instruksi Rawat
            </Label>
            <div className="p-6 bg-white border-2 border-dashed border-[#d9c3b6]/20 rounded-[1.75rem] text-[11px] text-slate-500 font-bold italic leading-loose relative shadow-sm">
              <Quote className="w-5 h-5 text-[#d9c3b6]/10 absolute top-2 right-2 rotate-12" />
              <div className="pr-4 uppercase tracking-tight">
                {data.catatan_tambahan ||
                  "Silakan lanjutkan perawatan harian sesuai arahan dokter saat sesi medis."}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100 shadow-inner">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Official Medical Archive
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
