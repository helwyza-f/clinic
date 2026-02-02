"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type BirthDatePickerProps = {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function BirthDatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal lahir",
  disabled,
  className,
}: BirthDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "h-14 w-full justify-between rounded-2xl bg-slate-50/50 border-slate-100 font-bold px-4 transition-all hover:bg-slate-100/50",
            !value && "text-slate-400 font-medium",
            className,
          )}
        >
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 opacity-40 text-[#959cc9]" />
            {value ? format(value, "dd MMMM yyyy") : <span>{placeholder}</span>}
          </div>
          <ChevronDown className="h-4 w-4 opacity-30" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 rounded-[1.5rem] border-none shadow-2xl overflow-hidden bg-white"
        align="start"
        sideOffset={8}
        // KUNCI PERBAIKAN: Mencegah Popover menutup saat memilih dropdown tahun
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('[role="listbox"]') ||
            target.closest("[data-radix-select-viewport]") ||
            target.closest("[data-radix-popper-content-wrapper]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          // Konfigurasi Dropdown Tahun & Bulan
          captionLayout="dropdown"
          fromYear={1980} // Rentang tahun lebih luas untuk pasien
          toYear={new Date().getFullYear()}
          defaultMonth={value || new Date(2000, 0)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
