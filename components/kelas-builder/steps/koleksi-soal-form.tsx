"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { useDebouncedAutoSave } from "@/lib/hooks/use-debounced-auto-save";

interface KoleksiSoalFormProps {
  koleksiIndex?: number;
  onSave?: () => void;
}

export function KoleksiSoalForm({ koleksiIndex, onSave }: KoleksiSoalFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const {
    koleksiSoals,
    addKoleksiSoal,
    updateKoleksiSoal,
    saveKoleksiSoal,
    draftId
  } = useKelasBuilderStore();

  const isEditing = koleksiIndex !== undefined;
  const koleksiSoal = isEditing ? koleksiSoals[koleksiIndex] : null;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: koleksiSoal || {
      nama: "",
      deskripsi: "",
      isPrivate: false,
      isDraft: !!draftId, // Follow session draft status
      soals: [],
    },
    mode: "onChange",
  });

  // Watch for form changes
  const formData = watch();

  // Auto-save function
  const handleAutoSave = async (data: any) => {
    setIsAutoSaving(true);
    
    const submissionData = {
      ...data,
      isPrivate: false, // Always public
      isDraft: !!draftId, // Follow session draft status
    };
    
    if (isEditing && koleksiIndex !== undefined) {
      // When updating, preserve the existing soals array
      const updateData = {
        ...submissionData,
        soals: koleksiSoal?.soals || [] // Preserve existing questions
      };
      updateKoleksiSoal(koleksiIndex, updateData);
      
      // Save the updated collection to database
      await saveKoleksiSoal(koleksiIndex);
      // Don't call onSave() for editing - keep dialog open
    } else {
      // For new collections, add to state and close dialog
      addKoleksiSoal(submissionData);
    }
    
    setIsAutoSaving(false);
  };

  // Form submit function - separate from auto-save
  const onSubmit = handleSubmit(async (data) => {
    setIsSaving(true);
    
    try {
      const submissionData = {
        ...data,
        isPrivate: false, // Always public
        isDraft: !!draftId, // Follow session draft status
      };
      
      if (isEditing && koleksiIndex !== undefined) {
        // When updating, preserve the existing soals array
        const updateData = {
          ...submissionData,
          soals: koleksiSoal?.soals || [] // Preserve existing questions
        };
        updateKoleksiSoal(koleksiIndex, updateData);
        
        // Save the updated collection to database immediately
        await saveKoleksiSoal(koleksiIndex);
      } else {
        // For new collections, add to state
        addKoleksiSoal(submissionData);
      }
      
      // Close dialog immediately after successful save
      if (onSave) {
        onSave();
      }
      
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSaving(false);
    }
  });

  // Setup debounced auto-save
  const { debouncedSave } = useDebouncedAutoSave({
    delay: 1500, // 1.5 second delay
    onSave: handleAutoSave,
    enabled: isDirty && (formData.nama?.trim() !== ""), // Only auto-save if form is dirty and has a name
  });

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (isDirty && formData.nama?.trim()) {
      debouncedSave(formData);
    }
  }, [formData, isDirty, debouncedSave]);

  return (
    <div className="relative">
      {/* Auto-save indicator */}
      {isDirty && formData.nama?.trim() && isAutoSaving && (
        <div className="absolute top-7 right-2 z-10 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border">
          Auto-saving...
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Collection Name *</Label>
            <Input
              id="nama"
              {...register("nama", { required: "Collection name is required" })}
              placeholder="Enter collection name"
              className={errors.nama ? "border-destructive" : ""}
            />
            {errors.nama && (
              <p className="text-sm text-destructive">{errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Description</Label>
            <Textarea
              id="deskripsi"
              {...register("deskripsi")}
              placeholder="Enter description (optional)"
              className="min-h-[100px]"
            />
            {errors.deskripsi && (
              <p className="text-sm text-destructive">{errors.deskripsi.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={!formData.nama?.trim() || isSaving}
            size="sm"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
