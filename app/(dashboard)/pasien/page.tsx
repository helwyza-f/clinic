"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Loader2,
  TicketPercent,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PasienDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [recentReservasi, setRecentReservasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPasienData = useCallback(
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
          const { data: reservasiData } = await supabase
            .from("reservasi")
            .select(
              `id, tanggal, jam, keluhan, status, dokter:dokter_id (nama_dokter)`,
            )
            .eq("pasien_id", profileData.auth_user_id)
            .order("created_at", { ascending: false })
            .limit(3);

          setRecentReservasi(reservasiData || []);
        }
      } catch (err) {
        console.error("Error System:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    fetchPasienData(true);
    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`dashboard_pasien_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "reservasi",
            filter: `pasien_id=eq.${user.id}`,
          },
          (payload) => {
            setRecentReservasi((prev) =>
              prev.map((item) =>
                item.id === payload.new.id
                  ? { ...item, status: payload.new.status }
                  : item,
              ),
            );
            toast.info(
              `Info: Status kunjungan diperbarui menjadi ${payload.new.status}`,
            );
          },
        )
        .subscribe();
      return channel;
    };

    const channelPromise = setupRealtime();
    return () => {
      channelPromise.then((ch) => ch && supabase.removeChannel(ch));
    };
  }, [supabase, fetchPasienData]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-700 px-1 sm:px-0 max-w-full overflow-x-hidden">
      {/* Hero Welcome Card - Luxury Gradient Mix */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] p-8 text-white shadow-[0_20px_50px_rgba(149,156,201,0.2)] group mx-1 border border-white/20">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
          <Star className="w-32 h-32 fill-white" />
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">
                Member Exclusive
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter leading-tight drop-shadow-md">
              Halo, {profile?.full_name?.split(" ")[0] || "Pasien"}! ✨
            </h1>
            <p className="text-white/90 text-[11px] font-bold uppercase tracking-[0.15em] opacity-80">
              Pantau Transformasi Cantikmu Hari Ini.
            </p>
          </div>
          <Link href="/pasien/reservasi" className="block">
            <button className="w-full sm:w-auto bg-white text-slate-800 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all ring-1 ring-black/5">
              Buat Reservasi Baru
            </button>
          </Link>
        </div>
      </div>

      {/* Promotional Banner - Soft Champagne Gradient */}
      <div className="px-2">
        <Card className="border-none bg-gradient-to-r from-[#fdfcfb] via-[#f8f5f2] to-[#fdfcfb] rounded-[2rem] overflow-hidden shadow-sm border border-[#d9c3b6]/20 group relative">
          <CardContent className="p-0 flex items-center">
            <div className="bg-gradient-to-b from-[#d9c3b6] to-[#cbb2a3] p-5 text-white flex items-center justify-center shadow-lg">
              <TicketPercent className="w-7 h-7" />
            </div>
            <div className="p-5 flex-1 min-w-0">
              <Badge className="bg-[#d9c3b6]/20 text-[#cbb2a3] text-[7px] font-black uppercase tracking-widest rounded-md mb-1.5 border-none">
                Member Offer
              </Badge>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                Glow Up Promo: Diskon 20% Facial
              </p>
              <p className="text-[9px] font-bold text-[#d9c3b6] uppercase tracking-tighter mt-0.5">
                Klaim sebelum akhir bulan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 px-2">
        {/* Recent Schedule Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-[10px] tracking-[0.3em]">
              <Clock className="w-4 h-4 text-[#959cc9]" /> Agenda Mendatang
            </h3>
            <Link
              href="/pasien/riwayat"
              className="text-[9px] font-black text-[#959cc9] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#959cc9]" />
              </div>
            ) : recentReservasi.length > 0 ? (
              recentReservasi.map((res) => (
                <Card
                  key={res.id}
                  className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-2xl overflow-hidden group hover:shadow-md transition-all active:scale-[0.99] border border-slate-50"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                        res.status === "Selesai"
                          ? "bg-blue-50 text-blue-500"
                          : res.status === "Dikonfirmasi"
                            ? "bg-green-50 text-green-500"
                            : "bg-orange-50 text-orange-500",
                      )}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">
                          {res.keluhan || "Treatment Estetika"}
                        </p>
                        <Badge
                          className={cn(
                            "text-[7px] font-black uppercase rounded-md border-none px-2 py-0.5 shadow-sm",
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
                      <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-[#d9c3b6]" />{" "}
                          {res.tanggal}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d9c3b6]" />{" "}
                          {res.jam.slice(0, 5)} WIB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[2rem] p-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                Agenda Kosong.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info - Luxury Styling */}
        <div className="space-y-4">
          <Card className="border-none shadow-xl shadow-[#d9c3b6]/20 bg-gradient-to-br from-[#d9c3b6] via-[#cbb2a3] to-[#d9c3b6] rounded-[2rem] overflow-hidden text-center text-white relative group border border-white/20">
            <Sparkles className="absolute bottom-[-5px] right-[-5px] w-12 h-12 opacity-20" />
            <div className="bg-white/20 backdrop-blur-md p-3 text-white uppercase text-[8px] font-black tracking-[0.5em] border-b border-white/10">
              Beauty Secret
            </div>
            <CardContent className="p-6">
              <p className="italic text-[11px] font-bold opacity-90 leading-relaxed uppercase tracking-tight drop-shadow-sm">
                &quot;Hasil maksimal bukan dari satu kali tindakan, melainkan
                dari konsistensi perawatan.&quot;
              </p>
            </CardContent>
          </Card>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-5 rounded-[1.75rem] flex items-center gap-4 shadow-sm ring-1 ring-slate-100">
            <div className="p-3 bg-[#959cc9]/10 rounded-xl shadow-inner">
              <ShieldCheck className="w-5 h-5 text-[#959cc9]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Akses Aman
              </p>
              <p className="text-[9px] text-slate-400 font-medium truncate">
                Data medis terenkripsi standar klinik.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 pt-10 opacity-30">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.8em]">
          D&apos;Aesthetic Intelligence Portal
        </p>
      </div>
    </div>
  );
}
