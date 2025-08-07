"use client";

import { useForm } from "react-hook-form";
import { Card,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Difficulty } from "@prisma/client";
import { NovelEditor } from "@/components/novel/novel-editor";
import React from "react";

interface SoalFormProps {
  koleksiIndex: number;
  soalIndex: number;
}

export function SoalForm({ koleksiIndex, soalIndex }: SoalFormProps) {
  const {
    koleksiSoals,
    updateSoal,
    saveSoal,
    addOpsi,
    updateOpsi,
    removeOpsi
  } = useKelasBuilderStore();

  const soal = koleksiSoals[koleksiIndex]?.soals[soalIndex];

  const {
  
    handleSubmit,
    
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: soal || {
      pertanyaan: "",
      difficulty: Difficulty.BEGINNER,
      explanation: "",
      isActive: true,
      opsis: [],
    },
    mode: "onChange",
  });



  const handleQuestionUpdate = (content: { json: any; html: string }) => {
    setValue("pertanyaan", content.html);
    // Update the store directly to ensure local state is saved
    if (soal) {
      updateSoal(koleksiIndex, soalIndex, { pertanyaan: content.html });
    }
  };

  const handleExplanationUpdate = (content: { json: any; html: string }) => {
    setValue("explanation", content.html);
    // Update the store directly to ensure local state is saved
    if (soal) {
      updateSoal(koleksiIndex, soalIndex, { explanation: content.html });
    }
  };

  const onSubmit = async (data: any) => {
    updateSoal(koleksiIndex, soalIndex, data);
    
    // Save the updated question to database
    try {
      await saveSoal(koleksiIndex, soalIndex);
    } catch (error) {
      console.error('Failed to save question:', error);
      // Don't prevent the form submission even if save fails
      // User can try again later
    }
  };

  const handleAddOpsi = () => {
    const currentOpsis = soal?.opsis || [];
    addOpsi(koleksiIndex, soalIndex, {
      opsiText: "",
      isCorrect: false,
      order: currentOpsis.length,
    });
  };

  const handleRemoveOpsi = (opsiIndex: number) => {
    removeOpsi(koleksiIndex, soalIndex, opsiIndex);
  };

  const handleOpsiTextChange = (opsiIndex: number, value: string) => {
    updateOpsi(koleksiIndex, soalIndex, opsiIndex, { opsiText: value });
  };

  const handleOpsiCorrectChange = (opsiIndex: number, isCorrect: boolean) => {
    // First, set all options to false
    soal?.opsis.forEach((_, index) => {
      updateOpsi(koleksiIndex, soalIndex, index, { isCorrect: false });
    });
    // Then set the selected one to true
    updateOpsi(koleksiIndex, soalIndex, opsiIndex, { isCorrect });
  };

  const correctOpsiCount = soal?.opsis.filter(opsi => opsi.isCorrect).length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Question *</Label>
        <div className="border rounded-lg">
          <NovelEditor
            initialContent={soal?.pertanyaan || null}
            onUpdate={handleQuestionUpdate}
            placeholder="Enter your question here..."
            height="min-h-[150px] "
            width="w-full"
            compact={true}
            hideSaveStatus={true}
          />
        </div>
        {errors.pertanyaan && (
          <p className="text-sm text-destructive">{errors.pertanyaan.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={soal?.difficulty || Difficulty.BEGINNER}
            onValueChange={(value) =>
              updateSoal(koleksiIndex, soalIndex, {
                difficulty: value as Difficulty | undefined
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={soal?.isActive ?? true}
            onCheckedChange={(checked) =>
              updateSoal(koleksiIndex, soalIndex, { isActive: checked })
            }
          />
          <Label htmlFor="isActive">Active Question</Label>
        </div>
      </div>



      {/* Answer Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Answer Options</Label>
          <div className="flex items-center gap-2">
            {correctOpsiCount !== 1 && (
              <Badge variant="destructive" className="text-xs">
                {correctOpsiCount === 0 ? "No correct answer" : "Multiple correct answers"}
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOpsi}
              disabled={(soal?.opsis.length || 0) >= 5}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
        </div>

        {soal?.opsis && soal.opsis.length > 0 ? (
          <div className="space-y-2">
            {soal.opsis.map((opsi, opsiIndex) => (
              <Card key={opsi.tempId || opsi.id || opsiIndex} className="p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs min-w-8">
                    {String.fromCharCode(65 + opsiIndex)}
                  </Badge>
                  
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + opsiIndex)}`}
                      value={opsi.opsiText}
                      onChange={(e) => handleOpsiTextChange(opsiIndex, e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpsiCorrectChange(opsiIndex, !opsi.isCorrect)}
                    className={opsi.isCorrect ? "text-green-600" : "text-muted-foreground"}
                  >
                    {opsi.isCorrect ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOpsi(opsiIndex)}
                    disabled={soal.opsis.length <= 2}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <p>No options added yet. Add at least 2 options.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOpsi}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Option
            </Button>
          </div>
        )}

        {errors.opsis && (
          <p className="text-sm text-destructive">{errors.opsis.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Explanation (Optional)</Label>
        <div className="border rounded-lg">
          <NovelEditor
            initialContent={soal?.explanation || null}
            onUpdate={handleExplanationUpdate}
            placeholder="Explain the correct answer here..."
            height="min-h-[150px] max-h-[800px]"
            width="w-full"
            compact={true}
            hideSaveStatus={true}
          />
        </div>
        {errors.explanation && (
          <p className="text-sm text-destructive">{errors.explanation.message}</p>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• Click the circle icon to mark the correct answer</p>
        <p>• Exactly one option must be marked as correct</p>
        <p>• Minimum 2 options, maximum 5 options</p>
      </div>
    </form>
  );
}
