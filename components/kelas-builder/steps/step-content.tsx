"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LessonForm } from "./add-lesson-form";
import { 
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
  onUpdateMateri: (index: number, data: Partial<any>) => void;
  onRemoveMateri: (index: number) => void;
}

function SortableMateriItem({
  materi,
  index,
  onUpdateMateri,
  onRemoveMateri,
}: SortableMateriItemProps) {
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

  const handleEditSubmit = (updatedData: any) => {
    onUpdateMateri(index, updatedData);
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
              <LessonForm
                mode="edit"
                initialData={materi}
                onSubmit={handleEditSubmit}
              />
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

    </>
  );
}

export function StepContent() {
  const { 
    materis, 
    addMateri, 
    removeMateri, 
    updateMateri,
    reorderMateris
  } = useKelasBuilderStore();

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
  };

  return (
    <div className="space-y-6">

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
                onUpdateMateri={updateMateri}
                onRemoveMateri={removeMateri}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Materi */}
      <LessonForm onSubmit={handleAddMateri} />


      {/* Note: Global save button is available in the header when there are unsaved changes */}
      {materis.filter(m => m.tempId).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You have {materis.filter(m => m.tempId).length} unsaved lesson(s). 
            Use the Save button in the header to save your changes.
          </p>
        </div>
      )}
    </div>
  );
}
