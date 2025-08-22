"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";

interface KoleksiSoalFormProps {
  koleksiId?: string | number;
  onSave?: () => void;
}

export function KoleksiSoalForm({ koleksiId, onSave }: KoleksiSoalFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    koleksiSoals,
    addKoleksiSoal,
    updateKoleksiSoal,
    saveKoleksiSoal,
    draftId
  } = useKelasBuilderStore();

  const isEditing = koleksiId !== undefined;
  const koleksiSoal = isEditing ? koleksiSoals.find(k => k.id === koleksiId || k.tempId === koleksiId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: koleksiSoal || {
      nama: "",
      deskripsi: "",
      isPrivate: false,
      isDraft: !!draftId, // Follow session draft status
      soals: [],
    },
  });

  // Form submit function
  const onSubmit = handleSubmit(async (data) => {
    setIsSaving(true);
    
    try {
      const submissionData = {
        ...data,
        isPrivate: false, // Always public
        isDraft: !!draftId, // Follow session draft status
      };
      
      if (isEditing && koleksiSoal) {
        // When updating, preserve the existing soals array
        const updateData = {
          ...submissionData,
          soals: koleksiSoal?.soals || [] // Preserve existing questions
        };
        const koleksiUpdateId = koleksiSoal.id || koleksiSoal.tempId;
        if (koleksiUpdateId) {
          updateKoleksiSoal(koleksiUpdateId, updateData);
          
          // Find the index for saving
          const koleksiIndex = koleksiSoals.findIndex(k => k.id === koleksiUpdateId || k.tempId === koleksiUpdateId);
          if (koleksiIndex !== -1) {
            await saveKoleksiSoal(koleksiIndex);
          }
        }
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

  return (
    <div className="space-y-6">
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
            disabled={!register("nama").name || isSaving}
            size="sm"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
