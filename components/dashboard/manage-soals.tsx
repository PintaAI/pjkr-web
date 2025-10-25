"use client";

import { useEffect, useState } from "react";
import { getGuruSoalSets, deleteSoalSet } from "@/app/actions/kelas/soal-set";
import { SoalCard } from "./soal-card";
import { SoalSet, SoalSheet } from "./soal-sheet";
import { ManageLayout } from "./manage-layout";



interface ManageSoalsProps {
  soalSets?: SoalSet[];
}


export function ManageSoals({ soalSets: initialSoalSets }: ManageSoalsProps) {
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

  const handleDelete = async (soalSetId: number) => {
    try {
      const result = await deleteSoalSet(soalSetId);
      if (result.success) {
        // Refresh the list
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
      } else {
        setError(result.error || "Failed to delete soal set");
      }
    } catch  {
      setError("Failed to delete soal set");
    }
  };



  return (
    <ManageLayout
      title="Manage Soals"
      description="Manage your soal sets and questions"
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
          onChange: (value: string) => setFilterStatus(value as "ALL" | "DRAFT" | "PUBLISHED"),
        },
      ]}
      loading={loading}
      error={error}
      items={filteredSoalSets}
      renderItem={(soalSet) => (
        <SoalCard
          key={soalSet.id}
          soalSet={soalSet}
          onClick={() => handleEditSoal(soalSet)}
          onDelete={(id) => handleDelete(id)}
        />
      )}
      createNewCard={{
        onClick: handleCreateSoal,
        title: "Create New Set",
        subtitle: "Add a new soal set",
      }}
      emptyTitle="Your Soal Sets"
      emptyMessage="No soal sets found matching your filters. Try adjusting your search or filters."
    >
      <SoalSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        soalSet={editingSoalSet}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </ManageLayout>
  );
}