"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  ClipboardList,
  Loader2,
  History,
  Filter,
  XCircle,
  CalendarRange,
  Stethoscope,
  Sparkles,
  Lock,
} from "lucide-react";
import { RekamMedisModal } from "../_component/rekam-medis-modal";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RiwayatPasienPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // State Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fungsi Fetch Data Terproteksi
  const fetchRiwayat = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Ambil info user yang sedang login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Cari ID Dokter berdasarkan auth_user_id
      const { data: dokter } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!dokter) {
        toast.error("Profil dokter tidak ditemukan.");
        return;
      }

      // 3. Query rekam medis yang HANYA terhubung dengan dokter ini
      // Berdasarkan skema, kita filter melalui relasi reservasi_id
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name, nik),
          reservasi:reservasi_id (tanggal, jam, keluhan, dokter_id)
        `,
        )
        .eq("reservasi.dokter_id", dokter.id) // Filter ketat berdasarkan kepemilikan dokter
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Supabase mengembalikan data meskipun reservasi.dokter_id tidak cocok (null di join)
      // Kita filter secara manual untuk memastikan list benar-benar bersih
      const sanitizedData =
        data?.filter((item) => item.reservasi !== null) || [];
      setRiwayat(sanitizedData);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast.error("Gagal memuat arsip medis personal Anda.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

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
              Arsip Medis Saya
            </h1>
          </div>
          <p className="text-slate-400 text-xs lg:text-sm font-medium italic flex items-center justify-center lg:justify-start gap-2">
            <Lock className="w-3 h-3" /> Menampilkan riwayat pasien yang Anda
            tangani.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 bg-white/50 p-2 rounded-2xl border border-slate-100 backdrop-blur-sm">
          <div className="px-4 py-2 text-center border-r border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Pasien Anda
            </p>
            <p className="text-lg font-black text-[#959cc9]">
              {riwayat.length}
            </p>
          </div>
          <div className="px-4 py-2 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Hasil Filter
            </p>
            <p className="text-lg font-black text-[#d9c3b6]">
              {filteredRiwayat.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-50 overflow-hidden">
        <CardContent className="p-5 lg:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <CalendarRange className="w-3 h-3" /> Dari Tanggal
              </Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Pilih Tanggal..."
                className="h-11 rounded-xl border-slate-100 bg-white font-bold text-[11px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <CalendarRange className="w-3 h-3" /> Sampai Tanggal
              </Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Pilih Tanggal..."
                className="h-11 rounded-xl border-slate-100 bg-white font-bold text-[11px]"
              />
            </div>

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

      {/* Table Section */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-50">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-[#959cc9]/5 border-b border-[#959cc9]/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 pl-12 text-[#959cc9]/70">
                  Tanggal
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 text-[#959cc9]/70">
                  Pasien
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-[0.25em] py-7 text-[#959cc9]/70">
                  Diagnosa & Tindakan
                </TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.25em] py-7 pr-12 text-[#959cc9]/70">
                  Aksi
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
                      Tidak ada riwayat untuk Anda
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRiwayat.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-slate-50/80 transition-all duration-300"
                  >
                    <TableCell className="pl-12 py-9 align-top">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center min-w-[65px] h-[65px] bg-[#959cc9] rounded-2xl shadow-lg border-2 border-white ring-1 ring-slate-100 text-white">
                          <span className="text-[11px] font-black">
                            {new Date(
                              item.reservasi?.tanggal,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="text-[8px] font-bold opacity-60 uppercase">
                            {new Date(item.reservasi?.tanggal).getFullYear()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#d9c3b6] uppercase tracking-widest">
                            {item.reservasi?.jam?.slice(0, 5)} WIB
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[8px] font-bold text-slate-300 border-slate-100 uppercase"
                          >
                            Log #{item.id.slice(-4).toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-9">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-base uppercase tracking-tight">
                          <User className="w-4 h-4 text-[#959cc9]" />{" "}
                          {item.pasien?.full_name}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-6">
                          NIK: {item.pasien?.nik || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-9 max-w-sm">
                      <div className="space-y-3">
                        <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm group-hover:border-[#d9c3b6]/40 transition-colors">
                          <div className="flex items-center gap-2 mb-2 opacity-40">
                            <Stethoscope className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">
                              Medical Analysis
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 leading-relaxed uppercase italic line-clamp-2">
                            "{item.diagnosa}"
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.tindakan?.split(", ").map((t: string) => (
                            <div
                              key={t}
                              className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
                            >
                              <Sparkles className="w-2 h-2 text-[#d9c3b6]" />
                              <span className="text-[8px] font-black text-slate-400 uppercase">
                                {t}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-12 py-9 align-top">
                      <RekamMedisModal
                        data={{
                          ...item.reservasi,
                          pasien: item.pasien,
                          rekam_medis: [item],
                        }}
                        onRefresh={fetchRiwayat}
                        viewOnly={true}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
