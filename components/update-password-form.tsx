"use client";

import { useEffect, useState } from "react";
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

  // Validasi Sesi di Awal
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError(
          "Sesi tidak ditemukan atau kadaluwarsa. Silakan minta link reset baru.",
        );
        toast.error("Akses tidak valid.");
      }
    };
    checkSession();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi Cocok
    if (password !== confirmPassword) {
      setError("Konfirmasi sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    // Validasi Panjang Sandi
    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      // Eksekusi Update
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success(
        "Sandi berhasil diperbarui! Mengalihkan ke halaman login...",
      );

      // Tunggu sebentar agar user bisa melihat pesan sukses
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memperbarui sandi.");
      toast.error("Gagal memperbarui kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full max-w-md mx-auto px-4",
        className,
      )}
      {...props}
    >
      <Card className="border-none shadow-[0_20px_60px_rgba(149,156,201,0.2)] bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-[#959cc9] via-[#b7bfdd] to-[#d9c3b6] w-full" />

        <CardHeader className="space-y-3 text-center pt-10 pb-6 px-6">
          <div className="mx-auto w-16 h-16 bg-[#959cc9]/10 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-inner">
            <Sparkles className="w-8 h-8 text-[#959cc9]" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">
            Sandi Baru
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] px-4">
            Keamanan akun Anda adalah prioritas D&apos;Aesthetic
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid gap-5">
              {/* Password Baru */}
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  title="password"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Kata Sandi Baru
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-bold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#959cc9]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="confirmPassword"
                  title="confirmPassword"
                  className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                >
                  Konfirmasi Sandi
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#959cc9] transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 border-slate-100 bg-slate-50/50 focus-visible:ring-[#959cc9]/20 h-14 rounded-2xl font-bold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#959cc9]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="text-[10px] font-bold text-red-500 bg-red-50/80 px-4 py-3 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase text-xs h-16 rounded-[1.5rem] shadow-xl active:scale-[0.98] transition-all tracking-[0.2em]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#d9c3b6]" />
                    <span>Sinkronisasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Perbarui Kredensial{" "}
                    <ShieldCheck className="w-4 h-4 text-[#d9c3b6]" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="flex flex-col items-center gap-2 opacity-30 mt-2">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.6em]">
          D&apos;Aesthetic Secure Encryption
        </p>
      </div>
    </div>
  );
}
