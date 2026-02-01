"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Stethoscope, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DokterModal } from "./_component/dokter-modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function KelolaDokterPage() {
  const [dokters, setDokters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDokter();
  }, []);

  async function fetchDokter() {
    setLoading(true);
    const { data, error } = await supabase
      .from("dokter")
      .select("*")
      .order("nama_dokter");

    if (!error) {
      setDokters(data);
    } else {
      toast.error("Gagal mengambil data dokter");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Hapus data dokter ini? Akun login di Auth harus dihapus manual di dashboard untuk keamanan.",
      )
    )
      return;

    const deleteProcess = async () => {
      const { error } = await supabase.from("dokter").delete().eq("id", id);
      if (error) throw error;
    };

    toast.promise(deleteProcess(), {
      loading: "Menghapus profil...",
      success: () => {
        fetchDokter();
        return "Profil dokter dihapus dari database";
      },
      error: (err) => `Gagal: ${err.message}`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pink-900">Manajemen Dokter</h1>
          <p className="text-pink-600/70 text-sm">
            Kelola data tenaga medis D'Aesthetic Clinic.
          </p>
        </div>
        <DokterModal onRefresh={fetchDokter} />
      </div>

      <Card className="border-pink-100 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-pink-50">
              <TableRow>
                <TableHead className="text-pink-900 font-bold">
                  Dokter
                </TableHead>
                <TableHead className="text-pink-900 font-bold">
                  Spesialis
                </TableHead>
                <TableHead className="text-pink-900 font-bold">
                  Status Akun
                </TableHead>
                <TableHead className="text-right text-pink-900 font-bold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : (
                dokters.map((d) => (
                  <TableRow
                    key={d.id}
                    className="hover:bg-pink-50/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-pink-900">
                            {d.nama_dokter}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {d.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded border border-pink-100">
                        {d.spesialis}
                      </span>
                    </TableCell>
                    <TableCell>
                      {d.auth_user_id ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-green-200 text-green-600 bg-green-50 flex w-fit gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" /> Terhubung Auth
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-red-200 text-red-600 bg-red-50"
                        >
                          Belum Ada Akun
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DokterModal data={d} onRefresh={fetchDokter} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(d.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
