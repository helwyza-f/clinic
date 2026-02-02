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

  const groupedEvents = events.reduce((acc: any, curr: any) => {
    const dateKey = curr.start.split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { id: dateKey, start: dateKey, count: 0 };
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
      extendedProps: { count: item.count },
    }),
  );

  return (
    <div className="dashboard-fc animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        events={calendarEvents}
        height="auto"
        dateClick={(info) => router.push(`/admin/jadwal?date=${info.dateStr}`)}
        eventContent={(eventInfo) => {
          const count = eventInfo.event.extendedProps.count;
          return (
            <div className="flex flex-col items-center justify-center w-full px-1.5 mt-1 cursor-pointer group">
              <div className="bg-[#959cc9] text-white w-full py-3 rounded-2xl shadow-xl shadow-[#959cc9]/20 border-2 border-white flex items-center justify-center gap-2 group-hover:bg-[#868db8] transition-all active:scale-95 group-hover:translate-y-[-2px]">
                <span className="text-sm font-black leading-none">{count}</span>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none opacity-90">
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
