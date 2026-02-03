"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Clock,
  Loader2,
  CalendarSearch,
  ArrowRight,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function JadwalContent() {
  const supabase = createClient();
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inisialisasi tanggal kosong untuk menghindari error hydration
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Set tanggal hari ini hanya saat komponen sudah mounted di client
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const nextSevenDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const jamOperasional = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  useEffect(() => {
    async function fetchJadwal() {
      setLoading(true);
      const { data } = await supabase
        .from("reservasi")
        .select("tanggal, jam")
        .neq("status", "Batal");

      if (data) setExistingReservations(data);
      setLoading(false);
    }
    fetchJadwal();
  }, [supabase]);

  // Tampilkan loader saat tanggal belum siap di client
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Syncing Calendar...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700 px-2 lg:px-0 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <CalendarSearch className="w-5 h-5 text-[#959cc9]" />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            Cek Ketersediaan
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
          Lihat slot kosong sebelum melakukan reservasi cerdas.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1 snap-x">
        {nextSevenDays.map((date) => {
          const isActive = isSameDay(selectedDate, date);
          return (
            <button
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center min-w-[75px] py-5 rounded-[2rem] border-2 transition-all active:scale-90 snap-center shadow-sm",
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-indigo-100 scale-105"
                  : "bg-white border-slate-100 text-slate-400 hover:border-[#959cc9]/30",
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter mb-1">
                {format(date, "EEE", { locale: id })}
              </span>
              <span className="text-xl font-black leading-none">
                {format(date, "dd")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5">
          <Sparkles className="w-32 h-32 text-[#d9c3b6]" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#959cc9]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
              Pilihan Sesi
            </h4>
          </div>
          <Badge className="bg-[#fdfcfb] text-[#959cc9] border border-[#959cc9]/20 text-[10px] font-black px-4 py-1.5 rounded-full">
            {format(selectedDate, "dd MMMM yyyy", { locale: id })}
          </Badge>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Memuat Sesi...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 relative z-10">
            {jamOperasional.map((time) => {
              const isBooked = existingReservations.some(
                (res) =>
                  res.tanggal === format(selectedDate, "yyyy-MM-dd") &&
                  res.jam.startsWith(time),
              );

              return (
                <div
                  key={time}
                  className={cn(
                    "group p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-1 transition-all duration-300 relative",
                    isBooked
                      ? "bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed"
                      : "bg-white border-slate-50 hover:border-[#959cc9]/40 hover:shadow-lg hover:translate-y-[-2px]",
                  )}
                >
                  <span
                    className={cn(
                      "text-[15px] font-black tracking-tighter",
                      isBooked ? "text-slate-300" : "text-slate-900",
                    )}
                  >
                    {time}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isBooked
                          ? "bg-slate-200"
                          : "bg-green-400 animate-pulse",
                      )}
                    />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      {isBooked ? "Terisi" : "Kosong"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Sudah Dipesan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-[#959cc9]/30" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Sesi Tersedia
              </span>
            </div>
          </div>

          <Link href="/pasien/reservasi" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-slate-900 text-[#d9c3b6] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              Lanjut Reservasi <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Komponen Utama yang membungkus Suspense
export default function PasienCekJadwalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Initialising...
          </p>
        </div>
      }
    >
      <JadwalContent />
    </Suspense>
  );
}
