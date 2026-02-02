import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function PromoStatsCards({ promos }: { promos: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {promos.map((promo) => (
        <Card
          key={promo.id}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-none shadow-2xl group"
        >
          <img
            src={promo.image_url}
            alt={promo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-green-500 text-white border-none font-black text-[9px] px-3 animate-pulse">
              LIVE NOW
            </Badge>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white font-black text-lg uppercase leading-tight mb-2">
              {promo.title}
            </p>
            <div className="flex items-center gap-2 text-[#d9c3b6] text-[10px] font-bold">
              <ExternalLink className="w-3 h-3" /> CTA: {promo.cta_text}
            </div>
          </div>
        </Card>
      ))}
      {promos.length === 0 && (
        <div className="col-span-3 h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold italic">
          Belum ada promo yang diaktifkan.
        </div>
      )}
    </div>
  );
}
