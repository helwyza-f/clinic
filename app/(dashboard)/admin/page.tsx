"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  Receipt,
  TrendingUp,
  Loader2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const DashboardCalendarView = dynamic(
  () => import("./dashboard_calendar_view"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
        <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.3em]">
          Sinkronisasi Inteligensi...
        </span>
      </div>
    ),
  },
);

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ pasien: 0, jadwal: 0, transaksi: 0 });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const [resP, resJ, resT, resAllJadwal] = await Promise.all([
      supabase
        .from("pasien")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),
      supabase
        .from("reservasi")
        .select("*", { count: "exact", head: true })
        .eq("tanggal", today),
      supabase
        .from("transaksi")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),
      supabase.from("reservasi").select("id, tanggal, jam"),
    ]);

    setCounts({
      pasien: resP.count || 0,
      jadwal: resJ.count || 0,
      transaksi: resT.count || 0,
    });

    if (resAllJadwal.data) {
      const formattedEvents = resAllJadwal.data.map((j: any) => ({
        id: j.id,
        start: `${j.tanggal}T${j.jam}`,
      }));
      setEvents(formattedEvents);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 px-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#959cc9]" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Panel Kendali Utama
            </h1>
          </div>
          <p className="text-slate-400 font-medium italic text-xs">
            Monitoring sistem antrean & manajemen klinis terintegrasi.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm ring-1 ring-slate-50">
          <div className="w-1.5 h-1.5 rounded-full bg-[#959cc9] animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Live Monitoring Active
          </span>
        </div>
      </div>

      {/* Grid Statistik - Ukuran Proporsional */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Pasien Hari Ini",
            val: counts.pasien,
            icon: Users,
            gradient: "from-[#959cc9] to-[#b7bfdd]",
          },
          {
            title: "Antrean Masuk",
            val: counts.jadwal,
            icon: CalendarCheck,
            gradient: "from-[#d9c3b6] to-[#cbb2a3]",
          },
          {
            title: "Beban Transaksi",
            val: counts.transaksi,
            icon: Receipt,
            gradient: "from-slate-800 to-slate-900",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="border-none shadow-xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-500 rounded-[2.25rem]"
          >
            <CardContent className="p-0">
              <div
                className={cn(
                  "bg-gradient-to-br p-7 text-white",
                  item.gradient,
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80">
                      {item.title}
                    </p>
                    <div className="text-4xl font-black tracking-tighter leading-none">
                      {loading ? "..." : item.val}
                    </div>
                  </div>
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-60">
                  <TrendingUp className="w-3 h-3" /> Data update otomatis
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kalender dengan Header Gradasi Lembut */}
      <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden border border-slate-100">
        <CardHeader className="bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] p-8 text-white flex flex-row items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-black/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-[0.15em] leading-none text-white">
                Visualisasi Beban Kerja
              </CardTitle>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-[0.4em] mt-2">
                Arsip Antrean Bulanan
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/20 font-black uppercase text-[8px] tracking-widest px-4 py-2 rounded-full backdrop-blur-sm shadow-inner">
            Real-time Feed
          </Badge>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <DashboardCalendarView events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
