"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, XCircle, CalendarDays, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ReservasiModal } from "./_component/reservasi-modal";
import TableView from "./_component/table_view";
import { DatePicker } from "@/components/date-picker";
import { format, parseISO } from "date-fns";

function JadwalContent() {
  const [mounted, setMounted] = useState(false);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dateQuery = searchParams.get("date");
  const supabase = createClient();

  const fetchJadwal = useCallback(async () => {
    // Jangan set loading true jika data sudah ada (agar tidak flicker saat realtime update)
    if (jadwal.length === 0) setLoading(true);

    const { data, error } = await supabase
      .from("reservasi")
      .select(
        `
        *, 
        pasien:pasien_id (full_name, no_telepon),
        dokter:dokter_id (nama_dokter),
        rekam_medis (
          id,
          detail_tindakan (
            id,
            perawatan (nama_perawatan, harga_promo, harga_normal)
          )
        )
      `,
      )
      .order("tanggal", { ascending: true })
      .order("jam", { ascending: true });

    if (!error && data) setJadwal(data);
    setLoading(false);
  }, [supabase, jadwal.length]);

  useEffect(() => {
    setMounted(true);
    fetchJadwal();
  }, [fetchJadwal]);

  useEffect(() => {
    if (!mounted) return;

    const channel = supabase
      .channel("jadwal_realtime_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservasi" },
        () => {
          // Panggil ulang fetch untuk mendapatkan data join terbaru
          fetchJadwal();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted, fetchJadwal, supabase]);

  const filteredJadwal = useMemo(() => {
    if (!dateQuery) return jadwal;
    return jadwal.filter((item) => item.tanggal === dateQuery);
  }, [jadwal, dateQuery]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    const prev = [...jadwal];

    // Optimistic Update agar UI langsung berubah sebelum server merespon
    setJadwal(prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));

    const { error } = await supabase
      .from("reservasi")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Gagal memperbarui status");
      setJadwal(prev);
    } else {
      toast.success(`Status diperbarui ke ${newStatus}`);
    }
  }

  const handleDateSelect = (date?: Date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      router.push(`/admin/jadwal?date=${formattedDate}`);
    } else {
      router.push("/admin/jadwal");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Manajemen Antrean
            </h1>
          </div>
          <p className="text-slate-400 text-sm italic font-medium">
            Status diperbarui secara real-time dari ruang periksa.
          </p>
        </div>
        <ReservasiModal onRefresh={fetchJadwal} />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-3">
          {dateQuery ? (
            <div className="flex items-center gap-2 bg-clinic-gradient text-white px-5 py-2.5 rounded-2xl shadow-lg animate-in zoom-in">
              <CalendarDays className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Filter: {dateQuery}
              </span>
              <button
                onClick={() => router.push("/admin/jadwal")}
                className="ml-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] px-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#d9c3b6]" /> Monitoring Seluruh
              Jadwal
            </div>
          )}
        </div>

        <div className="w-full md:w-64">
          <DatePicker
            value={dateQuery ? parseISO(dateQuery) : undefined}
            onChange={handleDateSelect}
            placeholder="Filter Tanggal..."
            className="h-12 text-xs"
          />
        </div>
      </div>

      <TableView
        jadwal={filteredJadwal}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default function JadwalPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={<Loader2 className="w-12 h-12 animate-spin text-[#959cc9]" />}
      >
        <JadwalContent />
      </Suspense>
    </div>
  );
}
