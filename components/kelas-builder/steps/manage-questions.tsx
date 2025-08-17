"use client";

import { useState } from "react";
import { Card, CardContent,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, CheckCircle, Circle, ChevronDown, ChevronRight, GripVertical, AlertTriangle } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Difficulty } from "@prisma/client";
import { SoalForm } from "./soal-form";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface ManageQuestionsProps {
  koleksiId: string | number;
}
interface SortableSoalItemProps {
  soal: any;
  onEditSoal: (id: number | string) => void;
  onToggleExpand: (id: number | string) => void;
  onRemoveSoal: (id: number | string) => void;
  isExpanded: boolean;
}
function SortableSoalItem({
  soal,
  onEditSoal,
  onToggleExpand,
  onRemoveSoal,
  isExpanded,
}: SortableSoalItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: soal.tempId || soal.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : "py-2"}`}
    >
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="touch-none cursor-move"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </div>
              <Badge variant="outline" className="text-xs shrink-0">No. {(soal.order ?? 0) + 1}</Badge>
              <p
                className="font-medium text-sm flex-1 line-clamp-1 cursor-pointer"
                onClick={() => onEditSoal(soal.tempId || soal.id)}
              >
                {soal.pertanyaan ? soal.pertanyaan.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || "Untitled Question" : "Untitled Question"}
              </p>
              <div className="flex items-center gap-2">
                {soal.difficulty && (
                  <Badge variant={
                    soal.difficulty === Difficulty.BEGINNER ? "default" :
                    soal.difficulty === Difficulty.INTERMEDIATE ? "secondary" : "destructive"
                  } className="text-xs">
                    {soal.difficulty}
                  </Badge>
                )}
                {!soal.isActive && (
                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {soal.opsis?.length || 0} options
                </span>
                {soal.opsis && soal.opsis.filter((o: any) => o.isCorrect).length > 0 && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(soal.tempId || soal.id);
                }}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSoal(soal.tempId || soal.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="pt-3 border-t space-y-3">
              {soal.explanation && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Explanation:</p>
                  <p className="text-sm">{soal.explanation}</p>
                </div>
              )}
              
              {soal.opsis && soal.opsis.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Answer Options:</p>
                  <div className="space-y-2">
                    {soal.opsis.map((opsi: any) => {
                      const opsiId = opsi.tempId || opsi.id;
                      return (
                        <div key={opsiId} className="flex items-center gap-2 text-sm">
                          {opsi.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-muted-foreground font-medium">
                            {String.fromCharCode(65 + (opsi.order ?? 0))}.
                          </span>
                          <span className={opsi.isCorrect ? "font-medium" : ""}>
                            {opsi.opsiText || "Empty option"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ManageQuestions({ koleksiId }: ManageQuestionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSoalId, setEditingSoalId] = useState<number | string | undefined>();
  const [expandedSoals, setExpandedSoals] = useState<Set<number | string>>(new Set());
  const { koleksiSoals, addSoal, removeSoal, reorderSoals } = useKelasBuilderStore();
  const koleksiSoal = koleksiSoals.find(k => k.id === koleksiId || k.tempId === koleksiId);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over && koleksiSoal) {
      // Extract the index from the sortable ID
      const soals = koleksiSoal.soals;
      const activeIndex = soals.findIndex(s => (s.tempId || s.id) === active.id);
      const overIndex = soals.findIndex(s => (s.tempId || s.id) === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex && koleksiIndex !== -1) {
        reorderSoals(koleksiId, activeIndex, overIndex);
      }
    }
  };

  const handleAddSoal = () => {
    if (!koleksiId) return;

    const newSoalTempId = addSoal(koleksiId, {
      pertanyaan: "",
      difficulty: Difficulty.BEGINNER,
      explanation: "",
      isActive: true,
      opsis: [
        { opsiText: "", isCorrect: false, order: 0 },
        { opsiText: "", isCorrect: false, order: 1 },
      ],
    });
    setEditingSoalId(newSoalTempId);
    setShowCreateDialog(true);
  };

  const handleEditSoal = (soalId: number | string) => {
    setEditingSoalId(soalId);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingSoalId(undefined);
  };

  const handleRemoveSoal = (soalId: number | string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      if (koleksiId) {
        removeSoal(koleksiId, soalId);
      }
    }
  };

  const toggleExpand = (soalId: number | string) => {
    const newExpanded = new Set(expandedSoals);
    if (newExpanded.has(soalId)) {
      newExpanded.delete(soalId);
    } else {
      newExpanded.add(soalId);
    }
    setExpandedSoals(newExpanded);
  };

  if (!koleksiSoal) {
    return <div>Collection not found</div>;
  }

  // Find the actual index for reorder operations
  const koleksiIndex = koleksiSoals.findIndex(k => k.id === koleksiId || k.tempId === koleksiId);


  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{koleksiSoal.nama}</h3>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Manage questions for this collection
            </p>
          </div>
        </div>
        <Button onClick={handleAddSoal} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {koleksiSoal.soals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold mb-2">No Questions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first question to this collection.
                </p>
                <Button onClick={handleAddSoal} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={koleksiSoal.soals.map((s) => s.tempId || s.id).filter((id): id is string | number => id !== undefined)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {koleksiSoal.soals
                .slice() // Create a shallow copy for sorting
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((soal) => {
                  const soalId = soal.tempId || soal.id;
                  if (!soalId) return null;
                  const isExpanded = expandedSoals.has(soalId);
                  return (
                    <SortableSoalItem
                      key={soalId}
                      soal={soal}
                      onEditSoal={handleEditSoal}
                      onToggleExpand={toggleExpand}
                      onRemoveSoal={handleRemoveSoal}
                      isExpanded={isExpanded}
                    />
                  );
                })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Question Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-7xl min-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingSoalId !== undefined ? "Edit Question" : "Create New Question"}
            </DialogTitle>
          </DialogHeader>
          {showCreateDialog && koleksiSoal && (
            <SoalForm
              koleksiId={koleksiSoal.id || koleksiSoal.tempId!}
              soalId={editingSoalId}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
