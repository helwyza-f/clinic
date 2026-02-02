import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function PerawatanTable({
  kategoriId,
}: {
  kategoriId: string | null;
}) {
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!kategoriId) return;
    const fetchData = async () => {
      const { data: res } = await supabase
        .from("perawatan")
        .select("*")
        .eq("kategori_id", kategoriId)
        .order("nama_perawatan");
      if (res) setData(res);
    };
    fetchData();

    const channel = supabase
      .channel(`table_${kategoriId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "perawatan" },
        () => fetchData(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [kategoriId, supabase]);

  const toggleStatus = async (id: string, current: boolean) => {
    await supabase
      .from("perawatan")
      .update({ is_active: !current })
      .eq("id", id);
    toast.success("Status tindakan diperbarui");
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="pl-8 py-5 text-slate-400 font-black uppercase text-[10px]">
              Nama Tindakan
            </TableHead>
            <TableHead className="text-slate-400 font-black uppercase text-[10px]">
              Harga Normal
            </TableHead>
            <TableHead className="text-slate-400 font-black uppercase text-[10px]">
              Harga Promo
            </TableHead>
            <TableHead className="text-right pr-8 text-slate-400 font-black uppercase text-[10px]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="pl-8 py-5">
                <div className="font-black text-slate-900 text-sm uppercase">
                  {item.nama_perawatan}
                </div>
              </TableCell>
              <TableCell className="text-slate-400 font-medium line-through">
                Rp {item.harga_normal.toLocaleString("id-ID")}
              </TableCell>
              <TableCell>
                <Badge className="bg-[#d9c3b6]/20 text-[#213125] border-none font-black text-xs">
                  Rp {item.harga_promo?.toLocaleString("id-ID") || "-"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => toggleStatus(item.id, item.is_active)}
                  className="data-[state=checked]:bg-[#959cc9]"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
