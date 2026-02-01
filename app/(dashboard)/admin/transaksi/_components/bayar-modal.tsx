"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wallet, CheckCircle } from "lucide-react";

export function BayarModal({
  data,
  onRefresh,
}: {
  data: any;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBayar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const total = formData.get("total");
    const metode = formData.get("metode");

    const { error } = await supabase.from("transaksi").insert([
      {
        rekam_medis_id: data.id,
        total_harga: total,
        metode_pembayaran: metode,
        status_pembayaran: "Lunas",
      },
    ]);

    if (!error) {
      toast.success("Pembayaran Berhasil!");
      setOpen(false);
      onRefresh();
    } else {
      toast.error("Gagal: " + error.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2 h-9 text-xs font-bold">
          <Wallet className="w-4 h-4" /> Proses Bayar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-pink-900 border-b pb-4">
            Pembayaran: {data.pasien?.full_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBayar} className="space-y-4 pt-4">
          <div>
            <Label className="text-xs font-bold">TOTAL TAGIHAN (RP)</Label>
            <Input
              name="total"
              type="number"
              placeholder="Contoh: 150000"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-bold">METODE PEMBAYARAN</Label>
            <Select name="metode" required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Tunai (Cash)</SelectItem>
                <SelectItem value="Transfer">Transfer Bank</SelectItem>
                <SelectItem value="QRIS">QRIS / E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-pink-50 p-3 rounded-lg text-[10px] text-pink-600 italic">
            Tindakan Dokter: {data.tindakan}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 py-6 font-bold"
          >
            {loading ? "Memproses..." : "Konfirmasi Lunas"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
