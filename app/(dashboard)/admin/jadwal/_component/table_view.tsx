"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  Info,
  User,
  Stethoscope,
  Sparkles,
  MessageCircleMore,
  Activity,
  ChevronRight,
  ArrowRightCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TableViewProps {
  jadwal: any[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function TableView({
  jadwal,
  loading,
  onUpdateStatus,
}: TableViewProps) {
  if (loading && jadwal.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-white rounded-[2rem] p-24 text-center">
        <Loader2 className="animate-spin mx-auto text-[#959cc9] w-12 h-12 mb-6" />
        <p className="text-slate-900 font-black uppercase text-xs tracking-[0.5em] animate-pulse">
          Sinkronisasi Data...
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden border border-slate-100">
      <Table>
        <TableHeader className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="font-black uppercase text-[11px] text-slate-400 tracking-[0.25em] py-8 pl-12">
              Jadwal & Waktu
            </TableHead>
            <TableHead className="font-black uppercase text-[11px] text-slate-400 tracking-[0.25em] py-8">
              Pasien & Tenaga Ahli
            </TableHead>
            <TableHead className="font-black uppercase text-[11px] text-slate-400 tracking-[0.25em] py-8">
              Rencana Tindakan
            </TableHead>
            <TableHead className="font-black uppercase text-[11px] text-slate-400 tracking-[0.25em] py-8 text-center">
              Status Badge
            </TableHead>
            <TableHead className="text-right pr-12 font-black uppercase text-[11px] text-slate-400 tracking-[0.25em] py-8">
              Aksi Kontrol
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jadwal.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-44 opacity-40">
                <Info className="w-16 h-16 mx-auto mb-6 text-slate-900" />
                <p className="font-black text-sm text-slate-900 uppercase tracking-[0.4em] italic">
                  Antrean Masih Kosong
                </p>
              </TableCell>
            </TableRow>
          ) : (
            jadwal.map((j) => {
              const detailTindakan = j.rekam_medis?.[0]?.detail_tindakan || [];
              const dateObj = new Date(j.tanggal);

              return (
                <TableRow
                  key={j.id}
                  className="group hover:bg-slate-50 transition-all duration-300 border-slate-100"
                >
                  <TableCell className="py-10 pl-12 align-top">
                    <div className="flex items-center gap-6">
                      {/* Date Box: Lebih Tajam & Terbaca */}
                      <div className="flex flex-col items-center justify-center min-w-[75px] h-[75px] bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 border-2 border-slate-800">
                        <span className="text-[10px] font-black text-[#d9c3b6] uppercase tracking-widest mb-1">
                          {format(dateObj, "MMM")}
                        </span>
                        <span className="text-2xl font-black text-white leading-none">
                          {format(dateObj, "dd")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-900 font-black flex items-center gap-2 text-sm uppercase tracking-tighter">
                          <Clock className="w-4 h-4 text-[#959cc9]" />{" "}
                          {j.jam?.slice(0, 5)} WIB
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-2 py-1 rounded-md">
                          Sesi Terjadwal
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-10 align-top">
                    <div className="space-y-4">
                      {/* Konten Pasien diperbesar */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-[#959cc9] shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                            Nama Pasien
                          </p>
                          <p className="font-black text-slate-900 text-base uppercase tracking-tight leading-none">
                            {j.pasien?.full_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-2">
                        <ArrowRightCircle className="w-4 h-4 text-[#d9c3b6]" />
                        <span className="text-[11px] text-slate-600 font-black uppercase tracking-widest">
                          dr. {j.dokter?.nama_dokter}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-10 align-top">
                    <div className="space-y-4 max-w-[320px]">
                      <div className="flex flex-col gap-2">
                        {detailTindakan.length > 0 ? (
                          detailTindakan.map((dt: any) => (
                            <div
                              key={dt.id}
                              className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm flex items-center gap-3 group/item hover:border-[#959cc9]/30 transition-colors"
                            >
                              <div className="p-1.5 bg-[#959cc9]/10 rounded-lg text-[#959cc9]">
                                <Sparkles className="w-3.5 h-3.5 fill-[#959cc9]/20" />
                              </div>
                              <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">
                                {dt.perawatan?.nama_perawatan}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 p-3 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Activity className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                              Konsultasi Umum
                            </span>
                          </div>
                        )}
                      </div>
                      {j.keluhan && (
                        <div className="p-4 bg-[#fdfcfb] rounded-2xl border-l-4 border-[#d9c3b6] shadow-inner relative overflow-hidden">
                          <MessageCircleMore className="w-5 h-5 text-[#d9c3b6] opacity-20 absolute -right-1 -top-1" />
                          <p className="text-[11px] text-slate-500 italic font-bold leading-relaxed uppercase pr-4">
                            &quot;{j.keluhan}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-10 align-top">
                    <Badge
                      className={cn(
                        "rounded-xl px-6 py-2.5 font-black text-[10px] uppercase border-none shadow-xl transition-all tracking-widest",
                        j.status === "Selesai"
                          ? "bg-blue-600 text-white shadow-blue-200"
                          : j.status === "Dikonfirmasi"
                            ? "bg-green-600 text-white shadow-green-200"
                            : j.status === "Batal"
                              ? "bg-red-600 text-white shadow-red-200"
                              : "bg-orange-600 text-white shadow-orange-200",
                      )}
                    >
                      {j.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right py-10 pr-12 align-top">
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mr-2">
                        Update Status
                      </p>
                      <Select
                        value={j.status}
                        onValueChange={(v) => onUpdateStatus(j.id, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[170px] h-14 text-[11px] uppercase font-black border-2 border-slate-100 rounded-2xl shadow-xl focus:ring-[#959cc9]/30 transition-all",
                            j.status === "Selesai"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-white text-slate-900",
                          )}
                        >
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl p-3 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                          {["Menunggu", "Dikonfirmasi", "Selesai", "Batal"].map(
                            (s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                className="font-black text-[10px] uppercase py-4 rounded-2xl cursor-pointer focus:bg-slate-50 transition-all mb-1 last:mb-0"
                              >
                                <div className="flex items-center justify-between w-full pr-2">
                                  {s}
                                  <ChevronRight className="w-4 h-4 text-[#d9c3b6]" />
                                </div>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
