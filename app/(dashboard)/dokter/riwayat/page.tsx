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
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  User,
  Sparkles,
  ClipboardList,
  Loader2,
  History,
  Activity,
  Filter,
  XCircle,
  CalendarRange,
  Stethoscope,
} from "lucide-react";
import { RekamMedisModal } from "../_component/rekam-medis-modal";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RiwayatPasienPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // State Filter Beragam
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name, nik),
          reservasi:reservasi_id (tanggal, jam, keluhan)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiwayat(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat arsip medis.");
    } finally {
      setLoading(false);
    }
  }

  // Logika Filtering Beragam
  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      const matchSearch =
        item.pasien?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.pasien?.nik?.includes(searchQuery) ||
        item.tindakan?.toLowerCase().includes(searchQuery.toLowerCase());

      const itemDate = new Date(item.reservasi?.tanggal);
      let matchDate = true;

      if (startDate && endDate) {
        matchDate = isWithinInterval(itemDate, {
          start: startOfDay(startDate),
          end: endOfDay(endDate),
        });
      } else if (startDate) {
        matchDate = itemDate >= startOfDay(startDate);
      }

      return matchSearch && matchDate;
    });
  }, [riwayat, searchQuery, startDate, endDate]);

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-12 px-2 lg:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1">
        <div className="space-y-1.5 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-100">
              <History className="w-6 h-6 text-[#959cc9]" />
            </div>
            <h1 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase tracking-tighter">
              Arsip Rekam Medis
            </h1>
          </div>
          <p className="text-slate-400 text-xs lg:text-sm font-medium italic">
            Manajemen database klinis & historis pasien D&apos;Aesthetic.
          </p>
        </div>

        {/* Info Stats Ringkas */}
        <div className="flex items-center justify-center gap-4 bg-white/50 p-2 rounded-2xl border border-slate-100 backdrop-blur-sm">
          <div className="px-4 py-2 text-center border-r border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Total Record
            </p>
            <p className="text-lg font-black text-[#959cc9]">
              {riwayat.length}
            </p>
          </div>
          <div className="px-4 py-2 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Filtered
            </p>
            <p className="text-lg font-black text-[#d9c3b6]">
              {filteredRiwayat.length}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar - Slate & Gold Palette */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-50 overflow-hidden">
        <CardContent className="p-5 lg:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Filter Search */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <Search className="w-3 h-3" /> Cari Pasien
              </Label>
              <Input
                placeholder="NAMA / NIK / TINDAKAN..."
                className="h-11 rounded-xl border-slate-100 bg-white shadow-inner font-bold text-[11px] uppercase tracking-wider focus-visible:ring-[#959cc9]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tanggal Mulai */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <CalendarRange className="w-3 h-3" /> Rentang Awal
              </Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Pilih Tanggal..."
                className="h-11 rounded-xl border-slate-100 bg-white font-bold text-[11px]"
              />
            </div>

            {/* Filter Tanggal Akhir */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <CalendarRange className="w-3 h-3" /> Rentang Akhir
              </Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Pilih Tanggal..."
                className="h-11 rounded-xl border-slate-100 bg-white font-bold text-[11px]"
              />
            </div>

            {/* Tombol Reset */}
            <div className="flex gap-2">
              <Button
                onClick={resetFilters}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <XCircle className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button className="flex-1 h-11 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                <Filter className="w-4 h-4 mr-2 text-[#d9c3b6]" /> Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table - High Contrast */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-50">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-[#959cc9]/5 border-b border-[#959cc9]/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 pl-12 text-[#959cc9]/70">
                  Tanggal Kunjungan
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 text-[#959cc9]/70">
                  Identitas Pasien
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 text-[#959cc9]/70">
                  Ringkasan Diagnosa
                </TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.25em] py-7 pr-12 text-[#959cc9]/70">
                  Opsi Arsip
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
              ) : filteredRiwayat.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-32 opacity-30 grayscale"
                  >
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-[#959cc9]" />
                    <p className="font-black uppercase tracking-[0.4em] text-[10px] text-[#959cc9]">
                      Data Tidak Ditemukan
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRiwayat.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50"
                  >
                    {/* Column 1: Date & Time */}
                    <TableCell className="pl-12 py-9 align-top">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center min-w-[65px] h-[65px] bg-[#959cc9] rounded-2xl shadow-lg border-2 border-white ring-1 ring-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-white/50 mb-0.5" />
                          <span className="text-[11px] font-black text-white leading-none">
                            {new Date(
                              item.reservasi?.tanggal,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="text-[8px] font-bold text-white/60 uppercase mt-0.5">
                            {new Date(item.reservasi?.tanggal).getFullYear()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#d9c3b6] uppercase tracking-widest">
                            {item.reservasi?.jam?.slice(0, 5)} WIB
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[8px] font-bold text-slate-300 border-slate-100 uppercase bg-slate-50"
                          >
                            Log #{item.id.slice(-4).toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Patient Info */}
                    <TableCell className="align-top py-9">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-base uppercase tracking-tight">
                          <User className="w-4 h-4 text-[#959cc9]" />{" "}
                          {item.pasien?.full_name}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-6">
                          NIK: {item.pasien?.nik || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    {/* Column 3: Medical Summary */}
                    <TableCell className="align-top py-9 max-w-sm">
                      <div className="space-y-3">
                        <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm group-hover:border-[#d9c3b6]/40 transition-colors">
                          <div className="flex items-center gap-2 mb-2.5 opacity-40">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-900" />
                            <span className="text-[9px] font-black uppercase text-slate-900 tracking-widest">
                              Analysis Report
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 leading-relaxed uppercase italic line-clamp-2">
                            &quot;{item.diagnosa}&quot;
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {item.tindakan?.split(", ").map((t: string) => (
                            <div
                              key={t}
                              className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#d9c3b6]" />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                {t}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 4: Detailed View */}
                    <TableCell className="text-right pr-12 py-9 align-top">
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mr-2 leading-none">
                          Access Record
                        </span>
                        <RekamMedisModal
                          data={{
                            ...item.reservasi,
                            pasien: item.pasien,
                            rekam_medis: [item],
                          }}
                          onRefresh={fetchRiwayat}
                          viewOnly={true}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] pt-4">
        D&apos;Aesthetic Archive System Portal
      </p>
    </div>
  );
}
