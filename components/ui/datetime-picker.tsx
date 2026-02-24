"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tanggal dan waktu",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [hours, setHours] = useState<string>(
    value ? format(new Date(value), "HH") : "00"
  );
  const [minutes, setMinutes] = useState<string>(
    value ? format(new Date(value), "mm") : "00"
  );
  const [open, setOpen] = useState(false);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = new Date(newDate);
      updatedDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(updatedDate);
      onChange(updatedDate.toISOString());
    }
  };

  const handleTimeChange = (field: "hours" | "minutes", value: string) => {
    let numValue = parseInt(value) || 0;
    
    if (field === "hours") {
      numValue = Math.min(23, Math.max(0, numValue));
      setHours(numValue.toString().padStart(2, "0"));
    } else {
      numValue = Math.min(59, Math.max(0, numValue));
      setMinutes(numValue.toString().padStart(2, "0"));
    }

    if (date) {
      const updatedDate = new Date(date);
      updatedDate.setHours(
        field === "hours" ? numValue : parseInt(hours),
        field === "minutes" ? numValue : parseInt(minutes)
      );
      setDate(updatedDate);
      onChange(updatedDate.toISOString());
    }
  };

  const handleBlur = (field: "hours" | "minutes", value: string) => {
    let numValue = parseInt(value) || 0;
    
    if (field === "hours") {
      numValue = Math.min(23, Math.max(0, numValue));
      setHours(numValue.toString().padStart(2, "0"));
    } else {
      numValue = Math.min(59, Math.max(0, numValue));
      setMinutes(numValue.toString().padStart(2, "0"));
    }
  };

  const formattedValue = date
    ? format(date, "dd/MM/yyyy HH:mm")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Jam
              </label>
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
                onBlur={(e) => handleBlur("hours", e.target.value)}
                className="text-center"
              />
            </div>
            <span className="text-lg font-medium mt-4">:</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Menit
              </label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                onBlur={(e) => handleBlur("minutes", e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
