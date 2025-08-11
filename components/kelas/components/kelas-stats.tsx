"use client";

import { Users, BookOpen, FileText } from "lucide-react";

interface KelasStatsProps {
  stats: {
    members: number;
    materis: number;
    kelasKoleksiSoals: number;
    vocabularySets: number;
  };
}

export default function KelasStats({ stats }: KelasStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <Users className="w-4 h-4 text-primary mx-auto mb-1" />
        <div className="text-lg font-semibold text-primary">{stats.members}</div>
        <div className="text-xs text-muted-foreground">Murid</div>
      </div>
      
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen className="w-4 h-4 text-primary mx-auto mb-1" />
        <div className="text-lg font-semibold text-primary">{stats.materis}</div>
        <div className="text-xs text-muted-foreground">Materi</div>
      </div>
      
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <FileText className="w-4 h-4 text-primary mx-auto mb-1" />
        <div className="text-lg font-semibold text-primary">{stats.kelasKoleksiSoals}</div>
        <div className="text-xs text-muted-foreground">Paket Soal</div>
      </div>
      
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen className="w-4 h-4 text-primary mx-auto mb-1" />
        <div className="text-lg font-semibold text-primary">{stats.vocabularySets}</div>
        <div className="text-xs text-muted-foreground">koleksi kosa-kata</div>
      </div>
    </div>
  );
}