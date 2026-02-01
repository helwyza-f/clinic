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
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, User, Activity } from "lucide-react";
import { toast } from "sonner";

export default function MasterRekamMedisPage() {
  const [dataMedis, setDataMedis] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMasterMedis();
  }, []);

  async function fetchMasterMedis() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name, nik),
          reservasi:reservasi_id (tanggal, keluhan)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDataMedis(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat data rekam medis");
    } finally {
      setLoading(false);
    }
  }

  const filteredData = dataMedis.filter(
    (item) =>
      item.pasien?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.pasien?.nik?.includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pink-900">
            Master Rekam Medis
          </h1>
          <p className="text-pink-600/70 text-sm italic">
            Arsip pusat seluruh catatan medis pasien D'Aesthetic.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <Input
            placeholder="Cari Nama / NIK Pasien..."
            className="pl-10 border-pink-100"
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
                Waktu & Pasien
              </TableHead>
              <TableHead className="text-pink-900 font-bold">
                Keluhan Awal
              </TableHead>
              <TableHead className="text-pink-900 font-bold">
                Hasil Diagnosa
              </TableHead>
              <TableHead className="text-pink-900 font-bold">
                Tindakan
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Memuat arsip...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-400 italic"
                >
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-pink-50/30">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-pink-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {new Date(item.reservasi?.tanggal).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    <div className="font-bold text-pink-900">
                      {item.pasien?.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NIK: {item.pasien?.nik}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 italic max-w-[150px] truncate">
                    "{item.reservasi?.keluhan || "-"}"
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-start gap-2">
                      <Activity className="w-3 h-3 text-orange-400 mt-1" />
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {item.diagnosa}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 text-[10px]">
                      {item.tindakan}
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
