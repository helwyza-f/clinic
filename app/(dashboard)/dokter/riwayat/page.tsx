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
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, FileText } from "lucide-react";
import { RekamMedisModal } from "../_component/rekam-medis-modal";
import { toast } from "sonner";

export default function RiwayatPasienPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    setLoading(true);
    try {
      // Mengambil data dari tabel rekam_medis yang terhubung ke pasien dan reservasi
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (
            full_name,
            nik
          ),
          reservasi:reservasi_id (
            tanggal,
            keluhan
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiwayat(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat riwayat: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter pencarian berdasarkan nama pasien atau NIK
  const filteredRiwayat = riwayat.filter(
    (item) =>
      item.pasien?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.pasien?.nik?.includes(searchQuery),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pink-900">
            Riwayat Rekam Medis
          </h1>
          <p className="text-pink-600/70 text-sm italic">
            Cari dan tinjau riwayat diagnosa pasien terdahulu.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <Input
            placeholder="Cari Nama Pasien / NIK..."
            className="pl-10 border-pink-100 focus-visible:ring-pink-400 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-pink-100 shadow-md bg-white overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-pink-50/50">
              <TableRow>
                <TableHead className="text-pink-900 font-bold px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Tanggal Periksa
                  </div>
                </TableHead>
                <TableHead className="text-pink-900 font-bold">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Pasien
                  </div>
                </TableHead>
                <TableHead className="text-pink-900 font-bold">
                  Diagnosa & Tindakan
                </TableHead>
                <TableHead className="text-right text-pink-900 font-bold px-6">
                  Detail
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-20 text-pink-300 italic"
                  >
                    Memuat riwayat medis...
                  </TableCell>
                </TableRow>
              ) : filteredRiwayat.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-20 text-slate-400 italic"
                  >
                    Data rekam medis tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRiwayat.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-pink-50/30 transition-colors"
                  >
                    <TableCell className="px-6">
                      <div className="font-semibold text-slate-700">
                        {new Date(item.reservasi?.tanggal).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ID Reservasi: {item.reservasi_id.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-pink-900">
                        {item.pasien?.full_name}
                      </div>
                      <div className="text-[10px] text-pink-500 font-mono">
                        NIK: {item.pasien?.nik}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">
                        Diag: {item.diagnosa}
                      </div>
                      <div className="text-[10px] text-blue-600 font-medium line-clamp-1">
                        Tindakan: {item.tindakan}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      {/* Menggunakan Modal yang sama dengan mode viewOnly */}
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
        </CardContent>
      </Card>
    </div>
  );
}
