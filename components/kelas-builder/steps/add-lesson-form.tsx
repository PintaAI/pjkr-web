"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovelEditor } from "@/components/novel/novel-editor";

interface AddLessonFormProps {
  onAdd: (lesson: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
  }) => void;
  onCancel: () => void;
}

export function AddLessonForm({ onAdd, onCancel }: AddLessonFormProps) {
  const [newMateri, setNewMateri] = useState({
    title: '',
    description: '',
    jsonDescription: { type: "doc", content: [] },
    htmlDescription: '',
    isDemo: false,
  });

  const handleContentUpdate = (data: { json: any; html: string }) => {
    setNewMateri({ 
      ...newMateri, 
      jsonDescription: data.json, 
      htmlDescription: data.html 
    });
  };

  const handleSubmit = () => {
    if (newMateri.title && newMateri.description && newMateri.htmlDescription) {
      onAdd(newMateri);
      // Reset form
      setNewMateri({
        title: '',
        description: '',
        jsonDescription: { type: "doc", content: [] },
        htmlDescription: '',
        isDemo: false,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Lesson</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Lesson Title *</Label>
          <Input
            id="title"
            placeholder="Enter lesson title"
            value={newMateri.title}
            onChange={(e) => setNewMateri({ ...newMateri, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Brief description of the lesson"
            value={newMateri.description}
            onChange={(e) => setNewMateri({ ...newMateri, description: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <NovelEditor
            
            onUpdate={handleContentUpdate}
            className="min-h-[300px]"
            compact={true}
            
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDemo"
            checked={newMateri.isDemo}
            onChange={(e) => setNewMateri({ ...newMateri, isDemo: e.target.checked })}
          />
          <Label htmlFor="isDemo">Mark as demo lesson (free preview)</Label>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!newMateri.title || !newMateri.description || !newMateri.htmlDescription}
          >
            Add Lesson
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
