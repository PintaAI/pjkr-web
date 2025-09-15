"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BsCreditCard2Front } from "react-icons/bs";


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
  compact?: boolean;
}

export function SoalCard({ soalSet, onClick, compact = false }: SoalCardProps) {
  if (compact) {
    return (
      <Card
        className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer py-0 w-full max-h-[200px]"
        onClick={onClick}
      >
        {/* Media */}
        <div className="relative w-full h-full min-h-[120px]">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <BsCreditCard2Front className="h-8 w-8 text-primary-foreground" />
          </div>
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        <CardContent className="px-4 py-3">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-center">
            {soalSet.nama}
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer py-0"
      onClick={onClick}
    >
      {/* Media */}
      <div className="relative">
        <div className="relative w-full aspect-[16/9] bg-muted/40">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <BsCreditCard2Front className="h-12 w-12 text-primary-foreground" />
          </div>
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

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
        <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
          {soalSet.nama}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {soalSet.deskripsi || "No description available"}
        </p>
      </CardContent>
    </Card>
  );
}