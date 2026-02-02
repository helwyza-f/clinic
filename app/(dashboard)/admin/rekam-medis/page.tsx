"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  XCircle,
  ClipboardList,
  Stethoscope,
  Loader2,
  User,
  Activity,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DetailRekamMedisModal } from "./_components/detail-rekam-medis-modal";

export default function MasterRekamMedisPage() {
  const [dataMedis, setDataMedis] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggal, setFilterTanggal] = useState<Date | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMasterMedis = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name, nik),
          reservasi:reservasi_id (tanggal, jam, keluhan, dokter:dokter_id (nama_dokter)),
          detail_tindakan (
            id,
            perawatan:perawatan_id (nama_perawatan)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDataMedis(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMasterMedis();
    const channel = supabase
      .channel("arsip_medis_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rekam_medis" },
        () => fetchMasterMedis(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMasterMedis, supabase]);

  const filteredData = useMemo(() => {
    return dataMedis.filter((item) => {
      const matchSearch =
        item.pasien?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.pasien?.nik?.includes(searchTerm);
      const itemDate = item.reservasi?.tanggal;
      const matchDate = filterTanggal
        ? itemDate === format(filterTanggal, "yyyy-MM-dd")
        : true;
      return matchSearch && matchDate;
    });
  }, [dataMedis, searchTerm, filterTanggal]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 px-2">
      {/* Header Page */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-[1.75rem] shadow-xl border border-slate-800">
            <FileText className="w-8 h-8 text-[#d9c3b6]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#959cc9]" />
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Arsip Master Medis
              </h1>
            </div>
            <p className="text-slate-400 text-sm font-medium italic">
              Database riwayat kesehatan & estetika pasien.
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
            <Input
              placeholder="CARI PASIEN / NIK..."
              className="h-14 pl-12 rounded-2xl border-slate-100 bg-white shadow-xl shadow-slate-100/50 focus-visible:ring-[#959cc9]/20 font-black text-[11px] uppercase tracking-[0.2em]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-60">
            <DatePicker
              value={filterTanggal}
              onChange={setFilterTanggal}
              placeholder="FILTER TANGGAL"
              className="h-14 border-slate-100 bg-white shadow-xl shadow-slate-100/50 font-black text-[11px] tracking-[0.2em] rounded-2xl"
            />
          </div>
          {filterTanggal && (
            <button
              onClick={() => setFilterTanggal(undefined)}
              className="h-14 w-14 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl border border-red-100 shadow-lg active:scale-95 transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden border border-slate-100">
        <Table>
          {/* Header Tabel Diperkecil Padding-nya (py-6) */}
          <TableHeader className="bg-slate-900">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-black px-12 py-6 uppercase text-[10px] text-slate-400 tracking-[0.3em]">
                Sesi & Identitas
              </TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] text-slate-400 tracking-[0.3em]">
                Analisa Diagnosa
              </TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] text-slate-400 tracking-[0.3em]">
                Log Tindakan
              </TableHead>
              <TableHead className="text-right pr-12 py-6 font-black uppercase text-[10px] text-slate-400 tracking-[0.3em]">
                Opsi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-40">
                  <Loader2 className="w-12 h-12 animate-spin text-[#959cc9] mx-auto mb-6" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] animate-pulse">
                    Menghubungkan Database...
                  </span>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-48 opacity-40 grayscale"
                >
                  <ClipboardList className="w-20 h-20 mx-auto mb-6 text-slate-900" />
                  <p className="font-black uppercase tracking-[0.4em] text-slate-900 italic">
                    Database Kosong
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const tindakans = item.detail_tindakan || [];
                const dateObj = new Date(item.reservasi?.tanggal || new Date());
                const jamStr = item.reservasi?.jam?.slice(0, 5) || "00:00";

                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-slate-50/60 transition-all duration-500 border-slate-50"
                  >
                    <TableCell className="px-12 py-10 align-top">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col items-center justify-center min-w-[75px] h-[75px] bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-800 group-hover:scale-105 transition-transform">
                            <span className="text-[10px] font-black text-[#d9c3b6] uppercase leading-none mb-1.5">
                              {format(dateObj, "MMM")}
                            </span>
                            <span className="text-2xl font-black text-white leading-none">
                              {format(dateObj, "dd")}
                            </span>
                          </div>
                          {/* Jam Dibuat Putih Murni agar Lebih Nampak */}
                          <div className="bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 shadow-sm">
                            <Clock className="w-3 h-3 text-[#d9c3b6]" />
                            <span className="text-[10px] font-black text-white">
                              {jamStr} WIB
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2.5 leading-none">
                            <User className="w-5 h-5 text-[#959cc9]" />{" "}
                            {item.pasien?.full_name}
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-black uppercase text-slate-400 border-slate-200 bg-white"
                              >
                                NIK: {item.pasien?.nik || "N/A"}
                              </Badge>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-[#959cc9] opacity-60" />{" "}
                              {item.reservasi?.dokter?.nama_dokter}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-10">
                      <div className="space-y-4 max-w-[340px]">
                        <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm ring-1 ring-slate-50 group-hover:border-[#d9c3b6]/40 transition-colors relative overflow-hidden">
                          <div className="flex items-center gap-2.5 mb-3 opacity-40">
                            <Calendar className="w-4 h-4 text-slate-900" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900">
                              Clinical Analysis
                            </span>
                          </div>
                          <p className="text-[12px] font-black text-slate-700 leading-relaxed uppercase tracking-tight italic">
                            {item.diagnosa === "Menunggu Pemeriksaan"
                              ? "DOKUMEN DIAGNOSA BELUM TERSEDIA"
                              : `"${item.diagnosa}"`}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-10">
                      <div className="flex flex-col gap-3 min-w-[260px]">
                        {tindakans.length > 0 ? (
                          tindakans.map((t: any) => (
                            <div
                              key={t.id}
                              className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:border-[#959cc9]/40 transition-all group/item cursor-default"
                            >
                              <div className="p-2 bg-[#959cc9]/10 rounded-xl text-[#959cc9] group-hover/item:bg-[#959cc9] group-hover/item:text-white transition-all shadow-inner">
                                <Activity className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">
                                {t.perawatan?.nama_perawatan}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 opacity-60">
                            <Activity className="w-5 h-5 text-slate-400" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                              Konsultasi Umum
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-12 align-top py-10">
                      <div className="flex flex-col items-end gap-3.5">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mr-2">
                          Digital File
                        </span>
                        <DetailRekamMedisModal data={item} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col items-center justify-center gap-2 pt-8 opacity-40">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.8em]">
          D&apos;Aesthetic Intelligence Archive
        </p>
      </div>
    </div>
  );
}
