"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  ReceiptIndianRupee,
  FileBarChart,
  Stethoscope,
  ReceiptIcon,
  Menu,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { NavUser } from "@/components/nav-user"; // Import Komponen NavUser

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pasien", href: "/admin/pasien", icon: Users },
  { name: "Dokter", href: "/admin/dokter", icon: Stethoscope },
  { name: "Jadwal", href: "/admin/jadwal", icon: CalendarDays },
  { name: "Rekam Medis", href: "/admin/rekam-medis", icon: ClipboardList },
  { name: "Transaksi", href: "/admin/transaksi", icon: ReceiptIndianRupee },
  {
    name: "Riwayat Transaksi",
    href: "/admin/transaksi/riwayat",
    icon: ReceiptIcon,
  },
  { name: "Laporan", href: "/admin/laporan", icon: FileBarChart },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-6 h-6 fill-[#959cc9] text-[#959cc9]" />
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            D&apos;Aesthetic
          </h1>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Premium Clinic System
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <span
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] text-white shadow-lg shadow-slate-200 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-[#959cc9]",
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <p className="text-[8px] text-slate-300 font-black text-center uppercase tracking-widest">
          Administrator Control Unit
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#959cc9] hover:bg-slate-50 rounded-xl"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none">
                  <VisuallyHidden.Root>
                    <SheetTitle>Navigasi Admin D&apos;Aesthetic</SheetTitle>
                    <SheetDescription>
                      Manajemen data klinik dan promo massal.
                    </SheetDescription>
                  </VisuallyHidden.Root>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-slate-900 uppercase tracking-tight text-lg">
              {pathname === "/admin"
                ? "Dashboard Overview"
                : pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h2>
          </div>

          {/* INTEGRASI NAV-USER DI POJOK KANAN HEADER */}
          <div className="flex items-center gap-4">
            <NavUser />
          </div>
        </header>

        <div className="p-6 lg:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
