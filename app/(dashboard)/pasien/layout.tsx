"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  LogOut,
  User,
  Menu,
  Sparkles,
  ShieldCheck,
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

const pasienMenuItems = [
  { name: "Beranda", href: "/pasien", icon: LayoutDashboard },
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
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-slate-50">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 fill-[#d9c3b6] text-[#d9c3b6]" />
          D&apos;Aesthetic
        </h1>
        <p className="text-[9px] text-[#959cc9] font-black text-center uppercase tracking-[0.4em] mt-1.5 opacity-80">
          Patient Portal
        </p>
      </div>

      <nav className="flex-1 px-5 py-8 space-y-3">
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
                  "flex items-center gap-3 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "text-white shadow-lg shadow-indigo-100/50 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-[#959cc9]",
                )}
              >
                {/* Background Gradient khusus Active Link */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#959cc9] to-[#d9c3b6] z-0 animate-in fade-in duration-500" />
                )}

                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-500 relative z-10",
                    isActive ? "scale-110 text-white" : "group-hover:scale-110",
                  )}
                />
                <span className="relative z-10">{item.name}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-50 gap-3 rounded-2xl font-bold transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar Desktop */}
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
                    <SheetTitle>Menu Pasien</SheetTitle>
                    <SheetDescription>Navigasi portal pasien</SheetDescription>
                  </VisuallyHidden.Root>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            <h2 className="font-black text-slate-900 uppercase tracking-[0.1em] text-sm">
              {pasienMenuItems.find((i) => i.href === pathname)?.name ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black text-[#d9c3b6] uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Exclusive Member
              </span>
              <span className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">
                Patient Account
              </span>
            </div>

            <div className="w-11 h-11 rounded-[1.25rem] bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-[#959cc9] font-black text-lg ring-1 ring-slate-100">
              P
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 overflow-y-auto w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
