"use client";

import { useEffect, useState, useMemo } from "react";
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
  Receipt,
  Search,
  Printer,
  Sparkles,
  CalendarDays,
  Filter,
  XCircle,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function RiwayatTransaksiPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggal, setFilterTanggal] = useState<Date | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    setLoading(true);
    try {
      // Fetch data dengan join multi-perawatan melalui junction table
      const { data, error } = await supabase
        .from("transaksi")
        .select(
          `
          *,
          rekam_medis:rekam_medis_id (
            id,
            pasien:pasien_id (full_name, nik),
            detail_tindakan (
              id,
              perawatan:perawatan_id (nama_perawatan)
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiwayat(data || []);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Gabungan filter Pencarian Nama dan Tanggal
  const filteredData = useMemo(() => {
    return riwayat.filter((item) => {
      const matchNama = item.rekam_medis?.pasien?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const itemDate = format(new Date(item.created_at), "yyyy-MM-dd");
      const matchTanggal = filterTanggal
        ? itemDate === format(filterTanggal, "yyyy-MM-dd")
        : true;

      return matchNama && matchTanggal;
    });
  }, [riwayat, searchTerm, filterTanggal]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Archive Transaksi
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Audit riwayat pembayaran lunas dan laporan tindakan medis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
            <Input
              placeholder="Cari Pasien..."
              className="h-12 pl-11 rounded-2xl border-slate-100 bg-white shadow-xl shadow-slate-100/50 focus-visible:ring-[#959cc9]/30 font-bold text-xs uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="w-full sm:w-56">
            <DatePicker
              value={filterTanggal}
              onChange={setFilterTanggal}
              placeholder="Filter Tanggal"
              className="h-12 border-slate-100 bg-white shadow-xl shadow-slate-100/50"
            />
          </div>

          {filterTanggal && (
            <button
              onClick={() => setFilterTanggal(undefined)}
              className="p-3 hover:bg-red-50 text-red-400 rounded-2xl transition-all shadow-sm bg-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-slate-400 font-black px-10 py-6 uppercase text-[10px] tracking-[0.2em]">
                Invoice & Waktu
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Pasien
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Rincian Tindakan
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Total
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] text-center">
                Metode
              </TableHead>
              <TableHead className="text-right text-slate-400 font-black px-10 uppercase text-[10px] tracking-[0.2em]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-32">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#959cc9] rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                      Sinkronisasi Arsip...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                    <Receipt className="w-16 h-16 text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">
                      Data riwayat tidak ditemukan
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const details = item.rekam_medis?.detail_tindakan || [];

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-all border-slate-50 group"
                  >
                    <TableCell className="px-10 py-8 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[9px] font-black text-[#d9c3b6] uppercase tracking-widest flex items-center gap-2">
                          <ShoppingBag className="w-3 h-3" /> INV-
                          {item.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-tighter">
                          <CalendarDays className="w-3.5 h-3.5 text-[#959cc9]" />
                          {format(new Date(item.created_at), "dd MMM yyyy")}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-8">
                      <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        {item.rekam_medis?.pasien?.full_name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        NIK: {item.rekam_medis?.pasien?.nik || "-"}
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-8">
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        {details.length > 0 ? (
                          details.map((dt: any) => (
                            <div
                              key={dt.id}
                              className="flex items-center gap-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-[#d9c3b6]" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                {dt.perawatan?.nama_perawatan}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 italic uppercase">
                            Konsultasi Umum
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-8">
                      <div className="font-black text-slate-900 text-sm tracking-tight">
                        Rp {Number(item.total_harga).toLocaleString("id-ID")}
                      </div>
                    </TableCell>

                    <TableCell className="text-center align-top py-8">
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-500 border-slate-200 font-black text-[9px] px-3 py-1 uppercase rounded-lg shadow-sm"
                      >
                        <CreditCard className="w-3 h-3 mr-1.5 opacity-50" />{" "}
                        {item.metode_pembayaran}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right px-10 align-top py-8">
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Lunas
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-center gap-3 pt-6 opacity-20">
        <div className="h-[1px] w-12 bg-slate-300" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
          D&apos;Aesthetic Billing Archives
        </p>
        <div className="h-[1px] w-12 bg-slate-300" />
      </div>
    </div>
  );
}
