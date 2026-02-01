"use client";

import { useEffect, useState, useCallback } from "react";
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
import { ReceiptText, CreditCard, Wallet, Loader2 } from "lucide-react";
import { BayarModal } from "./_components/bayar-modal";
import { toast } from "sonner";

export default function TransaksiPage() {
  const [antreanBayar, setAntreanBayar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Membungkus fetch dalam useCallback agar stabil saat digunakan di useEffect
  const fetchAntreanBayar = useCallback(async () => {
    // Hanya tampilkan loading spinner pada pemuatan pertama
    if (antreanBayar.length === 0) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name),
          transaksi:transaksi (id, status_pembayaran)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter: Hanya tampilkan yang belum memiliki data di tabel transaksi
      const filtered = data?.filter(
        (item) => !item.transaksi || item.transaksi.length === 0,
      );
      setAntreanBayar(filtered || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast.error("Gagal sinkronisasi data transaksi");
    } finally {
      setLoading(false);
    }
  }, [supabase, antreanBayar.length]);

  useEffect(() => {
    fetchAntreanBayar();

    // SETUP REALTIME LISTENER
    // Mendengarkan perubahan pada rekam_medis (saat dokter selesai input)
    // dan transaksi (saat kasir lain mungkin sudah memproses)
    const channel = supabase
      .channel("kasir_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rekam_medis" },
        () => {
          fetchAntreanBayar();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transaksi" },
        () => {
          fetchAntreanBayar();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchAntreanBayar]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-pink-900 uppercase tracking-tight">
            Kasir / Transaksi
          </h1>
          <p className="text-pink-600/70 text-sm italic font-medium">
            Proses pembayaran real-time untuk tindakan medis selesai.
          </p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-pink-100 shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-pink-900 uppercase tracking-widest">
            Sistem Aktif
          </span>
        </div>
      </div>

      <Card className="border-pink-100 shadow-xl shadow-pink-50/50 bg-white overflow-hidden rounded-3xl">
        <Table>
          <TableHeader className="bg-pink-500">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-white font-black px-6 uppercase text-[10px] tracking-widest">
                Pasien
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest">
                Tindakan Dokter
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-right text-white font-black px-6 uppercase text-[10px] tracking-widest">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">
                      Menyinkronkan Tagihan...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : antreanBayar.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-20 text-slate-400 font-medium italic"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ReceiptText className="w-10 h-10 text-pink-100" />
                    <span>Tidak ada tagihan tertunda saat ini.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              antreanBayar.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-pink-50/30 transition-colors border-pink-50"
                >
                  <TableCell className="px-6 py-4">
                    <div className="font-black text-pink-900 text-sm">
                      {item.pasien?.full_name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      RM-ID: {item.id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-slate-700">
                      {item.tindakan}
                    </div>
                    <div className="text-[10px] text-pink-400 font-medium italic mt-0.5">
                      Diag: {item.diagnosa}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-none bg-orange-100 text-orange-600 shadow-sm">
                      Menunggu Pembayaran
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <BayarModal data={item} onRefresh={fetchAntreanBayar} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.3em] pt-4">
        D&apos;Aesthetic Kasir Terintegrasi &copy; 2026
      </p>
    </div>
  );
}
