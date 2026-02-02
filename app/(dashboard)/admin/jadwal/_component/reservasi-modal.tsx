"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Loader2,
  Sparkles,
  X,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CalendarDays,
  History,
} from "lucide-react";
import { toast } from "sonner";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/searchable-select";
import { DatePicker } from "@/components/date-picker";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { debounce } from "lodash";
import { format, isToday, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ReservasiModal({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [pasienOptions, setPasienOptions] = useState<SearchableOption[]>([]);
  const [dokterList, setDokterList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [perawatanOptions, setPerawatanOptions] = useState<SearchableOption[]>(
    [],
  );

  const [selectedPasienId, setSelectedPasienId] = useState("");
  const [selectedDokterId, setSelectedDokterId] = useState("");
  const [selectedKategoriId, setSelectedKategoriId] = useState("");
  const [selectedPerawatans, setSelectedPerawatans] = useState<any[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState<Date | undefined>(
    undefined,
  );
  const [selectedJam, setSelectedJam] = useState("");
  const [keluhan, setKeluhan] = useState("");

  const [isBentrok, setIsBentrok] = useState(false);
  const [isPast, setIsPast] = useState(false);

  const supabase = createClient();

  const resetForm = () => {
    setSelectedPasienId("");
    setSelectedDokterId("");
    setSelectedKategoriId("");
    setSelectedPerawatans([]);
    setSelectedTanggal(undefined);
    setSelectedJam("");
    setKeluhan("");
    setIsBentrok(false);
    setIsPast(false);
  };

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [resP, resD, resK] = await Promise.all([
          supabase
            .from("pasien")
            .select("auth_user_id, full_name")
            .not("full_name", "is", null)
            .order("full_name"),
          supabase.from("dokter").select("id, nama_dokter"),
          supabase.from("kategori_perawatan").select("id, nama_kategori"),
        ]);
        if (resP.data)
          setPasienOptions(
            resP.data.map((p) => ({
              value: p.auth_user_id,
              label: p.full_name,
            })),
          );
        if (resD.data) setDokterList(resD.data);
        if (resK.data) setKategoriList(resK.data);
      };
      fetchData();
    }
  }, [open, supabase]);

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

  const addPerawatan = (val: string) => {
    const item = perawatanOptions.find((o) => o.value === val);
    if (item && !selectedPerawatans.find((s) => s.value === val)) {
      setSelectedPerawatans([...selectedPerawatans, item]);
    }
  };

  const removePerawatan = (val: string) => {
    setSelectedPerawatans(selectedPerawatans.filter((s) => s.value !== val));
  };

  const verifySchedule = async (dId: string, tgl: string, jam: string) => {
    if (!dId || !tgl || !jam) return;
    setChecking(true);
    const { data } = await supabase
      .from("reservasi")
      .select("id")
      .match({ dokter_id: dId, tanggal: tgl, jam: jam })
      .not("status", "eq", "Batal")
      .maybeSingle();
    setIsBentrok(!!data);
    setChecking(false);
  };

  const debouncedCheck = useCallback(
    debounce((d, t, j) => verifySchedule(d, t, j), 500),
    [],
  );

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

  useEffect(() => {
    setIsBentrok(false);
    setIsPast(false);
    if (selectedDokterId && selectedTanggal && selectedJam) {
      const isValid = checkTimeValidity(selectedTanggal, selectedJam);
      if (isValid)
        debouncedCheck(
          selectedDokterId,
          format(selectedTanggal, "yyyy-MM-dd"),
          selectedJam,
        );
    }
  }, [
    selectedDokterId,
    selectedTanggal,
    selectedJam,
    debouncedCheck,
    checkTimeValidity,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPasienId || !selectedTanggal || !selectedJam)
      return toast.error("Lengkapi data!");
    if (isPast) return toast.error("Waktu reservasi sudah terlewati!");
    setLoading(true);

    try {
      const { data: reservasiData, error: resError } = await supabase
        .from("reservasi")
        .insert([
          {
            pasien_id: selectedPasienId,
            dokter_id: selectedDokterId,
            tanggal: format(selectedTanggal, "yyyy-MM-dd"),
            jam: selectedJam,
            keluhan: keluhan,
            status: "Dikonfirmasi",
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
            pasien_id: selectedPasienId,
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
          harga_saat_ini: (p as any).rawHarga,
        }));
        await supabase.from("detail_tindakan").insert(detailPayload);
      }

      toast.success("Reservasi Berhasil Didaftarkan");
      setOpen(false);
      onRefresh();
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <button className="bg-clinic-gradient text-white px-10 py-4 rounded-[1.5rem] font-black text-xs shadow-2xl active:scale-95 transition-all tracking-[0.2em] flex items-center gap-2">
          <Plus className="w-4 h-4" /> RESERVASI BARU
        </button>
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Entry Perjanjian Medis</DialogTitle>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-10 text-white relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                Entry Perjanjian
              </h2>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                Sistem Antrean D&apos;Aesthetic
              </p>
            </div>
          </div>
        </div>

        {/* MODAL BODY DENGAN SCROLLBAR DIPERHALUS */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            "p-10 space-y-6 max-h-[75vh] overflow-y-auto",
            "scrollbar-thin",
            "[&::-webkit-scrollbar]:w-[6px]",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "hover:[&::-webkit-scrollbar-thumb]:bg-[#d9c3b6] transition-colors",
          )}
        >
          {/* FEEDBACK BANNER (STATUS JADWAL) */}
          {selectedDokterId && selectedTanggal && selectedJam && (
            <div
              className={cn(
                "p-4 rounded-2xl border flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2",
                checking
                  ? "bg-slate-50 border-slate-200 text-slate-500"
                  : isBentrok || isPast
                    ? "bg-red-50 border-red-100 text-red-600"
                    : "bg-green-50 border-green-100 text-green-600",
              )}
            >
              {checking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isBentrok || isPast ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {checking
                    ? "Mengecek Ketersediaan..."
                    : isPast
                      ? "Sesi Berakhir"
                      : isBentrok
                        ? "Jadwal Bentrok!"
                        : "Jadwal Tersedia"}
                </span>
                <p className="text-[11px] font-medium opacity-80">
                  {checking
                    ? "Sistem sedang memverifikasi jadwal dokter..."
                    : isPast
                      ? "Jam yang dipilih sudah terlewati untuk hari ini."
                      : isBentrok
                        ? "Dokter ini sudah memiliki janji temu di jam & tanggal tersebut."
                        : "Slot waktu ini aman untuk didaftarkan."}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Pilih Pasien
            </Label>
            <SearchableSelect
              options={pasienOptions}
              value={selectedPasienId}
              onChange={setSelectedPasienId}
              placeholder="Cari nama pasien..."
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="grid gap-2.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
                Dokter Ahli
              </Label>
              <Select
                value={selectedDokterId}
                onValueChange={setSelectedDokterId}
                required
              >
                <SelectTrigger className="border-slate-100 h-14 rounded-2xl bg-slate-50/50 font-bold focus:ring-[#959cc9]/30">
                  <SelectValue placeholder="Pilih Dokter" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
                  {dokterList.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="font-bold py-4 text-xs uppercase"
                    >
                      {d.nama_dokter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
                Kategori Layanan
              </Label>
              <Select
                value={selectedKategoriId}
                onValueChange={setSelectedKategoriId}
              >
                <SelectTrigger className="border-slate-100 h-14 rounded-2xl bg-slate-50/50 font-bold">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
                  {kategoriList.map((k) => (
                    <SelectItem
                      key={k.id}
                      value={k.id}
                      className="font-bold py-4 text-xs uppercase"
                    >
                      {k.nama_kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Rencana Tindakan Medis
            </Label>
            <SearchableSelect
              options={perawatanOptions}
              value=""
              onChange={addPerawatan}
              disabled={!selectedKategoriId}
              placeholder={
                selectedKategoriId
                  ? "Tambah tindakan..."
                  : "Pilih kategori dahulu"
              }
            />
            {selectedPerawatans.length > 0 && (
              <div className="flex flex-wrap gap-2 p-5 bg-slate-50/50 rounded-[1.5rem] border border-dashed border-slate-200">
                {selectedPerawatans.map((p) => (
                  <Badge
                    key={p.value}
                    className="bg-white text-slate-700 border-slate-100 px-4 py-2 flex items-center gap-3 shadow-sm rounded-xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer group"
                    onClick={() => removePerawatan(p.value)}
                  >
                    <Activity className="w-3.5 h-3.5 text-[#959cc9]" />
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      {p.label}
                    </span>
                    <X className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="grid gap-2.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
                Waktu Kunjungan
              </Label>
              <DatePicker
                value={selectedTanggal}
                onChange={setSelectedTanggal}
                placeholder="Pilih Tanggal"
              />
            </div>
            <div className="grid gap-2.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
                Sesi Jam
              </Label>
              <Select
                value={selectedJam}
                onValueChange={setSelectedJam}
                required
              >
                <SelectTrigger className="border-slate-100 h-14 rounded-2xl bg-slate-50/50 font-bold">
                  <SelectValue placeholder="WIB" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] rounded-2xl shadow-2xl">
                  {[
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
                  ].map((j) => (
                    <SelectItem
                      key={j}
                      value={j}
                      className="font-bold py-4 tracking-widest"
                    >
                      {j} WIB
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Catatan Pasien / Keluhan
            </Label>
            <Textarea
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              placeholder="Tulis keluhan pasien di sini..."
              className="border-slate-100 rounded-[1.5rem] h-24 bg-slate-50/50 p-5 text-sm font-medium focus:ring-[#959cc9]/30"
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
              !selectedPasienId ||
              !selectedJam
            }
            className={cn(
              "w-full h-20 text-white font-black uppercase rounded-[1.5rem] shadow-2xl transition-all active:scale-[0.97] tracking-[0.3em] text-xs flex items-center justify-center gap-3",
              isBentrok || isPast
                ? "bg-slate-200 cursor-not-allowed shadow-none"
                : "bg-clinic-gradient",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isBentrok || isPast ? (
              <History className="w-5 h-5" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" /> KONFIRMASI JADWAL
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
