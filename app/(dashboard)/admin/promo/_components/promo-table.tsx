import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function PromoTable({
  promos,
  onRefresh,
}: {
  promos: any[];
  onRefresh: () => void;
}) {
  const supabase = createClient();

  const toggleStatus = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("promos")
      .update({ is_active: !current })
      .eq("id", id);
    if (!error) {
      toast.success("Status Diperbarui");
      onRefresh();
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Hapus konten ini selamanya?")) return;
    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (!error) {
      toast.success("Konten Dihapus");
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[100px] pl-8 py-5 text-slate-400 font-black uppercase text-[10px]">
              Preview
            </TableHead>
            <TableHead className="text-slate-400 font-black uppercase text-[10px]">
              Judul Konten
            </TableHead>
            <TableHead className="text-slate-400 font-black uppercase text-[10px]">
              Tujuan (CTA)
            </TableHead>
            <TableHead className="text-slate-400 font-black uppercase text-[10px]">
              Status
            </TableHead>
            <TableHead className="text-right pr-8 text-slate-400 font-black uppercase text-[10px]">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promos.map((promo) => (
            <TableRow
              key={promo.id}
              className="border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="pl-8 py-4">
                <img
                  src={promo.image_url}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                />
              </TableCell>
              <TableCell>
                <div className="font-black text-slate-900 text-sm uppercase">
                  {promo.title}
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                  Dibuat: {new Date(promo.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="inline-flex items-center px-3 py-1 bg-[#d9c3b6]/10 text-[#213125] rounded-full text-[10px] font-black uppercase">
                  {promo.cta_text}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={promo.is_active}
                  onCheckedChange={() =>
                    toggleStatus(promo.id, promo.is_active)
                  }
                  className="data-[state=checked]:bg-[#959cc9]"
                />
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-[#959cc9]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => deletePromo(promo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
