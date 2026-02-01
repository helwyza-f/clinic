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
  LogOut,
  Stethoscope,
  ReceiptIcon,
  Menu,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  // Komponen Sidebar Content agar bisa digunakan kembali di Mobile & Desktop
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6">
        <h1 className="text-2xl font-black text-pink-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
          D&apos;Aesthetic
        </h1>
        <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">
          Clinic Management System
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)} // Tutup drawer saat link diklik
            >
              <span
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-100 scale-[1.02]"
                    : "text-pink-900/60 hover:bg-pink-50 hover:text-pink-600",
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive ? "animate-pulse" : "")}
                />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-pink-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-pink-900/60 hover:text-red-500 hover:bg-red-50 gap-3 rounded-2xl font-bold"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Keluar Sistem
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FFF5F7]">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-white border-r border-pink-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu untuk Mobile */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-pink-600 hover:bg-pink-50 rounded-xl"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="p-0 w-72 border-r-pink-100"
                >
                  {/* Perbaikan Aksesibilitas: Menambahkan Title & Description */}
                  <VisuallyHidden.Root>
                    <SheetTitle>Navigasi Menu Admin</SheetTitle>
                    <SheetDescription>
                      Akses cepat ke seluruh modul manajemen klinik
                      D&apos;Aesthetic.
                    </SheetDescription>
                  </VisuallyHidden.Root>

                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-pink-900 uppercase tracking-tighter text-lg lg:text-xl">
              {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                Administrator
              </span>
              <span className="text-xs font-bold text-pink-900">
                Dr. Eny System
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content Wrapper dengan padding yang responsif */}
        <div className="p-4 lg:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
