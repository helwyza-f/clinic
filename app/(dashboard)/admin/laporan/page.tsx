"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileBarChart,
  Users,
  TrendingUp,
  Sparkles,
  CalendarDays,
  Stethoscope,
  Search,
  XCircle,
  Loader2,
  ClipboardCheck,
  Filter,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DatePicker } from "@/components/date-picker";

export default function LaporanAdminPage() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States untuk Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggal, setFilterTanggal] = useState<Date | undefined>(
    undefined,
  );

  const supabase = createClient();

  useEffect(() => {
    fetchLaporan();
  }, []);

  async function fetchLaporan() {
    setLoading(true);
    const { data } = await supabase
      .from("rekam_medis")
      .select(
        `
        id,
        diagnosa,
        created_at,
        pasien:pasien_id (full_name),
        reservasi:reservasi_id (tanggal, dokter:dokter_id (nama_dokter)),
        detail_tindakan (
          perawatan:perawatan_id (nama_perawatan)
        )
      `,
      )
      .neq("diagnosa", "Menunggu Pemeriksaan")
      .order("created_at", { ascending: false });

    if (data) setLaporan(data);
    setLoading(false);
  }

  // Logic Filtering Reaktif
  const filteredData = useMemo(() => {
    return laporan.filter((item) => {
      const matchSearch =
        item.pasien?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.reservasi?.dokter?.nama_dokter
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const itemDate = item.reservasi?.tanggal;
      const matchDate = filterTanggal
        ? itemDate === format(filterTanggal, "yyyy-MM-dd")
        : true;

      return matchSearch && matchDate;
    });
  }, [laporan, searchTerm, filterTanggal]);

  // Statistik Dinamis berdasarkan data yang sudah difilter
  const topPerawatan = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((item) => {
      item.detail_tindakan?.forEach((dt: any) => {
        const name = dt.perawatan?.nama_perawatan;
        if (name) counts[name] = (counts[name] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "Konsultasi";
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-8 h-8 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Aktivitas Klinik
            </h1>
          </div>
          <p className="text-slate-400 text-base font-medium italic mt-2">
            Rekapitulasi riwayat kunjungan dan kinerja tenaga medis
            D&apos;Aesthetic Batam.
          </p>
        </div>

        {/* FILTER BAR - Sejajar Vertikal */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 pl-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full lg:w-fit min-w-[450px]">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-100 group w-full sm:w-64">
            <Search className="w-5 h-5 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
            <Input
              placeholder="CARI PASIEN / DOKTER..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-none bg-transparent shadow-none text-[11px] font-black uppercase tracking-widest focus-visible:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#d9c3b6]" />
            <div className="w-full sm:w-44">
              <DatePicker
                value={filterTanggal}
                onChange={setFilterTanggal}
                placeholder="PILIH TANGGAL"
                className="h-10 border-none bg-slate-50/50 shadow-none text-[11px] font-black"
              />
            </div>
            {filterTanggal && (
              <button
                onClick={() => setFilterTanggal(undefined)}
                className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid gap-6 md:grid-cols-3 px-4">
        <Card className="border-none shadow-2xl shadow-slate-100/50 rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-all bg-white">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Kunjungan
              </p>
              <div className="text-5xl font-black text-slate-800 tracking-tighter">
                {loading ? "..." : filteredData.length}
              </div>
              <p className="text-[10px] font-bold text-[#959cc9] uppercase tracking-widest mt-1">
                Pasien Terlayani
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-slate-100 text-slate-700 group-hover:rotate-12 transition-transform shadow-inner">
              <Users className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-100/50 rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-all bg-white">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tindakan Terpopuler
              </p>
              <div className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase line-clamp-1">
                {loading ? "..." : topPerawatan}
              </div>
              <p className="text-[10px] font-bold text-[#d9c3b6] uppercase tracking-widest mt-1 italic">
                Trend Perawatan
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-[#d9c3b6]/10 text-[#d9c3b6] group-hover:rotate-12 transition-transform shadow-inner">
              <TrendingUp className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Rincian Laporan dengan Custom Scrollbar */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[3rem] mx-2">
        <div
          className={cn(
            "max-h-[60vh] overflow-y-auto",
            "scrollbar-thin",
            "[&::-webkit-scrollbar]:w-[6px]",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "hover:[&::-webkit-scrollbar-thumb]:bg-[#d9c3b6]",
          )}
        >
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-20">
              <TableRow className="hover:bg-transparent border-none text-slate-400">
                <TableHead className="font-black px-12 py-8 uppercase text-[11px] tracking-[0.2em]">
                  Waktu Kunjungan
                </TableHead>
                <TableHead className="font-black uppercase text-[11px] tracking-[0.2em]">
                  Pasien & Dokter
                </TableHead>
                <TableHead className="font-black uppercase text-[11px] tracking-[0.2em]">
                  Diagnosa Medis
                </TableHead>
                <TableHead className="font-black uppercase text-[11px] tracking-[0.2em]">
                  Treatment
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-32">
                    <Loader2 className="w-10 h-10 animate-spin text-[#959cc9] mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-40 grayscale opacity-40"
                  >
                    <ClipboardCheck className="w-20 h-20 mx-auto mb-4 text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                      Arsip Tidak Ditemukan
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const tindakans = item.detail_tindakan || [];
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-all border-slate-50"
                    >
                      <TableCell className="px-12 py-10 align-top">
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 bg-slate-100 rounded-2xl text-[#d9c3b6] shadow-inner">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase">
                              {item.reservasi?.tanggal
                                ? format(
                                    new Date(item.reservasi.tanggal),
                                    "dd MMM yyyy",
                                  )
                                : "-"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {item.created_at
                                ? format(new Date(item.created_at), "HH:mm")
                                : "-"}{" "}
                              WIB
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-10">
                        <div className="space-y-2">
                          <div className="font-black text-slate-900 text-base uppercase tracking-tight flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-[#959cc9] shadow-sm shadow-[#959cc9]/50" />{" "}
                            {item.pasien?.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-2.5 tracking-[0.15em]">
                            <Stethoscope className="w-4 h-4 text-[#d9c3b6]" />{" "}
                            dr. {item.reservasi?.dokter?.nama_dokter}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-10 max-w-[300px]">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed uppercase italic line-clamp-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                          &quot;{item.diagnosa}&quot;
                        </p>
                      </TableCell>
                      <TableCell className="align-top py-10">
                        <div className="flex flex-wrap gap-2">
                          {tindakans.length > 0 ? (
                            tindakans.map((t: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-[#959cc9]/5 text-[#959cc9] border-[#959cc9]/20 font-black text-[10px] px-3 py-1 uppercase rounded-xl shadow-sm"
                              >
                                <Activity className="w-3 h-3 mr-1.5 opacity-50" />{" "}
                                {t.perawatan?.nama_perawatan}
                              </Badge>
                            ))
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-black text-slate-300 uppercase px-4 h-7 tracking-widest"
                            >
                              Konsultasi
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="px-6 flex justify-between items-center opacity-60">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
          D&apos;Aesthetic Intelligence Report System
        </p>
        <div className="flex gap-6">
          <button className="text-[10px] font-black text-[#959cc9] uppercase tracking-widest hover:text-[#d9c3b6] transition-colors">
            Export PDF
          </button>
          <button className="text-[10px] font-black text-[#959cc9] uppercase tracking-widest hover:text-[#d9c3b6] transition-colors">
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
