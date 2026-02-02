"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 bg-white rounded-[2rem]",
        // Menangani RTL secara manual untuk Tailwind v3
        "[&_.rdp-button_next>svg]:rtl:rotate-180 [&_.rdp-button_previous>svg]:rtl:rotate-180",
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code || "default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months,
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between z-10 px-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 aria-disabled:opacity-50 p-0 select-none rounded-xl hover:bg-slate-50 text-slate-400 transition-all",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 aria-disabled:opacity-50 p-0 select-none rounded-xl hover:bg-slate-50 text-slate-400 transition-all",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-8 w-full px-8",
          defaultClassNames.month_caption,
        ),
        // STYLING DROPDOWN CONTAINER
        dropdowns: cn(
          "w-full flex items-center text-sm font-black justify-center h-8 gap-2",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative inline-flex items-center group/dropdown",
          defaultClassNames.dropdown_root,
        ),
        // DROPDOWN ASLI (Dibuat transparan di atas label cantik)
        dropdown: cn(
          "absolute inset-0 opacity-0 z-30 cursor-pointer w-full h-full",
          defaultClassNames.dropdown,
        ),
        // LABEL CANTIK UNTUK PENGGANTI DROPDOWN
        caption_label: cn(
          "z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-[#959cc9] transition-all group-hover/dropdown:bg-slate-100",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse mt-2",
        weekdays: cn("flex justify-between", defaultClassNames.weekdays),
        weekday: cn(
          "text-slate-300 rounded-md flex-1 font-black text-[9px] uppercase select-none tracking-[0.2em] py-2",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-1.5", defaultClassNames.week),
        day: cn(
          "relative w-9 h-9 p-0 text-center group/day aspect-square select-none flex items-center justify-center",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-l-2xl bg-[#959cc9] text-white relative isolate",
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          "rounded-none bg-slate-50 text-slate-900",
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          "rounded-r-2xl bg-[#959cc9] text-white relative isolate",
          defaultClassNames.range_end,
        ),
        today: cn(
          "text-[#d9c3b6] font-black after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-[#d9c3b6] after:rounded-full",
          defaultClassNames.today,
        ),
        outside: cn("text-slate-200 opacity-50", defaultClassNames.outside),
        disabled: cn(
          "text-slate-200 opacity-20 cursor-not-allowed",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className="h-4 w-4" {...props} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className="h-4 w-4" {...props} />;
          }
          return <ChevronDownIcon className="h-3 w-3 opacity-50" {...props} />;
        },
        // Menambahkan Chevron Down otomatis di sebelah Label Bulan/Tahun
        CaptionLabel: ({ children }) => (
          <div className="flex items-center gap-1">
            {children}
            <ChevronDownIcon className="h-3 w-3 opacity-30" />
          </div>
        ),
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={cn(
        "h-8 w-8 p-0 font-bold text-[11px] rounded-xl transition-all relative isolate z-10 tracking-tight",
        "hover:bg-slate-100 hover:text-[#959cc9]",
        "data-[selected-single=true]:bg-[#959cc9] data-[selected-single=true]:text-white data-[selected-single=true]:shadow-lg data-[selected-single=true]:shadow-[#959cc9]/30",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-slate-200",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
