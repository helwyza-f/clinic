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
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PasienModal } from "./_component/modal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PasienPage() {
  const [pasien, setPasien] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPasien();
  }, []);

  async function fetchPasien() {
    setLoading(true);
    // Mengambil semua data dari tabel pasien
    const { data, error } = await supabase
      .from("pasien")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPasien(data || []);
    setLoading(false);
  }

  const filteredPasien = pasien.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(searchLower) ||
      p.nik?.includes(searchQuery)
    );
  });

  async function handleDelete(authUserId: string) {
    const deleteProcess = async () => {
      // Menghapus berdasarkan auth_user_id sesuai skema database
      const { error } = await supabase
        .from("pasien")
        .delete()
        .eq("auth_user_id", authUserId);

      if (error) throw error;
    };

    toast.promise(deleteProcess(), {
      loading: "Sedang menghapus data...",
      success: () => {
        fetchPasien();
        return "Data pasien berhasil dihapus";
      },
      error: (err) => `Gagal menghapus: ${err.message}`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pink-900">Data Pasien</h1>
          <p className="text-pink-600/70 text-sm">
            Kelola semua informasi data pasien D'Aesthetic Clinic.
          </p>
        </div>
        <PasienModal onRefresh={fetchPasien} />
      </div>

      <Card className="border-pink-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="w-4 h-4 text-pink-400" />
            <Input
              placeholder="Cari nama atau NIK..."
              className="border-pink-100 focus-visible:ring-pink-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-pink-50 hover:bg-pink-50">
                <TableHead className="text-pink-900">Nama</TableHead>
                <TableHead className="text-pink-900">NIK</TableHead>
                <TableHead className="text-pink-900">No. Telepon</TableHead>
                <TableHead className="text-pink-900">Alamat</TableHead>
                <TableHead className="text-right text-pink-900">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-pink-900/50 italic"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredPasien.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-pink-900/50 italic"
                  >
                    {searchQuery
                      ? `Pasien "${searchQuery}" tidak ditemukan.`
                      : "Belum ada data pasien."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPasien.map((p) => (
                  <TableRow
                    key={`pasien-${p.auth_user_id}`} // Menggunakan auth_user_id sebagai key unik
                    className="hover:bg-pink-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-pink-900">
                      {p.full_name}
                    </TableCell>
                    <TableCell>{p.nik || "-"}</TableCell>
                    <TableCell>{p.no_telepon || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {p.alamat}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <PasienModal
                        key={`edit-${p.auth_user_id}`}
                        data={p}
                        onRefresh={fetchPasien}
                      />

                      <AlertDialog key={`delete-dialog-${p.auth_user_id}`}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-pink-100">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-pink-900">
                              Hapus Data Pasien?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data pasien{" "}
                              <strong className="text-pink-900">
                                {p.full_name}
                              </strong>{" "}
                              akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-pink-100 text-pink-900">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.auth_user_id)} // Mengirim auth_user_id
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
