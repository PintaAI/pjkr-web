"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { useEffect, useRef } from "react";

interface VocabularySetBasicFormProps {
  vocabSet?: {
    id?: number;
    title: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  };
  onSave: (data: {
    title: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
}

export function VocabularySetBasicForm({ vocabSet, onSave, onCancel }: VocabularySetBasicFormProps) {
  // Define validation schema
  const VocabularySetBasicSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    icon: z.string().default("FaBook"),
    isPublic: z.boolean().default(false),
  });

  const { setError } = useKelasBuilderStore();

  const form = useForm({
    resolver: zodResolver(VocabularySetBasicSchema),
    defaultValues: {
      title: vocabSet?.title || "",
      description: vocabSet?.description || "",
      icon: vocabSet?.icon || "FaBook",
      isPublic: vocabSet?.isPublic || false,
    },
  });

  const { watch } = form;
  const watchedValues = watch();

  // Debounced auto-save effect
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-save when form values change (with debounce)
    if (vocabSet?.id) { // Only auto-save for existing sets
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for 2 seconds after user stops typing
      saveTimeoutRef.current = setTimeout(() => {
        console.log("Vocabulary set form debounce timeout fired. Auto-saving...");
        try {
          onSave({
            ...watchedValues,
            isPublic: watchedValues.isPublic ?? false
          });
        } catch (error: any) {
          console.error("Auto-save failed:", error);
        }
      }, 2000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [watchedValues, vocabSet?.id, onSave]);

  const onSubmit = (data: any) => {
    console.log("Vocabulary Set Form Submitted:", data);
    try {
      onSave(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save vocabulary set");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              value={form.watch("title")}
              onChange={(e) => form.setValue("title", e.target.value)}
              placeholder="e.g., Basic Korean Vocabulary"
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              value={form.watch("description")}
              onChange={(e) => form.setValue("description", e.target.value)}
              placeholder="Brief description of this vocabulary set"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.watch("isPublic")}
                onChange={(e) => form.setValue("isPublic", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPublic">Make this set public</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {vocabSet?.id ? "Update Set" : "Create Set"}
          </Button>
        </div>
      </form>
    </div>
  );
}