"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User, Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RiwayatTransaksiPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    setLoading(true);
    try {
      // Ambil data dari tabel transaksi, hubungkan ke rekam_medis dan pasien
      const { data, error } = await supabase
        .from("transaksi")
        .select(
          `
          *,
          rekam_medis:rekam_medis_id (
            tindakan,
            pasien:pasien_id (full_name, nik)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiwayat(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = riwayat.filter((item) =>
    item.rekam_medis?.pasien?.full_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pink-900">
            Riwayat Pembayaran
          </h1>
          <p className="text-pink-600/70 text-sm italic">
            Daftar seluruh transaksi lunas D'Aesthetic Clinic.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <Input
            placeholder="Cari Nama Pasien..."
            className="pl-10 border-pink-100 focus-visible:ring-pink-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-pink-100 shadow-md bg-white overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-pink-50/50">
            <TableRow>
              <TableHead className="text-pink-900 font-bold px-6">
                Tanggal & No. Nota
              </TableHead>
              <TableHead className="text-pink-900 font-bold">Pasien</TableHead>
              <TableHead className="text-pink-900 font-bold">
                Tindakan
              </TableHead>
              <TableHead className="text-pink-900 font-bold">
                Total Harga
              </TableHead>
              <TableHead className="text-pink-900 font-bold">Metode</TableHead>
              <TableHead className="text-right text-pink-900 font-bold px-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-400 italic"
                >
                  Belum ada riwayat transaksi.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-pink-50/30">
                  <TableCell className="px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </div>
                    <div className="text-xs font-mono text-pink-600">
                      #INV-{item.id.slice(0, 5).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-pink-900 text-sm">
                      {item.rekam_medis?.pasien?.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.rekam_medis?.tindakan}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 text-sm">
                    Rp {Number(item.total_harga).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-pink-100 text-pink-700 bg-pink-50"
                    >
                      {item.metode_pembayaran}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Badge className="bg-green-500 hover:bg-green-600 shadow-sm border-none">
                      Lunas
                    </Badge>
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
