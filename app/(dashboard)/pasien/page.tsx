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
  Heart,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PasienDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [recentReservasi, setRecentReservasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Memisahkan fungsi fetch agar bisa dipanggil secara modular
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
              `
            id,
            tanggal,
            jam,
            keluhan,
            status,
            dokter:dokter_id (nama_dokter)
          `,
            )
            .eq("pasien_id", profileData.auth_user_id)
            .order("created_at", { ascending: false })
            .limit(5);

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

    // Filter Realtime hanya untuk USER_ID ini
    // Langkah ini membutuhkan kebijakan RLS "Enable Realtime" di Supabase
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
            event: "UPDATE", // Fokus pada perubahan status
            schema: "public",
            table: "reservasi",
            filter: `pasien_id=eq.${user.id}`, // Filter tingkat database
          },
          (payload) => {
            // Update state lokal secara spesifik agar tidak memicu re-render total
            setRecentReservasi((prev) =>
              prev.map((item) =>
                item.id === payload.new.id
                  ? { ...item, status: payload.new.status }
                  : item,
              ),
            );

            toast.info(
              `Status reservasi ${payload.new.tanggal} Anda diperbarui menjadi: ${payload.new.status}`,
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reservasi",
            filter: `pasien_id=eq.${user.id}`,
          },
          () => fetchPasienData(), // Ambil ulang data jika ada booking baru
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtime();

    return () => {
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [supabase, fetchPasienData]);

  // ... (Sisa JSX tetap sama, pastikan menggunakan recentReservasi.map)
  return (
    <div className="space-y-8 pb-10 px-4 sm:px-0">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 to-rose-400 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-pink-100 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> D'Aesthetic Personal Portal
            </div>
            <h1 className="text-3xl font-black">
              Halo, {profile?.full_name?.split(" ")[0] || "Cantik"}! ✨
            </h1>
            <p className="text-pink-50 text-sm opacity-90">
              Pantau jadwal kecantikanmu secara real-time.
            </p>
          </div>
          <Link href="/pasien/reservasi">
            <button className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-black text-sm shadow-lg border-none cursor-pointer active:scale-95 transition-all">
              Booking Sekarang
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-pink-900 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Clock className="w-4 h-4 text-pink-500" /> Jadwal Reservasi
            </h3>
            <Link
              href="/pasien/riwayat"
              className="text-[10px] font-bold text-pink-500 hover:underline"
            >
              Riwayat Lengkap
            </Link>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="p-10 text-center text-pink-300 animate-pulse font-bold">
                Menghubungkan...
              </div>
            ) : recentReservasi.length > 0 ? (
              recentReservasi.map((res) => (
                <Card
                  key={res.id}
                  className="border-none shadow-sm bg-white rounded-2xl overflow-hidden group"
                >
                  <div className="flex">
                    <div
                      className={cn(
                        "w-2",
                        res.status === "Menunggu"
                          ? "bg-orange-400"
                          : res.status === "Selesai"
                            ? "bg-green-400"
                            : "bg-blue-400",
                      )}
                    />
                    <CardContent className="p-5 flex flex-1 items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-pink-900 capitalize">
                            {res.keluhan || "Treatment Aesthetic"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Badge
                              variant="outline"
                              className="text-[9px] border-pink-100 text-pink-400 font-bold uppercase"
                            >
                              {res.dokter?.nama_dokter || "Dokter Klinik"}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> {res.tanggal}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-xl px-3 py-1 text-[10px] font-bold border-none",
                          res.status === "Menunggu"
                            ? "bg-orange-50 text-orange-600"
                            : res.status === "Selesai"
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-600",
                        )}
                      >
                        {res.status}
                      </Badge>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-pink-100 rounded-3xl p-12 text-center text-xs text-pink-400 font-bold italic">
                Belum ada jadwal.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden text-center">
            <div className="bg-pink-500 p-4 text-white uppercase text-[10px] font-black tracking-widest">
              <Heart className="w-5 h-5 mx-auto mb-1 fill-white" /> Glow Tips
            </div>
            <CardContent className="p-6 italic text-sm font-bold text-pink-900">
              "Kulit sehat dimulai dari hidrasi yang cukup."
            </CardContent>
          </Card>

          <div className="bg-white/40 border border-white p-6 rounded-3xl flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-xs font-black text-pink-900">
                Keamanan Terjamin
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Data medis kamu tersimpan aman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
