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
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  // State untuk toggle visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Konfirmasi password tidak sesuai.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            no_telepon: noTelepon,
            role: "pasien",
            username: fullName.replace(/\s+/g, "").toLowerCase(),
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (error) throw error;

      toast.success(
        "Pendaftaran berhasil! Silakan periksa email Anda atau langsung login.",
      );
      router.push("/auth/login");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mendaftar.",
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
            Daftar Member
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">
            Langkah Awal Perjalanan Cantikmu di D&apos;Aesthetic
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid gap-4">
              {/* Field Nama Lengkap */}
              <div className="grid gap-2">
                <Label
                  htmlFor="fullName"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="fullName"
                    placeholder="Contoh: Adista Azzahra"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                </div>
              </div>

              {/* Field Email */}
              <div className="grid gap-2">
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

              {/* Field Nomor Telepon */}
              <div className="grid gap-2">
                <Label
                  htmlFor="noTelepon"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Nomor WhatsApp
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="noTelepon"
                    type="tel"
                    placeholder="08123456789"
                    required
                    value={noTelepon}
                    onChange={(e) => setNoTelepon(e.target.value)}
                    className="pl-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                </div>
              </div>

              {/* Field Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Kata Sandi
                </Label>
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

              {/* Field Konfirmasi Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="repeat-password"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Ulangi Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="pl-11 pr-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#959cc9] transition-colors"
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-[11px] font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase text-xs h-16 rounded-[1.5rem] shadow-2xl active:scale-95 transition-all tracking-[0.2em] mt-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#d9c3b6]" />
                    <span>Mendaftarkan...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Daftar Sekarang{" "}
                    <ShieldCheck className="w-4 h-4 text-[#d9c3b6]" />
                  </div>
                )}
              </Button>
            </div>

            {/* Link Back to Login */}
            <div className="pt-4 text-center">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                Sudah punya akun member?{" "}
                <Link
                  href="/auth/login"
                  className="text-slate-900 hover:text-[#959cc9] underline underline-offset-4 decoration-[#d9c3b6] decoration-2 transition-all"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-4 px-8 opacity-40">
        <div className="h-px flex-1 bg-slate-200" />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">
          Data Terlindungi Sistem
        </p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
