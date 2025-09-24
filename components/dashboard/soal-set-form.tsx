"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveKoleksiSoal, getSoalsByKoleksi, saveSoal, saveOpsi, deleteSoal, deleteOpsi } from "@/app/actions/kelas/assessment";
import { SoalItemList } from "./soal-item-list";
import { SoalItemForm } from "./soal-item-form";
import { SoalSetFormSkeleton } from "./soal-set-form-skeleton";
import { Difficulty } from "@prisma/client";
import { z } from "zod";
import { useSoalStore } from "@/lib/dashboard/manage-soal-state";
import { generateItems, soalItemsSchema } from "@/lib/dashboard/ai-generation";
import { useDebouncedAutoSave } from "@/lib/hooks/use-debounced-auto-save";
import { Loader2, Check } from "lucide-react";

type GeneratedSoalItem = z.infer<typeof soalItemsSchema.element>;

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
  onCancel?: () => void;
}

export function SoalSetForm({ soalSet, kelasId, onCancel }: SoalSetFormProps) {
   const store = useSoalStore();
   const {
     loading,
     saving,
     formData,
     soals,
     originalSoals,
     deletedSoalIds,
     soalDialogOpen,
     editingSoalIndex,
     generating,
     setLoading,
     setSaving,
     setFormData,
     setSoals,
     setOriginalSoals,
     setDeletedSoalIds,
     setGenerating,
     initForCreate,
     initForEdit,
     handleAddSoal,
     handleEditSoal,
     handleDeleteSoal,
     handleSaveSoal,
     handleCancelSoal,
     handleQuickAddSoal,
     hasDataChanged,
   } = store;

   const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

   // Auto-save function that saves form data (without triggering onSuccess)
   const performAutoSave = async (data: { formData: any; soals: any[] }) => {
     if (saving) {
       return;
     }

     setAutoSaveStatus('saving');

     try {
       // Add a minimum delay to make the spinner visible
       const savePromise = performSave();
       const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));

       // Wait for both the save operation and the minimum delay
       await Promise.all([savePromise, delayPromise]);

       setAutoSaveStatus('saved');

       // Auto-hide the saved status after 2 seconds
       setTimeout(() => {
         setAutoSaveStatus('idle');
       }, 2000);
     } catch (error) {
       console.error('Auto-save failed:', error);
       setAutoSaveStatus('error');
       setTimeout(() => {
         setAutoSaveStatus('idle');
       }, 3000);
     }
   };

   // Initialize debounced auto-save with longer delay to see spinner
   const { debouncedSave, cancelAutoSave } = useDebouncedAutoSave({
     delay: 1500, // 1.5 second delay
     onSave: performAutoSave,
     enabled: !loading && formData.nama.trim().length > 0, // Only enable if form has a name
   });

   // Auto-save effect that triggers on form data changes
   useEffect(() => {
     if (!loading && formData.nama.trim()) {
       debouncedSave({ formData, soals });
     }
   }, [formData, soals, loading, debouncedSave]);

   // Cancel auto-save on unmount or manual save
   useEffect(() => {
     if (saving) {
       cancelAutoSave();
       setAutoSaveStatus('idle');
     }
   }, [saving, cancelAutoSave]);

  // Load existing data if editing
  useEffect(() => {
    if (soalSet) {
      initForEdit(soalSet);

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
        setLoading(false);
      };

      fetchSoals();
    } else {
      initForCreate();
    }
  }, [soalSet, initForCreate, initForEdit, setLoading, setSoals, setOriginalSoals]);

  const handleGenerate = async () => {
    if (!formData.nama.trim()) {
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Based on the question set title '${formData.nama}' and description '${formData.deskripsi || ''}', generate 1 multiple choice question with 4 options. The question (pertanyaan) and all answer options (opsis) should be written in Korean language. The explanation should be written in Indonesian language. Make sure the question has exactly one correct answer and appropriate difficulty level.`;

      const transformFn = (item: GeneratedSoalItem) => ({
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
      });

      const newSoals = await generateItems(prompt, 'soal', soals, soalItemsSchema, transformFn);
      setSoals([...soals, ...newSoals]);
    } catch (error) {
      console.error('Error generating questions:', error);
      // TODO: Show error toast
    } finally {
      setGenerating(false);
    }
  };


  // Save function for auto-save (no onSuccess callback to avoid closing dialog)
  const performSave = async () => {
    // Don't set setSaving(true) here as it interferes with autoSaveStatus
    // setSaving(true);

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
        
        // Don't call onSuccess to avoid auto-closing the dialog
        // Users can manually close via the sheet's close button
      } else {
        console.error("Failed to save collection:", koleksiResult.error);
      }
    } catch (error) {
      console.error("Error saving soal set:", error);
    } finally {
      // Don't set setSaving(false) here as it interferes with autoSaveStatus
      // setSaving(false);
    }
  };

  if (loading) {
    return <SoalSetFormSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="nama" className="text-lg font-medium text-foreground flex items-center gap-2">
                Soal Set Name
                <span className="text-destructive">*</span>
                {/* Enhanced auto-save status indicator */}
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground animate-in fade-in-0 duration-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in-0 duration-300">
                    <Check className="h-3 w-3" />
                    <span>Saved!</span>
                  </div>
                )}
                {autoSaveStatus === 'error' && (
                  <div className="flex items-center gap-1 text-xs text-red-600 animate-in fade-in-0 duration-300">
                    <span>Save failed</span>
                  </div>
                )}
              </Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isPrivate" className="text-sm text-muted-foreground">Private</Label>
                  <Switch
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData({ isPrivate: checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="isDraft" className="text-sm text-muted-foreground">Draft</Label>
                  <Switch
                    id="isDraft"
                    checked={formData.isDraft}
                    onCheckedChange={(checked) => setFormData({ isDraft: checked })}
                  />
                </div>
              </div>
            </div>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ nama: e.target.value })}
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
              onChange={(e) => setFormData({ deskripsi: e.target.value })}
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
       

      </div>

      <Dialog open={soalDialogOpen} onOpenChange={(open) => store.setSoalDialogOpen(open)}>
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