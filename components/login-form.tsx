"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  Loader2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Autentikasi Kredensial
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;

      const user = authData.user;
      let finalRole = "pasien"; // Default fallback

      // 2. Identifikasi Role (Dokter vs Admin/Pasien)
      const { data: dokterProfile } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (dokterProfile) {
        finalRole = "dokter";
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        finalRole = profile?.role || "pasien";
      }

      // 3. UPDATE METADATA USER [Krusial untuk Proxy]
      // Ini menanamkan role ke dalam token JWT agar terbaca oleh middleware proxy.ts
      await supabase.auth.updateUser({
        data: { role: finalRole },
      });

      // 4. Pengalihan Berdasarkan Role
      if (finalRole === "dokter") {
        toast.success("Akses Medis Terverifikasi. Selamat bertugas, Dok!");
      } else if (finalRole === "admin") {
        toast.success("Akses Administrator Aktif");
      } else {
        toast.success("Selamat datang kembali di D'Aesthetic! ✨");
      }

      router.push(`/${finalRole}`);
      router.refresh();
    } catch (error: any) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-[0_20px_50px_rgba(149,156,201,0.15)] bg-white/90 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
        <div className="h-2.5 bg-gradient-to-r from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] w-full" />

        <CardHeader className="space-y-2 text-center pt-10 pb-6 px-8">
          <div className="mx-auto w-14 h-14 bg-[#959cc9]/10 rounded-2xl flex items-center justify-center mb-2">
            <Sparkles className="w-7 h-7 text-[#959cc9]" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">
            Sistem Informasi &bull; D&apos;Aesthetic Clinic
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid gap-5">
              <div className="grid gap-2.5">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase text-slate-400 tracking-widest"
                  >
                    Kata Sandi
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] font-black text-[#959cc9] hover:text-[#d9c3b6] uppercase tracking-tighter transition-colors"
                  >
                    Lupa Sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#959cc9] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase text-xs h-16 rounded-[1.5rem] shadow-2xl active:scale-95 transition-all tracking-[0.2em] group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#d9c3b6]" />
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Masuk Ke Portal{" "}
                    <ShieldCheck className="w-4 h-4 text-[#d9c3b6]" />
                  </div>
                )}
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                Baru di D&apos;Aesthetic?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-slate-900 hover:text-[#959cc9] underline underline-offset-4 decoration-[#d9c3b6] decoration-2 transition-all"
                >
                  Buat Akun Member
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 px-8 opacity-40">
        <div className="h-px flex-1 bg-slate-200" />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">
          Koneksi Terenkripsi
        </p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
