"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  Loader2,
  Info,
  User,
  Stethoscope,
} from "lucide-react";
import { Card } from "@/components/ui/card";

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
  if (loading && jadwal.length === 0) {
    return (
      <Card className="border-pink-100 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-2xl p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-pink-500 w-10 h-10" />
        <p className="mt-4 text-pink-400 font-bold uppercase text-xs tracking-widest">
          Sinkronisasi Data...
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-pink-100 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl border-none">
      <Table>
        {/* Header Diperbaiki: Warna teks gelap agar terbaca */}
        <TableHeader className="bg-pink-500/10 border-b border-pink-100">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-pink-900 font-black uppercase text-[10px] tracking-widest py-5 pl-6">
              Waktu Pelayanan
            </TableHead>
            <TableHead className="text-pink-900 font-black uppercase text-[10px] tracking-widest py-5">
              Detail Pasien & Dokter
            </TableHead>
            <TableHead className="text-pink-900 font-black uppercase text-[10px] tracking-widest py-5 text-center">
              Status Reservasi
            </TableHead>
            <TableHead className="text-pink-900 font-black uppercase text-[10px] tracking-widest py-5 text-right pr-6">
              Aksi Cepat
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jadwal.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-24">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="p-4 bg-pink-50 rounded-full">
                    <Info className="w-8 h-8 text-pink-200" />
                  </div>
                  <p className="italic font-bold text-sm text-pink-900/30">
                    Tidak ada jadwal reservasi ditemukan.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            jadwal.map((j) => (
              <TableRow
                key={j.id}
                className="hover:bg-pink-50/30 transition-colors border-pink-50"
              >
                <TableCell className="py-6 pl-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-pink-900 flex items-center gap-2 text-xs uppercase tracking-tighter">
                      <CalendarDays className="w-3.5 h-3.5 text-pink-500" />{" "}
                      {j.tanggal}
                    </span>
                    <span className="text-pink-500 font-bold flex items-center gap-2 text-[10px] bg-pink-50 w-fit px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" /> {j.jam?.slice(0, 5)} WIB
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="space-y-1">
                    <div className="font-black text-pink-900 text-sm uppercase leading-tight flex items-center gap-2">
                      <User className="w-3 h-3 text-pink-300" />{" "}
                      {j.pasien?.full_name}
                    </div>
                    <div className="text-[10px] text-pink-400 font-bold italic flex items-center gap-2">
                      <Stethoscope className="w-3 h-3" /> dr.{" "}
                      {j.dokter?.nama_dokter}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center py-6">
                  <Badge
                    variant="outline"
                    className={`rounded-xl px-3 py-1 font-black text-[9px] uppercase border-none shadow-sm ${
                      j.status === "Selesai"
                        ? "bg-blue-50 text-blue-600"
                        : j.status === "Dikonfirmasi"
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {j.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-6 pr-6">
                  <Select
                    defaultValue={j.status}
                    onValueChange={(v) => onUpdateStatus(j.id, v)}
                  >
                    <SelectTrigger className="w-[140px] ml-auto h-10 text-[10px] uppercase font-black bg-white border-pink-100 rounded-xl shadow-sm focus:ring-pink-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-pink-100 shadow-2xl rounded-xl">
                      <SelectItem
                        value="Menunggu"
                        className="font-bold text-[10px] uppercase text-slate-500"
                      >
                        Menunggu
                      </SelectItem>
                      <SelectItem
                        value="Dikonfirmasi"
                        className="text-green-600 font-bold text-[10px] uppercase"
                      >
                        Konfirmasi
                      </SelectItem>
                      <SelectItem
                        value="Selesai"
                        className="text-blue-600 font-bold text-[10px] uppercase"
                      >
                        Selesai
                      </SelectItem>
                      <SelectItem
                        value="Batal"
                        className="text-red-500 font-bold text-[10px] uppercase"
                      >
                        Batal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
