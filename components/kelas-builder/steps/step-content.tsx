"use client";

import { useState } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NovelEditor } from "@/components/novel/novel-editor";
import { jsonToPlainText } from "@/lib/novel-utils";
import { AddLessonForm } from "./add-lesson-form";
import { 
  Plus, 
  FileText, 
  Trash2, 
  GripVertical,
  Edit2
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableMateriItemProps {
  materi: any;
  index: number;
  editingMateri: number | null;
  onEditMateri: (index: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateMateri: (index: number, data: Partial<any>) => void;
  onRemoveMateri: (index: number) => void;
  onEditContentUpdate: (index: number, data: { json: any; html: string }) => void;
}

function SortableMateriItem({
  materi,
  index,
  editingMateri,
  onEditMateri,
  onSaveEdit,
  onCancelEdit,
  onUpdateMateri,
  onRemoveMateri,
  onEditContentUpdate,
}: SortableMateriItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: materi.title,
    description: materi.description,
    jsonDescription: materi.jsonDescription,
    htmlDescription: materi.htmlDescription,
    isDemo: materi.isDemo,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `materi-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const handleSaveEdit = () => {
    onUpdateMateri(index, editForm);
    setIsEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      title: materi.title,
      description: materi.description,
      jsonDescription: materi.jsonDescription,
      htmlDescription: materi.htmlDescription,
      isDemo: materi.isDemo,
    });
    setIsEditDialogOpen(false);
  };

  const handleEditContentUpdate = (data: { json: any; html: string }) => {
    setEditForm(prev => ({
      ...prev,
      jsonDescription: data.json,
      htmlDescription: data.html
    }));
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`relative ${isDragging ? "opacity-50" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="touch-none"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{materi.title}</h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {materi.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {materi.isDemo && (
                <Badge key={`demo-${index}`} variant="secondary" className="text-xs">Demo</Badge>
              )}
              {materi.tempId && (
                <Badge key={`unsaved-${index}`} variant="outline" className="text-xs">Unsaved</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMateri(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <NovelEditor
                initialContent={editForm.jsonDescription}
                onUpdate={handleEditContentUpdate}
                className="min-h-[300px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`edit-demo-dialog-${index}`}
                checked={editForm.isDemo}
                onChange={(e) => setEditForm(prev => ({ ...prev, isDemo: e.target.checked }))}
              />
              <Label htmlFor={`edit-demo-dialog-${index}`}>Mark as demo lesson (free preview)</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function StepContent() {
  const { 
    materis, 
    draftId, 
    isLoading, 
    addMateri, 
    removeMateri, 
    updateMateri,
    reorderMateris,
    saveMateris 
  } = useKelasBuilderStore();

  const [isAddingMateri, setIsAddingMateri] = useState(false);
  const [editingMateri, setEditingMateri] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      // Extract the index from the sortable ID
      const activeId = active.id.toString();
      const overId = over.id.toString();
      
      const activeIndex = parseInt(activeId.replace('materi-', ''));
      const overIndex = parseInt(overId.replace('materi-', ''));

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        console.log('Reordering from', activeIndex, 'to', overIndex);
        reorderMateris(activeIndex, overIndex);
      }
    }
  };

  const handleAddMateri = (lesson: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
  }) => {
    addMateri(lesson);
    setIsAddingMateri(false);
  };

  const handleEditMateri = (index: number) => {
    setEditingMateri(index);
  };

  const handleSaveEdit = () => {
    setEditingMateri(null);
  };

  const handleCancelEdit = () => {
    setEditingMateri(null);
  };

  const handleEditContentUpdate = (index: number, data: { json: any; html: string }) => {
    updateMateri(index, {
      jsonDescription: data.json,
      htmlDescription: data.html
    });
  };

  const handleSaveMateris = async () => {
    if (draftId) {
      await saveMateris();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Course Content</h2>
        <p className="text-muted-foreground">
          Add lessons and learning materials to your course. Each lesson should have a clear title and comprehensive content.
        </p>
      </div>

      {/* Existing Materis */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={materis.map((_, index) => `materi-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {materis.map((materi, index) => (
              <SortableMateriItem
                key={materi.tempId || materi.id || `materi-${index}`}
                materi={materi}
                index={index}
                editingMateri={editingMateri}
                onEditMateri={handleEditMateri}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onUpdateMateri={updateMateri}
                onRemoveMateri={removeMateri}
                onEditContentUpdate={handleEditContentUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Materi */}
      <Dialog open={isAddingMateri} onOpenChange={setIsAddingMateri}>
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add New Lesson
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <AddLessonForm 
            onAdd={handleAddMateri}
            onCancel={() => setIsAddingMateri(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{materis.length}</div>
              <div className="text-sm text-muted-foreground">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {materis.filter(m => m.isDemo).length}
              </div>
              <div className="text-sm text-muted-foreground">Demo Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {materis.filter(m => m.tempId).length}
              </div>
              <div className="text-sm text-muted-foreground">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note: Global save button is available in the header when there are unsaved changes */}
      {materis.filter(m => m.tempId).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You have {materis.filter(m => m.tempId).length} unsaved lesson(s). 
            Use the "Save" button in the header to save your changes.
          </p>
        </div>
      )}
    </div>
  );
}
