"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileBarChart, Users, ClipboardCheck, TrendingUp } from "lucide-react";

export default function LaporanAdminPage() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchLaporan();
  }, []);

  async function fetchLaporan() {
    setLoading(true);
    // Mengambil data dari view yang kita buat tadi
    const { data } = await supabase
      .from("laporan_klinik")
      .select("*")
      .order("tanggal_kunjungan", { ascending: false });
    if (data) setLaporan(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900">
          Laporan Aktivitas Klinik
        </h1>
        <p className="text-pink-600/70 text-sm italic">
          Rekapitulasi kunjungan dan tindakan medis dr. Eny Aesthetic.
        </p>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-pink-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-pink-900">
              Total Kunjungan
            </CardTitle>
            <Users className="w-4 h-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-pink-900">
              {laporan.length}
            </div>
            <p className="text-[10px] text-pink-500">
              Pasien selesai treatment
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-pink-900">
              Tindakan Terpopuler
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-800 truncate">
              Facial Treatment
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Paling sering dilakukan dokter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Rincian Laporan */}
      <Card className="border-pink-100 shadow-md bg-white overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-pink-50/50">
            <TableRow>
              <TableHead className="text-pink-900 font-bold px-6">
                Tanggal
              </TableHead>
              <TableHead className="text-pink-900 font-bold">Pasien</TableHead>
              <TableHead className="text-pink-900 font-bold">Dokter</TableHead>
              <TableHead className="text-pink-900 font-bold">
                Tindakan
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Memuat laporan...
                </TableCell>
              </TableRow>
            ) : (
              laporan.map((item) => (
                <TableRow
                  key={item.rekam_medis_id}
                  className="hover:bg-pink-50/30"
                >
                  <TableCell className="px-6 text-xs">
                    {item.tanggal_kunjungan}
                  </TableCell>
                  <TableCell className="font-bold text-pink-900 text-sm">
                    {item.nama_pasien}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {item.nama_dokter}
                  </TableCell>
                  <TableCell className="text-xs italic text-blue-600 font-semibold">
                    {item.tindakan}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
