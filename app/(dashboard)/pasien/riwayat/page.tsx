"use client";

import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Clock,
  Loader2,
  Inbox,
  XCircle,
  ChevronRight,
  AlertCircle,
  Calendar,
  FilterX,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { DetailRekamMedisModal } from "./_components/detail-rekam-medis-modal";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function RiwayatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const highlightId = searchParams.get("id");
  const queryTanggal = searchParams.get("tanggal");

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

  useEffect(() => {
    if (queryTanggal) {
      const parsedDate = parseISO(queryTanggal);
      if (isValid(parsedDate)) {
        setFilterTanggal(parsedDate);
      }
    }
  }, [queryTanggal]);

  // Dibungkus useCallback agar bisa dipanggil di dalam listener Realtime
  const fetchRiwayat = useCallback(async () => {
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
        .order("tanggal", { ascending: false })
        .order("jam", { ascending: true });

      if (!error) setRiwayat(data || []);
    }
    setLoading(false);
  }, [supabase]);

  // LOGIKA REALTIME
  useEffect(() => {
    fetchRiwayat();

    // Inisialisasi Channel Realtime
    const channel = supabase
      .channel("riwayat_pasien_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservasi" },
        () => {
          fetchRiwayat(); // Refresh data jika ada perubahan status atau jadwal
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rekam_medis" },
        () => {
          fetchRiwayat(); // Refresh jika dokter selesai mengisi rekam medis
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup saat unmount
    };
  }, [supabase, fetchRiwayat]);

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reservasi")
        .update({ status: "Batal" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Reservasi berhasil dibatalkan");
      // Tidak perlu fetch manual karena Realtime akan menangkapnya
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    }
  };

  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      if (highlightId) return item.id === highlightId;
      const matchStatus =
        activeFilter === "Semua" ? true : item.status === activeFilter;
      const matchDate = filterTanggal
        ? item.tanggal === format(filterTanggal, "yyyy-MM-dd")
        : true;
      return matchStatus && matchDate;
    });
  }, [riwayat, activeFilter, filterTanggal, highlightId]);

  const clearFilters = () => {
    router.push("/pasien/riwayat");
    setFilterTanggal(undefined);
    setActiveFilter("Semua");
  };

  return (
    <div className="space-y-5 px-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <History className="w-5 h-5 text-[#959cc9]" />
          </div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
            Riwayat Kunjungan
          </h1>
        </div>

        {(highlightId || queryTanggal || filterTanggal) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 bg-[#959cc9]/10 text-slate-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-[#959cc9]/20"
          >
            <FilterX className="w-4 h-4" /> Lihat Semua
          </button>
        )}
      </div>

      {!highlightId && (
        <div className="space-y-3 px-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DatePicker
                value={filterTanggal}
                onChange={setFilterTanggal}
                placeholder="FILTER TANGGAL"
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
                    ? "bg-[#959cc9] text-white border-[#959cc9]"
                    : "bg-white text-slate-400 border-slate-100",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
        </div>
      ) : filteredRiwayat.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-100 mx-1">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Tidak Ada Arsip
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 px-1">
          {filteredRiwayat.map((item) => {
            const rekamMedis = item.rekam_medis?.[0];
            const detailTindakan = rekamMedis?.detail_tindakan || [];
            const isSelesai = item.status === "Selesai";
            const canCancel = item.status === "Menunggu";

            return (
              <Card
                key={item.id}
                className={cn(
                  "border-none shadow-sm shadow-slate-200/60 rounded-[1.75rem] overflow-hidden bg-white active:scale-[0.99] transition-all duration-300",
                  highlightId === item.id &&
                    "ring-2 ring-[#959cc9] shadow-lg shadow-[#959cc9]/10",
                )}
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
                        <div className="flex items-center gap-1 text-slate-900 font-black text-[10px] tracking-tight">
                          <Clock className="w-3.5 h-3.5 text-[#d9c3b6]" />
                          {item.jam.slice(0, 5)} WIB
                        </div>
                      </div>

                      <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate leading-none pt-0.5">
                        dr. {item.dokter?.nama_dokter}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {detailTindakan.length > 0 ? (
                          detailTindakan.slice(0, 2).map((dt: any) => (
                            <span
                              key={dt.id}
                              className="text-[10px] font-black text-slate-600 uppercase bg-slate-50 px-2 py-1 rounded-md border border-slate-200"
                            >
                              {dt.perawatan?.nama_perawatan}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 uppercase italic bg-slate-50 px-2 py-1 rounded-md">
                            Konsultasi Umum
                          </span>
                        )}
                        {detailTindakan.length > 2 && (
                          <span className="text-[9px] font-black text-[#959cc9] bg-[#959cc9]/5 px-2 py-1 rounded-md">
                            +{detailTindakan.length - 2} LAINNYA
                          </span>
                        )}
                      </div>
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
                          <AlertDialogContent className="w-[90%] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
                            <div className="bg-red-50 p-7 text-red-500 flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-red-600">
                                Batalkan Jadwal
                              </AlertDialogTitle>
                            </div>
                            <div className="p-8">
                              <AlertDialogDescription className="text-slate-500 text-[13px] font-medium leading-relaxed uppercase tracking-tight">
                                Batalkan kunjungan tanggal{" "}
                                <span className="text-slate-900 font-black">
                                  {format(
                                    new Date(item.tanggal),
                                    "dd MMM yyyy",
                                  )}
                                </span>
                                ?
                              </AlertDialogDescription>
                              <div className="flex gap-3 mt-8">
                                <AlertDialogCancel className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px]">
                                  Kembali
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(item.id)}
                                  className="flex-1 rounded-2xl h-14 bg-red-500 font-black uppercase text-[10px] border-none"
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

export default function PasienRiwayatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
        </div>
      }
    >
      <RiwayatContent />
    </Suspense>
  );
}
