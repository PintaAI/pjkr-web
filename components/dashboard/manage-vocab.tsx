"use client";

import { useEffect, useState } from "react";
import { getGuruVocabularySets } from "@/app/actions/kelas/vocabulary";
import { VocabSet, VocabSheet } from "./vocab-sheet";
import { VocabCard } from "./vocab-card";
import { ManageLayout } from "./manage-layout";



interface ManageVocabProps {
  vocabSets?: VocabSet[];
}


export function ManageVocab({ vocabSets: initialVocabSets }: ManageVocabProps) {
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
    } catch {
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



  return (
    <ManageLayout
      title="Manage Vocabulary"
      description="Manage your vocabulary sets and flashcards"
      placeholder="Search vocabulary sets..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          key: "public",
          type: "select",
          label: "Visibility",
          value: filterPublic,
          options: [
            { value: "ALL", label: "All Sets" },
            { value: "PUBLIC", label: "Public" },
            { value: "PRIVATE", label: "Private" },
          ],
          onChange: (value: string) => setFilterPublic(value as "ALL" | "PUBLIC" | "PRIVATE"),
        },
      ]}
      loading={loading}
      error={error}
      items={filteredVocabSets}
      renderItem={(vocabSet) => (
        <VocabCard
          key={vocabSet.id}
          vocabSet={vocabSet}
          onClick={() => handleEditVocab(vocabSet)}
        />
      )}
      createNewCard={{
        onClick: handleCreateVocab,
        title: "Create New Collection",
        subtitle: "Add a new vocabulary set",
      }}
      emptyTitle="Your Vocabulary Sets"
      emptyMessage="No vocabulary sets found matching your filters. Try adjusting your search or filters."
    >
      <VocabSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        vocabSet={editingVocabSet}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </ManageLayout>
  );
}