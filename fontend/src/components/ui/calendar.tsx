"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDateTime?: Date;
}

export function Calendar({
  value,
  onChange,
  minDateTime
}: CalendarProps) {
  const hour = value?.getHours() ?? 12;
  const minute = value?.getMinutes() ?? 0;

  const handleDateSelect = (date?: Date) => {
    if (!date) return;

    const newDate = new Date(date);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    if (minDateTime && newDate <= minDateTime) return;

    onChange?.(newDate);
  };

  const handleTimeChange = (h: number, m: number) => {
    if (!value) return;

    const newDate = new Date(value);
    newDate.setHours(h);
    newDate.setMinutes(m);

    if (minDateTime && newDate <= minDateTime) return;

    onChange?.(newDate);
  };

  const isSameDay =
    value &&
    minDateTime &&
    value.toDateString() === minDateTime.toDateString();

  return (
    <div className="p-3 bg-white rounded-xl">
      <DayPicker
        mode="single"
        selected={value}
        onSelect={handleDateSelect}
        disabled={
          minDateTime
            ? (date) =>
                date <
                new Date(
                  minDateTime.getFullYear(),
                  minDateTime.getMonth(),
                  minDateTime.getDate()
                )
            : undefined
        }
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
        }}
      />

      {/* Time selector */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <select
          value={hour}
          onChange={(e) =>
            handleTimeChange(Number(e.target.value), minute)
          }
          className="border rounded-md p-2"
        >
          {Array.from({ length: 24 }).map((_, h) => {
            if (isSameDay && minDateTime) {
              if (h < minDateTime.getHours()) return null;
            }
            return (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}
              </option>
            );
          })}
        </select>

        <select
          value={minute}
          onChange={(e) =>
            handleTimeChange(hour, Number(e.target.value))
          }
          className="border rounded-md p-2"
        >
          {Array.from({ length: 60 }).map((_, m) => {
            if (isSameDay && minDateTime) {
              if (
                hour === minDateTime.getHours() &&
                m <= minDateTime.getMinutes()
              )
                return null;
            }
            return (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}