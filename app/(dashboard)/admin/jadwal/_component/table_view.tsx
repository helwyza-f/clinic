"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  Info,
  User,
  Sparkles,
  ChevronRight,
  ArrowRightCircle,
  MessageSquareShare,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sendWhatsAppMessage,
  createReminderTemplate,
} from "@/lib/utils/fonnte";

interface TableViewProps {
  jadwal: any[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function TableView({
  jadwal,
  loading,
  onUpdateStatus,
}: TableViewProps) {
  const handleSendReminder = async (item: any) => {
    const noTelepon = item.pasien?.no_telepon;
    if (!noTelepon) return toast.error("Nomor telepon tidak terdaftar");

    const message = createReminderTemplate({
      nama: item.pasien.full_name,
      tanggal: item.tanggal,
      jam: item.jam.slice(0, 5),
      dokter: item.dokter?.nama_dokter,
    });

    const loadingToast = toast.loading("Mengirim WhatsApp...");
    const res = await sendWhatsAppMessage(noTelepon, message);
    toast.dismiss(loadingToast);

    if (res.success)
      toast.success("Reminder dikirim ke " + item.pasien.full_name);
    else toast.error("Gagal kirim WA: " + res.message);
  };

  if (loading && jadwal.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <Loader2 className="animate-spin text-[#959cc9] w-12 h-12" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em]">
          Synchronizing Registry...
        </p>
      </div>
    );
  }

  if (jadwal.length === 0) {
    return (
      <div className="py-44 flex flex-col items-center justify-center gap-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 opacity-60">
        <Info className="w-16 h-16 text-slate-300" />
        <p className="font-black text-sm text-slate-400 uppercase tracking-[0.4em] italic text-center">
          Antrean Masih Kosong
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Label Header Desktop (Disembunyikan di Mobile) */}
      <div className="hidden lg:grid grid-cols-5 gap-6 px-10 mb-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
          Jadwal & Waktu
        </span>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
          Pasien & Tenaga Ahli
        </span>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] col-span-2">
          Rencana Tindakan & Status
        </span>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">
          Kontrol
        </span>
      </div>

      <div className="grid gap-4">
        {jadwal.map((j) => {
          const detailTindakan = j.rekam_medis?.[0]?.detail_tindakan || [];
          const dateObj = new Date(j.tanggal);

          return (
            <Card
              key={j.id}
              className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-xl hover:translate-y-[-2px] transition-all duration-500 rounded-[2rem] overflow-hidden group"
            >
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-6 p-6 lg:p-10">
                  {/* KOLOM 1: WAKTU */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center min-w-[75px] h-[75px] bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-800">
                      <span className="text-[10px] font-black text-[#d9c3b6] uppercase tracking-widest leading-none mb-1">
                        {format(dateObj, "MMM")}
                      </span>
                      <span className="text-2xl font-black text-white leading-none">
                        {format(dateObj, "dd")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-tighter">
                        <Clock className="w-3.5 h-3.5 text-[#959cc9]" />{" "}
                        {j.jam?.slice(0, 5)} WIB
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-black uppercase tracking-widest border-slate-200 bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md"
                      >
                        Scheduled
                      </Badge>
                    </div>
                  </div>

                  {/* KOLOM 2: PASIEN */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded-xl text-[#959cc9] shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Full Name
                        </p>
                        <p className="font-black text-slate-900 uppercase tracking-tight truncate text-sm">
                          {j.pasien?.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-1 text-slate-500">
                      <ArrowRightCircle className="w-3.5 h-3.5 text-[#d9c3b6]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        dr. {j.dokter?.nama_dokter?.split(" ")[0]}
                      </span>
                    </div>
                  </div>

                  {/* KOLOM 3 & 4: TINDAKAN & STATUS */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {detailTindakan.length > 0 ? (
                        detailTindakan.map((dt: any) => (
                          <Badge
                            key={dt.id}
                            className="bg-white border border-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm hover:border-[#959cc9]/30 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 mr-2 text-[#959cc9]" />{" "}
                            {dt.perawatan?.nama_perawatan}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-[10px] font-black uppercase text-slate-300 italic flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4" /> Consultation
                          Session Only
                        </div>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-black uppercase px-4 py-1.5 rounded-lg border-none shadow-lg tracking-widest",
                        j.status === "Selesai"
                          ? "bg-blue-600 text-white shadow-blue-100"
                          : j.status === "Dikonfirmasi"
                            ? "bg-green-600 text-white shadow-green-100"
                            : j.status === "Batal"
                              ? "bg-red-600 text-white shadow-red-100"
                              : "bg-orange-500 text-white shadow-orange-100",
                      )}
                    >
                      {j.status}
                    </Badge>
                  </div>

                  {/* KOLOM 5: KONTROL */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
                    {/* <button
                      onClick={() => handleSendReminder(j)}
                      className="flex items-center gap-2 bg-green-50 text-green-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all active:scale-95 border border-green-100 shadow-sm"
                    >
                      <MessageSquareShare className="w-4 h-4" /> WA Remind
                    </button> */}

                    <Select
                      value={j.status}
                      onValueChange={(v) => onUpdateStatus(j.id, v)}
                    >
                      <SelectTrigger className="w-[140px] h-10 text-[10px] font-black uppercase rounded-xl border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        {["Menunggu", "Dikonfirmasi", "Selesai", "Batal"].map(
                          (s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="font-black text-[10px] uppercase py-3 rounded-xl cursor-pointer"
                            >
                              {s}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
