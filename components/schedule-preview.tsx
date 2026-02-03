"use client";

import { useState, useMemo } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SchedulePreview({
  existingReservations,
}: {
  existingReservations: any[];
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Menghasilkan 7 hari ke depan untuk dipilih
  const nextSevenDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const jamOperasional = [
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Horisontal Date Picker - Mobile First */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
        {nextSevenDays.map((date) => {
          const isActive = isSameDay(selectedDate, date);
          return (
            <button
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center min-w-[65px] py-4 rounded-[1.5rem] border-2 transition-all active:scale-90",
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-indigo-100"
                  : "bg-white border-slate-100 text-slate-400 hover:border-[#959cc9]/30",
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter mb-1">
                {format(date, "EEE", { locale: id })}
              </span>
              <span className="text-lg font-black leading-none">
                {format(date, "dd")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots Grid */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#959cc9]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Pilih Waktu
            </h4>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] border-[#d9c3b6] text-[#d9c3b6] font-black uppercase"
          >
            {format(selectedDate, "dd MMMM yyyy", { locale: id })}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {jamOperasional.map((time) => {
            // Cek apakah jam ini sudah dipesan di database
            const isBooked = existingReservations.some(
              (res) =>
                res.tanggal === format(selectedDate, "yyyy-MM-dd") &&
                res.jam.startsWith(time),
            );

            return (
              <div
                key={time}
                className={cn(
                  "p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all relative overflow-hidden",
                  isBooked
                    ? "bg-slate-50 border-slate-100 opacity-60"
                    : "bg-white border-slate-50 hover:border-[#959cc9]/40 cursor-pointer group",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-black tracking-tight",
                    isBooked ? "text-slate-300" : "text-slate-800",
                  )}
                >
                  {time}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  {isBooked ? "Penuh" : "Tersedia"}
                </span>

                {!isBooked && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-around">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Terisi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-slate-100 shadow-sm" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Tersedia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
