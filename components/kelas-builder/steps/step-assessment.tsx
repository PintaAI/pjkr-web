"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClipboardList, Plus, Edit, Trash2, FileText, MousePointerClick,} from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { KoleksiSoalForm } from "./koleksi-soal-form";
import { ManageQuestions } from "./manage-questions";
import { Difficulty } from "@prisma/client";

export function StepAssessment() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();
  const [managingQuestionsIndex, setManagingQuestionsIndex] = useState<number | undefined>();
  const {
    koleksiSoals,
    removeKoleksiSoal,
    setIsDirty
  } = useKelasBuilderStore();

  const handleCreateNew = () => {
    setEditingIndex(undefined);
    setShowCreateForm(true);
    setIsDirty(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowCreateForm(true);
    setIsDirty(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingIndex(undefined);
  };

  const handleManageQuestions = (index: number) => {
    setManagingQuestionsIndex(index);
  };

  const handleCloseManageQuestions = () => {
    setManagingQuestionsIndex(undefined);
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this question collection?")) {
      removeKoleksiSoal(index);
    }
  };

  return (
    <div className="space-y-6">

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
              <div className="text-2xl font-bold text-primary">{koleksiSoals.length}</div>
              <div className="text-sm text-muted-foreground">Collections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {koleksiSoals.reduce((total, koleksi) => total + koleksi.soals.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {koleksiSoals.filter(k => k.tempId).length}
              </div>
              <div className="text-sm text-muted-foreground">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">Question Collections ({koleksiSoals.length})</span>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      </div>

      {koleksiSoals.length === 0 ? (
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
          {koleksiSoals.map((koleksi, index) => (
            <Card
              key={koleksi.tempId || koleksi.id || index}
              className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              onClick={() => handleManageQuestions(index)}
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
                        handleEdit(index);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
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
              {editingIndex !== undefined ? "Edit Question Collection" : "Create New Question Collection"}
            </DialogTitle>
          </DialogHeader>
          <KoleksiSoalForm
            koleksiIndex={editingIndex}
            onCancel={handleCancel}
            onSave={() => setIsDirty(true)}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Questions Sheet */}
      <Sheet open={managingQuestionsIndex !== undefined} onOpenChange={handleCloseManageQuestions}>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="px-6 py-4">
            <SheetTitle>
              Manage Questions
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            {managingQuestionsIndex !== undefined && (
              <ManageQuestions koleksiIndex={managingQuestionsIndex} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
