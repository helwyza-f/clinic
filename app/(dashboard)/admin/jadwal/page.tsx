"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { List, Loader2, XCircle, CalendarDays, Filter } from "lucide-react";
import { toast } from "sonner";
import { ReservasiModal } from "./_component/reservasi-modal";
import TableView from "./_component/table_view";
import { Input } from "@/components/ui/input";

// Pisahkan konten utama yang menggunakan searchParams ke komponen tersendiri
function JadwalContent() {
  const [mounted, setMounted] = useState(false);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dateQuery = searchParams.get("date");
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    fetchJadwal();
  }, []);

  const fetchJadwal = useCallback(async () => {
    if (jadwal.length === 0) setLoading(true);
    const { data, error } = await supabase
      .from("reservasi")
      .select("*, pasien:pasien_id (full_name), dokter:dokter_id (nama_dokter)")
      .order("tanggal", { ascending: true })
      .order("jam", { ascending: true });

    if (!error && data) setJadwal(data);
    setLoading(false);
  }, [supabase, jadwal.length]);

  useEffect(() => {
    if (!mounted) return;
    const channel = supabase
      .channel("jadwal_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservasi" },
        () => fetchJadwal(),
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
    setJadwal(
      jadwal.map((j) => (j.id === id ? { ...j, status: newStatus } : j)),
    );
    const { error } = await supabase
      .from("reservasi")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast.error("Gagal sinkron");
      setJadwal(prev);
    } else {
      toast.success("Status diperbarui");
    }
  }

  // Fungsi untuk update query param tanggal langsung dari input
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      router.push(`/admin/jadwal?date=${newDate}`);
    } else {
      router.push("/admin/jadwal");
    }
  };

  const clearFilter = () => router.push("/admin/jadwal");

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-pink-500 rounded-lg text-white shadow-lg shadow-pink-100">
              <List className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-pink-900 uppercase tracking-tight">
              Manajemen Antrean
            </h1>
          </div>
          <p className="text-pink-600/70 text-sm italic font-medium">
            Kelola status kunjungan pasien secara real-time.
          </p>
        </div>
        <ReservasiModal onRefresh={fetchJadwal} />
      </div>

      {/* Filter Bar: Interaktif & Konsisten */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 p-4 rounded-[24px] border border-pink-100 shadow-sm">
        <div className="flex items-center gap-3">
          {dateQuery ? (
            <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl shadow-md animate-in fade-in slide-in-from-left-4">
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">
                Filter: {dateQuery}
              </span>
              <button
                onClick={clearFilter}
                className="ml-2 p-0.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-pink-900/40 text-xs font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Menampilkan Semua Data
            </div>
          )}
        </div>

        {/* Input Tanggal Kustom */}
        <div className="relative flex items-center gap-2 w-full md:w-auto">
          <label className="text-[10px] font-black text-pink-900 uppercase tracking-widest hidden md:block">
            Cari Tanggal:
          </label>
          <div className="relative flex-1 md:w-48">
            <Input
              type="date"
              value={dateQuery || ""}
              onChange={handleDateFilterChange}
              className="border-pink-100 focus:ring-pink-500 focus:border-pink-500 rounded-xl h-10 text-xs font-bold uppercase text-pink-900 shadow-inner bg-white/80"
            />
          </div>
        </div>
      </div>

      {/* Area Tabel */}
      <div className="animate-in fade-in zoom-in duration-500">
        <TableView
          jadwal={filteredJadwal}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}

// Komponen utama yang membungkus konten dengan Suspense
export default function JadwalPage() {
  return (
    <div className="p-4 sm:p-6 bg-pink-50/20 min-h-screen">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-pink-300 rounded-full" />
              </div>
            </div>
            <p className="text-xs font-black text-pink-300 uppercase tracking-widest animate-pulse">
              Sinkronisasi Antrean...
            </p>
          </div>
        }
      >
        <JadwalContent />
      </Suspense>
    </div>
  );
}
