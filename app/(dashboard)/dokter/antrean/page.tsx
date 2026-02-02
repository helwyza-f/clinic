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
              id, 
              diagnosa, 
              tindakan, 
              detail_tindakan (
                id,
                perawatan:perawatan_id (id, nama_perawatan)
              )
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION - Sejajar Vertikal */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
            <ClipboardList className="w-10 h-10 text-[#959cc9]" />
            Antrean Medis Saya
          </h1>
          <p className="text-slate-400 text-base font-medium italic">
            Monitor dan input hasil diagnosa secara real-time.
          </p>
        </div>

        {/* FILTER BOX - Disederhanakan */}
        <div className="flex items-center gap-4 bg-white p-3 pl-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full lg:w-fit min-w-[350px]">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
            <Filter className="w-5 h-5 text-[#d9c3b6]" />
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">
              FILTER
            </span>
          </div>
          <div className="flex-1 lg:w-56">
            <DatePicker
              value={filterTanggal}
              onChange={setFilterTanggal}
              placeholder="Pilih Tanggal..."
              className="h-12 border-none bg-transparent shadow-none text-sm font-bold text-slate-700 focus:ring-0"
            />
          </div>
          {filterTanggal && (
            <button
              onClick={() => setFilterTanggal(undefined)}
              className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Pasien
          </p>
          <p className="text-4xl font-black text-[#959cc9]">
            {filteredAntrean.length}
          </p>
        </div>
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Diagnosa Selesai
          </p>
          <p className="text-4xl font-black text-green-500">
            {filteredAntrean.filter((i) => i.status === "Selesai").length}
          </p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-[3rem] mx-2">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none text-slate-400">
              <TableHead className="font-black uppercase text-[11px] tracking-[0.2em] py-8 pl-12">
                Jadwal & Pasien
              </TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-[0.2em] py-8">
                Rencana Tindakan
              </TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-[0.2em] py-8 text-center">
                Status Layanan
              </TableHead>
              <TableHead className="text-right text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] py-8 pr-12">
                Arsip Medis
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#959cc9]" />
                </TableCell>
              </TableRow>
            ) : filteredAntrean.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-32 text-slate-300"
                >
                  <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                    <CalendarDays className="w-16 h-16" />
                    <span className="font-black uppercase tracking-[0.4em] text-xs">
                      Jadwal Kosong
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAntrean.map((item) => {
                const rekamMedis = item.rekam_medis?.[0];
                const detailTindakan = rekamMedis?.detail_tindakan || [];

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-all border-slate-50"
                  >
                    <TableCell className="pl-12 py-10">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-4 bg-slate-100 rounded-3xl text-[#959cc9] shadow-inner">
                            <Clock className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black text-slate-400 tracking-tighter">
                            {item.jam?.slice(0, 5)}
                          </span>
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none mb-2">
                            {item.pasien?.full_name}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="text-[11px] font-bold text-[#d9c3b6] uppercase tracking-[0.15em] flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" />{" "}
                              {item.tanggal === format(new Date(), "yyyy-MM-dd")
                                ? "Hari Ini"
                                : item.tanggal}
                            </div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              NIK: {item.pasien?.nik || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {detailTindakan.length > 0 ? (
                          detailTindakan.map((dt: any) => (
                            <div
                              key={dt.id}
                              className="flex items-center gap-2.5"
                            >
                              <Sparkles className="w-4 h-4 text-[#d9c3b6] fill-[#d9c3b6]/10" />
                              <span className="text-[11px] font-black uppercase text-slate-600 tracking-tight">
                                {dt.perawatan?.nama_perawatan}
                              </span>
                            </div>
                          ))
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-400 text-[10px] uppercase tracking-widest font-black h-7 px-4"
                          >
                            Konsultasi
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        disabled={item.status === "Selesai"}
                        defaultValue={item.status}
                        onValueChange={(v) => updateStatus(item.id, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[150px] h-10 border-none font-black text-[10px] uppercase rounded-full shadow-sm mx-auto transition-all",
                            item.status === "Menunggu"
                              ? "bg-orange-50 text-orange-600"
                              : item.status === "Dikonfirmasi"
                                ? "bg-green-50 text-green-600"
                                : "bg-blue-50 text-blue-600",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          <SelectItem
                            value="Menunggu"
                            className="text-[11px] font-black uppercase py-3"
                          >
                            Menunggu
                          </SelectItem>
                          <SelectItem
                            value="Dikonfirmasi"
                            className="text-[11px] font-black uppercase py-3"
                          >
                            Konfirmasi
                          </SelectItem>
                          <SelectItem
                            value="Selesai"
                            className="text-[11px] font-black uppercase py-3"
                          >
                            Selesai
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right pr-12">
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
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic animate-pulse">
                          Sedang Berjalan
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
