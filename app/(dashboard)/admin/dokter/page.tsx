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
  Trash2,
  Stethoscope,
  Mail,
  ShieldCheck,
  Sparkles,
  UserX,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DokterModal } from "./_component/dokter-modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
    const { error } = await supabase.from("dokter").delete().eq("id", id);

    if (!error) {
      toast.success("Profil dokter berhasil dihapus");
      fetchDokter();
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
              Tenaga Medis
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Manajemen kredensial dan otorisasi dokter klinik.
          </p>
        </div>
        <DokterModal onRefresh={fetchDokter} />
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-slate-400 font-black px-10 py-6 uppercase text-[10px] tracking-[0.2em]">
                Profil Dokter
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Spesialisasi
              </TableHead>
              <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Status Otoritas
              </TableHead>
              <TableHead className="text-right pr-10 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                Opsi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-32">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#959cc9]" />
                  <p className="mt-4 text-slate-300 font-black uppercase text-[10px] tracking-[0.4em]">
                    Sinkronisasi Data...
                  </p>
                </TableCell>
              </TableRow>
            ) : dokters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-40 grayscale opacity-30"
                >
                  <UserX className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                    Belum ada data dokter
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              dokters.map((d) => (
                <TableRow
                  key={d.id}
                  className="hover:bg-slate-50/50 transition-all border-slate-50 group"
                >
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#959cc9] shadow-inner">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight">
                          {d.nama_dokter}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <Mail className="w-3 h-3 text-[#d9c3b6]" /> {d.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-[#d9c3b6]/10 text-[#213125] hover:bg-[#d9c3b6]/20 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg"
                    >
                      {d.spesialis}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {d.auth_user_id ? (
                      <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex w-fit gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" /> Terkoneksi
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase tracking-widest border-red-100 text-red-400 bg-red-50/50 px-3 py-1.5 rounded-full"
                      >
                        Akun Tidak Aktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex justify-end gap-2">
                      <DokterModal data={d} onRefresh={fetchDokter} />
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
                        <AlertDialogContent className="border-none rounded-[2.5rem] shadow-2xl p-10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
                              Hapus Tenaga Medis?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 font-medium pt-2 italic">
                              Profil{" "}
                              <span className="font-bold text-red-500">
                                {d.nama_dokter}
                              </span>{" "}
                              akan dihapus dari database. Akun login pada sistem
                              Auth tetap harus dikelola secara manual.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-6 gap-3">
                            <AlertDialogCancel className="rounded-2xl border-slate-100 font-bold uppercase text-[10px] tracking-widest h-12">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(d.id)}
                              className="rounded-2xl bg-red-500 hover:bg-red-600 font-bold uppercase text-[10px] tracking-widest h-12 px-8"
                            >
                              Konfirmasi Hapus
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
