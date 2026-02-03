// components/nav-user.tsx
"use client";

import { useEffect, useState } from "react";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function NavUser() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        // Kita ambil full_name dari metadata atau profile table jika ada
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .single();

        setUser({
          name: profile?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          avatar: "", // Bisa dikembangkan dengan URL image dari storage
        });
      }
    }
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none group">
          <div className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">
                {user.name}
              </span>
              <span className="text-[9px] font-bold text-[#959cc9] uppercase tracking-widest mt-1">
                Authorized Access
              </span>
            </div>
            <Avatar className="w-11 h-11 rounded-[1.25rem] border-2 border-white shadow-sm ring-1 ring-slate-100 transition-transform group-active:scale-95">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#959cc9] to-[#d9c3b6] text-white font-black">
                {user.name.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-[1.5rem] p-2 shadow-2xl border-slate-100"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-3 font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarFallback className="bg-slate-100 text-[#959cc9] font-black">
                {user.name.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-black text-slate-900 uppercase text-xs">
                {user.name}
              </span>
              <span className="truncate text-slate-400 text-[10px]">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator className="bg-slate-50" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="rounded-xl py-3 gap-3 focus:bg-slate-50 cursor-pointer">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">
              Profile Management
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl py-3 gap-3 focus:bg-slate-50 cursor-pointer">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">
              Account Settings
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-50" /> */}
        <DropdownMenuItem
          className="rounded-xl py-3 gap-3 focus:bg-red-50 focus:text-red-600 text-slate-400 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Sign Out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
