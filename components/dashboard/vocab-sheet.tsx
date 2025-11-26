"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VocabCollectionForm } from "./vocab-collection-form";

export interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  isDraft: boolean;
  createdAt: Date;
  items: Array<{
    id: number;
    korean: string;
    indonesian: string;
    type: string;
  }>;
  kelas: {
    id: number;
    title: string;
    level: string;
  } | null;
  user: {
    id: string;
    name: string | null;
  } | null;
}

interface VocabSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vocabSet?: VocabSet | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VocabSheet({ isOpen, onOpenChange, vocabSet, onSuccess, onCancel }: VocabSheetProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    
    // When sheet is closed, refresh the parent data
    if (!open) {
      onSuccess();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0">
        <SheetHeader>
          <SheetTitle className="text-center">
            {vocabSet ? "Edit Set Kosakata" : "Buat Set Kosakata"}
          </SheetTitle>
        </SheetHeader>
        <VocabCollectionForm
          vocabSet={vocabSet}
          onCancel={onCancel}
        />
      </SheetContent>
    </Sheet>
  );
}