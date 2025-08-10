"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import NovelEditor from "@/components/novel/novel-editor";
import React from "react";

// Validation schema for soal form
const soalFormSchema = z.object({
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

type SoalFormData = z.infer<typeof soalFormSchema>;


interface SoalFormProps {
  koleksiIndex: number;
  soalIndex: number;
}

export function SoalForm({ koleksiIndex, soalIndex }: SoalFormProps) {
  const {
    koleksiSoals,
    updateSoal,
    addOpsi,
    updateOpsi,
    removeOpsi,
  } = useKelasBuilderStore();

  const soal = koleksiSoals[koleksiIndex]?.soals[soalIndex];

  const methods = useForm<SoalFormData>({
    resolver: zodResolver(soalFormSchema),
    defaultValues: {
      pertanyaan: soal?.pertanyaan || "",
      difficulty: soal?.difficulty || Difficulty.BEGINNER,
      explanation: soal?.explanation || "",
      isActive: soal?.isActive ?? true,
      opsis: soal?.opsis || [
        { opsiText: "", isCorrect: false, order: 0 },
        { opsiText: "", isCorrect: false, order: 1 },
      ],
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = methods;

  const watchedOpsis = watch("opsis");

  const handleQuestionUpdate = (content: { json: any; html: string }) => {
    setValue("pertanyaan", content.html, { shouldValidate: true });
    // Update the store directly to ensure local state is saved
    if (soal) {
      updateSoal(koleksiIndex, soalIndex, { pertanyaan: content.html });
    }
  };

  const handleExplanationUpdate = (content: { json: any; html: string }) => {
    setValue("explanation", content.html, { shouldValidate: true });
    // Update the store directly to ensure local state is saved
    if (soal) {
      updateSoal(koleksiIndex, soalIndex, { explanation: content.html });
    }
  };

  const handleDifficultyChange = (value: string) => {
    setValue("difficulty", value as Difficulty, { shouldValidate: true });
    updateSoal(koleksiIndex, soalIndex, {
      difficulty: value as Difficulty
    });
  };

  const handleActiveChange = (checked: boolean) => {
    setValue("isActive", checked, { shouldValidate: true });
    updateSoal(koleksiIndex, soalIndex, { isActive: checked });
  };



  const handleAddOpsi = () => {
    const currentOpsis = watchedOpsis || soal?.opsis || [];
    const newOpsi = {
      opsiText: "",
      isCorrect: false,
      order: currentOpsis.length,
    };
    const updatedOpsis = [...currentOpsis, newOpsi];
    setValue("opsis", updatedOpsis, { shouldValidate: true });
    addOpsi(koleksiIndex, soalIndex, newOpsi);
  };

  const handleRemoveOpsi = (opsiIndex: number) => {
    const currentOpsis = watchedOpsis || soal?.opsis || [];
    const updatedOpsis = currentOpsis.filter((_, i) => i !== opsiIndex)
      .map((opsi, index) => ({ ...opsi, order: index }));
    setValue("opsis", updatedOpsis, { shouldValidate: true });
    removeOpsi(koleksiIndex, soalIndex, opsiIndex);
  };

  const handleOpsiTextChange = (opsiIndex: number, value: string) => {
    const currentOpsis = watchedOpsis || soal?.opsis || [];
    const updatedOpsis = currentOpsis.map((opsi, index) =>
      index === opsiIndex ? { ...opsi, opsiText: value } : opsi
    );
    setValue("opsis", updatedOpsis, { shouldValidate: true });
    updateOpsi(koleksiIndex, soalIndex, opsiIndex, { opsiText: value });
  };

  const handleOpsiCorrectChange = (opsiIndex: number, isCorrect: boolean) => {
    const currentOpsis = watchedOpsis || soal?.opsis || [];
    // Create a new array with all options set to false except the selected one
    const updatedOpsis = currentOpsis.map((opsi, index) => ({
      ...opsi,
      isCorrect: index === opsiIndex ? isCorrect : false,
    }));
    
    setValue("opsis", updatedOpsis, { shouldValidate: true });
    // Update the store with all options at once
    updateSoal(koleksiIndex, soalIndex, { opsis: updatedOpsis });
  };

  const correctOpsiCount = (watchedOpsis || soal?.opsis || []).filter(opsi => opsi.isCorrect).length;

  return (
    <FormProvider {...methods}>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label>Tambah pertanyaan</Label>
          <div className="border rounded-lg">
          <NovelEditor
            initialContent={soal?.pertanyaan || null}
            onUpdate={handleQuestionUpdate}
           
            
  
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
            onValueChange={handleDifficultyChange}
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
            onCheckedChange={handleActiveChange}
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
  </FormProvider>
  );
}
