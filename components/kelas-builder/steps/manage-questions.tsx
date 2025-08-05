"use client";

import { useState } from "react";
import { Card, CardContent,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, CheckCircle, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Difficulty } from "@prisma/client";
import { SoalForm } from "./soal-form";

interface ManageQuestionsProps {
  koleksiIndex: number;
}

export function ManageQuestions({ koleksiIndex }: ManageQuestionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | undefined>();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const { koleksiSoals, addSoal, removeSoal } = useKelasBuilderStore();
  const koleksiSoal = koleksiSoals[koleksiIndex];

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
        <div className="space-y-2">
          {koleksiSoal.soals.map((soal, soalIndex) => {
            const isExpanded = expandedQuestions.has(soalIndex);
            return (
              <Card
                key={soal.tempId || soal.id || soalIndex}
                className="relative hover:shadow-md transition-shadow py-2 cursor-pointer"
                onClick={() => handleEditSoal(soalIndex)}
              >
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline" className="text-xs shrink-0">No. {soalIndex + 1}</Badge>
                        <p className="font-medium text-sm flex-1 line-clamp-1">
                          {soal.pertanyaan || "Untitled Question"}
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
                          {soal.opsis && soal.opsis.filter(o => o.isCorrect).length > 0 && (
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
                            toggleExpand(soalIndex);
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
                            handleRemoveSoal(soalIndex);
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
                              {soal.opsis.map((opsi, opsiIndex) => (
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
          })}
        </div>
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
