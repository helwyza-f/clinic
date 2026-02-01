"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import { EventInput } from "@fullcalendar/core";
import "./dashboard_calendar.css";

interface DashboardCalendarViewProps {
  events: any[];
}

export default function DashboardCalendarView({
  events,
}: DashboardCalendarViewProps) {
  const router = useRouter();

  // Pengelompokan data berdasarkan tanggal murni (YYYY-MM-DD)
  const groupedEvents = events.reduce((acc: any, curr: any) => {
    const dateKey = curr.start.split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        id: dateKey,
        start: dateKey,
        count: 0,
      };
    }
    acc[dateKey].count += 1;
    return acc;
  }, {});

  const calendarEvents: EventInput[] = Object.values(groupedEvents).map(
    (item: any) => ({
      id: item.id,
      start: item.start,
      allDay: true,
      display: "block",
      extendedProps: {
        count: item.count,
      },
    }),
  );

  return (
    <div className="dashboard-fc">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today",
        }}
        events={calendarEvents}
        height="auto"
        dateClick={(info) => {
          router.push(`/admin/jadwal?date=${info.dateStr}`);
        }}
        eventContent={(eventInfo) => {
          const count = eventInfo.event.extendedProps.count;
          return (
            <div className="flex flex-col items-center justify-center w-full px-2 mt-1 cursor-pointer animate-in fade-in zoom-in duration-300">
              {/* Badge Sesi Diperbagus: Shadow lebih soft, font lebih bold */}
              <div className="bg-pink-600 text-white w-full py-2.5 rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center gap-1.5 border-2 border-white hover:bg-pink-700 transition-all active:scale-95">
                <span className="text-sm font-black leading-none tracking-tighter">
                  {count}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest leading-none opacity-90">
                  Sesi
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
