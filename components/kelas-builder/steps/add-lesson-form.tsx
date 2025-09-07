"use client";

import React, { useState } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NovelEditor from "@/components/novel/novel-editor";
import { Plus, Edit2,} from "lucide-react";

interface LessonFormProps {
  mode?: 'add' | 'edit';
  initialData?: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
  };
  onSubmit: (lesson: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
  }) => void;
  trigger?: React.ReactNode;
}

export function LessonForm({ 
  mode = 'add', 
  initialData, 
  onSubmit, 
  trigger 
}: LessonFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading } = useKelasBuilderStore();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jsonDescription: initialData?.jsonDescription || { type: "doc", content: [] },
    htmlDescription: initialData?.htmlDescription || '',
    isDemo: initialData?.isDemo || false,
  });

  // Reset form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        jsonDescription: initialData.jsonDescription,
        htmlDescription: initialData.htmlDescription,
        isDemo: initialData.isDemo,
      });
    }
  }, [initialData]);

  const handleContentUpdate = (data: { json: any; html: string }) => {
    setFormData(prev => ({ 
      ...prev, 
      jsonDescription: data.json, 
      htmlDescription: data.html 
    }));
  };

  const handleFormSubmit = () => {
    if (formData.title && formData.description && formData.htmlDescription) {
      onSubmit(formData);
      if (mode === 'add') {
        // Reset form only for add mode
        setFormData({
          title: '',
          description: '',
          jsonDescription: { type: "doc", content: [] },
          htmlDescription: '',
          isDemo: false,
        });
      }
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        title: '',
        description: '',
        jsonDescription: { type: "doc", content: [] },
        htmlDescription: '',
        isDemo: false,
      });
    } else {
      // Reset to initial data for edit mode
      setFormData({
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
      <DialogContent className="max-w-7xl sm:max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{mode === 'add' ? 'Add New Lesson' : 'Edit Lesson'}</span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isDemo" className="text-sm">Demo</Label>
              <Switch
                id="isDemo"
                checked={formData.isDemo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDemo: checked }))}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              placeholder="Enter lesson title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the lesson"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <NovelEditor
              initialContent={formData.jsonDescription}
              onUpdate={handleContentUpdate}
              className="min-h-[700px]"
              saveStatus={isLoading ? "Saving..." : "Saved"}
            />
          </div>
          
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              disabled={!formData.title || !formData.description || !formData.htmlDescription}
            >
              {mode === 'add' ? 'Add Lesson' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
