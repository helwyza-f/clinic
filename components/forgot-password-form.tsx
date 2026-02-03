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
import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
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

        {success ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <CardHeader className="space-y-2 text-center pt-10 pb-6 px-8">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2 border border-green-100">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Email Terkirim
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">
                Instruksi Pemulihan Akun
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 text-center">
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Kami telah mengirimkan tautan pengaturan ulang kata sandi ke
                email Anda. Silakan periksa kotak masuk atau folder spam Anda.
              </p>
              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase text-xs h-16 rounded-[1.5rem] shadow-xl active:scale-95 transition-all tracking-[0.2em]"
              >
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali Ke Login
                </Link>
              </Button>
            </CardContent>
          </div>
        ) : (
          <div>
            <CardHeader className="space-y-2 text-center pt-10 pb-6 px-8">
              <div className="mx-auto w-14 h-14 bg-[#959cc9]/10 rounded-2xl flex items-center justify-center mb-2">
                <Sparkles className="w-7 h-7 text-[#959cc9]" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                Reset Sandi
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">
                Keamanan &bull; D&apos;Aesthetic Intelligence
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0">
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="grid gap-5">
                  <div className="grid gap-2.5">
                    <Label
                      htmlFor="email"
                      className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest"
                    >
                      Alamat Email Terdaftar
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

                  {error && (
                    <div className="text-[11px] font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-2">
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
                        <span>Mengirim Tautan...</span>
                      </div>
                    ) : (
                      "Kirim Tautan Pemulihan"
                    )}
                  </Button>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                    Ingat kata sandi Anda?{" "}
                    <Link
                      href="/auth/login"
                      className="text-slate-900 hover:text-[#959cc9] underline underline-offset-4 decoration-[#d9c3b6] decoration-2 transition-all"
                    >
                      Masuk Di Sini
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-center gap-4 px-8 opacity-40">
        <div className="h-px flex-1 bg-slate-200" />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">
          Akses Terlindungi Sistem
        </p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
