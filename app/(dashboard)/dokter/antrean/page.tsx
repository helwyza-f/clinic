"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, User, ClipboardList, Loader2 } from "lucide-react";
import { RekamMedisModal } from "../_component/rekam-medis-modal";

export default function DokterAntreanPage() {
  const [antrean, setAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Membungkus fetch ke useCallback agar bisa dipanggil di dalam useEffect dengan aman
  const fetchAntreanDanJadwal = useCallback(
    async (dokterId: string) => {
      try {
        const { data, error } = await supabase
          .from("reservasi")
          .select(
            `
          *,
          pasien:pasien_id (full_name, nik),
          rekam_medis:rekam_medis (id, diagnosa, tindakan)
        `,
          )
          .eq("dokter_id", dokterId) // Filter data milik dokter ini
          .in("status", ["Menunggu", "Dikonfirmasi", "Selesai"])
          .order("tanggal", { ascending: true })
          .order("jam", { ascending: true });

        if (error) throw error;
        setAntrean(data || []);
      } catch (error: any) {
        console.error("Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    let channel: any;

    async function initRealtime() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: dokterProfile } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (dokterProfile) {
        // 1. Ambil data awal
        fetchAntreanDanJadwal(dokterProfile.id);

        // 2. Setup Realtime dengan FILTER
        // Menambahkan filter agar hanya mendengarkan baris yang dokter_id nya cocok
        channel = supabase
          .channel(`antrean_dokter_${dokterProfile.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "reservasi",
              filter: `dokter_id=eq.${dokterProfile.id}`, // KUNCI PERBAIKAN: Filter di sisi server
            },
            (payload) => {
              console.log("Update khusus untuk saya:", payload);
              fetchAntreanDanJadwal(dokterProfile.id);

              if (payload.eventType === "INSERT") {
                toast.success("Ada pasien baru mendaftar di jadwal Anda!", {
                  description: "Silakan cek daftar antrean.",
                });
              }
            },
          )
          .subscribe();
      }
    }

    initRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchAntreanDanJadwal]);

  async function updateStatus(id: string, status: string) {
    // Update Optimistik agar UI terasa instan
    const originalAntrean = [...antrean];
    setAntrean((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    const { error } = await supabase
      .from("reservasi")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Gagal update status");
      setAntrean(originalAntrean); // Rollback jika gagal
    } else {
      toast.success(`Pasien diset ke ${status}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-pink-900 uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-pink-500" />
            Antrean Pasien Saya
          </h1>
          <p className="text-pink-600/70 text-sm font-medium italic">
            Hanya menampilkan dan menerima notifikasi jadwal Anda sendiri.
          </p>
        </div>
      </div>

      <Card className="border-pink-100 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-2xl">
        <Table>
          <TableHeader className="bg-pink-500">
            <TableRow className="hover:bg-pink-500 border-none">
              <TableHead className="text-white font-bold">
                Waktu & Pasien
              </TableHead>
              <TableHead className="text-white font-bold">Keluhan</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-right text-white font-bold">
                Rekam Medis
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-pink-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="font-bold">Memuat jadwal pribadi...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : antrean.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-20 text-slate-400 italic"
                >
                  Belum ada jadwal pasien untuk Anda.
                </TableCell>
              </TableRow>
            ) : (
              antrean.map((item) => {
                const isSelesai = item.status === "Selesai";
                const isRMDiisi =
                  item.rekam_medis && item.rekam_medis.length > 0;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-pink-50/30 transition-colors border-pink-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-pink-900 text-sm uppercase">
                            {item.jam?.slice(0, 5)} - {item.pasien?.full_name}
                          </div>
                          <div className="text-[10px] text-pink-500 font-bold opacity-70">
                            <User className="w-3 h-3 inline mr-1" /> NIK:{" "}
                            {item.pasien?.nik || "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 italic max-w-[200px] truncate">
                      "{item.keluhan || "Treatment rutin"}"
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={isSelesai}
                        defaultValue={item.status}
                        onValueChange={(v) => updateStatus(item.id, v)}
                      >
                        <SelectTrigger
                          className={`w-[140px] h-9 border-none font-bold text-[10px] uppercase rounded-full shadow-sm ${
                            item.status === "Menunggu"
                              ? "bg-orange-100 text-orange-600"
                              : item.status === "Dikonfirmasi"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Menunggu">Menunggu</SelectItem>
                          <SelectItem value="Dikonfirmasi">
                            Konfirmasi
                          </SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelesai ? (
                        <RekamMedisModal
                          data={item}
                          onRefresh={() =>
                            fetchAntreanDanJadwal(item.dokter_id)
                          }
                          viewOnly={isRMDiisi}
                        />
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[8px] opacity-40"
                        >
                          MENUNGGU SELESAI
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
