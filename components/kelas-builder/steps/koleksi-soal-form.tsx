"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, EyeOff } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";


interface KoleksiSoalFormProps {
  koleksiIndex?: number;
  onCancel?: () => void;
}

export function KoleksiSoalForm({ koleksiIndex, onCancel }: KoleksiSoalFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { 
    koleksiSoals, 
    addKoleksiSoal, 
    updateKoleksiSoal
  } = useKelasBuilderStore();

  const isEditing = koleksiIndex !== undefined;
  const koleksiSoal = isEditing ? koleksiSoals[koleksiIndex] : null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: koleksiSoal || {
      nama: "",
      deskripsi: "",
      isPrivate: false,
      isDraft: true,
      soals: [],
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const onSubmit = (data: any) => {
    if (isEditing && koleksiIndex !== undefined) {
      // When updating, preserve the existing soals array
      const updateData = {
        ...data,
        soals: koleksiSoal?.soals || [] // Preserve existing questions
      };
      updateKoleksiSoal(koleksiIndex, updateData);
    } else {
      addKoleksiSoal(data);
    }
    onCancel?.();
  };


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  id="deskripsi"
                  {...register("deskripsi")}
                  placeholder="Enter description (optional)"
                />
                {errors.deskripsi && (
                  <p className="text-sm text-destructive">{errors.deskripsi.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrivate"
                  checked={watchedValues.isPrivate}
                  onCheckedChange={(checked) => setValue("isPrivate", checked)}
                />
                <Label htmlFor="isPrivate">Private Collection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDraft"
                  checked={watchedValues.isDraft}
                  onCheckedChange={(checked) => setValue("isDraft", checked)}
                />
                <Label htmlFor="isDraft">Draft Status</Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>

              <Badge variant={watchedValues.isPrivate ? "secondary" : "default"}>
                {watchedValues.isPrivate ? "Private" : "Public"}
              </Badge>

              <Badge variant={watchedValues.isDraft ? "outline" : "default"}>
                {watchedValues.isDraft ? "Draft" : "Published"}
              </Badge>
            </div>

            {showPreview && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{watchedValues.nama || "Untitled Collection"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {watchedValues.deskripsi || "No description provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Questions: {koleksiSoal?.soals?.length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
