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
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white">
      <div
        className={cn(
          "border-b border-slate-50 flex items-center",
          mobile ? "p-8 justify-start" : collapsed ? "p-4 justify-center" : "p-8 justify-between",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed && !mobile ? "gap-0" : "gap-2",
          )}
        >
          <Heart className="w-5 h-5 fill-[#959cc9] text-[#959cc9]" />
          {(!collapsed || mobile) && (
            <div className="ml-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">
                D&apos;Aesthetic
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em]">
                Premium Clinic System
              </p>
            </div>
          )}
        </div>
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-xl text-slate-400 hover:text-[#959cc9] hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed && !mobile ? "px-2 py-4" : "px-4 py-4")}>
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
                  "flex items-center font-bold transition-all duration-300",
                  collapsed && !mobile ? "justify-center px-3 py-3 rounded-2xl" : "gap-3 px-4 py-3 rounded-2xl text-sm",
                  isActive
                    ? "bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] text-white shadow-md shadow-slate-200 scale-[1.01]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-[#959cc9]",
                )}
              >
                <item.icon className="w-5 h-5" />
                {(!collapsed || mobile) && <span>{item.name}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-slate-50", collapsed && !mobile ? "p-4" : "p-6")}>
        <p className="text-[8px] text-slate-300 font-black text-center uppercase tracking-widest">
          Administrator Control Unit
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside
        className={cn(
          "bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300",
          collapsed ? "w-20" : "w-72",
        )}
      >
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
                  <SidebarContent mobile />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-slate-900 uppercase tracking-tight text-base">
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

        <div className="p-4 lg:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
