"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NovelEditor from "@/components/novel/novel-editor";
import { Plus, Edit2 } from "lucide-react";

interface LessonFormData {
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  isDemo: boolean;
}

interface LessonFormProps {
  mode?: 'add' | 'edit';
  initialData?: LessonFormData;
  onSubmit: (lesson: LessonFormData) => void;
  trigger?: React.ReactNode;
}

export function LessonForm({
  mode = 'add',
  initialData,
  onSubmit,
  trigger
}: LessonFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, saveMateris, updateMateri } = useKelasBuilderStore();

  // Custom debounce hook
  const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    
    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
  };
  
  const form = useForm<LessonFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      jsonDescription: initialData?.jsonDescription || { type: "doc", content: [] },
      htmlDescription: initialData?.htmlDescription || '',
      isDemo: initialData?.isDemo || false,
    }
  });

  const { register, handleSubmit, reset, setValue, control, formState: { isDirty } } = form;

  // Watch form changes for auto-save
  const watchedData = useWatch({ control });

  // Reset form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        jsonDescription: initialData.jsonDescription,
        htmlDescription: initialData.htmlDescription,
        isDemo: initialData.isDemo,
      });
    }
  }, [initialData, reset]);

  // Auto-save function
  const autoSave = useCallback(async (data: LessonFormData) => {
    if (mode === 'edit' && initialData && isDirty) {
      console.log('🔄 Auto-saving lesson data:', data);
      try {
        // Find the materi ID (could be tempId or real id)
        const materiId = (initialData as any).tempId || (initialData as any).id;
        if (materiId) {
          updateMateri(materiId, data);
          // Auto-save to backend if it's not a temp item
          if ((initialData as any).id && !(initialData as any).tempId) {
            await saveMateris();
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [mode, initialData, isDirty, updateMateri, saveMateris]);

  // Debounced auto-save function
  const debouncedAutoSave = useDebounce(autoSave, 1500); // 1.5 second debounce

  // Watch for form changes and trigger auto-save
  useEffect(() => {
    if (watchedData && mode === 'edit') {
      debouncedAutoSave(watchedData as LessonFormData);
    }
    
    // Cleanup is handled automatically by the debounce hook
  }, [watchedData, debouncedAutoSave, mode]);

  const handleContentUpdate = (data: { json: any; html: string }) => {
    setValue('jsonDescription', data.json, { shouldDirty: true });
    setValue('htmlDescription', data.html, { shouldDirty: true });
  };

  const handleFormSubmit = (data: LessonFormData) => {
    onSubmit(data);
    if (mode === 'add') {
      // Reset form only for add mode
      reset({
        title: '',
        description: '',
        jsonDescription: { type: "doc", content: [] },
        htmlDescription: '',
        isDemo: false,
      });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (mode === 'add') {
      // Reset form for add mode
      reset({
        title: '',
        description: '',
        jsonDescription: { type: "doc", content: [] },
        htmlDescription: '',
        isDemo: false,
      });
    } else {
      // Reset to initial data for edit mode
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        jsonDescription: initialData?.jsonDescription || { type: "doc", content: [] },
        htmlDescription: initialData?.htmlDescription || '',
        isDemo: initialData?.isDemo || false,
      });
    }
    setIsOpen(false);
  };

  const defaultTrigger = mode === 'add' ? (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Add Lesson
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
    >
      <Edit2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Lesson' : 'Edit Lesson'}
            {mode === 'edit' && isDirty && (
              <span className="ml-2 text-sm text-orange-600">(Auto-saving...)</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              placeholder="Enter lesson title"
              {...register('title', { required: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the lesson"
              {...register('description', { required: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <NovelEditor
              initialContent={watchedData.jsonDescription}
              onUpdate={handleContentUpdate}
              className="min-h-[300px]"
              saveStatus={isLoading ? "Saving..." : isDirty ? "Unsaved" : "Saved"}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDemo"
              {...register('isDemo')}
            />
            <Label htmlFor="isDemo">Mark as demo lesson (free preview)</Label>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!watchedData.title || !watchedData.description || !watchedData.htmlDescription}
            >
              {mode === 'add' ? 'Add Lesson' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
