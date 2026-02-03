"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Activity,
  X,
  History,
} from "lucide-react";
import { debounce } from "lodash";
import { format, isToday, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/searchable-select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const jamOperasional = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export default function PasienReservasiPage() {
  const router = useRouter();
  const [dokters, setDokters] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [perawatanOptions, setPerawatanOptions] = useState<SearchableOption[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [selectedDokter, setSelectedDokter] = useState<string>("");
  const [selectedKategoriId, setSelectedKategoriId] = useState("");
  const [selectedPerawatans, setSelectedPerawatans] = useState<any[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState<Date | undefined>(
    undefined,
  );
  const [selectedJam, setSelectedJam] = useState<string>("");
  const [keluhan, setKeluhan] = useState("");

  const [isBentrok, setIsBentrok] = useState(false);
  const [isPast, setIsPast] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [resD, resK] = await Promise.all([
        supabase.from("dokter").select("*").order("nama_dokter"),
        supabase.from("kategori_perawatan").select("id, nama_kategori"),
      ]);
      if (resD.data) setDokters(resD.data);
      if (resK.data) setKategoriList(resK.data);
    }
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (selectedKategoriId) {
      const fetchPerawatan = async () => {
        const { data } = await supabase
          .from("perawatan")
          .select("id, nama_perawatan, harga_promo, harga_normal")
          .eq("kategori_id", selectedKategoriId)
          .eq("is_active", true);
        if (data) {
          setPerawatanOptions(
            data.map((p) => ({
              value: p.id,
              label: p.nama_perawatan,
              rawHarga: p.harga_promo || p.harga_normal,
              description: `Rp ${(p.harga_promo || p.harga_normal).toLocaleString("id-ID")}`,
            })),
          );
        }
      };
      fetchPerawatan();
    }
  }, [selectedKategoriId, supabase]);

  const checkTimeValidity = useCallback((tgl: Date, jam: string) => {
    if (isToday(tgl)) {
      const currentTime = new Date();
      const selectedTime = parse(jam, "HH:mm", new Date());
      if (selectedTime.getTime() < currentTime.getTime()) {
        setIsPast(true);
        return false;
      }
    }
    setIsPast(false);
    return true;
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
      .match({ dokter_id: dokterId, tanggal: tanggal, jam: jam })
      .not("status", "eq", "Batal")
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
    setIsPast(false);
    if (selectedDokter && selectedTanggal && selectedJam) {
      const isValid = checkTimeValidity(selectedTanggal, selectedJam);
      if (isValid) {
        debouncedCheck(
          selectedDokter,
          format(selectedTanggal, "yyyy-MM-dd"),
          selectedJam,
        );
      }
    }
  }, [
    selectedDokter,
    selectedTanggal,
    selectedJam,
    debouncedCheck,
    checkTimeValidity,
  ]);

  const addPerawatan = (val: string) => {
    const item = perawatanOptions.find((o) => o.value === val);
    if (item && !selectedPerawatans.find((s) => s.value === val)) {
      setSelectedPerawatans([...selectedPerawatans, item]);
    }
  };

  const removePerawatan = (val: string) => {
    setSelectedPerawatans(selectedPerawatans.filter((s) => s.value !== val));
  };

  const handleReservasi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBentrok || isPast)
      return toast.error("Jadwal tidak tersedia atau sudah lewat.");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi berakhir.");

      const { data: reservasiData, error: resError } = await supabase
        .from("reservasi")
        .insert([
          {
            pasien_id: user.id,
            dokter_id: selectedDokter,
            tanggal: format(selectedTanggal!, "yyyy-MM-dd"),
            jam: selectedJam,
            keluhan: keluhan,
            status: "Menunggu",
          },
        ])
        .select()
        .single();

      if (resError) throw resError;

      const { data: rmData, error: rmError } = await supabase
        .from("rekam_medis")
        .insert([
          {
            reservasi_id: reservasiData.id,
            pasien_id: user.id,
            diagnosa: "Menunggu Pemeriksaan",
            tindakan:
              selectedPerawatans.length > 0
                ? selectedPerawatans.map((p) => p.label).join(", ")
                : "Konsultasi Umum",
          },
        ])
        .select()
        .single();

      if (rmError) throw rmError;

      if (selectedPerawatans.length > 0) {
        const detailPayload = selectedPerawatans.map((p) => ({
          rekam_medis_id: rmData.id,
          perawatan_id: p.value,
          harga_saat_ini: p.rawHarga,
        }));
        await supabase.from("detail_tindakan").insert(detailPayload);
      }

      toast.success("Reservasi berhasil dikirim!");

      // REDIRECT DENGAN QUERY PARAM ID
      router.push(`/pasien/riwayat?id=${reservasiData.id}`);

      // Reset Form State
      setSelectedDokter("");
      setSelectedTanggal(undefined);
      setSelectedJam("");
      setSelectedPerawatans([]);
      setSelectedKategoriId("");
      setKeluhan("");
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 animate-in fade-in duration-700 px-1">
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="w-5 h-5 fill-[#d9c3b6] text-[#d9c3b6]" />
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Reservasi Baru
          </h1>
        </div>
        <p className="text-slate-400 text-xs font-medium italic">
          Booking jadwal treatment Anda secara instan.
        </p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] text-white p-6">
          <CardTitle className="flex items-center gap-2.5 text-base font-black uppercase tracking-widest">
            <CalendarDays className="w-5 h-5" /> Formulir Booking
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleReservasi} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                Spesialis Dokter
              </Label>
              <Select
                onValueChange={setSelectedDokter}
                value={selectedDokter}
                required
              >
                <SelectTrigger className="h-12 bg-slate-50/50 rounded-xl border-slate-100 font-bold focus:ring-[#959cc9]/20 text-sm">
                  <SelectValue placeholder="Pilih Dokter Ahli" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl p-2">
                  {dokters.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="py-2.5 font-bold uppercase text-[10px] tracking-tight"
                    >
                      {d.nama_dokter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Kategori Treatment
                </Label>
                <Select
                  value={selectedKategoriId}
                  onValueChange={setSelectedKategoriId}
                >
                  <SelectTrigger className="h-12 bg-slate-50/50 rounded-xl border-slate-100 font-bold text-sm">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl">
                    {kategoriList.map((k) => (
                      <SelectItem
                        key={k.id}
                        value={k.id}
                        className="font-bold py-3 text-[10px] uppercase tracking-tighter"
                      >
                        {k.nama_kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Pilih Perawatan
                </Label>
                <SearchableSelect
                  options={perawatanOptions}
                  value=""
                  onChange={addPerawatan}
                  disabled={!selectedKategoriId}
                  placeholder={
                    selectedKategoriId
                      ? "Tambah treatment..."
                      : "Pilih kategori dahulu"
                  }
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {selectedPerawatans.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                {selectedPerawatans.map((p) => (
                  <Badge
                    key={p.value}
                    className="bg-white text-slate-700 border-slate-100 px-3 py-1.5 flex items-center gap-2 shadow-sm rounded-lg hover:text-red-500 transition-all cursor-pointer"
                    onClick={() => removePerawatan(p.value)}
                  >
                    <Activity className="w-3 h-3 text-[#d9c3b6]" />
                    <span className="text-[9px] font-black uppercase">
                      {p.label}
                    </span>
                    <X className="w-3 h-3 opacity-40" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Pilih Tanggal
                </Label>
                <DatePicker
                  value={selectedTanggal}
                  onChange={setSelectedTanggal}
                  placeholder="Pilih Tanggal"
                  className="h-12 rounded-xl border-slate-100 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Pilih Sesi
                </Label>
                <Select
                  onValueChange={setSelectedJam}
                  value={selectedJam}
                  required
                >
                  <SelectTrigger className="h-12 bg-slate-50/50 rounded-xl border-slate-100 font-bold text-sm">
                    <SelectValue placeholder="WIB" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl p-2 max-h-[250px]">
                    {jamOperasional.map((j) => (
                      <SelectItem
                        key={j}
                        value={j}
                        className="py-2.5 font-bold text-[10px] tracking-widest"
                      >
                        {j} WIB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDokter && selectedTanggal && selectedJam && (
              <div
                className={cn(
                  "p-4 rounded-2xl border flex items-center gap-3 transition-all animate-in zoom-in duration-300",
                  checking
                    ? "bg-slate-50 border-slate-200"
                    : isBentrok || isPast
                      ? "bg-red-50 border-red-100 text-red-600"
                      : "bg-green-50 border-green-100 text-green-600",
                )}
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : isBentrok || isPast ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                    {checking
                      ? "Memproses..."
                      : isPast
                        ? "Sesi Berakhir"
                        : isBentrok
                          ? "Jadwal Penuh"
                          : "Jadwal Tersedia"}
                  </span>
                  <p className="text-[10px] opacity-80 mt-0.5 leading-none font-medium">
                    {isPast
                      ? "Jam yang dipilih sudah terlewati hari ini."
                      : isBentrok
                        ? "Silakan cari jam atau dokter lain."
                        : "Slot ini siap untuk direservasi."}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                Catatan Keluhan
              </Label>
              <Textarea
                placeholder="Apa yang Anda rasakan?"
                required
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                className="h-28 bg-slate-50/50 rounded-2xl border-slate-100 p-4 font-medium text-sm focus:ring-[#959cc9]/20"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                isBentrok ||
                isPast ||
                checking ||
                !selectedTanggal ||
                !selectedDokter ||
                !selectedJam
              }
              className={cn(
                "w-full h-16 text-white font-black uppercase rounded-2xl shadow-lg transition-all active:scale-[0.98] tracking-[0.2em] text-xs flex items-center justify-center gap-3",
                isBentrok || isPast
                  ? "bg-slate-200 text-slate-400"
                  : "bg-gradient-to-r from-[#959cc9] to-[#d9c3b6]",
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : isBentrok || isPast ? (
                <History className="w-5 h-5" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> KONFIRMASI BOOKING
                </>
              )}
            </button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] opacity-80">
        D&apos;Aesthetic Smart Booking
      </p>
    </div>
  );
}
