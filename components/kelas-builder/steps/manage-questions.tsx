"use client";

import { useState } from "react";
import { z } from "zod";
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

// Reuse the same validation schema from soal-form
const soalValidationSchema = z.object({
  pertanyaan: z.string().min(1, "Question is required"),
  difficulty: z.nativeEnum(Difficulty, {
    errorMap: () => ({ message: "Please select a difficulty level" })
  }),
  explanation: z.string().optional(),
  isActive: z.boolean(),
  opsis: z.array(z.object({
    opsiText: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
    order: z.number(),
  })).min(2, "At least 2 options are required").max(5, "Maximum 5 options allowed")
    .refine(
      (opsis) => opsis.filter(opsi => opsi.isCorrect).length === 1,
      { message: "Exactly one option must be marked as correct" }
    ),
});

// Validation function using Zod
function validateSoal(soal: any): { isValid: boolean; errors: string[] } {
  try {
    // Clean the question text for validation
    const cleanedSoal = {
      ...soal,
      pertanyaan: soal.pertanyaan?.replace(/<[^>]*>/g, "").trim() || "",
    };
    
    soalValidationSchema.parse(cleanedSoal);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return { isValid: false, errors: ["Unknown validation error"] };
  }
}

interface ManageQuestionsProps {
  koleksiIndex: number;
}

interface SortableSoalItemProps {
  soal: any;
  onEditSoal: (id: number | string) => void;
  onToggleExpand: (id: number | string) => void;
  onRemoveSoal: (id: number | string) => void;
  isExpanded: boolean;
  hasValidationErrors?: boolean;
}

function SortableSoalItem({
  soal,
  onEditSoal,
  onToggleExpand,
  onRemoveSoal,
  isExpanded,
  hasValidationErrors = false,
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
      className={`relative ${isDragging ? "opacity-50" : "py-2"} ${
        hasValidationErrors ? "border-destructive/50 bg-destructive/5" : ""
      }`}
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
  const [editingSoalId, setEditingSoalId] = useState<number | string | undefined>();
  const [expandedSoals, setExpandedSoals] = useState<Set<number | string>>(new Set());
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
      const soals = koleksiSoal.soals;
      const activeIndex = soals.findIndex(s => (s.tempId || s.id) === active.id);
      const overIndex = soals.findIndex(s => (s.tempId || s.id) === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const koleksiId = koleksiSoal.id || koleksiSoal.tempId;
        if (koleksiId) {
          reorderSoals(koleksiId, activeIndex, overIndex);
        }
      }
    }
  };

  const handleAddSoal = () => {
    const koleksiId = koleksiSoal.id || koleksiSoal.tempId;
    if (!koleksiId) return;

    addSoal(koleksiId, {
      pertanyaan: "",
      difficulty: Difficulty.BEGINNER,
      explanation: "",
      isActive: true,
      opsis: [
        { opsiText: "", isCorrect: false, order: 0 },
        { opsiText: "", isCorrect: false, order: 1 },
      ],
    });
    // The new soal will have a tempId. We'll open the form without a specific soalId,
    // and the form will be responsible for identifying it's a new soal.
    setEditingSoalId(undefined);
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
      const koleksiId = koleksiSoal.id || koleksiSoal.tempId;
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

  // Validate all soals and get summary
  const validationSummary = koleksiSoal.soals.map((soal, index) => ({
    index,
    validation: validateSoal(soal)
  }));
  
  const invalidSoals = validationSummary.filter(item => !item.validation.isValid);
  const allErrors = invalidSoals.flatMap(item =>
    item.validation.errors.map(error => `Question ${item.index + 1}: ${error}`)
  );

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{koleksiSoal.nama}</h3>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Manage questions for this collection
            </p>
            {invalidSoals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive font-medium">
                    {invalidSoals.length} question(s) need attention:
                  </p>
                </div>
                <div className="ml-6 space-y-1">
                  {allErrors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      • {error}
                    </p>
                  ))}
                  {allErrors.length > 5 && (
                    <p className="text-xs text-destructive">
                      • ... and {allErrors.length - 5} more issues
                    </p>
                  )}
                </div>
              </div>
            )}
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
                  if (!soalId) return null; // Should not happen if filtered correctly
                  const isExpanded = expandedSoals.has(soalId);
                  const validation = validateSoal(soal);
                  const hasValidationErrors = !validation.isValid;
                  return (
                    <SortableSoalItem
                      key={soalId}
                      soal={soal}
                      onEditSoal={handleEditSoal}
                      onToggleExpand={toggleExpand}
                      onRemoveSoal={handleRemoveSoal}
                      isExpanded={isExpanded}
                      hasValidationErrors={hasValidationErrors}
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
