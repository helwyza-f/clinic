import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FolderHeart, ChevronRight } from "lucide-react";

export default function KategoriList({ kategoris, selectedId, onSelect }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-100/50 border border-slate-50 space-y-2">
      {kategoris.map((kat: any) => (
        <button
          key={kat.id}
          onClick={() => onSelect(kat.id)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 group",
            selectedId === kat.id
              ? "bg-[#959cc9] text-white shadow-lg shadow-slate-200 translate-x-1"
              : "hover:bg-slate-50 text-slate-500",
          )}
        >
          <div className="flex items-center gap-3">
            <FolderHeart
              className={cn(
                "w-4 h-4",
                selectedId === kat.id ? "text-white" : "text-[#d9c3b6]",
              )}
            />
            <span className="text-xs font-bold uppercase tracking-tight">
              {kat.nama_kategori}
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
            )}
          />
        </button>
      ))}
    </div>
  );
}
