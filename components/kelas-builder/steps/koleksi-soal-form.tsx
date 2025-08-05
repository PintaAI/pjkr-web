"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";


interface KoleksiSoalFormProps {
  koleksiIndex?: number;
  onCancel?: () => void;
}

export function KoleksiSoalForm({ koleksiIndex, onCancel }: KoleksiSoalFormProps) {
  const {
    koleksiSoals,
    addKoleksiSoal,
    updateKoleksiSoal,
    draftId
  } = useKelasBuilderStore();

  const isEditing = koleksiIndex !== undefined;
  const koleksiSoal = isEditing ? koleksiSoals[koleksiIndex] : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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

  const onSubmit = (data: any) => {
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
    } else {
      addKoleksiSoal(submissionData);
    }
    onCancel?.();
  };


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Collection Name *</Label>
                <Input
                  id="nama"
                  {...register("nama")}
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


            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={!isValid}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update" : "Create"} Collection
              </Button>
            </div>
          </form>

    </div>
  );
}
