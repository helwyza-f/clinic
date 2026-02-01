"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  History,
  LogOut,
  Stethoscope,
  Menu,
  Heart,
  Sparkles,
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

const dokterMenuItems = [
  { name: "Dashboard", href: "/dokter", icon: LayoutDashboard },
  { name: "Antrean Medis", href: "/dokter/antrean", icon: Stethoscope },
  { name: "Riwayat Pasien", href: "/dokter/riwayat", icon: History },
];

export default function DokterLayout({
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

  // Sidebar Content yang digunakan bersama oleh Desktop & Mobile
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-pink-50">
        <h1 className="text-2xl font-black text-pink-900 tracking-tight flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
          D&apos;Aesthetic
        </h1>
        <p className="text-[10px] text-pink-500 font-black text-center uppercase tracking-[0.3em] mt-1">
          Area Dokter
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {dokterMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <span
                className={cn(
                  "flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-pink-500 text-white shadow-xl shadow-pink-100 scale-[1.02]"
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

      <div className="p-6 border-t border-pink-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-pink-900/40 hover:text-red-500 hover:bg-red-50 gap-3 rounded-2xl font-bold transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" /> Logout
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Mobile */}
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
                <SheetContent side="left" className="p-0 w-72 border-none">
                  <VisuallyHidden.Root>
                    <SheetTitle>Menu Navigasi Dokter</SheetTitle>
                    <SheetDescription>
                      Akses ke Dashboard, Antrean, dan Riwayat Pasien.
                    </SheetDescription>
                  </VisuallyHidden.Root>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-pink-900 uppercase tracking-tight text-lg">
              {dokterMenuItems.find((i) => i.href === pathname)?.name ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-pink-50/50 pl-4 pr-2 py-1.5 rounded-2xl border border-pink-100">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                <Sparkles className="w-2 h-2 fill-pink-400" /> Professional
              </span>
              <span className="text-xs font-black text-pink-900 leading-none">
                dr. Eny Aesthetic
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="p-6 lg:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
