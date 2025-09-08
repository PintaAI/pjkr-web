"use client";

import * as FaIcons from "react-icons/fa";
import { useIconPicker } from "../../hooks/use-icon-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Input } from "./input";
import { Button } from "./button";
import { useState } from "react";

// IconRenderer Component
export const IconRenderer = ({
  icon,
  ...rest
}: {
  icon: string;
} & React.ComponentPropsWithoutRef<"svg">) => {
  const IconComponent = FaIcons[icon as keyof typeof FaIcons];

  if (!IconComponent) return null;

  return <IconComponent {...rest} />;
};

// IconPicker Component
interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { search, setSearch, icons } = useIconPicker();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {value ? (
            <IconRenderer icon={value} className="h-4 w-4" />
          ) : (
            <IconRenderer icon="FaIcons" className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-8 gap-2 overflow-y-auto max-h-[60vh]">
          {icons.map((icon) => (
            <Button
              key={icon.name}
              variant="ghost"
              size="icon"
              className="h-12 w-12 relative group"
              title={icon.friendly_name}
              onClick={() => {
                onChange?.(icon.name);
                setOpen(false);
              }}
            >
              <icon.Component className="h-5 w-5" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-[8px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {icon.friendly_name}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}