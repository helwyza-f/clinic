import { AuthButton } from "@/components/auth-button";
import { cn, hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import {
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
  Stethoscope,
  Star,
  Crown,
  Zap,
  Droplets,
  Flower2,
  Gem,
  Activity,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    title: "Skinbooster",
    desc: "Hidrasi mendalam via asam hialuronat.",
    icon: Droplets,
    startPrice: "310rb",
    color: "from-blue-50/50 to-indigo-50/50",
  },
  {
    title: "PRP Treatment",
    desc: "Regenerasi sel dengan plasma darah.",
    icon: Activity,
    startPrice: "310rb",
    color: "from-rose-50/50 to-red-50/50",
  },
  {
    title: "Botox Class",
    desc: "Relaksasi otot untuk wajah kencang.",
    icon: Gem,
    startPrice: "250rb",
    color: "from-slate-100 to-zinc-200/50",
  },
  {
    title: "Facial Care",
    desc: "Deep cleansing & aura glow.",
    icon: Flower2,
    startPrice: "110rb",
    color: "from-orange-50/50 to-amber-50/50",
  },
];

export default function Home() {
  return (
    // Menambahkan scroll-smooth langsung di tag main
    <main className="min-h-screen flex flex-col bg-[#F8F7F5] selection:bg-[#959cc9]/30 scroll-smooth">
      {/* 1. LUXURY NAVIGATION */}
      <nav className="w-full flex justify-center border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 h-20">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <div className="flex gap-3 items-center group cursor-pointer">
            <div className="p-2 bg-slate-900 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-[#d9c3b6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                D&apos;AESTHETIC
              </span>
              <span className="text-[9px] font-black text-[#959cc9] uppercase tracking-[0.3em] mt-0.5">
                Klinik dr. Eny
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasEnvVars && (
              <Suspense
                fallback={
                  <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-full" />
                }
              >
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION - DIMENSIONAL GRADIENT */}
      <div className="relative overflow-hidden px-6 pt-16 pb-24 lg:pt-32 lg:pb-48 text-center flex flex-col items-center">
        {/* Layered Background: Radial & Linear Mix */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,#efeffa_0%,#f8f7f5_100%)] opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-[#959cc9]/15 to-transparent blur-[120px] -z-10 animate-pulse" />

        <div className="relative z-10 max-w-5xl space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-white animate-in fade-in slide-in-from-top-4 duration-1000">
            <Crown className="w-3.5 h-3.5 text-[#d9c3b6]" />
            <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Experience Medical Artistry
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase italic px-2">
            Pancarkan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] not-italic">
              Cantik Alami
            </span>
          </h1>

          <p className="text-[14px] md:text-lg text-slate-500 max-w-xl mx-auto font-medium leading-relaxed tracking-wide px-6">
            Hasil{" "}
            <span className="text-slate-900 font-bold italic underline decoration-[#d9c3b6]">
              presisi dan personal
            </span>{" "}
            melalui integrasi teknologi medis terkini dalam satu sistem
            reservasi cerdas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 px-6">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shadow-2xl shadow-indigo-200/50"
            >
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-black text-[#d9c3b6] px-12 py-8 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 border-none">
                Booking Now <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            {/* Tombol Jelajahi Layanan dengan Smooth Scroll */}
            <Link href="#services" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                className="w-full sm:w-auto px-10 py-8 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all gap-2 group"
              >
                Jelajahi Layanan{" "}
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. TREATMENT CATEGORIES SHOWCASE */}
      <section
        id="services"
        className="max-w-7xl mx-auto w-full px-6 py-20 lg:py-32 space-y-12 lg:space-y-20"
      >
        <div className="text-center space-y-3">
          <div className="h-1 w-12 bg-[#d9c3b6] mx-auto rounded-full mb-2" />
          <h2 className="text-[10px] font-black text-[#959cc9] uppercase tracking-[0.5em]">
            Our Specialties
          </h2>
          <p className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Menu Perawatan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item, i) => (
            <div
              key={i}
              className={cn(
                "group relative p-8 rounded-[2.5rem] border border-slate-200 bg-white hover:shadow-2xl hover:translate-y-[-10px] transition-all duration-700 overflow-hidden",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                  item.color,
                )}
              />

              <div className="relative z-10 space-y-7">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-inner border border-slate-100">
                  <item.icon className="w-7 h-7 text-[#959cc9]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-slate-950 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                      Starting At
                    </span>
                    <span className="text-[15px] font-black text-slate-900">
                      Rp {item.startPrice}
                    </span>
                  </div>
                  <Link href="/auth/login">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 active:scale-90">
                      <Plus className="w-5 h-5 text-[#d9c3b6]" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TRUST FEATURES GRID */}
      <div className="max-w-7xl mx-auto w-full px-6 py-24 bg-slate-900 rounded-[3rem] lg:rounded-[5rem] my-10 relative overflow-hidden shadow-[0_40px_100px_rgba(15,23,42,0.2)]">
        <div className="absolute top-[-50px] right-[-50px] opacity-10 rotate-12">
          <Zap className="w-96 h-96 text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          {[
            {
              icon: ShieldCheck,
              title: "Data Secure",
              desc: "Sistem enkripsi tingkat tinggi menjamin keamanan data rekam medis Anda.",
            },
            {
              icon: CalendarCheck,
              title: "Smart Booking",
              desc: "Kelola sesi konsultasi harian Anda secara mandiri dalam satu genggaman.",
            },
            {
              icon: Stethoscope,
              title: "Precision Care",
              desc: "Pelayanan medis langsung oleh dr. Eny dengan standar diagnosa akurat.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center space-y-5 px-4 group"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <f.icon className="w-8 h-8 text-[#d9c3b6]" />
              </div>
              <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tighter">
                {f.title}
              </h3>
              <p className="text-[13px] text-white/40 leading-relaxed max-w-[280px] font-medium">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FOOTER */}
      <footer className="w-full flex flex-col items-center justify-center py-20 gap-10 bg-white">
        <div className="flex items-center gap-5 px-6 w-full justify-center opacity-80">
          <Star className="w-4 h-4 fill-[#d9c3b6] text-[#d9c3b6]" />
          <div className="h-px flex-1 max-w-[150px] bg-slate-200" />
          <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.7em] text-center">
            D&apos;Aesthetic Intelligence System
          </span>
          <div className="h-px flex-1 max-w-[150px] bg-slate-200" />
          <Star className="w-4 h-4 fill-[#d9c3b6] text-[#d9c3b6]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            &copy; 2026 Klinik dr. Eny &bull; Advanced Patient Portal
          </p>
          <p className="text-[8px] text-slate-300 font-medium uppercase tracking-[0.2em]">
            Crafted for excellence
          </p>
        </div>
      </footer>
    </main>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
