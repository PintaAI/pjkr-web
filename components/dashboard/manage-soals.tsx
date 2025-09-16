"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Plus, Users } from "lucide-react";
import { BsCreditCard2Front } from "react-icons/bs";
import { getGuruSoalSets } from "@/app/actions/kelas/soal-set";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SoalSetForm } from "./soal-set-form";
import { SearchFilters } from "@/components/ui/search-filters";
import { SoalCard } from "./soal-card";


const SoalStatsCards = ({ stats }: { stats: { totalSets: number; totalQuestions: number; publishedSets: number; draftSets: number } }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard
      title="Total Sets"
      value={stats.totalSets}
      description={`${stats.publishedSets} published, ${stats.draftSets} drafts`}
      icon={<BsCreditCard2Front className="h-4 w-4" />}
    />
    <StatsCard
      title="Total Questions"
      value={stats.totalQuestions}
      description="Across all sets"
      icon={<BsCreditCard2Front className="h-4 w-4" />}
    />
    <StatsCard
      title="Published Sets"
      value={stats.publishedSets}
      description="Available for use"
      icon={<Users className="h-4 w-4" />}
    />
    <StatsCard
      title="Draft Sets"
      value={stats.draftSets}
      description="Work in progress"
      icon={<BsCreditCard2Front className="h-4 w-4" />}
    />
  </div>
);

interface ManageSoalsProps {
  embedded?: boolean;
  soalSets?: SoalSet[];
}

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

export function ManageSoals({ embedded = false, soalSets: initialSoalSets }: ManageSoalsProps) {
  const [soalSets, setSoalSets] = useState<SoalSet[]>(initialSoalSets || []);
  const [loading, setLoading] = useState(!initialSoalSets || (initialSoalSets && initialSoalSets.length === 0));
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSoalSet, setEditingSoalSet] = useState<SoalSet | null>(null);

  useEffect(() => {
    if (!initialSoalSets || initialSoalSets.length === 0) {
      const fetchSoalSets = async () => {
        try {
          const result = await getGuruSoalSets();
          if (result.success && result.data) {
            setSoalSets(result.data);
          } else {
            setError(result.error || "Failed to load soal sets");
          }
        } catch {
          setError("Failed to load soal sets");
        } finally {
          setLoading(false);
        }
      };

      fetchSoalSets();
    } else {
      setSoalSets(initialSoalSets);
      setLoading(false);
    }
  }, [initialSoalSets]);

  const filteredSoalSets = soalSets.filter(soalSet => {
    const matchesSearch = soalSet.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (soalSet.deskripsi && soalSet.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" ||
                          (filterStatus === "PUBLISHED" && !soalSet.isDraft) ||
                          (filterStatus === "DRAFT" && soalSet.isDraft);
    return matchesSearch && matchesStatus;
  });

  const totalSets = soalSets.length;
  const totalQuestions = soalSets.reduce((sum, set) => sum + set.soals.length, 0);
  const publishedSets = soalSets.filter(set => !set.isDraft).length;
  const draftSets = totalSets - publishedSets;

  const handleCreateSoal = () => {
    setEditingSoalSet(null);
    setSheetOpen(true);
  };

  const handleEditSoal = (soalSet: SoalSet) => {
    setEditingSoalSet(soalSet);
    setSheetOpen(true);
  };

  const handleFormSuccess = () => {
    setSheetOpen(false);
    setEditingSoalSet(null);
    // Refresh the soal sets list
    const fetchSoalSets = async () => {
      try {
        const result = await getGuruSoalSets();
        if (result.success && result.data) {
          setSoalSets(result.data);
        }
      } catch (err) {
        console.error("Failed to refresh soal sets:", err);
      }
    };
    fetchSoalSets();
  };

  const handleFormCancel = () => {
    setSheetOpen(false);
    setEditingSoalSet(null);
  };



  return (
    <>
      <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
        {!embedded && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Soals</h1>
                <p className="text-muted-foreground">
                  View and manage your question sets and assessments
                </p>
              </div>
              <Button onClick={handleCreateSoal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Soal Set
              </Button>
            </div>
            {!error && <SoalStatsCards stats={{ totalSets, totalQuestions, publishedSets, draftSets }} />}
          </>
        )}

        {/* Filters */}
        <SearchFilters
          placeholder="Search soal sets..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              key: "status",
              type: "select",
              label: "Status",
              value: filterStatus,
              options: [
                { value: "ALL", label: "All Sets" },
                { value: "PUBLISHED", label: "Published" },
                { value: "DRAFT", label: "Draft" },
              ],
              onChange: (value) => setFilterStatus(value as "ALL" | "DRAFT" | "PUBLISHED"),
            },
          ]}
        />

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          filteredSoalSets.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Soal Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No soal sets found matching your filters. Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-dashed border-2" onClick={handleCreateSoal}>
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-sm sm:text-base font-semibold leading-snug text-center">
                    Create New Set
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-center">
                    Add a new soal set
                  </p>
                </CardContent>
              </Card>
              {filteredSoalSets.map((soalSet) => (
                <SoalCard
                  key={soalSet.id}
                  soalSet={soalSet}
                  onClick={() => handleEditSoal(soalSet)}
                />
              ))}
            </div>
          )
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0">
          <SheetHeader>
            <SheetTitle className="text-center">
              {editingSoalSet ? "Edit Soal Set" : "Create Soal Set"}
            </SheetTitle>
          </SheetHeader>
          <SoalSetForm
            soalSet={editingSoalSet || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}