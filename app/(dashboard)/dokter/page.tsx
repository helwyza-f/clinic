"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Clock, Stethoscope } from "lucide-react";

export default function DokterDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-pink-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-pink-900">
              Antrean Hari Ini
            </CardTitle>
            <Clock className="w-4 h-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-pink-900">12</div>
            <p className="text-xs text-pink-600/60 font-medium">
              Pasien terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-pink-900">
              Menunggu Tindakan
            </CardTitle>
            <Users className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-500">5</div>
            <p className="text-xs text-orange-600/60 font-medium">
              Segera periksa
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-pink-900">
              Selesai Diperiksa
            </CardTitle>
            <ClipboardCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600">7</div>
            <p className="text-xs text-green-600/60 font-medium">
              Rekam medis terisi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nanti di sini kita pasang tabel antrean cepat */}
      <div className="p-20 border-2 border-dashed border-pink-100 rounded-2xl flex flex-col items-center justify-center text-pink-300 italic">
        <Stethoscope className="w-12 h-12 mb-4 opacity-20" />
        Dashboard visual sedang disiapkan...
      </div>
    </div>
  );
}
