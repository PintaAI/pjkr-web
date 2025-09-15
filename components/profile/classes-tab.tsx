"use client";

import { KelasCard } from "@/components/kelas/kelas-card";

interface ClassesTabProps {
  user: {
    role: string;
    name?: string | null;
    authoredKelas?: any[];
    joinedKelas?: any[];
  };
  isOwnProfile: boolean;
}

export default function ClassesTab({ user, isOwnProfile }: ClassesTabProps) {
  const isGuru = user.role.toLowerCase() === "guru";
  const kelasData = isGuru ? (user.authoredKelas || []) : (user.joinedKelas || []);

  return (
    <>
      {kelasData.length === 0 ? (
        <p className="text-muted-foreground">
          {isGuru
            ? (isOwnProfile ? "No classes created yet." : "No public classes to show.")
            : (isOwnProfile ? "No classes joined yet." : "No public classes to show.")
          }
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelasData.map((kelas: any) => (
            <KelasCard key={kelas.id} data={kelas} />
          ))}
        </div>
      )}
    </>
  );
}