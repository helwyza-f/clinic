"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Plus, Layers, Stethoscope, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KategoriList from "./_components/kategori-list";
import PerawatanTable from "./_components/perawatan-table";
import PerawatanModal from "./_components/perawatan-modal";
import KategoriModal from "./_components/kategori-modal";

export default function PerawatanCMSPage() {
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKatModalOpen, setIsKatModalOpen] = useState(false);
  const [kategoris, setKategoris] = useState<any[]>([]);
  const supabase = createClient();

  const fetchKategori = useCallback(async () => {
    const { data } = await supabase
      .from("kategori_perawatan")
      .select("*")
      .order("nama_kategori");
    if (data) {
      setKategoris(data);
      // Set kategori pertama sebagai default jika belum ada yang terpilih
      if (!selectedKategori && data.length > 0) setSelectedKategori(data[0].id);
    }
  }, [supabase, selectedKategori]);

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Master Perawatan
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Kelola layanan medis & daftar harga premium.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-clinic-gradient text-white px-8 py-6 rounded-2xl font-black text-xs shadow-xl border-none hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> TAMBAH TINDAKAN
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Kategori */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Layers className="w-3 h-3" /> Kategori Layanan
            </h3>
            {/* Tombol Tambah Kategori Baru */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsKatModalOpen(true)}
              className="h-8 w-8 p-0 text-[#959cc9] hover:bg-[#959cc9]/10 rounded-lg transition-colors"
              title="Tambah Kategori"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>

          <KategoriList
            kategoris={kategoris}
            selectedId={selectedKategori}
            onSelect={setSelectedKategori}
            onRefresh={fetchKategori}
          />
        </div>

        {/* Tabel Utama */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Stethoscope className="w-3 h-3" /> Daftar Tindakan Medis
          </h3>
          <PerawatanTable kategoriId={selectedKategori} />
        </div>
      </div>

      {/* Modals */}
      <PerawatanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kategoris={kategoris}
      />
      <KategoriModal
        isOpen={isKatModalOpen}
        onClose={() => setIsKatModalOpen(false)}
        onRefresh={fetchKategori}
      />
    </div>
  );
}
