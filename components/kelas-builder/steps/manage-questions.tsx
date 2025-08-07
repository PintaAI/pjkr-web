"use client";

import { useState } from "react";
import { Card, CardContent,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, CheckCircle, Circle, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Difficulty } from "@prisma/client";
import { SoalForm } from "./soal-form";
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

interface ManageQuestionsProps {
  koleksiIndex: number;
}

interface SortableSoalItemProps {
  soal: any;
  soalIndex: number;
  onEditSoal: (soalIndex: number) => void;
  onToggleExpand: (soalIndex: number) => void;
  onRemoveSoal: (soalIndex: number) => void;
  isExpanded: boolean;
}

function SortableSoalItem({
  soal,
  soalIndex,
  onEditSoal,
  onToggleExpand,
  onRemoveSoal,
  isExpanded,
}: SortableSoalItemProps & { isExpanded: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `soal-${soalIndex}` });

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
              <Badge variant="outline" className="text-xs shrink-0">No. {soalIndex + 1}</Badge>
              <p
                className="font-medium text-sm flex-1 line-clamp-1 cursor-pointer"
                onClick={() => onEditSoal(soalIndex)}
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
                  onToggleExpand(soalIndex);
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
                  onRemoveSoal(soalIndex);
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
                    {soal.opsis.map((opsi: any, opsiIndex: number) => (
                      <div key={opsiIndex} className="flex items-center gap-2 text-sm">
                        {opsi.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-muted-foreground font-medium">
                          {String.fromCharCode(65 + opsiIndex)}.
                        </span>
                        <span className={opsi.isCorrect ? "font-medium" : ""}>
                          {opsi.opsiText || "Empty option"}
                        </span>
                      </div>
                    ))}
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

export function ManageQuestions({ koleksiIndex }: ManageQuestionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | undefined>();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const { koleksiSoals, addSoal, removeSoal, reorderSoals } = useKelasBuilderStore();
  const koleksiSoal = koleksiSoals[koleksiIndex];

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
      
      const activeIndex = parseInt(activeId.replace('soal-', ''));
      const overIndex = parseInt(overId.replace('soal-', ''));

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        console.log('Reordering questions from', activeIndex, 'to', overIndex);
        reorderSoals(koleksiIndex, activeIndex, overIndex);
      }
    }
  };

  const handleAddSoal = () => {
    addSoal(koleksiIndex, {
      pertanyaan: "",
      difficulty: undefined,
      explanation: "",
      isActive: true,
      opsis: [
        { opsiText: "", isCorrect: false, order: 0 },
        { opsiText: "", isCorrect: false, order: 1 },
      ],
    });
    setEditingSoalIndex(koleksiSoal.soals.length);
    setShowCreateDialog(true);
  };

  const handleEditSoal = (soalIndex: number) => {
    setEditingSoalIndex(soalIndex);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingSoalIndex(undefined);
  };

  const handleRemoveSoal = (soalIndex: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      removeSoal(koleksiIndex, soalIndex);
    }
  };

  const toggleExpand = (soalIndex: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(soalIndex)) {
      newExpanded.delete(soalIndex);
    } else {
      newExpanded.add(soalIndex);
    }
    setExpandedQuestions(newExpanded);
  };

  if (!koleksiSoal) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{koleksiSoal.nama}</h3>
          <p className="text-sm text-muted-foreground">
            Manage questions for this collection
          </p>
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
            items={koleksiSoal.soals.map((_, index) => `soal-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {koleksiSoal.soals
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((soal, ) => {
                  const soalIndex = koleksiSoal.soals.findIndex(s => s === soal);
                  const isExpanded = expandedQuestions.has(soalIndex);
                  return (
                    <SortableSoalItem
                      key={soal.tempId || soal.id || soalIndex}
                      soal={soal}
                      soalIndex={soalIndex}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSoalIndex !== undefined && editingSoalIndex < koleksiSoal.soals.length 
                ? `Edit Question ${editingSoalIndex + 1}` 
                : "Create New Question"}
            </DialogTitle>
          </DialogHeader>
          {editingSoalIndex !== undefined && (
            <SoalForm
              koleksiIndex={koleksiIndex}
              soalIndex={editingSoalIndex}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
