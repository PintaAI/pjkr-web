"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClipboardList, Plus, Edit, Trash2, FileText, MousePointerClick,} from "lucide-react";
import { KoleksiSoalForm } from "./question-set-form";
import { ManageQuestions } from "./manage-questions";
import { Difficulty } from "@prisma/client";

export function StepQuestions() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | undefined>();
  const [managingQuestionsId, setManagingQuestionsId] = useState<string | number | undefined>();
  // Mock data for development
  const mockKoleksiSoals = [
    {
      id: 1,
      tempId: undefined,
      nama: "Basic Math Collection",
      deskripsi: "Collection of basic mathematics questions",
      isPrivate: false,
      isDraft: false,
      soals: [
        {
          pertanyaan: "What is 2 + 2?",
          difficulty: Difficulty.BEGINNER,
          isActive: true,
          opsis: [
            { opsiText: "3", isCorrect: false, order: 1 },
            { opsiText: "4", isCorrect: true, order: 2 },
            { opsiText: "5", isCorrect: false, order: 3 }
          ]
        },
        {
          pertanyaan: "What is 10 - 5?",
          difficulty: Difficulty.BEGINNER,
          isActive: true,
          opsis: [
            { opsiText: "4", isCorrect: false, order: 1 },
            { opsiText: "5", isCorrect: true, order: 2 },
            { opsiText: "6", isCorrect: false, order: 3 }
          ]
        },
        {
          pertanyaan: "What is 15 ÷ 3?",
          difficulty: Difficulty.INTERMEDIATE,
          isActive: true,
          opsis: [
            { opsiText: "3", isCorrect: false, order: 1 },
            { opsiText: "5", isCorrect: true, order: 2 },
            { opsiText: "7", isCorrect: false, order: 3 }
          ]
        }
      ]
    },
    {
      tempId: "temp-1",
      nama: "English Grammar Test",
      deskripsi: "Grammar and vocabulary assessment",
      isPrivate: true,
      isDraft: true,
      soals: [
        {
          pertanyaan: "Choose the correct form: I ___ to school every day.",
          difficulty: Difficulty.INTERMEDIATE,
          isActive: true,
          opsis: [
            { opsiText: "go", isCorrect: true, order: 1 },
            { opsiText: "goes", isCorrect: false, order: 2 },
            { opsiText: "going", isCorrect: false, order: 3 }
          ]
        },
        {
          pertanyaan: "Identify the adjective in the sentence: The big dog barked loudly.",
          difficulty: Difficulty.INTERMEDIATE,
          isActive: true,
          opsis: [
            { opsiText: "big", isCorrect: true, order: 1 },
            { opsiText: "dog", isCorrect: false, order: 2 },
            { opsiText: "loudly", isCorrect: false, order: 3 }
          ]
        },
        {
          pertanyaan: "Which sentence uses the present perfect tense correctly?",
          difficulty: Difficulty.ADVANCED,
          isActive: true,
          opsis: [
            { opsiText: "I have finished my homework.", isCorrect: true, order: 1 },
            { opsiText: "I have finish my homework.", isCorrect: false, order: 2 },
            { opsiText: "I am finish my homework.", isCorrect: false, order: 3 }
          ]
        }
      ]
    }
  ];

  // Console log for debugging
  console.log("StepAssessment: Mock koleksi soals loaded", mockKoleksiSoals);

  const handleCreateNew = () => {
    setEditingId(undefined);
    setShowCreateForm(true);
  };

  const handleEdit = (koleksi: any) => {
    setEditingId(koleksi.id || koleksi.tempId);
    setShowCreateForm(true);
  };

  const handleFormSave = () => {
    setShowCreateForm(false);
    setEditingId(undefined);
  };

  const handleManageQuestions = (koleksi: any) => {
    setManagingQuestionsId(koleksi.id || koleksi.tempId);
  };

  const handleCloseManageQuestions = () => {
    setManagingQuestionsId(undefined);
  };

  const handleDelete = (koleksi: any) => {
    if (confirm("Are you sure you want to delete this question collection?")) {
      const id = koleksi.id || koleksi.tempId;
      console.log("StepAssessment: Deleting koleksi with id:", id);
      // Mock deletion - in real app this would call removeKoleksiSoal(id)
    }
  };

  return (
    <div className="space-y-2">

      {/* Assessment Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockKoleksiSoals.length}</div>
              <div className="text-sm text-muted-foreground">Collections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockKoleksiSoals.reduce((total, koleksi) => total + koleksi.soals.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockKoleksiSoals.filter(k => k.tempId).length}
              </div>
              <div className="text-sm text-muted-foreground">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">Question Collections ({mockKoleksiSoals.length})</span>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      </div>

      {mockKoleksiSoals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold mb-2">No Question Collections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first question collection to add assessments to your course.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockKoleksiSoals.map((koleksi) => (
            <Card
              key={koleksi.tempId || koleksi.id}
              className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              onClick={() => handleManageQuestions(koleksi)}
            >
              {/* Overlay for click instruction */}
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/10 text-foreground/50 px-3 py-2 rounded-lg">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm">Click to manage soals</span>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{koleksi.nama}</CardTitle>
                    </div>
                    {koleksi.deskripsi && (
                      <p className="text-sm text-muted-foreground">{koleksi.deskripsi}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(koleksi);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(koleksi);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{koleksi.soals.length} questions</span>
                  </div>
                  {koleksi.soals.length > 0 && (
                    <div className="flex items-center gap-2">
                      {Object.entries(
                        koleksi.soals.reduce((acc, soal) => {
                          if (soal.difficulty) {
                            acc[soal.difficulty] = (acc[soal.difficulty] || 0) + 1;
                          }
                          return acc;
                        }, {} as Record<Difficulty, number>)
                      ).map(([difficulty, count]) => (
                        <Badge
                          key={difficulty}
                          variant={
                            difficulty === Difficulty.BEGINNER ? "default" :
                            difficulty === Difficulty.INTERMEDIATE ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {difficulty}: {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Collection Create/Edit Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== undefined ? "Edit Question Collection" : "Create New Question Collection"}
            </DialogTitle>
          </DialogHeader>
          <KoleksiSoalForm
            koleksiId={editingId}
            onSave={handleFormSave}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Questions Sheet */}
      <Sheet open={managingQuestionsId !== undefined} onOpenChange={handleCloseManageQuestions}>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="px-6 py-4">
            <SheetTitle>
              Manage Questions
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            {managingQuestionsId !== undefined && (
              <ManageQuestions koleksiId={managingQuestionsId} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
