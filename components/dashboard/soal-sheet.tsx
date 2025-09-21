"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SoalSetForm } from "./soal-set-form";

export interface SoalSet {
  id: number;
  nama: string;
  deskripsi: string | null;
  isPrivate: boolean;
  isDraft: boolean;
  createdAt: Date;
  soals: Array<{
    id: number;
    pertanyaan: string;
    difficulty: string | null;
  }>;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelasKoleksiSoals: Array<{
    kelas: {
      id: number;
      title: string;
      level: string;
    };
  }>;
}

interface SoalSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  soalSet?: SoalSet | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SoalSheet({ isOpen, onOpenChange, soalSet, onSuccess, onCancel }: SoalSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0">
        <SheetHeader>
          <SheetTitle className="text-center">
            {soalSet ? "Edit Soal Set" : "Create Soal Set"}
          </SheetTitle>
        </SheetHeader>
        <SoalSetForm
          soalSet={soalSet || undefined}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </SheetContent>
    </Sheet>
  );
}