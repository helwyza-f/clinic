"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  ClipboardCheck,
  Clock,
  Stethoscope,
  TrendingUp,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function DashboardContent() {
  const [stats, setStats] = useState({ antrean: 0, menunggu: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: dokter } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (dokter) {
        const { data: res } = await supabase
          .from("reservasi")
          .select("status")
          .eq("dokter_id", dokter.id)
          .eq("tanggal", today);

        if (res) {
          setStats({
            antrean: res.length,
            menunggu: res.filter((r) => r.status === "Dikonfirmasi").length,
            selesai: res.filter((r) => r.status === "Selesai").length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard stats");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel("dashboard_dokter_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservasi",
        },
        () => {
          fetchStats();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, supabase]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 px-1">
      {/* Header Central Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#959cc9]/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#959cc9]" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Medical Hub
            </h1>
          </div>
          <p className="text-slate-400 font-medium italic text-xs">
            Pantau performa klinis dan antrean pasien secara real-time.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Clinical System Online
          </span>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Total Antrean",
            val: stats.antrean,
            icon: Clock,
            gradient: "from-[#959cc9] to-[#b7bfdd]",
            label: "Terjadwal Hari Ini",
          },
          {
            title: "Menunggu Tindakan",
            val: stats.menunggu,
            icon: Users,
            gradient: "from-[#d9c3b6] to-[#cbb2a3]",
            label: "Segera di Ruang Periksa",
          },
          {
            title: "Diagnosa Selesai",
            val: stats.selesai,
            icon: ClipboardCheck,
            gradient: "from-slate-800 to-slate-900",
            label: "Tersimpan di Arsip",
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
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80 leading-none">
                      {item.title}
                    </p>
                    <div className="text-4xl font-black tracking-tighter leading-none">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                      ) : (
                        item.val
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-60">
                  <TrendingUp className="w-3 h-3" /> {item.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Workspace */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl bg-white rounded-[3rem] p-8 border border-slate-50 flex flex-col justify-center gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
            <Stethoscope className="w-48 h-48 text-slate-900" />
          </div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Mulai Pemeriksaan
            </h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm uppercase">
              Buka panel antrean medis untuk melakukan diagnosa dan memberikan
              instruksi tindakan pada pasien.
            </p>
          </div>

          <Link href="/dokter/antrean">
            <button className="relative z-10 flex items-center justify-between w-full max-w-xs bg-slate-900 text-white px-8 py-5 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-[#959cc9] transition-all group/btn">
              Buka Antrean{" "}
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </Link>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 rounded-[2.5rem] p-8 flex items-center gap-6 border-l-4 border-[#d9c3b6]">
            <div className="p-4 bg-white shadow-lg rounded-2xl">
              <CalendarDays className="w-6 h-6 text-[#d9c3b6]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#d9c3b6] uppercase tracking-widest">
                Sesi Hari Ini
              </p>
              <p className="text-sm font-bold text-slate-700 uppercase">
                {new Date().toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Card>

          <div className="p-8 bg-[#959cc9]/5 rounded-[2.5rem] border border-dashed border-[#959cc9]/30 flex flex-col items-center justify-center text-center gap-3">
            <HeartPulse className="w-10 h-10 text-[#959cc9] opacity-30" />
            <p className="text-[10px] font-black text-[#959cc9] uppercase tracking-[0.4em] italic opacity-60">
              D&apos;Aesthetic Central Monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Pembungkus Suspense
export default function DokterDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Initialising Hub...
          </p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function HeartPulse(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
