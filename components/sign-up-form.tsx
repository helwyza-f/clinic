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
import { User, Mail, Phone, Lock, Loader2 } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
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
      router.push("/auth/login");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-pink-100 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
        {/* Dekorasi Bar Pink Konsisten dengan Login */}
        <div className="h-2 bg-pink-500 w-full" />

        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-3xl font-black tracking-tighter text-pink-900 uppercase">
            D'Aesthetic
          </CardTitle>
          <CardDescription className="text-pink-600/70 font-medium">
            Daftar untuk mulai perawatan kecantikan Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid gap-4">
              {/* Field Nama Lengkap */}
              <div className="grid gap-2">
                <Label
                  htmlFor="fullName"
                  className="text-pink-900 font-bold flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Contoh: Adista Azzahra"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400 py-6"
                />
              </div>

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

              {/* Field Nomor Telepon */}
              <div className="grid gap-2">
                <Label
                  htmlFor="noTelepon"
                  className="text-pink-900 font-bold flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Nomor Telepon
                </Label>
                <Input
                  id="noTelepon"
                  type="tel"
                  placeholder="08123456789"
                  required
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400 py-6"
                />
              </div>

              {/* Field Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-pink-900 font-bold flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400 py-6"
                />
              </div>

              {/* Field Konfirmasi Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="repeat-password"
                  className="text-pink-900 font-bold flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Konfirmasi Password
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
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
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-7 shadow-lg shadow-pink-100 transition-all active:scale-95 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </div>
                ) : (
                  "Daftar Akun Baru"
                )}
              </Button>
            </div>

            {/* Link Back to Login */}
            <div className="mt-6 text-center text-sm">
              <span className="text-pink-900/60 font-medium">
                Sudah memiliki akun?{" "}
              </span>
              <Link
                href="/auth/login"
                className="font-black text-pink-600 underline underline-offset-4 hover:text-pink-700 transition-colors"
              >
                Login di sini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-[10px] text-center text-pink-300 font-medium px-8 uppercase tracking-widest">
        Privasi Anda adalah prioritas kami &copy; 2026 D'Aesthetic Clinic
      </p>
    </div>
  );
}
