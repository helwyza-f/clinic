import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFF5F7]">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-pink-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <div className="flex gap-2 items-center">
            <Heart className="w-8 h-8 fill-pink-500 text-pink-500" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-pink-900 tracking-tighter leading-none">
                D&apos;AESTHETIC
              </span>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em]">
                Clinic by Dr. Eny
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {hasEnvVars && (
              <Suspense
                fallback={
                  <div className="w-20 h-8 bg-pink-50 animate-pulse rounded-lg" />
                }
              >
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-pink-100 mb-4">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-[10px] font-black text-pink-900 uppercase tracking-widest">
              Premium Aesthetic Clinic
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-pink-900 leading-[1.1] tracking-tight">
            Pancarkan Pesona <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
              Cantik Alami Anda
            </span>
          </h1>

          <p className="text-lg text-pink-700/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Sistem manajemen reservasi dan perawatan kulit terintegrasi untuk
            memberikan pengalaman estetika terbaik bagi Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/login">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-7 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-pink-200 border-none transition-all active:scale-95">
                Masuk ke Portal <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto w-full px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: ShieldCheck,
            title: "Aman & Terpercaya",
            desc: "Data medis dan riwayat perawatan Anda terenkripsi dengan aman.",
          },
          {
            icon: CalendarCheck,
            title: "Booking Mudah",
            desc: "Reservasi sesi treatment dengan dokter pilihan dalam hitungan detik.",
          },
          {
            icon: Heart,
            title: "Layanan Personal",
            desc: "Konsultasi mendalam untuk solusi kulit yang tepat sasaran.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-500 transition-colors">
              <f.icon className="w-7 h-7 text-pink-500 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-black text-pink-900 mb-2 uppercase tracking-tight">
              {f.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center border-t border-pink-100 bg-white py-12 gap-4">
        <div className="flex items-center gap-2 opacity-50">
          <Heart className="w-4 h-4 fill-pink-900" />
          <span className="text-[10px] font-black text-pink-900 uppercase tracking-widest">
            D&apos;Aesthetic System &copy; 2026
          </span>
        </div>
        <p className="text-[9px] text-slate-400 font-medium italic">
          Powered by Supabase & Next.js
        </p>
      </footer>
    </main>
  );
}
