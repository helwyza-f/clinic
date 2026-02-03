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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Lock,
  Loader2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 1. TUKARKAN KODE PKCE MENJADI SESI SAAT HALAMAN DIMUAT
  useEffect(() => {
    const handleExchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      console.log("Recovery code from URL:", code);

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError("Sesi pemulihan tidak valid atau kadaluwarsa.");
          toast.error("Gagal memverifikasi sesi pemulihan.");
        } else {
          toast.success("Sesi terverifikasi. Silakan masukkan sandi baru.");
        }
      }
    };

    handleExchangeCode();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. UPDATE PASSWORD USER
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Kata sandi berhasil diperbarui! Silakan masuk kembali.");

      // Redirect ke login agar user masuk dengan kredensial baru
      router.push("/auth/login");
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Terjadi kesalahan sistem.",
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
            Sandi Baru
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">
            Perbarui Kredensial Keamanan Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid gap-5">
              <div className="grid gap-2.5">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
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

              <div className="grid gap-2.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Konfirmasi Sandi Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi sandi baru"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#959cc9] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Simpan Perubahan{" "}
                    <ShieldCheck className="w-4 h-4 text-[#d9c3b6]" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
