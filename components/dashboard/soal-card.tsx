"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BsCreditCard2Front } from "react-icons/bs";
import { useState } from "react";


interface SoalSet {
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

interface SoalCardProps {
  soalSet: SoalSet;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export function SoalCard({ soalSet, onClick, onDelete, compact = false }: SoalCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (compact) {
    return (
      <Card
        className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-4 relative bg-card rounded-lg border"
        onClick={onClick}
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-card" />
        <CardContent className="p-0 space-y-3 pl-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-primary mb-1 break-words line-clamp-1">
                {soalSet.nama}
              </h3>
              <p className="text-sm text-muted-foreground break-words">
                <span className="inline-flex items-center gap-1">
                  <BsCreditCard2Front className="h-3 w-3" />
                  {soalSet.soals.length} questions
                </span>
              </p>
            </div>
          </div>
        </CardContent>
 
        {onDelete && (
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Soal Set?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the soal set {soalSet.nama} and all its questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(soalSet.id);
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

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-card py-0 border"
      onClick={onClick}
    >
      {/* Media */}
      <div className="relative">
        <div className="relative w-full aspect-[16/9]">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60">
            <BsCreditCard2Front className="h-12 w-12 text-primary-foreground" />
          </div>
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent dark:from-black/50 dark:via-black/20" />

          {/* badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {soalSet.isPrivate && (
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                Private
              </Badge>
            )}
            {soalSet.isDraft && (
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                Draft
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
              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-background/90 backdrop-blur-sm text-destructive border"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* overlay: info at bottom */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="inline-flex items-center gap-1">
                <BsCreditCard2Front className="h-4 w-4" />
                {soalSet.soals.length} questions
              </span>
              <span>{new Date(soalSet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
        <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 text-foreground">
          {soalSet.nama}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground/80 dark:text-muted-foreground line-clamp-2">
          {soalSet.deskripsi || "No description available"}
        </p>
      </CardContent>

      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Soal Set?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the soal set {soalSet.nama} and all its questions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(soalSet.id);
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