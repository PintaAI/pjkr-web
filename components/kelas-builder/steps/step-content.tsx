"use client";

import { useState } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NovelEditor } from "@/components/novel/novel-editor";
import { jsonToPlainText } from "@/lib/novel-utils";
import { AddLessonForm } from "./add-lesson-form";
import { 
  Plus, 
  FileText, 
  Trash2, 
  GripVertical
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
  arrayMove,
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: materi.tempId || materi.id || `materi-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            </div>
            <div>
              <CardTitle className="text-lg">{materi.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {materi.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {materi.isDemo && (
              <Badge variant="secondary">Demo</Badge>
            )}
            {materi.tempId && (
              <Badge variant="outline">Unsaved</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveMateri(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editingMateri === index ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={materi.title}
                onChange={(e) => onUpdateMateri(index, { title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={materi.description}
                onChange={(e) => onUpdateMateri(index, { description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <NovelEditor
                initialContent={materi.jsonDescription}
                onUpdate={(data) => onEditContentUpdate(index, data)}
                className="min-h-[300px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`edit-demo-${index}`}
                checked={materi.isDemo}
                onChange={(e) => onUpdateMateri(index, { isDemo: e.target.checked })}
              />
              <Label htmlFor={`edit-demo-${index}`}>Mark as demo lesson (free preview)</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit}>
                Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Content: {jsonToPlainText(materi.jsonDescription).substring(0, 100)}...
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditMateri(index)}
            >
              Edit Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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

    if (active.id !== over?.id) {
      const activeIndex = materis.findIndex(
        (item) => (item.tempId || item.id) === active.id
      );
      const overIndex = materis.findIndex(
        (item) => (item.tempId || item.id) === over?.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
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
          items={materis.map((materi) => materi.tempId || materi.id || `materi-${materis.indexOf(materi)}`)}
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
      {isAddingMateri ? (
        <AddLessonForm 
          onAdd={handleAddMateri}
          onCancel={() => setIsAddingMateri(false)}
        />
      ) : (
        <Button
          onClick={() => setIsAddingMateri(true)}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add New Lesson
        </Button>
      )}

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

      {/* Save Button */}
      {materis.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveMateris}
            disabled={isLoading || !draftId}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
