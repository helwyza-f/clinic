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
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Tambahan untuk verifikasi
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validasi kecocokan password sebelum mengirim ke Supabase
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Redirect ke halaman terproteksi setelah berhasil
      router.push("/protected");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-pink-100 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-pink-900">
            Perbarui Password
          </CardTitle>
          <CardDescription className="text-pink-600/70">
            Silakan masukkan kata sandi baru Anda di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password" text-pink-900>
                  Password Baru
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password baru"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-pink-100 focus-visible:ring-pink-400"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" text-pink-900>
                  Konfirmasi Password Baru
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password baru"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
