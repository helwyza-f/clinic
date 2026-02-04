"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  HeartPulse,
  History,
  LayoutGrid,
  Stethoscope,
  ArrowRight,
  Loader2,
  CalendarCheck,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function DashboardContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [todayReservasi, setTodayReservasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [todayStr] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const fetchDashboardData = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("pasien")
          .select("*")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          const { data: resData } = await supabase
            .from("reservasi")
            .select(
              `
              id, tanggal, jam, keluhan, status, 
              dokter:dokter_id (nama_dokter),
              rekam_medis (
                id, 
                detail_tindakan (
                  id,
                  perawatan (nama_perawatan)
                )
              )
            `,
            )
            .eq("pasien_id", user.id)
            .eq("tanggal", todayStr)
            .neq("status", "Batal")
            .order("jam", { ascending: true })
            .limit(5);

          setTodayReservasi(resData || []);
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase, todayStr],
  );

  useEffect(() => {
    fetchDashboardData(true);
    const channel = supabase
      .channel("pasien_today_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservasi" },
        () => fetchDashboardData(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchDashboardData]);

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#959cc9]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center px-6">
          Synchronizing...
        </p>
      </div>
    );
  }

  return (
    // FIX: Gunakan px-4 untuk memberi ruang aman di sisi layar mobile
    <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-700 px-3 max-w-full overflow-x-hidden lg:px-0">
      {/* 1. HERO BANNER - RESPONSIVE HEIGHT */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-7 lg:p-12 text-white shadow-2xl group mt-2">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#959cc9]/10 to-transparent z-0" />
        <Sparkles className="absolute bottom-4 right-6 w-20 h-20 text-white/5 rotate-12 transition-transform duration-700" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
              Halo,{" "}
              <span className="text-[#d9c3b6]">
                {profile?.full_name?.split(" ")[0] || "Pasien"}
              </span>
            </h1>
            <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em]">
              Siap untuk sesi cantikmu? ✨
            </p>
          </div>

          <Link href="/pasien/reservasi">
            <button className="w-fit bg-[#d9c3b6] text-slate-900 px-6 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
              Booking <Plus className="w-3.5 h-3.5 stroke-[4px]" />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 2. TODAY'S AGENDA - COMPACT FLEXBOX */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-[10px] tracking-[0.1em]">
              <div className="w-1 h-4 bg-[#959cc9] rounded-full" /> Jadwal Hari
              Ini
            </h3>
            <Link
              href={`/pasien/riwayat?tanggal=${todayStr}`}
              className="text-[9px] font-black text-[#959cc9] uppercase tracking-widest"
            >
              Arsip
            </Link>
          </div>

          <div className="space-y-3">
            {todayReservasi.length > 0 ? (
              todayReservasi.map((res) => {
                const tindakanList =
                  res.rekam_medis?.[0]?.detail_tindakan || [];
                const firstTindakan =
                  tindakanList[0]?.perawatan?.nama_perawatan;

                return (
                  <button
                    key={res.id}
                    onClick={() => router.push(`/pasien/riwayat?id=${res.id}`)}
                    className="w-full text-left group active:scale-[0.98] transition-all"
                  >
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                      <CardContent className="p-0 flex items-stretch min-h-[85px]">
                        {/* Time Box - Ukuran tetap yang lebih ramping */}
                        <div className="w-16 flex-shrink-0 bg-slate-50 flex flex-col items-center justify-center border-r border-slate-100 group-hover:bg-[#959cc9]/5">
                          <span className="text-sm font-black text-slate-900 leading-none">
                            {res.jam.slice(0, 5)}
                          </span>
                          <span className="text-[7px] font-bold text-[#959cc9] uppercase mt-1">
                            WIB
                          </span>
                        </div>

                        {/* Content Info - Flexible min-w-0 agar teks memotong/truncate */}
                        <div className="flex-1 p-3.5 flex flex-col justify-center min-w-0">
                          <div className="mb-1">
                            <Badge
                              className={cn(
                                "text-[7px] font-black uppercase px-2 py-0 rounded-full border-none shadow-none",
                                res.status === "Selesai"
                                  ? "bg-blue-100 text-blue-600"
                                  : res.status === "Dikonfirmasi"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-orange-100 text-orange-600",
                              )}
                            >
                              {res.status}
                            </Badge>
                          </div>

                          <h4 className="text-[12px] font-black text-slate-800 uppercase truncate leading-snug">
                            {firstTindakan || res.keluhan || "Konsultasi Umum"}
                          </h4>

                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate">
                            dr. {res.dokter?.nama_dokter?.split(" ")[0]}
                          </p>
                        </div>

                        {/* Action Icon */}
                        <div className="px-3 flex items-center">
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] py-10 text-center flex flex-col items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-slate-200" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                  Belum ada jadwal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. QUICK ACTIONS */}
        <div className="space-y-3">
          <Link href="/pasien/riwayat">
            <Card className="border-none shadow-sm bg-gradient-to-br from-[#959cc9] to-[#b7bfdd] rounded-[2rem] p-5 text-white active:scale-[0.98] transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70">
                    Archive
                  </p>
                  <h3 className="text-md font-black uppercase tracking-tighter">
                    Riwayat Medis
                  </h3>
                </div>
                <History className="w-5 h-5 opacity-50" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer info yang lebih tipis agar tidak overflow di layar pendek */}
      <div className="flex flex-col items-center gap-2 pt-6 opacity-20">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.5em]">
          D&apos;AESTHETIC INTELLIGENCE 2026
        </p>
      </div>
    </div>
  );
}

export default function PasienDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#959cc9]" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
