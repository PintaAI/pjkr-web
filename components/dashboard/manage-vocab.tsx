"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/ui/stats-card";
import { Plus, BookOpen, Users, Calendar, Edit, Search } from "lucide-react";
import { getGuruVocabularySets } from "@/app/actions/kelas/vocabulary";
import { VocabCollectionForm } from "./vocab-collection-form";
import { IconRenderer } from "@/components/ui/icon-picker";

const VocabFilters = ({
  searchTerm,
  setSearchTerm,
  filterPublic,
  setFilterPublic
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterPublic: "ALL" | "PUBLIC" | "PRIVATE";
  setFilterPublic: (value: "ALL" | "PUBLIC" | "PRIVATE") => void;
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-8">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search vocabulary sets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
    
    <Select value={filterPublic} onValueChange={(value) => setFilterPublic(value as "ALL" | "PUBLIC" | "PRIVATE")}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Sets</SelectItem>
        <SelectItem value="PUBLIC">Public</SelectItem>
        <SelectItem value="PRIVATE">Private</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const VocabStatsCards = ({ stats }: { stats: { totalSets: number; totalItems: number; publicSets: number; privateSets: number } }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard
      title="Total Sets"
      value={stats.totalSets}
      description={`${stats.publicSets} public, ${stats.privateSets} private`}
      icon={<BookOpen className="h-4 w-4" />}
    />
    <StatsCard
      title="Total Items"
      value={stats.totalItems}
      description="Vocabulary items"
      icon={<BookOpen className="h-4 w-4" />}
    />
    <StatsCard
      title="Public Sets"
      value={stats.publicSets}
      description="Available to all"
      icon={<Users className="h-4 w-4" />}
    />
    <StatsCard
      title="Private Sets"
      value={stats.privateSets}
      description="For your use only"
      icon={<BookOpen className="h-4 w-4" />}
    />
  </div>
);

interface ManageVocabProps {
  embedded?: boolean;
  vocabSets?: VocabSet[];
}

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt: Date;
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

export function ManageVocab({ embedded = false, vocabSets: initialVocabSets }: ManageVocabProps) {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>(initialVocabSets || []);
  const [loading, setLoading] = useState(!initialVocabSets || (initialVocabSets && initialVocabSets.length === 0));
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingVocabSet, setEditingVocabSet] = useState<VocabSet | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublic, setFilterPublic] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");

  const fetchVocabSets = async () => {
    try {
      const result = await getGuruVocabularySets();
      if (result.success && result.data) {
        setVocabSets(result.data);
      } else {
        setError(result.error || "Failed to load vocabulary sets");
      }
    } catch (err) {
      setError("Failed to load vocabulary sets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialVocabSets || initialVocabSets.length === 0) {
      fetchVocabSets();
    } else {
      setVocabSets(initialVocabSets);
      setLoading(false);
    }
  }, [initialVocabSets]);

  const filteredVocabSets = vocabSets.filter(vocabSet => {
    const matchesSearch = vocabSet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (vocabSet.description && vocabSet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPublic = filterPublic === "ALL" ||
                          (filterPublic === "PUBLIC" && vocabSet.isPublic) ||
                          (filterPublic === "PRIVATE" && !vocabSet.isPublic);
    return matchesSearch && matchesPublic;
  });

  const totalSets = vocabSets.length;
  const totalItems = vocabSets.reduce((sum, set) => sum + set.items.length, 0);
  const publicSets = vocabSets.filter(set => set.isPublic).length;
  const privateSets = totalSets - publicSets;

  const handleCreateVocab = () => {
    setEditingVocabSet(null);
    setSheetOpen(true);
  };

  const handleEditVocab = (vocabSet: VocabSet) => {
    setEditingVocabSet(vocabSet);
    setSheetOpen(true);
  };

  const handleFormSuccess = () => {
    setSheetOpen(false);
    setEditingVocabSet(null);
    // Refresh the vocab sets list
    fetchVocabSets();
  };

  const handleFormCancel = () => {
    setSheetOpen(false);
    setEditingVocabSet(null);
  };

  if (loading) {
    return (
      <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
        {!embedded && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Vocabulary</h1>
                <p className="text-muted-foreground">
                  View and manage your vocabulary sets
                </p>
              </div>
              <Button onClick={handleCreateVocab}>
                <Plus className="h-4 w-4 mr-2" />
                Create Vocabulary Set
              </Button>
            </div>

            {/* Stats Cards */}
            <VocabStatsCards stats={{ totalSets, totalItems, publicSets, privateSets }} />
          </>
        )}

        {/* Filters */}
        <VocabFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPublic={filterPublic}
          setFilterPublic={setFilterPublic}
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
              <h1 className="text-3xl font-bold tracking-tight">Manage Vocabulary</h1>
              <p className="text-muted-foreground">
                View and manage your vocabulary sets
              </p>
            </div>
            <Button onClick={handleCreateVocab}>
              <Plus className="h-4 w-4 mr-2" />
              Create Vocabulary Set
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
    <>
      <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
        {!embedded && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Vocabulary</h1>
              <p className="text-muted-foreground">
                View and manage your vocabulary sets
              </p>
            </div>
            <Button onClick={handleCreateVocab}>
              <Plus className="h-4 w-4 mr-2" />
              Create Vocabulary Set
            </Button>
          </div>
        )}

        {/* Filters */}
        <VocabFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPublic={filterPublic}
          setFilterPublic={setFilterPublic}
        />

        {filteredVocabSets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Vocabulary Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No vocabulary sets found matching your filters. Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Card */}
            <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-dashed border-2" onClick={handleCreateVocab}>
              <CardContent className="flex flex-col items-center justify-center h-48">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-sm sm:text-base font-semibold leading-snug text-center">
                  Create New Collection
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-center">
                  Add a new vocabulary set
                </p>
              </CardContent>
            </Card>

            {filteredVocabSets.map((vocabSet) => (
              <Card key={vocabSet.id} className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer py-0" onClick={() => handleEditVocab(vocabSet)}>
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

                    {/* overlay: info at bottom */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-3 text-xs text-white/90">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {vocabSet.items.length} items
                        </span>
                        <span>{new Date(vocabSet.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
                  <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
                    {vocabSet.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {vocabSet.description || "No description available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0 ">
          <SheetHeader >
            <SheetTitle className="text-center">
              {editingVocabSet ? "Edit Vocabulary Set" : "Create Vocabulary Set"}
            </SheetTitle>
          </SheetHeader>
          <VocabCollectionForm
            vocabSet={editingVocabSet}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}