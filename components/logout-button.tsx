"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn("flex items-center", className)}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
