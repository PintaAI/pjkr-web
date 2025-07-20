"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Plus, Edit, Trash2, FileText, Users, Lock, Unlock } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { KoleksiSoalForm } from "./koleksi-soal-form";
import { ManageQuestions } from "./manage-questions";
import { Difficulty } from "@prisma/client";

export function StepAssessment() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();
  const [managingQuestionsIndex, setManagingQuestionsIndex] = useState<number | undefined>();
  const { koleksiSoals, removeKoleksiSoal } = useKelasBuilderStore();

  const handleCreateNew = () => {
    setEditingIndex(undefined);
    setShowCreateForm(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowCreateForm(true);
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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Assessment & Quizzes</h2>
        <p className="text-muted-foreground">
          Create and manage question collections for your course assessments.
        </p>
      </div>

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
            <Card key={koleksi.tempId || koleksi.id || index} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{koleksi.nama}</CardTitle>
                      <Badge variant={koleksi.isPrivate ? "secondary" : "default"}>
                        {koleksi.isPrivate ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Public
                          </>
                        )}
                      </Badge>
                      <Badge variant={koleksi.isDraft ? "outline" : "default"}>
                        {koleksi.isDraft ? "Draft" : "Published"}
                      </Badge>
                    </div>
                    {koleksi.deskripsi && (
                      <p className="text-sm text-muted-foreground">{koleksi.deskripsi}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageQuestions(index)}
                  >
                    Manage Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {koleksiSoals.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold">Assessment Summary</h4>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{koleksiSoals.length} collections</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>{koleksiSoals.reduce((total, koleksi) => total + koleksi.soals.length, 0)} total questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{koleksiSoals.filter(k => !k.isPrivate).length} public collections</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          />
        </DialogContent>
      </Dialog>

      {/* Manage Questions Dialog */}
      <Dialog open={managingQuestionsIndex !== undefined} onOpenChange={handleCloseManageQuestions}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Questions
            </DialogTitle>
          </DialogHeader>
          {managingQuestionsIndex !== undefined && (
            <ManageQuestions koleksiIndex={managingQuestionsIndex} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
