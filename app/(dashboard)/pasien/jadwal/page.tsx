"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  addDays,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Clock,
  Loader2,
  CalendarSearch,
  ArrowRight,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

function JadwalContent() {
  const supabase = createClient();
  const [dokters, setDokters] = useState<any[]>([]);
  const [selectedDokter, setSelectedDokter] = useState<string>("all");
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
    async function fetchData() {
      setLoading(true);
      const [resD, resR] = await Promise.all([
        supabase.from("dokter").select("id, nama_dokter").order("nama_dokter"),
        supabase
          .from("reservasi")
          .select("tanggal, jam, dokter_id")
          .neq("status", "Batal"),
      ]);

      if (resD.data) setDokters(resD.data);
      if (resR.data) setExistingReservations(resR.data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
              <CalendarSearch className="w-5 h-5 text-[#959cc9]" />
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Cek Ketersediaan
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">
            Lihat ketersediaan per dokter untuk hasil akurat.
          </p>
        </div>

        {/* Filter Dokter */}
        <div className="w-full sm:w-64 space-y-2">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Pilih Dokter
          </label>
          <Select value={selectedDokter} onValueChange={setSelectedDokter}>
            <SelectTrigger className="h-12 bg-white rounded-2xl border-slate-100 font-bold focus:ring-[#959cc9]/20 text-xs shadow-sm">
              <SelectValue placeholder="Semua Dokter" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              <SelectItem
                value="all"
                className="font-bold py-2.5 text-[10px] uppercase"
              >
                Semua Dokter
              </SelectItem>
              {dokters.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id}
                  className="font-bold py-2.5 text-[10px] uppercase"
                >
                  {d.nama_dokter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Tabs */}
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
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105"
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

      <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
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
          <Badge className="bg-[#fdfcfb] text-[#959cc9] border border-[#959cc9]/20 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
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
              // Logika Cek Ketersediaan per Dokter
              const isBooked = existingReservations.some((res) => {
                const matchDate =
                  res.tanggal === format(selectedDate, "yyyy-MM-dd");
                const matchTime = res.jam.startsWith(time);
                const matchDokter =
                  selectedDokter === "all"
                    ? true
                    : res.dokter_id === selectedDokter;
                return matchDate && matchTime && matchDokter;
              });

              // Logika Waktu Lampau
              let isPast = false;
              if (isToday(selectedDate)) {
                const now = new Date();
                const [hour, minute] = time.split(":").map(Number);
                const sessionTime = new Date();
                sessionTime.setHours(hour, minute, 0, 0);
                if (isBefore(sessionTime, now)) isPast = true;
              }

              const isDisabled = isBooked || isPast;

              return (
                <div
                  key={time}
                  className={cn(
                    "group p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-1 transition-all duration-300 relative",
                    isDisabled
                      ? "bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed"
                      : "bg-white border-slate-50 hover:border-[#959cc9]/40 hover:shadow-lg hover:translate-y-[-1px]",
                  )}
                >
                  <span
                    className={cn(
                      "text-[15px] font-black tracking-tighter",
                      isDisabled ? "text-slate-300" : "text-slate-900",
                    )}
                  >
                    {time}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isPast
                          ? "bg-slate-300"
                          : isBooked
                            ? "bg-red-400"
                            : "bg-green-400 animate-pulse",
                      )}
                    />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      {isPast ? "Lewat" : isBooked ? "Penuh" : "Kosong"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Waktu Lampau
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Sudah Terisi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Slot Tersedia
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

export default function PasienCekJadwalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
        </div>
      }
    >
      <JadwalContent />
    </Suspense>
  );
}
