"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PromoStatsCards from "./_components/promo-stats-cards";
import PromoTable from "./_components/promo-table";
import PromoModalForm from "./_components/promo-modal-form";

export default function PromoCMSPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const fetchPromos = useCallback(async () => {
    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) setPromos(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPromos();
    // Realtime Sync
    const channel = supabase
      .channel("promo_cms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promos" },
        () => fetchPromos(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPromos, supabase]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header CMS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Promo CMS Center
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium italic">
            Kelola konten visual eksklusif D&apos;Aesthetic.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] text-white px-8 py-6 rounded-2xl font-black text-xs shadow-xl hover:scale-105 transition-all border-none"
        >
          <Plus className="w-4 h-4 mr-2" /> TAMBAH KONTEN BARU
        </Button>
      </div>

      {/* Section 1: Highlight Cards (Preview Live) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <LayoutGrid className="w-3 h-3" /> Live Preview di Pasien
        </h3>
        <PromoStatsCards
          promos={promos.filter((p) => p.is_active).slice(0, 3)}
        />
      </div>

      {/* Section 2: Management Table */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <ListIcon className="w-3 h-3" /> Inventaris Seluruh Konten
        </h3>
        <PromoTable promos={promos} onRefresh={fetchPromos} />
      </div>

      <PromoModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchPromos}
      />
    </div>
  );
}
