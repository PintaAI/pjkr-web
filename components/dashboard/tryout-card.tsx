"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Clock, ClipboardList, Power, PowerOff } from "lucide-react";
import { useState } from "react";

export interface Tryout {
  id: number;
  nama: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  duration: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  passingScore: number;
  koleksiSoalId: number;
  isActive: boolean;
  guruId: string;
  createdAt: Date;
  updatedAt: Date;
  koleksiSoal: {
    id: number;
    nama: string;
  };
  guru: {
    id: string;
    name: string | null;
  };
  _count: {
    participants: number;
  };
}

interface TryoutCardProps {
  tryout: Tryout;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number) => void;
  onViewResults?: (id: number) => void;
  compact?: boolean;
}

export function TryoutCard({ tryout, onClick, onDelete, onToggleActive, compact = false }: TryoutCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = new Date() > new Date(tryout.endTime);
  const isUpcoming = new Date() < new Date(tryout.startTime);

  if (compact) {
    return (
      <Card
        className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-4 relative bg-gradient-to-br from-card to-muted/20 rounded-lg border"
        onClick={onClick}
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-card" />
        <CardContent className="p-0 space-y-3 pl-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-primary mb-1 break-words line-clamp-1">
                {tryout.nama}
              </h3>
              <p className="text-sm text-muted-foreground break-words">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tryout._count.participants} peserta
                </span>
              </p>
            </div>
          </div>
        </CardContent>
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
            <ClipboardList className="h-12 w-12 text-primary-foreground" />
          </div>
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent dark:from-black/50 dark:via-black/20" />

          {/* badges */}
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
            {tryout.isActive ? (
              <Badge variant="default" className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700">
                Aktif
              </Badge>
            ) : (
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                Tidak Aktif
              </Badge>
            )}
            {isUpcoming && (
              <Badge variant="outline" className="h-6 px-2 text-[10px]">
                Akan Datang
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive" className="h-6 px-2 text-[10px]">
                Selesai
              </Badge>
            )}
          </div>

          {/* Toggle active button - top right, hover only */}
          {onToggleActive && !isExpired && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(tryout.id);
              }}
              className="absolute top-2 right-12 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-background/90 backdrop-blur-sm border"
              title={tryout.isActive ? "Nonaktifkan" : "Aktifkan"}
            >
              {tryout.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </Button>
          )}

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
            <div className="flex items-center gap-3 text-xs text-white/90 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tryout._count.participants} peserta
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {tryout.duration} menit
              </span>
              <span>{new Date(tryout.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 text-foreground flex-1">
            {tryout.nama}
          </h3>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground/80 dark:text-muted-foreground line-clamp-2">
          {tryout.description || "Tidak ada deskripsi tersedia"}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClipboardList className="h-3 w-3" />
            {tryout.koleksiSoal.nama}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Mulai: {formatDate(tryout.startTime)}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Selesai: {formatDate(tryout.endTime)}</span>
        </div>
      </CardContent>

      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Tryout?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tryout {tryout.nama} dan semua data peserta secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tryout.id);
                  setDeleteDialogOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
