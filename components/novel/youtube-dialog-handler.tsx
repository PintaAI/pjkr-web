"use client";

import { useState } from "react";
import { YoutubeDialog } from "./youtube-dialog";

// Global dialog state
let globalDialogHandler: {
  openDialog: (onSubmit: (url: string) => void) => void;
} | null = null;

interface YoutubeDialogHandlerProps {
  children: React.ReactNode;
}

export function YoutubeDialogHandler({ children }: YoutubeDialogHandlerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [onSubmit, setOnSubmit] = useState<((url: string) => void) | null>(null);

  const openDialog = (submitHandler: (url: string) => void) => {
    setOnSubmit(() => submitHandler);
    setIsOpen(true);
  };

  // Register global handler
  globalDialogHandler = { openDialog };

  const handleSubmit = (url: string) => {
    if (onSubmit) {
      onSubmit(url);
    }
    setIsOpen(false);
    setOnSubmit(null);
  };

  return (
    <>
      {children}
      <YoutubeDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// Export function to open dialog from anywhere
export const openYoutubeDialog = (onSubmit: (url: string) => void) => {
  if (globalDialogHandler) {
    globalDialogHandler.openDialog(onSubmit);
  }
};
