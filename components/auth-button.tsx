import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil inisial untuk Avatar
  const initial = user?.email?.charAt(0).toUpperCase() || "U";
  const role = user?.user_metadata?.role || "pasien";

  return user ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-xl p-0 overflow-hidden border border-slate-100 shadow-sm active:scale-95 transition-all"
          >
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarFallback className="bg-slate-900 text-[#d9c3b6] font-black">
                {initial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-2xl p-2"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-[#959cc9]">
                Akun Anda
              </p>
              <p className="text-[11px] font-medium leading-none text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            asChild
            className="rounded-xl focus:bg-slate-50 cursor-pointer p-2.5"
          >
            <Link
              href={`/${role}`}
              className="flex w-full items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-slate-700"
            >
              <LayoutDashboard className="h-4 w-4 text-[#959cc9]" />
              Dashboard {role}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem className="rounded-xl focus:bg-red-50 cursor-pointer p-0">
            <LogoutButton className="w-full justify-start gap-2 text-[11px] font-bold uppercase tracking-tight text-red-500 p-2.5 hover:bg-transparent" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl"
      >
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-slate-900 text-[#d9c3b6] text-[10px] font-black uppercase tracking-widest rounded-xl px-5 active:scale-95 transition-all"
      >
        <Link href="/auth/sign-up">Join</Link>
      </Button>
    </div>
  );
}
