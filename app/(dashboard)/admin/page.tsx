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
} from "lucide-react";

const DashboardCalendarView = dynamic(
  () => import("./dashboard_calendar_view"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-pink-100 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-[10px] font-black uppercase text-pink-300">
          Sinkronisasi Jadwal...
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

    // Ambil data untuk statistik dan data mentah untuk kalender
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
      supabase.from("reservasi").select("id, tanggal, jam"), // Tarik data mentah
    ]);

    setCounts({
      pasien: resP.count || 0,
      jadwal: resJ.count || 0,
      transaksi: resT.count || 0,
    });

    if (resAllJadwal.data) {
      // Pastikan string start digabung agar logic split('T') di calendar_view bekerja
      const formattedEvents = resAllJadwal.data.map((j: any) => ({
        id: j.id,
        start: `${j.tanggal}T${j.jam}`,
      }));
      setEvents(formattedEvents);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-pink-900 uppercase tracking-tight leading-none">
            Dashboard Utama
          </h1>
          <p className="text-pink-600/70 font-medium italic text-sm mt-2">
            D'Aesthetic Clinic Monitoring System
          </p>
        </div>
        <div className="bg-pink-50 px-4 py-2 rounded-full border border-pink-100 flex items-center gap-2 shadow-sm">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest leading-none">
            Live Monitoring
          </span>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Pasien Baru",
            val: counts.pasien,
            icon: Users,
            color: "text-pink-600",
            bg: "bg-pink-50",
          },
          {
            title: "Antrean Hari Ini",
            val: counts.jadwal,
            icon: CalendarCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Total Transaksi",
            val: counts.transaksi,
            icon: Receipt,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="border-none shadow-xl shadow-pink-100/30 overflow-hidden group hover:scale-[1.02] transition-all rounded-[28px]"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.title}
                </p>
                <div className="text-4xl font-black text-pink-900 leading-none">
                  {loading ? "..." : item.val}
                </div>
              </div>
              <div
                className={`p-4 rounded-2xl ${item.bg} text-white transition-transform group-hover:rotate-12 shadow-inner`}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl shadow-pink-100/40 rounded-[36px] overflow-hidden bg-white">
        <CardHeader className="bg-pink-500 p-6 text-white flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-black uppercase tracking-widest leading-none">
              Beban Kerja Klinik Bulanan
            </CardTitle>
          </div>
          <span className="text-[9px] font-bold bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-tighter">
            Pilih Tanggal Untuk Kelola Antrean
          </span>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 bg-white">
          <DashboardCalendarView events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
