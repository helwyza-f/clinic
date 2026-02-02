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
import {
  ReceiptText,
  Loader2,
  Sparkles,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";
import { BayarModal } from "./_components/bayar-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TransaksiPage() {
  const [antreanBayar, setAntreanBayar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAntreanBayar = useCallback(async () => {
    if (antreanBayar.length === 0) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("rekam_medis")
        .select(
          `
          *,
          pasien:pasien_id (full_name),
          transaksi:transaksi (id, status_pembayaran),
          detail_tindakan (
            id,
            harga_saat_ini,
            perawatan:perawatan_id (nama_perawatan)
          )
        `,
        )
        // Filter Krusial: Hanya munculkan jika diagnosa SUDAH diisi oleh dokter
        .neq("diagnosa", "Menunggu Pemeriksaan")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter tambahan: Hanya yang belum ada record di tabel transaksi
      const filtered = data?.filter(
        (item) => !item.transaksi || item.transaksi.length === 0,
      );
      setAntreanBayar(filtered || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast.error("Gagal sinkronisasi billing");
    } finally {
      setLoading(false);
    }
  }, [supabase, antreanBayar.length]);

  useEffect(() => {
    fetchAntreanBayar();
    const channel = supabase
      .channel("kasir_realtime_v2")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rekam_medis" },
        () => fetchAntreanBayar(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transaksi" },
        () => fetchAntreanBayar(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "detail_tindakan" },
        () => fetchAntreanBayar(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchAntreanBayar]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Billing & Kasir
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Tagihan otomatis berdasarkan diagnosa final dokter.
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-[1.25rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
            Data Diagnosa Sinkron
          </span>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none text-slate-400">
              <TableHead className="font-black px-10 py-6 uppercase text-[10px] tracking-[0.2em]">
                Identitas Pasien
              </TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em]">
                Diagnosa & Tindakan
              </TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em]">
                Total Billing
              </TableHead>
              <TableHead className="text-right font-black px-10 uppercase text-[10px] tracking-[0.2em]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-32">
                  <Loader2 className="w-10 h-10 animate-spin text-[#959cc9] mx-auto" />
                </TableCell>
              </TableRow>
            ) : antreanBayar.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-40 grayscale opacity-30"
                >
                  <div className="flex flex-col items-center gap-3">
                    <ReceiptText className="w-16 h-16 text-slate-200" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Menunggu Dokter Mengisi Rekam Medis...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              antreanBayar.map((item) => {
                const details = item.detail_tindakan || [];
                const totalCalculated = details.reduce(
                  (acc: number, curr: any) =>
                    acc + (Number(curr.harga_saat_ini) || 0),
                  0,
                );

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-all border-slate-50"
                  >
                    <TableCell className="px-10 py-8">
                      <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        {item.pasien?.full_name}
                      </div>
                      <div className="text-[9px] font-black text-[#d9c3b6] uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" /> RM-
                        {item.id.slice(0, 8).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3 h-3 text-[#959cc9]" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase italic line-clamp-1">
                            Diagnosa: {item.diagnosa}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {details.map((dt: any) => (
                            <Badge
                              key={dt.id}
                              variant="outline"
                              className="text-[9px] border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase py-0 px-2 h-5"
                            >
                              {dt.perawatan?.nama_perawatan}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-none font-black text-[11px] px-4 py-1.5 rounded-full shadow-sm",
                          totalCalculated > 0
                            ? "bg-[#d9c3b6]/20 text-[#213125]"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        Rp {totalCalculated.toLocaleString("id-ID")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <BayarModal
                        data={item}
                        totalAmount={totalCalculated}
                        onRefresh={fetchAntreanBayar}
                      />
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
