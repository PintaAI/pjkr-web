"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { IconRenderer } from "@/components/shared/icon-picker";
import { useState } from "react";

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt?: Date;
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

interface VocabCardProps {
  vocabSet: VocabSet;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export function VocabCard({ vocabSet, onClick, onDelete, compact = false }: VocabCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  if (compact) {
    return (
      <Card
        className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer py-0 w-full max-h-[80px] bg-gradient-to-br from-primary to-secondary"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {vocabSet.icon ? (
                <IconRenderer icon={vocabSet.icon} className="h-5 w-5 text-primary-foreground" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1 text-primary-foreground">
              {vocabSet.title}
            </h3>

            {/* Item count */}
            <div className="flex-shrink-0 text-xs text-primary-foreground/80 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
              {vocabSet.items.length} items
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all bg-gradient-to-br from-card to-muted/20 cursor-pointer py-0 relative"
      onClick={onClick}
    >
      {/* Media */}
      <div className="relative">
        <div className="relative w-full aspect-[16/9] bg-muted/40">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary">
            {vocabSet.icon ? (
              <IconRenderer icon={vocabSet.icon} className="h-12 w-12 text-primary-foreground" />
            ) : (
              <BookOpen className="h-12 w-12 text-primary-foreground" />
            )}
          </div>
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {vocabSet.isPublic && (
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                Public
              </Badge>
            )}
          </div>

          {/* Delete button - top right, hover only */}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50 hover:bg-black/70 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* overlay: info at bottom */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {vocabSet.items.length} items
              </span>
              <span>{vocabSet.createdAt ? new Date(vocabSet.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
              {vocabSet.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {vocabSet.description || "No description available"}
            </p>
          </div>
        </div>
      </CardContent>
  
      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vocabulary Set?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the vocabulary set "{vocabSet.title}" and all its items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(vocabSet.id);
                  setDeleteDialogOpen(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}