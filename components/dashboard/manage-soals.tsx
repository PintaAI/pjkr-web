"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Plus, Users, Search } from "lucide-react";
import { BsCreditCard2Front } from "react-icons/bs";
import { getGuruSoalSets } from "@/app/actions/kelas/soal-set";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SoalSetForm } from "./soal-set-form";
import { SoalCard } from "./soal-card";

const SoalFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: "ALL" | "DRAFT" | "PUBLISHED";
  setFilterStatus: (value: "ALL" | "DRAFT" | "PUBLISHED") => void;
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-8">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search soal sets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>

    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "ALL" | "DRAFT" | "PUBLISHED")}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Sets</SelectItem>
        <SelectItem value="PUBLISHED">Published</SelectItem>
        <SelectItem value="DRAFT">Draft</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

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
        } catch (err) {
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

  if (loading) {
    return (
      <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
        {!embedded && (
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
        )}

        {/* Filters */}
        <SoalFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

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
      </div>
    );
  }

  if (error) {
    return (
      <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
        {!embedded && (
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
        )}
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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

          {/* Stats Cards */}
          <SoalStatsCards stats={{ totalSets, totalQuestions, publishedSets, draftSets }} />
        </>
      )}

      {/* Filters */}
      <SoalFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {filteredSoalSets.length === 0 ? (
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
          {filteredSoalSets.map((soalSet) => (
            <SoalCard
              key={soalSet.id}
              soalSet={soalSet}
              onClick={() => handleEditSoal(soalSet)}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}