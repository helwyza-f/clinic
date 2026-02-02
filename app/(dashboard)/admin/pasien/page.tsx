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
import {
  Search,
  Trash2,
  User,
  Phone,
  MapPin,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
    const { error } = await supabase
      .from("pasien")
      .delete()
      .eq("auth_user_id", authUserId);

    if (!error) {
      toast.success("Data pasien berhasil dihapus");
      fetchPasien();
    } else {
      toast.error("Gagal menghapus: " + error.message);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Database Pasien
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Manajemen informasi rekam profil dan kredensial pasien.
          </p>
        </div>
        <PasienModal onRefresh={fetchPasien} />
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 max-w-md">
        <Search className="w-5 h-5 text-slate-300 ml-2" />
        <Input
          placeholder="Cari Nama atau NIK..."
          className="border-none bg-transparent shadow-none focus-visible:ring-0 font-bold text-xs uppercase tracking-widest"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-slate-400 font-black px-10 py-6 uppercase text-[10px] tracking-[0.2em]">
                Profil Pasien
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Identitas NIK
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Kontak
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Alamat Residensial
              </TableHead>
              <TableHead className="text-right pr-10 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Opsi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-32">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#959cc9]" />
                  <p className="mt-4 text-slate-300 font-black uppercase text-[10px] tracking-[0.4em]">
                    Sinkronisasi Data...
                  </p>
                </TableCell>
              </TableRow>
            ) : filteredPasien.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-40 grayscale opacity-30"
                >
                  <User className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                    Data pasien tidak ditemukan
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filteredPasien.map((p) => (
                <TableRow
                  key={p.auth_user_id}
                  className="hover:bg-slate-50/50 transition-all border-slate-50 group"
                >
                  <TableCell className="px-10 py-8">
                    <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                      {p.full_name}
                    </div>
                    <div className="text-[9px] font-black text-[#d9c3b6] uppercase tracking-widest mt-1">
                      ID: {p.auth_user_id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-500 text-xs">
                    {p.nik || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                      <Phone className="w-3 h-3 text-[#959cc9]" />
                      {p.no_telepon || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed italic uppercase font-medium">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {p.alamat || "Alamat belum diatur"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex justify-end gap-2">
                      <PasienModal data={p} onRefresh={fetchPasien} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-none rounded-[2rem] shadow-2xl p-8">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
                              Hapus Data Pasien?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 font-medium pt-2 italic">
                              Tindakan ini permanen. Seluruh riwayat medis atas
                              nama{" "}
                              <span className="font-bold text-red-500">
                                {p.full_name}
                              </span>{" "}
                              mungkin akan terdampak.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-6 gap-3">
                            <AlertDialogCancel className="rounded-2xl border-slate-100 font-bold uppercase text-[10px] tracking-widest h-12">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.auth_user_id)}
                              className="rounded-2xl bg-red-500 hover:bg-red-600 font-bold uppercase text-[10px] tracking-widest h-12 px-8"
                            >
                              Hapus Permanen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
