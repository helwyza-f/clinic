"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Check,
  ChevronsUpDown,
  Clock,
  Stethoscope,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce } from "lodash";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour !== 20) slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const jamOperasional = generateTimeSlots();

export function ReservasiModal({ onRefresh }: { onRefresh: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [dokterList, setDokterList] = useState<any[]>([]);
  const [selectedPasienId, setSelectedPasienId] = useState("");
  const [selectedDokterId, setSelectedDokterId] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [selectedJam, setSelectedJam] = useState("");
  const [isBentrok, setIsBentrok] = useState(false);
  const [openPasienSelect, setOpenPasienSelect] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    if (open) fetchInitialData();
  }, [open]);

  async function fetchInitialData() {
    const [resP, resD] = await Promise.all([
      supabase
        .from("pasien")
        .select("auth_user_id, full_name")
        .not("full_name", "is", null)
        .order("full_name"),
      supabase.from("dokter").select("id, nama_dokter"),
    ]);
    if (resP.data) {
      setPasienList(
        resP.data.map((p: any) => ({
          id: p.auth_user_id,
          full_name: p.full_name,
        })),
      );
    }
    if (resD.data) setDokterList(resD.data);
  }

  const verifySchedule = async (dId: string, tgl: string, jam: string) => {
    if (!dId || !tgl || !jam) return;
    setChecking(true);
    const { data } = await supabase
      .from("reservasi")
      .select("id")
      .match({ dokter_id: dId, tanggal: tgl, jam: jam })
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
    if (selectedDokterId && selectedTanggal && selectedJam)
      debouncedCheck(selectedDokterId, selectedTanggal, selectedJam);
  }, [selectedDokterId, selectedTanggal, selectedJam, debouncedCheck]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPasienId) return toast.error("Pilih pasien!");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      pasien_id: selectedPasienId,
      dokter_id: selectedDokterId,
      tanggal: selectedTanggal,
      jam: selectedJam,
      keluhan: formData.get("keluhan"),
      status: "Dikonfirmasi",
    };
    const { error } = await supabase.from("reservasi").insert([payload]);
    if (!error) {
      toast.success("Jadwal ditambahkan!");
      setOpen(false);
      onRefresh();
      setSelectedPasienId("");
      setSelectedDokterId("");
      setSelectedTanggal("");
      setSelectedJam("");
    } else {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // Modal guard: return null agar server tidak mencoba merender DOM yang berat
  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-600 hover:bg-pink-700 gap-2 px-6 py-5 rounded-xl">
          <Plus className="w-4 h-4" /> Reservasi Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="border-pink-100 sm:max-w-[450px] rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="bg-pink-500 p-6 text-white">
          <DialogTitle className="text-xl font-black uppercase">
            Buat Jadwal Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid gap-2">
            <Label className="text-pink-900 font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-pink-500" /> Pasien
            </Label>
            <Popover open={openPasienSelect} onOpenChange={setOpenPasienSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between border-pink-100 h-12 bg-white rounded-xl text-pink-900"
                >
                  {selectedPasienId
                    ? pasienList.find((p) => p.id === selectedPasienId)
                        ?.full_name
                    : "Cari data pasien..."}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 shadow-xl border-pink-50">
                <Command>
                  <CommandInput
                    placeholder="Ketik nama pasien..."
                    className="h-12"
                  />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {pasienList.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.full_name}
                          onSelect={() => {
                            setSelectedPasienId(p.id);
                            setOpenPasienSelect(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedPasienId === p.id ? "opacity-100" : "opacity-0"}`}
                          />
                          {p.full_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label className="text-pink-900 font-bold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-pink-500" /> Dokter
            </Label>
            <Select
              value={selectedDokterId}
              onValueChange={setSelectedDokterId}
              required
            >
              <SelectTrigger className="border-pink-100 h-12 bg-white rounded-xl">
                <SelectValue placeholder="Pilih Dokter" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {dokterList.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nama_dokter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-pink-900 font-bold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-pink-500" /> Tanggal
              </Label>
              <Input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                required
                className="border-pink-100 h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-pink-900 font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-500" /> Jam Sesi
              </Label>
              <Select
                value={selectedJam}
                onValueChange={setSelectedJam}
                required
              >
                <SelectTrigger className="border-pink-100 h-12 bg-white rounded-xl">
                  <SelectValue placeholder="Sesi" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {jamOperasional.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j} WIB
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDokterId && selectedTanggal && selectedJam && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 border text-[10px] font-black uppercase tracking-widest transition-all ${checking ? "bg-slate-50 text-slate-400" : isBentrok ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isBentrok ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {checking
                ? "Memverifikasi..."
                : isBentrok
                  ? "Sesi Terisi"
                  : "Jadwal Tersedia"}
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-pink-900 font-bold">Catatan</Label>
            <Textarea
              name="keluhan"
              placeholder="..."
              className="border-pink-100 rounded-xl h-20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || isBentrok || checking}
            className="w-full bg-pink-600 hover:bg-pink-700 h-14 text-white font-black uppercase rounded-2xl shadow-xl"
          >
            Simpan Jadwal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
