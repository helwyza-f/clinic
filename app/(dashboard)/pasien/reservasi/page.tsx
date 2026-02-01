"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays,
  Send,
  Clock,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { debounce } from "lodash";

// Daftar Jam Operasional Klinik dengan Kelipatan 30 Menit
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour !== 20) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const jamOperasional = generateTimeSlots();

export default function PasienReservasiPage() {
  const [dokters, setDokters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedDokter, setSelectedDokter] = useState<string>("");
  const [selectedTanggal, setSelectedTanggal] = useState<string>("");
  const [selectedJam, setSelectedJam] = useState<string>("");
  const [isBentrok, setIsBentrok] = useState(false);

  // State untuk menangani tanggal hari ini di sisi client
  const [today, setToday] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    // Inisialisasi tanggal hari ini setelah komponen mounted
    setToday(new Date().toISOString().split("T")[0]);

    async function fetchDokter() {
      const { data } = await supabase.from("dokter").select("*");
      if (data) setDokters(data);
    }
    fetchDokter();
  }, []);

  const verifySchedule = async (
    dokterId: string,
    tanggal: string,
    jam: string,
  ) => {
    if (!dokterId || !tanggal || !jam) return;

    setChecking(true);
    const { data } = await supabase
      .from("reservasi")
      .select("id")
      .match({
        dokter_id: dokterId,
        tanggal: tanggal,
        jam: jam,
      })
      .maybeSingle();

    setIsBentrok(!!data);
    setChecking(false);
  };

  const debouncedCheck = useCallback(
    debounce((d, t, j) => verifySchedule(d, t, j), 500),
    [],
  );

  useEffect(() => {
    setIsBentrok(false);
    if (selectedDokter && selectedTanggal && selectedJam) {
      debouncedCheck(selectedDokter, selectedTanggal, selectedJam);
    }
  }, [selectedDokter, selectedTanggal, selectedJam, debouncedCheck]);

  const handleReservasi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBentrok) return toast.error("Jadwal sudah terisi!");

    setLoading(true);
    const form = e.currentTarget;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("pasien")
        .select("auth_user_id")
        .eq("auth_user_id", user?.id)
        .single();

      if (!profile) throw new Error("Profil tidak ditemukan.");

      const formData = new FormData(form);
      const payload = {
        pasien_id: profile.auth_user_id,
        dokter_id: selectedDokter,
        tanggal: selectedTanggal,
        jam: selectedJam,
        keluhan: formData.get("keluhan"),
        status: "Menunggu",
      };

      const { error } = await supabase.from("reservasi").insert([payload]);
      if (error) throw error;

      toast.success("Reservasi berhasil dikirim!");
      form.reset();
      setSelectedDokter("");
      setSelectedTanggal("");
      setSelectedJam("");
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 sm:p-6 bg-pink-50/20 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-pink-900 uppercase tracking-tight">
          Reservasi Sesi Treatment
        </h1>
        <p className="text-pink-600/70 text-sm font-medium italic">
          Satu sesi konsultasi berdurasi 30 menit.
        </p>
      </div>

      <Card className="border-pink-100 shadow-2xl bg-white overflow-hidden rounded-3xl">
        <CardHeader className="bg-pink-500 text-white p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider">
            <CalendarDays className="w-5 h-5" /> Formulir Perjanjian
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleReservasi} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-pink-900 font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-pink-500" /> Pilih Dokter
              </Label>
              <Select
                onValueChange={setSelectedDokter}
                value={selectedDokter}
                required
              >
                <SelectTrigger className="border-pink-100 h-14 bg-white rounded-2xl">
                  <SelectValue placeholder="Klik untuk memilih dokter" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl">
                  {dokters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nama_dokter} - {d.spesialis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-pink-500" /> Tanggal
                </Label>
                <Input
                  type="date"
                  required
                  min={today} // Menggunakan state today untuk menghindari hydration error
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  value={selectedTanggal}
                  className="border-pink-100 h-14 bg-white rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-pink-900 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-500" /> Jam (Sesi 30
                  Menit)
                </Label>
                <Select
                  onValueChange={setSelectedJam}
                  value={selectedJam}
                  required
                >
                  <SelectTrigger className="border-pink-100 h-14 bg-white rounded-2xl">
                    <SelectValue placeholder="Pilih Jam" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl max-h-[300px]">
                    {jamOperasional.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j} WIB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDokter && selectedTanggal && selectedJam && (
              <div
                className={`p-5 rounded-2xl flex items-center justify-between border transition-all ${
                  checking
                    ? "bg-slate-50 border-slate-100 text-slate-400"
                    : isBentrok
                      ? "bg-red-50 border-red-100 text-red-600 shadow-sm shadow-red-50"
                      : "bg-green-50 border-green-100 text-green-600 shadow-sm shadow-green-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {checking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isBentrok ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span className="text-xs font-black uppercase tracking-widest">
                    {checking
                      ? "Mengecek Jadwal..."
                      : isBentrok
                        ? "Sesi Sudah Terisi"
                        : "Sesi Tersedia"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-pink-900 font-bold">Detail Keluhan</Label>
              <Textarea
                name="keluhan"
                placeholder="Apa yang ingin Anda konsultasikan hari ini?"
                required
                className="border-pink-100 min-h-[120px] rounded-2xl bg-white p-4"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || isBentrok || checking}
              className="w-full bg-pink-500 hover:bg-pink-600 py-8 text-lg font-black uppercase tracking-widest shadow-xl shadow-pink-100 transition-all rounded-2xl border-none text-white disabled:bg-slate-200 disabled:text-slate-400"
            >
              {loading ? (
                "Mengirim..."
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Konfirmasi Jadwal
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
