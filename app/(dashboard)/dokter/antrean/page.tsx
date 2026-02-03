"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Clock,
  ClipboardList,
  Loader2,
  Activity,
  Sparkles,
  CalendarDays,
  Filter,
  XCircle,
  CheckCircle2,
  ChevronRight,
  MessageSquareText,
} from "lucide-react";
import { RekamMedisModal } from "../_component/rekam-medis-modal";
import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DokterAntreanPage() {
  const [antrean, setAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dokterId, setDokterId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState<Date | undefined>(
    undefined,
  );

  const supabase = createClient();

  const fetchAntreanDanJadwal = useCallback(
    async (dId: string) => {
      try {
        const { data, error } = await supabase
          .from("reservasi")
          .select(
            `
            *,
            pasien:pasien_id (full_name, nik),
            rekam_medis:rekam_medis (
              id, diagnosa, tindakan, catatan_tambahan, 
              detail_tindakan (id, perawatan:perawatan_id (id, nama_perawatan))
            )
          `,
          )
          .eq("dokter_id", dId)
          .in("status", ["Menunggu", "Dikonfirmasi", "Selesai"])
          .order("jam", { ascending: true });

        if (error) throw error;
        setAntrean(data || []);
      } catch (error: any) {
        console.error("Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    setIsMounted(true);
    setFilterTanggal(new Date());

    let channel: any;
    async function initRealtime() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: dokterProfile } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (dokterProfile) {
        setDokterId(dokterProfile.id);
        fetchAntreanDanJadwal(dokterProfile.id);
        channel = supabase
          .channel(`antrean_dokter_${dokterProfile.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "reservasi",
              filter: `dokter_id=eq.${dokterProfile.id}`,
            },
            () => fetchAntreanDanJadwal(dokterProfile.id),
          )
          .subscribe();
      }
    }
    initRealtime();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchAntreanDanJadwal]);

  const filteredAntrean = useMemo(() => {
    if (!filterTanggal) return antrean;
    const selectedDateStr = format(filterTanggal, "yyyy-MM-dd");
    return antrean.filter((item) => item.tanggal === selectedDateStr);
  }, [antrean, filterTanggal]);

  async function updateStatus(id: string, status: string) {
    const originalAntrean = [...antrean];
    setAntrean((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    const { error } = await supabase
      .from("reservasi")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Gagal update status");
      setAntrean(originalAntrean);
    } else {
      toast.success(`Status pasien diperbarui`);
    }
  }

  if (!isMounted) return null;

  return (
    <div className="space-y-5 lg:space-y-7 animate-in fade-in duration-700 pb-20 px-3 lg:px-0 max-w-full overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 px-1 lg:px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-slate-100">
              <ClipboardList className="w-5 h-5 lg:w-7 lg:h-7 text-[#959cc9]" />
            </div>
            <h1 className="text-xl lg:text-3xl font-black text-slate-800 uppercase tracking-tighter">
              Antrean Medis
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] lg:text-sm font-medium italic pl-1">
            Clinical queue management system.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 lg:p-2.5 pl-4 lg:pl-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/30 w-full lg:w-fit">
          <Filter className="w-4 h-4 text-[#d9c3b6]" />
          <div className="flex-1 lg:w-48">
            <DatePicker
              value={filterTanggal}
              onChange={setFilterTanggal}
              placeholder="Pilih Tanggal"
              className="h-9 lg:h-10 border-none bg-transparent shadow-none text-[10px] lg:text-xs font-black uppercase tracking-widest text-[#959cc9] focus:ring-0"
            />
          </div>
          {filterTanggal && (
            <button
              onClick={() => setFilterTanggal(undefined)}
              className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1 lg:px-4">
        <div className="bg-gradient-to-br from-[#959cc9] via-[#a8b0d8] to-[#d9c3b6] p-4 lg:p-6 rounded-[1.5rem] shadow-xl shadow-indigo-100/40 text-white flex flex-col justify-center border border-white/20">
          <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            Total Antrean
          </p>
          <p className="text-2xl lg:text-4xl font-black tracking-tighter">
            {filteredAntrean.length}
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <CheckCircle2 className="absolute -right-2 -bottom-2 w-12 h-12 text-green-500/10 group-hover:scale-110 transition-transform" />
          <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Selesai
          </p>
          <p className="text-2xl lg:text-4xl font-black text-slate-800">
            {filteredAntrean.filter((i) => i.status === "Selesai").length}
          </p>
        </div>
      </div>

      {/* MOBILE VIEW (CARD BASED) */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
          </div>
        ) : filteredAntrean.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 grayscale opacity-40">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 text-[#959cc9]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#959cc9]">
              Agenda Kosong
            </p>
          </div>
        ) : (
          filteredAntrean.map((item) => {
            const rekamMedis = item.rekam_medis?.[0];
            const isSelesai = item.status === "Selesai";

            return (
              <Card
                key={item.id}
                className="border-none shadow-lg rounded-[2rem] p-5 space-y-4 bg-white active:scale-[0.98] transition-transform overflow-hidden relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#959cc9] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span className="text-[11px] font-black leading-none mt-0.5">
                        {item.jam?.slice(0, 5)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none">
                        {item.pasien?.full_name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        NIK: {item.pasien?.nik?.slice(-4) || "..."}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-black uppercase border-[#d9c3b6]/30 text-[#d9c3b6]"
                  >
                    ID: {item.id.slice(-4).toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex-1">
                    <Select
                      disabled={isSelesai}
                      value={item.status}
                      onValueChange={(v) => updateStatus(item.id, v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 w-full border-none font-black text-[9px] uppercase rounded-xl shadow-sm transition-all",
                          item.status === "Menunggu"
                            ? "bg-orange-50 text-orange-600"
                            : item.status === "Dikonfirmasi"
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-600",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-1.5">
                        {["Menunggu", "Dikonfirmasi", "Selesai"].map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-[10px] font-black uppercase py-3 rounded-xl"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-shrink-0">
                    {isSelesai ? (
                      <RekamMedisModal
                        data={item}
                        onRefresh={() => fetchAntreanDanJadwal(dokterId!)}
                        viewOnly={
                          !!rekamMedis &&
                          rekamMedis.diagnosa !== "Menunggu Pemeriksaan"
                        }
                      />
                    ) : (
                      <div className="h-10 px-4 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100 opacity-60">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d9c3b6] animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                          Sesi Aktif
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW (RICH DATA TABLE) - Menghilangkan Kesan Kosong */}
      <Card className="hidden lg:block border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-[3rem] border border-slate-50 mx-4">
        <Table>
          <TableHeader className="bg-[#959cc9]/5 border-b border-[#959cc9]/10">
            <TableRow className="hover:bg-transparent border-none text-[#959cc9]/60">
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] py-7 pl-12">
                Waktu & Pasien
              </TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] py-7">
                Detail Perawatan & Keluhan
              </TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] py-7 text-center">
                Status Sesi
              </TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.2em] py-7 pr-12">
                Arsip Medis
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#959cc9]" />
                </TableCell>
              </TableRow>
            ) : (
              filteredAntrean.map((item) => {
                const rekamMedis = item.rekam_medis?.[0];
                const detailTindakan = rekamMedis?.detail_tindakan || [];
                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-slate-50 transition-all duration-300 border-slate-50"
                  >
                    <TableCell className="pl-12 py-10 align-top">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center min-w-[65px] h-[65px] bg-[#959cc9] rounded-2xl shadow-lg border-2 border-white">
                          <Clock className="w-3.5 h-3.5 text-white/50 mb-0.5" />
                          <span className="text-xs font-black text-white leading-none">
                            {item.jam?.slice(0, 5)}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-black text-slate-800 text-base uppercase tracking-tight leading-none">
                            {item.pasien?.full_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            NIK: {item.pasien?.nik || "..."}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[8px] font-black uppercase text-[#d9c3b6] border-[#d9c3b6]/30 bg-[#fdfcfb] px-2 py-0 mt-1"
                          >
                            REF: {item.id.slice(-6).toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* DATA TAMBAHAN KHUSUS DESKTOP */}
                    <TableCell className="align-top py-10">
                      <div className="space-y-4 max-w-[400px]">
                        <div className="flex flex-wrap gap-2">
                          {detailTindakan.length > 0 ? (
                            detailTindakan.map((dt: any) => (
                              <div
                                key={dt.id}
                                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"
                              >
                                <Sparkles className="w-3 h-3 text-[#d9c3b6]" />
                                <span className="text-[10px] font-black uppercase text-slate-600">
                                  {dt.perawatan?.nama_perawatan}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                              Konsultasi Umum
                            </span>
                          )}
                        </div>
                        {item.keluhan && (
                          <div className="flex items-start gap-2.5 p-3.5 bg-[#fdfcfb] rounded-2xl border-l-4 border-[#d9c3b6]/40 shadow-inner">
                            <MessageSquareText className="w-4 h-4 text-[#d9c3b6] mt-0.5 shrink-0" />
                            <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed line-clamp-2 uppercase">
                              &quot;{item.keluhan}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-10 align-top min-w-[160px]">
                      <Select
                        disabled={item.status === "Selesai"}
                        value={item.status}
                        onValueChange={(v) => updateStatus(item.id, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-11 w-full max-w-[145px] border-none font-black text-[10px] uppercase rounded-2xl shadow-sm transition-all mx-auto",
                            item.status === "Menunggu"
                              ? "bg-orange-50 text-orange-600"
                              : item.status === "Dikonfirmasi"
                                ? "bg-green-50 text-green-600"
                                : "bg-blue-50 text-blue-600",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2 min-w-[170px]">
                          {["Menunggu", "Dikonfirmasi", "Selesai"].map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="text-[11px] font-black uppercase py-4 rounded-xl focus:bg-[#959cc9]/10"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-right pr-12 py-10 align-top">
                      {item.status === "Selesai" ? (
                        <RekamMedisModal
                          data={item}
                          onRefresh={() => fetchAntreanDanJadwal(dokterId!)}
                          viewOnly={
                            !!rekamMedis &&
                            rekamMedis.diagnosa !== "Menunggu Pemeriksaan"
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-3 text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-[#d9c3b6] animate-ping" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] italic opacity-60">
                            Sesi Sedang Berlangsung
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pt-4">
        D&apos;AESTHETIC MEDICAL INTELLIGENCE
      </p>
    </div>
  );
}
