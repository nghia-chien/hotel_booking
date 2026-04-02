"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  className?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "flex flex-col gap-4 relative",

        // Header: month/year
        month_caption: "flex justify-center items-center h-9",
        caption_label:
          "text-sm font-semibold text-[var(--color-text-primary)] tracking-tight",

        // Navigation (v9 separated from caption)
        nav: "flex items-center justify-between absolute w-full top-0 px-1 z-10 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 rounded-full hover:bg-[var(--color-surface)] transition-colors duration-150 pointer-events-auto"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 rounded-full hover:bg-[var(--color-surface)] transition-colors duration-150 pointer-events-auto"
        ),

        // Grid structure
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-1",

        // Day headers (MON, TUE...)
        weekday:
          "text-[var(--color-text-muted)] w-9 text-[11px] font-semibold uppercase tracking-wider text-center flex-none",

        week: "flex w-full mt-0.5",

        // Cell wrapper (td)
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl"
            : "[&:has([aria-selected])]:rounded-xl"
        ),

        // The actual date button
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-medium rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors duration-150 w-9 h-9 flex items-center justify-center m-auto"
        ),

        // States (v9 shorter keys)
        selected: cn(
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
          "hover:bg-[var(--color-primary-dark)] hover:text-[var(--color-primary-foreground)]",
          "focus:bg-[var(--color-primary)] focus:text-[var(--color-primary-foreground)]",
          "font-semibold opacity-100!"
        ),
        today: cn(
          "text-[var(--color-primary-foreground)] font-semibold",
          "ring-1 ring-inset ring-[var(--color-primary)]/60"
        ),
        outside:
          "text-[var(--color-text-muted)] opacity-40 aria-selected:opacity-70",
        disabled:
          "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed line-through",
        range_start:
          "day-range-start aria-selected:bg-[var(--color-primary)] aria-selected:text-[var(--color-primary-foreground)] aria-selected:font-semibold",
        range_end:
          "day-range-end aria-selected:bg-[var(--color-primary)] aria-selected:text-[var(--color-primary-foreground)] aria-selected:font-semibold",
        range_middle:
          "aria-selected:bg-[var(--color-primary)]/12 aria-selected:text-[var(--color-text-primary)] aria-selected:rounded-none",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) => {
          return orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...props} />
          );
        }
      }}
      {...props}
    />
  );
}

export { Calendar };
