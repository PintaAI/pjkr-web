"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LessonForm } from "./add-lesson-form";
import {
  FileText,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  BookOpen,
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
import { useCallback } from "react";

interface SortableMateriItemProps {
  materi: any;
  sortableId: string;
  onUpdateMateri: (id: number | string, data: Partial<any>) => void;
  onRemoveMateri: (id: number | string) => void;
  onToggleMateriDraft: (id: number | string) => Promise<void>;
  draftId: number | null;
}

function SortableMateriItem({
  materi,
  sortableId,
  onUpdateMateri,
  onRemoveMateri,
  onToggleMateriDraft,
  draftId,
}: SortableMateriItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const materiId = materi.tempId || materi.id;

  const handleEditSubmit = (updatedData: any) => {
    onUpdateMateri(materiId, updatedData);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`relative py-4 ${isDragging ? "opacity-50" : ""}`}
      >
        <CardContent >
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 cursor-help">
                        {materi.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-sm">{materi.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {materi.koleksiSoalId && (
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Assessment
                    </Badge>
                    {materi.passingScore && (
                      <span className="text-xs text-muted-foreground">
                        ({materi.passingScore}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {materi.isDemo && (
                <Badge key={`demo-${materiId}`} variant="secondary" className="text-xs">Demo</Badge>
              )}
              {materi.tempId && (
                <Badge key={`unsaved-${materiId}`} variant="outline" className="text-xs">Unsaved</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleMateriDraft(materiId)}
                className="h-8 w-8 p-0"
                title={materi.isDraft ? "Publish lesson" : "Mark as draft"}
                disabled={materi.tempId}
              >
                {materi.isDraft ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-orange-600" />
                )}
              </Button>
              <LessonForm
                mode="edit"
                initialData={materi}
                onSubmit={handleEditSubmit}
                kelasId={draftId || undefined}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMateri(materiId)}
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
    draftId,
    materis,
    addMateri,
    removeMateri,
    updateMateri,
    reorderMateris,
    toggleMateriDraft,
    saveMateris,
    stepDirtyFlags
  } = useKelasBuilderStore();

  // Debounced auto-save for content step
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (stepDirtyFlags.content) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for 2 seconds after user stops making changes
      console.log("Setting debounce timeout for content changes...");
      saveTimeoutRef.current = setTimeout(() => {
        console.log("Content debounce timeout fired. Saving materis...");
        saveMateris().catch(error => {
          console.error("Auto-save failed:", error);
        });
      }, 2000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [stepDirtyFlags.content, saveMateris]);

  // Enhanced updateMateri handler that triggers auto-save
  const handleUpdateMateri = useCallback((id: number | string, data: Partial<any>) => {
    updateMateri(id, data);
    // Auto-save will be triggered by the useEffect above
  }, [updateMateri]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      // Get the sorted array to match visual order
      const sortedMateris = [...materis].sort((a, b) => a.order - b.order);
      
      // Extract indices from the sortable IDs
      const activeIndex = parseInt(active.id.toString().replace('materi-index-', ''));
      const overIndex = parseInt(over.id.toString().replace('materi-index-', ''));

      if (!isNaN(activeIndex) && !isNaN(overIndex) && activeIndex !== overIndex) {
        const activeMateri = sortedMateris[activeIndex];
        const overMateri = sortedMateris[overIndex];
        
        if (activeMateri && overMateri) {
          const activeId = activeMateri.tempId || activeMateri.id;
          const overId = overMateri.tempId || overMateri.id;
          
          if (activeId && overId) {
            console.log('Reordering from', activeId, 'to', overId);
            reorderMateris(activeId, overId);
          }
        }
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
    addMateri({ ...lesson, isDraft: false });
  };

  return (
    <div className="space-y-4">

      {/* Summary */}
      <Card className="bg-muted/50">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="font-semibold">Lessons ({materis.length})</span>
        </div>
        <LessonForm onSubmit={handleAddMateri} kelasId={draftId || undefined} />
      </div>

      {/* Existing Materis */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={[...materis]
            .sort((a, b) => a.order - b.order)
            .map((_, index) => `materi-index-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {[...materis] // Create a copy to avoid mutating Zustand's read-only array
              .sort((a, b) => a.order - b.order) // Sort by order field, not array index
              .map((materi, index) => (
                <SortableMateriItem
                  key={materi.tempId || materi.id || `materi-${materi.order}`}
                  materi={materi}
                  sortableId={`materi-index-${index}`}
                  onUpdateMateri={handleUpdateMateri}
                  onRemoveMateri={removeMateri}
                  onToggleMateriDraft={toggleMateriDraft}
                  draftId={draftId}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
