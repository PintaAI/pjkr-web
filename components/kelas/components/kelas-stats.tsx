"use client";

import { Users, BookOpen, FileText } from "lucide-react";
import { useKelasColorsContext } from "@/lib/contexts/kelas-colors-context";

interface KelasStatsProps {
  stats: {
    members: number;
    materis: number;
    kelasKoleksiSoals: number;
    vocabularySets: number;
  };
}

export default function KelasStats({ stats }: KelasStatsProps) {
  const { colors } = useKelasColorsContext()

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <Users
          className="w-4 h-4 mx-auto mb-1"
          style={{ color: colors?.primary || 'hsl(var(--primary))' }}
        />
        <div
          className="text-lg font-semibold"
          style={{ color: colors?.secondary || 'hsl(var(--primary))' }}
        >
          {stats.members}
        </div>
        <div className="text-xs text-muted-foreground">Murid</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen
          className="w-4 h-4 mx-auto mb-1"
          style={{ color: colors?.primary || 'hsl(var(--primary))' }}
        />
        <div
          className="text-lg font-semibold"
          style={{ color: colors?.secondary || 'hsl(var(--primary))' }}
        >
          {stats.materis}
        </div>
        <div className="text-xs text-muted-foreground">Materi</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <FileText
          className="w-4 h-4 mx-auto mb-1"
          style={{ color: colors?.primary || 'hsl(var(--primary))' }}
        />
        <div
          className="text-lg font-semibold"
          style={{ color: colors?.secondary || 'hsl(var(--primary))' }}
        >
          {stats.kelasKoleksiSoals}
        </div>
        <div className="text-xs text-muted-foreground">Paket Soal</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen
          className="w-4 h-4 mx-auto mb-1"
          style={{ color: colors?.primary || 'hsl(var(--primary))' }}
        />
        <div
          className="text-lg font-semibold"
          style={{ color: colors?.secondary || 'hsl(var(--primary))' }}
        >
          {stats.vocabularySets}
        </div>
        <div className="text-xs text-muted-foreground">koleksi kosa-kata</div>
      </div>
    </div>
  );
}