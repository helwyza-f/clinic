"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Wallet,
  Sparkles,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function BayarModal({
  data,
  totalAmount,
  onRefresh,
}: {
  data: any;
  totalAmount: number;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputTotal, setInputTotal] = useState(totalAmount.toString());
  const supabase = createClient();

  useEffect(() => {
    if (open) setInputTotal(totalAmount.toString());
  }, [open, totalAmount]);

  const handleBayar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const total = formData.get("total");
    const metode = formData.get("metode");

    try {
      const { error } = await supabase.from("transaksi").insert([
        {
          rekam_medis_id: data.id,
          total_harga: Number(total),
          metode_pembayaran: metode,
          status_pembayaran: "Lunas",
        },
      ]);

      if (error) throw error;

      toast.success("Transaksi Selesai & Lunas!");
      setOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#959cc9] hover:bg-[#959cc9]/90 text-white gap-2 h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#959cc9]/20">
          <Wallet className="w-4 h-4" /> BAYAR SEKARANG
        </Button>
      </DialogTrigger>

      <DialogContent className="border-none sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Invoice Detail</DialogTitle>
        </VisuallyHidden.Root>

        <div className="bg-clinic-gradient p-10 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
                Checkout Pasien
              </h2>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1.5">
                {data.pasien?.full_name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleBayar} className="p-10 space-y-6">
          <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tight leading-snug">
              Diagnosa dokter telah diterima. Silahkan konfirmasi nominal
              pembayaran.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Nominal Akhir (Berdasarkan Tindakan)
            </Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                RP
              </span>
              <Input
                name="total"
                type="number"
                value={inputTotal}
                onChange={(e) => setInputTotal(e.target.value)}
                required
                className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-xl focus:ring-[#959cc9]/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
              Metode Pembayaran
            </Label>
            <Select name="metode" required>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                <SelectValue placeholder="Pilih Metode" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                <SelectItem
                  value="Cash"
                  className="py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-4 h-4 text-green-500" /> Tunai / Cash
                  </div>
                </SelectItem>
                <SelectItem
                  value="Transfer"
                  className="py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Transfer
                    Bank
                  </div>
                </SelectItem>
                <SelectItem
                  value="QRIS"
                  className="py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-purple-500" /> QRIS /
                    E-Wallet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-[#fdfcfb] border border-[#d9c3b6]/30 p-6 rounded-[1.5rem] space-y-4">
            <div className="flex items-center gap-2 text-[#d9c3b6]">
              <Info className="w-3.5 h-3.5" />
              <p className="text-[9px] font-black uppercase tracking-widest">
                Rincian Layanan yang Diberikan
              </p>
            </div>
            <div className="space-y-2">
              {data.detail_tindakan?.map((dt: any) => (
                <div
                  key={dt.id}
                  className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0"
                >
                  <span className="text-[10px] font-bold text-slate-600 uppercase">
                    {dt.perawatan?.nama_perawatan}
                  </span>
                  <span className="text-[10px] font-black text-[#959cc9]">
                    Rp {dt.harga_saat_ini.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clinic-gradient h-20 text-white font-black uppercase rounded-[1.5rem] shadow-2xl shadow-[#959cc9]/30 transition-all active:scale-[0.98] disabled:grayscale tracking-[0.3em] text-xs flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" /> KONFIRMASI LUNAS
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
