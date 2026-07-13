"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  User,
  Menu,
  Sparkles,
  Calendar,
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
import { NavUser } from "@/components/nav-user"; // Import Komponen Reusable

const pasienMenuItems = [
  { name: "Beranda", href: "/pasien", icon: LayoutDashboard },
  { name: "Lihat Jadwal", href: "/pasien/jadwal", icon: Calendar },
  { name: "Buat Reservasi", href: "/pasien/reservasi", icon: CalendarPlus },
  { name: "Riwayat Kunjungan", href: "/pasien/riwayat", icon: History },
  { name: "Profil Saya", href: "/pasien/profil", icon: User },
];

export default function PasienLayout({
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
        <div className={cn("flex items-center", collapsed && !mobile ? "gap-0" : "gap-2")}>
          <Sparkles className="w-5 h-5 fill-[#d9c3b6] text-[#d9c3b6]" />
          {(!collapsed || mobile) && (
            <div className="ml-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                D&apos;Aesthetic
              </h1>
              <p className="text-[9px] text-[#959cc9] font-black uppercase tracking-[0.35em] mt-1 opacity-80">
                Patient Portal
              </p>
            </div>
          )}
        </div>
        {!mobile && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((v) => !v)} className="rounded-xl text-slate-400 hover:text-[#959cc9] hover:bg-slate-50">
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className={cn("flex-1 space-y-2", collapsed && !mobile ? "px-2 py-4" : "px-5 py-6")}>
        {pasienMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <span
                className={cn(
                  "flex items-center font-bold transition-all duration-300 group relative overflow-hidden",
                  collapsed && !mobile ? "justify-center px-3 py-3 rounded-2xl" : "gap-3 px-5 py-3.5 rounded-2xl text-sm",
                  isActive
                    ? "text-white shadow-lg shadow-indigo-100/50 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-[#959cc9]",
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] z-0 animate-in fade-in duration-500" />
                )}

                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-500 relative z-10",
                    isActive ? "scale-110 text-white" : "group-hover:scale-110",
                  )}
                />
                {(!collapsed || mobile) && <span className="relative z-10">{item.name}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout di Sidebar Mobile/Desktop bisa dipertahankan atau dihapus jika sudah ada di NavUser */}
      <div className={cn("border-t border-slate-50", collapsed && !mobile ? "p-4" : "p-6")}>
        <p className="text-[8px] text-slate-300 font-black text-center uppercase tracking-widest">
          D&apos;Aesthetic Intelligence
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300",
          collapsed ? "w-20" : "w-72",
        )}
      >
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header dengan NavUser terintegrasi */}
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
                    <SheetTitle>Menu Pasien</SheetTitle>
                    <SheetDescription>Navigasi portal pasien</SheetDescription>
                  </VisuallyHidden.Root>
                  <SidebarContent mobile />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-slate-900 uppercase tracking-[0.1em] text-sm">
              {pasienMenuItems.find((i) => i.href === pathname)?.name ||
                "Dashboard"}
            </h2>
          </div>

          {/* POJOK KANAN: NavUser Reusable Component */}
          <div className="flex items-center gap-4">
            <NavUser />
          </div>
        </header>

        <div className="py-4 lg:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
