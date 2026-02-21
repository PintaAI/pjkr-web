"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SoalSetForm } from "./soal-set-form";
import { Loader2, AlertCircle } from "lucide-react";

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
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pendingClose, setPendingClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSavingOnClose, setIsSavingOnClose] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const onBeforeCloseRef = useRef<(() => Promise<boolean>) | null>(null);

  const handleOpenChange = async (open: boolean) => {
    // If trying to close
    if (!open) {
      // If already closing, don't do anything
      if (isClosing) return;

      // If there's an ongoing auto-save, wait for it to complete
      if (autoSaveStatus === 'saving') {
        setPendingClose(true);
        setIsClosing(true);
        return;
      }

      // Check if there are unsaved changes and trigger save before close
      if (onBeforeCloseRef.current) {
        setIsClosing(true);
        setIsSavingOnClose(true);
        setSaveError(null);

        try {
          const saveSuccess = await onBeforeCloseRef.current();
          
          if (saveSuccess) {
            // Save completed successfully, proceed with close
            setIsSavingOnClose(false);
            onOpenChange(false);
            // Refresh parent data after sheet closes
            setTimeout(() => {
              onSuccess();
              setIsClosing(false);
            }, 300); // Wait for sheet animation to complete
          } else {
            // Save failed, keep sheet open and show error
            setIsSavingOnClose(false);
            setIsClosing(false);
            setSaveError('Failed to save changes. Please try again or continue editing.');
          }
        } catch (error) {
          console.error('Error during save before close:', error);
          setIsSavingOnClose(false);
          setIsClosing(false);
          setSaveError('An error occurred while saving. Please try again.');
        }
      } else {
        // No save-before-close handler, proceed with close normally
        setIsClosing(true);
        onOpenChange(false);
        // Refresh parent data after sheet closes
        setTimeout(() => {
          onSuccess();
          setIsClosing(false);
        }, 300); // Wait for sheet animation to complete
      }
      return;
    }

    // If opening, proceed normally
    if (open) {
      setPendingClose(false);
      setIsClosing(false);
      setIsSavingOnClose(false);
      setSaveError(null);
      onOpenChange(true);
    }
  };

  // Watch for auto-save status changes and handle pending close
  useEffect(() => {
    if (pendingClose && autoSaveStatus !== 'saving') {
      // Save completed (either saved or error), proceed with close
      setPendingClose(false);
      onOpenChange(false);
      // Refresh parent data after sheet closes
      setTimeout(() => {
        onSuccess();
        setIsClosing(false);
      }, 300); // Wait for sheet animation to complete
    }
  }, [autoSaveStatus, pendingClose, onOpenChange, onSuccess]);

  const handleAutoSaveStatusChange = (status: 'idle' | 'saving' | 'saved' | 'error') => {
    setAutoSaveStatus(status);
  };

  return (
    <Sheet open={isOpen || pendingClose} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0">
        <SheetHeader>
          <SheetTitle className="text-center">
            {soalSet ? "Edit Set Soal" : "Buat Set Soal"}
          </SheetTitle>
          {isSavingOnClose && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2 animate-in fade-in-0">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan perubahan...</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center justify-center gap-2 text-sm text-destructive mt-2 animate-in fade-in-0">
              <AlertCircle className="h-4 w-4" />
              <span>{saveError}</span>
            </div>
          )}
          {isClosing && autoSaveStatus === 'saving' && !isSavingOnClose && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2 animate-in fade-in-0">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan sebelum menutup...</span>
            </div>
          )}
        </SheetHeader>
        <SoalSetForm
          soalSet={soalSet || undefined}
          onCancel={onCancel}
          onAutoSaveStatusChange={handleAutoSaveStatusChange}
          onBeforeCloseRef={onBeforeCloseRef}
        />
      </SheetContent>
    </Sheet>
  );
}
