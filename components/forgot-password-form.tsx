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
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-pink-100 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-pink-900">
              Cek Email Anda
            </CardTitle>
            <CardDescription className="text-pink-600/70">
              Instruksi reset password telah dikirim
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-pink-900/60">
              Silakan periksa kotak masuk email Anda untuk melanjutkan proses
              pengaturan ulang kata sandi.
            </p>
            <Button asChild variant="link" className="mt-4 text-pink-600">
              <Link href="/auth/login">Kembali ke Login</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-pink-100 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-pink-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-pink-600/70">
              Masukkan email Anda dan kami akan mengirimkan tautan pengaturan
              ulang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-pink-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-pink-100 focus-visible:ring-pink-400"
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive bg-red-50 p-2 rounded-md">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-pink-900/60">
                Ingat kata sandi Anda?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-pink-600 underline underline-offset-4 hover:text-pink-700"
                >
                  Login di sini
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
