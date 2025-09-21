"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveKoleksiSoal, getSoalsByKoleksi, saveSoal, saveOpsi, deleteSoal, deleteOpsi } from "@/app/actions/kelas/assessment";
import { SoalItemList } from "./soal-item-list";
import { SoalItemForm } from "./soal-item-form";
import { Difficulty } from "@prisma/client";
import { z } from "zod";

// Define Zod schemas for validation
const soalItemSchema = z.object({
  pertanyaan: z.string().min(1, "Question is required"),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  explanation: z.string().optional(),
  opsis: z.array(z.object({
    opsiText: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean()
  })).min(3).max(5)
});

const soalItemsSchema = z.array(soalItemSchema).min(1).max(1);

type GeneratedSoalItem = z.infer<typeof soalItemSchema>;

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
  const [originalSoals, setOriginalSoals] = useState<SoalItem[]>([]);
  const [deletedSoalIds, setDeletedSoalIds] = useState<number[]>([]);
  const [soalDialogOpen, setSoalDialogOpen] = useState(false);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

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
            setOriginalSoals(JSON.parse(JSON.stringify(transformedSoals))); // Deep copy for comparison
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
      const soalToDelete = soals[index];
      
      // If it has an ID (existing soal), mark for deletion
      if (soalToDelete.id && typeof soalToDelete.id === 'number') {
        setDeletedSoalIds(prev => [...prev, soalToDelete.id as number]);
      }
      
      // Remove from current soals array
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

  const handleGenerate = async () => {
    if (!formData.nama.trim()) {
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Based on the question set title '${formData.nama}' and description '${formData.deskripsi || ''}', generate 1 multiple choice question with 4 options. The question (pertanyaan) and all answer options (opsis) should be written in Korean language. The explanation should be written in Indonesian language. Make sure the question has exactly one correct answer and appropriate difficulty level.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'soal',
          existingItems: soals,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedData = await response.json();
      
      try {
        const validatedItems = soalItemsSchema.parse(generatedData);
        
        const newSoals: SoalItem[] = validatedItems.map((item: GeneratedSoalItem) => ({
          pertanyaan: item.pertanyaan,
          difficulty: item.difficulty as Difficulty,
          explanation: item.explanation,
          opsis: item.opsis?.map((opsi) => ({
            opsiText: opsi.opsiText,
            isCorrect: opsi.isCorrect,
          })) || [
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
          ],
        }));
        
        setSoals((prev) => [...prev, ...newSoals]);
      } catch (validationError) {
        console.error('Generated soal data validation failed:', validationError);
        // Fallback to old parsing method if validation fails
        const generated: any[] = Array.isArray(generatedData) ? generatedData : [];
        const newSoals: SoalItem[] = generated.map((item) => ({
          pertanyaan: item.pertanyaan || "",
          difficulty: (item.difficulty as Difficulty) || Difficulty.BEGINNER,
          explanation: item.explanation,
          opsis: item.opsis?.map((opsi: any) => ({
            opsiText: opsi.opsiText || "",
            isCorrect: opsi.isCorrect || false,
          })) || [
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
            { opsiText: "", isCorrect: false },
          ],
        }));
        
        setSoals((prev) => [...prev, ...newSoals]);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // TODO: Show error toast
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to check if data has changed
  const hasDataChanged = () => {
    // Check if collection metadata changed
    const originalFormData = {
      nama: soalSet?.nama || "",
      deskripsi: soalSet?.deskripsi || "",
      isPrivate: soalSet?.isPrivate || false,
      isDraft: soalSet?.isDraft ?? true,
    };
    
    const hasFormDataChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    
    // Check if soals changed
    const hasSoalsChanged = JSON.stringify(soals) !== JSON.stringify(originalSoals);
    
    // Check if there are deleted soals
    const hasDeletedSoals = deletedSoalIds.length > 0;
    
    return hasFormDataChanged || hasSoalsChanged || hasDeletedSoals;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Skip if no changes
    if (!hasDataChanged()) {
      console.log('No changes detected, skipping save');
      onSuccess?.();
      return;
    }

    setSaving(true);

    try {
      // First, handle deletions
      for (const deletedSoalId of deletedSoalIds) {
        await deleteSoal(deletedSoalId);
      }

      // Save the collection metadata (only if it changed)
      const koleksiResult = await saveKoleksiSoal(kelasId || null, {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        isPrivate: formData.isPrivate,
        isDraft: formData.isDraft,
      }, soalSet?.id);

      if (koleksiResult.success && koleksiResult.data) {
        const koleksiSoalId = koleksiResult.data.id;
        
        // Only save soals that have changed or are new
        for (let i = 0; i < soals.length; i++) {
          const soalItem = soals[i];
          const originalSoal = originalSoals[i];
          
          // Skip if soal hasn't changed
          if (originalSoal && JSON.stringify(soalItem) === JSON.stringify(originalSoal)) {
            continue;
          }
          
          if (soalItem.pertanyaan.trim()) {
            const soalResult = await saveSoal(koleksiSoalId, {
              pertanyaan: soalItem.pertanyaan,
              difficulty: soalItem.difficulty || undefined,
              explanation: soalItem.explanation,
              isActive: true,
            }, typeof soalItem.id === 'number' ? soalItem.id : undefined);

            if (soalResult.success && soalResult.data && soalItem.opsis) {
              const soalId = soalResult.data.id;
              
              // Save options that have changed or are new
              for (let j = 0; j < soalItem.opsis.length; j++) {
                const opsi = soalItem.opsis[j];
                const originalOpsi = originalSoal?.opsis?.[j];
                
                // Skip if option hasn't changed
                if (originalOpsi && JSON.stringify(opsi) === JSON.stringify(originalOpsi)) {
                  continue;
                }
                
                if (opsi.opsiText.trim()) {
                  await saveOpsi(soalId, {
                    opsiText: opsi.opsiText,
                    isCorrect: opsi.isCorrect,
                    order: j,
                  }, typeof opsi.id === 'number' ? opsi.id : undefined);
                }
              }
            }
          }
        }

        // Clear deletion tracking after successful save
        setDeletedSoalIds([]);
        // Update original data for next comparison
        setOriginalSoals(JSON.parse(JSON.stringify(soals)));

        onSuccess?.();
      } else {
        console.error("Failed to save collection:", koleksiResult.error);
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="nama" className="text-lg font-medium text-foreground flex items-center gap-2">
                Soal Set Name
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isPrivate" className="text-sm text-muted-foreground">Private</Label>
                  <Switch
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="isDraft" className="text-sm text-muted-foreground">Draft</Label>
                  <Switch
                    id="isDraft"
                    checked={formData.isDraft}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDraft: checked })}
                  />
                </div>
              </div>
            </div>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Enter a descriptive name for your question set"
              required
              className="h-11 border-0 bg-muted/30 rounded-xl focus-visible:bg-background focus-visible:border focus-visible:border-primary/20 transition-all text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="deskripsi" className="text-lg font-medium text-foreground">Description</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi || ""}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              className="min-h-[100px] border-0 bg-muted/30 rounded-xl focus-visible:bg-background focus-visible:border focus-visible:border-primary/20 transition-all resize-none"
            />
          </div>
        </div>

          {/* Soal Items */} 
          <SoalItemList
            items={soals}
            onEdit={handleEditSoal}
            onDelete={handleDeleteSoal}
            onAdd={handleAddSoal}
            onQuickAdd={handleQuickAddSoal}
            onGenerate={handleGenerate}
            generating={generating}
            title={formData.nama}
          />
       

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            {saving ? "Saving..." : soalSet ? "Update Question Set" : "Create Question Set"}
          </Button>
        </div>
      </form>

      <Dialog open={soalDialogOpen} onOpenChange={setSoalDialogOpen}>
        <DialogContent className="max-w-6xl w-full sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-background border-border/20 shadow-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              {editingSoalIndex !== null ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {editingSoalIndex !== null
                ? "Make changes to your existing question"
                : "Create a new question for your set"
              }
            </p>
          </DialogHeader>
          <div className="mt-6">
            <SoalItemForm
              item={editingSoalIndex !== null ? soals[editingSoalIndex] : undefined}
              onSave={handleSaveSoal}
              onCancel={handleCancelSoal}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}