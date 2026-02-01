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
import { Lock, Mail, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Proses Login ke Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      const user = authData.user;

      // 2. Cek apakah ID user ini terdaftar di tabel 'dokter'
      const { data: dokterProfile } = await supabase
        .from("dokter")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      // 3. Logika Pengalihan Berdasarkan Keberadaan di Tabel Dokter
      if (dokterProfile) {
        toast.success("Selamat datang, Dok!");
        router.push("/dokter");
      } else {
        // Cek role di tabel profiles untuk Admin/Pasien
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          toast.success("Login berhasil sebagai Admin");
          router.push("/admin");
        } else {
          toast.success("Selamat datang di D'Aesthetic!");
          router.push("/pasien");
        }
      }

      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Terjadi kesalahan saat login",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-pink-100 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
        <div className="h-2 bg-pink-500 w-full" />
        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-3xl font-black tracking-tighter text-pink-900 uppercase">
            D'Aesthetic
          </CardTitle>
          <CardDescription className="text-pink-600/70 font-medium">
            Sistem Informasi Klinik dr. Eny
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="grid gap-4">
              {/* Field Email */}
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-pink-900 font-bold flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400 py-6"
                />
              </div>

              {/* Field Password */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-pink-900 font-bold flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400 py-6"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-7 shadow-lg shadow-pink-100 transition-all active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </div>
                ) : (
                  "Masuk Sekarang"
                )}
              </Button>
            </div>

            {/* Footer: Sign Up */}
            <div className="mt-6 text-center text-sm">
              <span className="text-pink-900/60 font-medium">
                Belum memiliki akun?{" "}
              </span>
              <Link
                href="/auth/sign-up"
                className="font-black text-pink-600 underline underline-offset-4 hover:text-pink-700 transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Small Privacy Note */}
      <p className="text-[10px] text-center text-pink-300 font-medium px-8 uppercase tracking-widest">
        Privasi Anda adalah prioritas kami &copy; 2026 D'Aesthetic Clinic
      </p>
    </div>
  );
}
