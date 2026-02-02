"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SearchableOption = {
  value: string;
  label: string;
  description?: string;
};

type SearchableSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih data...",
  searchPlaceholder = "Cari...",
  emptyText = "Data tidak ditemukan.",
  disabled,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "h-14 w-full justify-between rounded-2xl bg-slate-50/50 font-bold border-slate-100",
            disabled && "opacity-50",
            className,
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-30" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="
          w-[--radix-popover-trigger-width]
          p-0
          rounded-2xl
          border-none
          shadow-2xl
          overflow-hidden
        "
      >
        <Command
          className="border-none"
          // ⬇️ ini kunci supaya scroll wheel jalan normal
          onWheelCapture={(e) => e.stopPropagation()}
        >
          {/* SEARCH INPUT */}
          <CommandInput
            placeholder={searchPlaceholder}
            className="
              h-12
              border-b
              border-slate-100
              bg-slate-50
              px-4
              text-sm
              outline-none
              ring-0
              focus:ring-0
              placeholder:text-slate-400
            "
          />

          <CommandList
            className="
              max-h-[260px]
              overflow-y-auto
              overscroll-contain
              custom-scrollbar
            "
          >
            <CommandEmpty className="py-6 text-xs text-center text-slate-400">
              {emptyText}
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="
                    py-3 px-4 cursor-pointer
                    aria-selected:bg-[#d9c3b6]
                    aria-selected:text-slate-900
                    rounded-xl mx-2 my-1
                  "
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[10px] text-slate-500">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
