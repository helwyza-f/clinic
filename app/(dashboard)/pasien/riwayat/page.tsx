"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Clock,
  Loader2,
  Inbox,
  Sparkles,
  XCircle,
  ChevronRight,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DetailRekamMedisModal } from "./_components/detail-rekam-medis-modal";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PasienRiwayatPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [filterTanggal, setFilterTanggal] = useState<Date | undefined>(
    undefined,
  );

  const supabase = createClient();
  const filterOptions = [
    "Semua",
    "Menunggu",
    "Dikonfirmasi",
    "Selesai",
    "Batal",
  ];

  const fetchRiwayat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("reservasi")
        .select(
          `
          *,
          dokter:dokter_id (nama_dokter),
          rekam_medis (
            id, diagnosa, catatan_tambahan,
            detail_tindakan (id, perawatan:perawatan_id (nama_perawatan))
          )
        `,
        )
        .eq("pasien_id", user.id)
        .order("tanggal", { ascending: false });

      if (!error) setRiwayat(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRiwayat();
  }, [supabase]);

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reservasi")
        .update({ status: "Batal" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Reservasi berhasil dibatalkan");
      fetchRiwayat();
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    }
  };

  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      const matchStatus =
        activeFilter === "Semua" ? true : item.status === activeFilter;
      const matchDate = filterTanggal
        ? item.tanggal === format(filterTanggal, "yyyy-MM-dd")
        : true;
      return matchStatus && matchDate;
    });
  }, [riwayat, activeFilter, filterTanggal]);

  return (
    <div className="space-y-5 animate-in fade-in duration-700 pb-10">
      {/* Header Utama */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
          <History className="w-5 h-5 text-[#959cc9]" />
        </div>
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
          Riwayat Kunjungan
        </h1>
      </div>

      {/* Filter Section: Tanggal & Status Stacking */}
      <div className="space-y-3 px-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DatePicker
              value={filterTanggal}
              onChange={setFilterTanggal}
              placeholder="FILTER BERDASARKAN TANGGAL"
              className="h-11 w-full rounded-2xl border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest pl-10 shadow-sm"
            />
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
          {filterTanggal && (
            <button
              onClick={() => setFilterTanggal(undefined)}
              className="h-11 w-11 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl border border-red-100 shadow-sm"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border shadow-sm whitespace-nowrap",
                activeFilter === opt
                  ? "bg-[#959cc9] text-white border-[#959cc9] shadow-[#959cc9]/20"
                  : "bg-white text-slate-400 border-slate-100 hover:border-[#959cc9]/30",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
        </div>
      ) : filteredRiwayat.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-100 mx-1 shadow-inner">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Tidak Ada Arsip Ditemukan
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 px-1">
          {filteredRiwayat.map((item) => {
            const rekamMedis = item.rekam_medis?.[0];
            const isSelesai = item.status === "Selesai";
            const canCancel = item.status === "Menunggu";

            return (
              <Card
                key={item.id}
                className="border-none shadow-sm shadow-slate-200/60 rounded-[1.75rem] overflow-hidden bg-white active:scale-[0.99] transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center min-w-[58px] h-[58px] bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {format(new Date(item.tanggal), "dd")}
                      </span>
                      <span className="text-[9px] font-black text-[#959cc9] uppercase tracking-tighter">
                        {format(new Date(item.tanggal), "MMM")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border-none shadow-sm",
                            isSelesai
                              ? "bg-blue-50 text-blue-600"
                              : item.status === "Dikonfirmasi"
                                ? "bg-green-50 text-green-600"
                                : item.status === "Batal"
                                  ? "bg-red-50 text-red-400"
                                  : "bg-orange-50 text-orange-600",
                          )}
                        >
                          {item.status}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-slate-300 font-black text-[9px]">
                          <Clock className="w-3 h-3" /> {item.jam.slice(0, 5)}
                        </div>
                      </div>
                      <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate leading-none">
                        dr. {item.dokter?.nama_dokter}
                      </h3>
                      <p className="text-[10px] font-bold text-[#d9c3b6] uppercase truncate opacity-90 leading-none">
                        {rekamMedis?.detail_tindakan?.[0]?.perawatan
                          ?.nama_perawatan || "Konsultasi Rutin"}
                      </p>
                    </div>

                    <div className="pl-1">
                      {isSelesai && rekamMedis ? (
                        <DetailRekamMedisModal
                          data={{ ...rekamMedis, reservasi: item }}
                        />
                      ) : canCancel ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="w-9 h-9 rounded-full bg-red-50 text-red-400 flex items-center justify-center border border-red-100 shadow-sm active:scale-90 transition-all">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[90%] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-300">
                            {/* Header Konfirmasi yang Lebih Halus */}
                            <div className="bg-red-50 p-7 text-red-500 flex items-center gap-4 border-b border-red-100/50">
                              <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter leading-none text-red-600">
                                Batalkan Jadwal
                              </AlertDialogTitle>
                            </div>
                            <div className="p-8">
                              <AlertDialogDescription className="text-slate-500 text-[13px] font-medium leading-relaxed uppercase tracking-tight">
                                Anda akan membatalkan kunjungan tanggal{" "}
                                <span className="text-slate-900 font-black">
                                  {format(
                                    new Date(item.tanggal),
                                    "dd MMM yyyy",
                                  )}
                                </span>
                                . Apakah Anda sudah yakin?
                              </AlertDialogDescription>
                              <div className="flex gap-3 mt-8">
                                <AlertDialogCancel className="flex-1 rounded-2xl h-14 border-slate-100 font-black uppercase text-[10px] tracking-[0.2em] shadow-sm hover:bg-slate-50 m-0">
                                  Kembali
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(item.id)}
                                  className="flex-1 rounded-2xl h-14 bg-red-500 hover:bg-red-600 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-100 m-0"
                                >
                                  Ya, Batal
                                </AlertDialogAction>
                              </div>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 opacity-40">
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
