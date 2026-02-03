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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Synchronizing...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-700 px-2 lg:px-0">
      {/* 1. HERO BANNER - ADAPTIVE DESKTOP & MOBILE */}
      <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] bg-gradient-to-br from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] p-7 lg:p-14 text-white shadow-2xl border border-white/20 group">
        <div className="absolute -top-10 -right-10 lg:top-[-20px] lg:right-[-20px] opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
          <Stethoscope className="w-48 h-48 lg:w-80 lg:h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight uppercase">
              Halo, <br className="lg:hidden" />
              <span className="italic text-[#fdfcfb] lg:not-italic lg:text-white lg:ml-2">
                {profile?.full_name?.split(" ")[0] || "Patient"}!
              </span>
            </h1>
            <p className="text-white/90 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] lg:tracking-[0.4em]">
              Siap untuk sesi cantikmu hari ini? ✨
            </p>
          </div>

          <Link href="/pasien/reservasi" className="block w-fit lg:shrink-0">
            <button className="bg-slate-900 text-[#d9c3b6] px-8 py-4 lg:px-10 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 hover:bg-black transition-all border border-white/10 flex items-center gap-3">
              Buat Reservasi <Plus className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 2. TODAY'S AGENDA - NEW CARD STYLE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[9px] tracking-[0.3em]">
              <CalendarCheck className="w-4 h-4 text-[#959cc9]" /> Sesi Hari Ini
            </h3>
            <Link
              href={`/pasien/riwayat?tanggal=${todayStr}`}
              className="text-[8px] font-black text-[#959cc9] uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="grid gap-3.5">
            {todayReservasi.length > 0 ? (
              todayReservasi.map((res) => {
                const tindakanList =
                  res.rekam_medis?.[0]?.detail_tindakan || [];
                const firstTindakan =
                  tindakanList[0]?.perawatan?.nama_perawatan;
                const extraTindakanCount = tindakanList.length - 1;

                return (
                  <button
                    key={res.id}
                    onClick={() => router.push(`/pasien/riwayat?id=${res.id}`)}
                    className="w-full text-left group active:scale-[0.98] transition-all focus:outline-none"
                  >
                    {/* ENHANCED RESERVASI CARD */}
                    <Card className="border-2 border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden hover:border-[#959cc9]/30 hover:shadow-xl transition-all relative">
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Time Thumbnail Box */}
                        <div className="flex flex-col items-center justify-center min-w-[65px] h-[65px] bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-[#959cc9]/5 transition-colors">
                          <Clock className="w-3.5 h-3.5 text-[#959cc9] mb-1" />
                          <span className="text-[13px] font-black text-slate-900 leading-none">
                            {res.jam.slice(0, 5)}
                          </span>
                          <span className="text-[7px] font-black text-[#959cc9] uppercase mt-1 tracking-tighter">
                            WIB
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge
                              className={cn(
                                "text-[7px] font-black uppercase px-2 py-0.5 rounded-md border-none",
                                res.status === "Selesai"
                                  ? "bg-blue-600 text-white"
                                  : res.status === "Dikonfirmasi"
                                    ? "bg-green-600 text-white"
                                    : "bg-orange-500 text-white",
                              )}
                            >
                              {res.status}
                            </Badge>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                              Authorized
                            </span>
                          </div>

                          <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight truncate leading-none">
                            {firstTindakan || res.keluhan || "Konsultasi Umum"}
                          </h4>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                              <User className="w-3 h-3 text-[#d9c3b6]" /> dr.{" "}
                              {res.dokter?.nama_dokter?.split(" ")[0]}
                            </div>
                            {extraTindakanCount > 0 && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#959cc9]/20 bg-[#959cc9]/5 text-[#959cc9] text-[7px] font-black px-1.5 rounded-sm"
                              >
                                +{extraTindakanCount} TINDAKAN LAGI
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Decorative Arrow */}
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#959cc9] group-hover:border-[#959cc9] transition-all">
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })
            ) : (
              <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 text-center flex flex-col items-center gap-4">
                <LayoutGrid className="w-10 h-10 text-slate-200" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                  No Sessi Hari Ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. SIDEBAR QUICK INFO */}
        <div className="hidden lg:block space-y-6">
          <Card className="border-2 border-slate-100 shadow-xl bg-white rounded-[2.5rem] p-7">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-[#959cc9]/10 rounded-2xl border border-[#959cc9]/20">
                <HeartPulse className="w-6 h-6 text-[#959cc9]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  System Status
                </p>
                <p className="text-sm font-bold text-slate-900 uppercase">
                  Live Dashboard
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/pasien/riwayat" className="block">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-[#d9c3b6] hover:bg-[#fdfcfb] transition-all group">
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-slate-400 group-hover:text-[#959cc9]" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Semua Riwayat
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <p className="text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.8em] pt-10">
        D&apos;AESTHETIC INTELLIGENCE
      </p>
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
