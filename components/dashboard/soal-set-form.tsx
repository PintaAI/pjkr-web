"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveKoleksiSoal, getSoalsByKoleksi } from "@/app/actions/kelas/assessment";
import { SoalItemList } from "./soal-item-list";
import { SoalItemForm } from "./soal-item-form";
import { Difficulty } from "@prisma/client";

interface SoalItem {
  id?: number | string;
  pertanyaan: string;
  difficulty?: Difficulty | null;
  explanation?: string;
  opsis?: Array<{
    id?: number | string;
    opsiText: string;
    isCorrect: boolean;
  }>;
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

interface SoalSetFormProps {
  soalSet?: SoalSet;
  kelasId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SoalSetForm({ soalSet, kelasId, onSuccess, onCancel }: SoalSetFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    isPrivate: false,
    isDraft: true,
  });
  const [soals, setSoals] = useState<SoalItem[]>([]);
  const [soalDialogOpen, setSoalDialogOpen] = useState(false);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | null>(null);

  // Load existing data if editing
  useEffect(() => {
    if (soalSet) {
      setLoading(true);
      setFormData({
        nama: soalSet.nama || "",
        deskripsi: soalSet.deskripsi || "",
        isPrivate: soalSet.isPrivate || false,
        isDraft: soalSet.isDraft ?? true,
      });

      // Fetch existing soals for this collection
      const fetchSoals = async () => {
        try {
          const result = await getSoalsByKoleksi(soalSet.id);
          if (result.success && result.data) {
            // Transform database data to component format
            const transformedSoals: SoalItem[] = result.data.map((soal: any) => ({
              id: soal.id,
              pertanyaan: soal.pertanyaan,
              difficulty: soal.difficulty,
              explanation: soal.explanation,
              opsis: soal.opsis.map((opsi: any) => ({
                id: opsi.id,
                opsiText: opsi.opsiText,
                isCorrect: opsi.isCorrect,
              })),
            }));
            setSoals(transformedSoals);
          }
        } catch (error) {
          console.error("Failed to fetch soals:", error);
        }
      };

      fetchSoals();
      setLoading(false);
    }
  }, [soalSet]);

  const handleAddSoal = () => {
    setEditingSoalIndex(null);
    setSoalDialogOpen(true);
  };

  const handleEditSoal = (index: number) => {
    setEditingSoalIndex(index);
    setSoalDialogOpen(true);
  };

  const handleDeleteSoal = (index: number) => {
    if (soals.length > 1) {
      setSoals(soals.filter((_, i) => i !== index));
    }
  };

  const handleSaveSoal = (soalData: SoalItem) => {
    if (editingSoalIndex !== null) {
      // Update existing soal
      const updatedSoals = [...soals];
      updatedSoals[editingSoalIndex] = soalData;
      setSoals(updatedSoals);
    } else {
      // Add new soal
      setSoals([...soals, soalData]);
    }
    setSoalDialogOpen(false);
    setEditingSoalIndex(null);
  };

  const handleCancelSoal = () => {
    setSoalDialogOpen(false);
    setEditingSoalIndex(null);
  };

  const handleQuickAddSoal = (pertanyaan: string) => {
    if (!pertanyaan.trim()) return;
    const newSoal: SoalItem = {
      pertanyaan: pertanyaan.trim(),
      difficulty: Difficulty.BEGINNER,
      opsis: [
        { opsiText: "", isCorrect: false },
        { opsiText: "", isCorrect: false },
        { opsiText: "", isCorrect: false },
        { opsiText: "", isCorrect: false },
      ],
    };
    setSoals([...soals, newSoal]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await saveKoleksiSoal(kelasId || null, {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        isPrivate: formData.isPrivate,
        isDraft: formData.isDraft,
      }, soalSet?.id);

      if (result.success) {
        onSuccess?.();
      } else {
        console.error("Failed to save:", result.error);
      }
    } catch (error) {
      console.error("Error saving soal set:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nama" className="font-bold">Name *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Enter soal set name"
              required
            />
          </div>

          <div>
            <Label htmlFor="deskripsi" className="font-bold">Description</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi || ""}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
            />
            <Label htmlFor="isPrivate" className="font-bold">Make this soal set private</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isDraft"
              checked={formData.isDraft}
              onCheckedChange={(checked) => setFormData({ ...formData, isDraft: checked })}
            />
            <Label htmlFor="isDraft" className="font-bold">Save as draft</Label>
          </div>
        </div>

        <SoalItemList
          items={soals}
          onEdit={handleEditSoal}
          onDelete={handleDeleteSoal}
          onAdd={handleAddSoal}
          onQuickAdd={handleQuickAddSoal}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : soalSet ? "Update" : "Create"} Soal Set
          </Button>
        </div>
      </form>

      <Dialog open={soalDialogOpen} onOpenChange={setSoalDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSoalIndex !== null ? "Edit Question" : "Add Question"}
            </DialogTitle>
          </DialogHeader>
          <SoalItemForm
            item={editingSoalIndex !== null ? soals[editingSoalIndex] : undefined}
            onSave={handleSaveSoal}
            onCancel={handleCancelSoal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}