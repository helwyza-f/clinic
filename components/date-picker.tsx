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

type DatePickerProps = {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal kunjungan",
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            // Penyesuaian Style D'Aesthetic: h-14 dan rounded-2xl
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
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          // defaultMonth memastikan kalender terbuka di bulan yang dipilih
          defaultMonth={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
