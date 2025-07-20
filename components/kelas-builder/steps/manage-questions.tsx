"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Difficulty } from "@prisma/client";
import { SoalForm } from "./soal-form";

interface ManageQuestionsProps {
  koleksiIndex: number;
}

export function ManageQuestions({ koleksiIndex }: ManageQuestionsProps) {
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
  };

  const handleRemoveSoal = (soalIndex: number) => {
    removeSoal(koleksiIndex, soalIndex);
  };

  if (!koleksiSoal) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="space-y-4">
          {koleksiSoal.soals.map((soal, soalIndex) => (
            <Card key={soal.tempId || soal.id || soalIndex} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Q{soalIndex + 1}</Badge>
                    {soal.difficulty && (
                      <Badge variant={
                        soal.difficulty === Difficulty.BEGINNER ? "default" :
                        soal.difficulty === Difficulty.INTERMEDIATE ? "secondary" : "destructive"
                      }>
                        {soal.difficulty}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSoal(soalIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SoalForm
                  koleksiIndex={koleksiIndex}
                  soalIndex={soalIndex}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
