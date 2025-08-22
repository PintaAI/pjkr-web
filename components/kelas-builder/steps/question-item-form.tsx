"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider, Controller, useFieldArray } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, Circle,} from "lucide-react";
import { Difficulty } from "@prisma/client";
import NovelEditor from "@/components/novel/novel-editor";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { toast } from "sonner";

type SoalFormData = {
  pertanyaan: string;
  difficulty: Difficulty;
  explanation?: string;
  isActive: boolean;
  opsis: Array<{
    opsiText: string;
    isCorrect: boolean;
    order: number;
  }>;
};

interface SoalFormProps {
  koleksiId: number | string;
  soalId?: number | string;
  onClose: () => void;
}

export function SoalForm({ koleksiId, soalId, onClose }: SoalFormProps) {
  const { koleksiSoals, updateSoal, addOpsi, updateOpsi, removeOpsi, saveAllAssessments } = useKelasBuilderStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the current soal data
  const koleksiSoal = koleksiSoals.find(k => k.id === koleksiId || k.tempId === koleksiId);
  const currentSoal = soalId ? koleksiSoal?.soals.find(s => s.id === soalId || s.tempId === soalId) : null;
  
  // Determine if editing: soal has a real ID (number) vs temp ID (string)
  const isNewQuestion = !!currentSoal && !!currentSoal.tempId; // Has tempId = new question
  const isEditing = !!currentSoal && !isNewQuestion; // Has real ID = editing existing
  
  const methods = useForm<SoalFormData>({
    defaultValues: {
      pertanyaan: "",
      difficulty: Difficulty.BEGINNER,
      explanation: "",
      isActive: true,
      opsis: [
        { opsiText: "", isCorrect: false, order: 0 },
        { opsiText: "", isCorrect: false, order: 1 },
      ],
    },
    mode: "onChange",
  });

  const { control, watch, setValue, handleSubmit, reset } = methods;
  
  // Load existing soal data when editing or creating new question
  useEffect(() => {
    if (currentSoal) {
      const formData: SoalFormData = {
        pertanyaan: currentSoal.pertanyaan || "",
        difficulty: currentSoal.difficulty || Difficulty.BEGINNER,
        explanation: currentSoal.explanation || "",
        isActive: currentSoal.isActive ?? true,
        opsis: currentSoal.opsis?.map((opsi, index) => ({
          opsiText: opsi.opsiText || "",
          isCorrect: opsi.isCorrect || false,
          order: opsi.order ?? index,
        })) || [
          { opsiText: "", isCorrect: false, order: 0 },
          { opsiText: "", isCorrect: false, order: 1 },
        ],
      };
      reset(formData);
    }
  }, [currentSoal, reset]);
  const { fields, append, remove } = useFieldArray({ 
    control, 
    name: "opsis", 
    keyName: "_fieldId" 
  });

  // Watch form values
  const formValues = watch();

  // Handlers
  const handleQuestionUpdate = (content: { json: any; html: string }) => {
    setValue("pertanyaan", content.html);
  };

  const handleExplanationUpdate = (content: { json: any; html: string }) => {
    setValue("explanation", content.html);
  };

  const handleAddOpsi = () => {
    append({
      opsiText: "",
      isCorrect: false,
      order: fields.length,
    });
  };

  const handleRemoveOpsi = (index: number) => {
    if (fields.length <= 2) return;
    remove(index);
  };

  const handleOpsiCorrectChange = (index: number, isCorrect: boolean) => {
    const currentOpsis = formValues.opsis;
    const updatedOpsis = currentOpsis.map((opsi, i) => ({
      ...opsi,
      isCorrect: i === index ? isCorrect : false,
    }));
    setValue("opsis", updatedOpsis);
  };

  // Save function that updates store and syncs to database
  const saveChanges = useCallback(async (data: SoalFormData) => {
    if (!koleksiId || !soalId) return;
    
    try {
      setIsLoading(true);
      
      // Update the soal basic info in the store (without opsis)
      updateSoal(koleksiId, soalId, {
        pertanyaan: data.pertanyaan,
        difficulty: data.difficulty,
        explanation: data.explanation,
        isActive: data.isActive,
      });
      
      // Update opsis individually to ensure proper tracking
      if (currentSoal) {
        // Get current opsis from store
        const currentOpsis = currentSoal.opsis || [];
        
        // Update existing opsis and add new ones
        data.opsis.forEach((formOpsi, index) => {
          const existingOpsi = currentOpsis[index];
          
          if (existingOpsi) {
            // Update existing opsi
            const opsiId = existingOpsi.tempId || existingOpsi.id;
            if (opsiId) {
              updateOpsi(koleksiId, soalId, opsiId, {
                opsiText: formOpsi.opsiText,
                isCorrect: formOpsi.isCorrect,
                order: index,
              });
            }
          } else {
            // Add new opsi
            addOpsi(koleksiId, soalId, {
              opsiText: formOpsi.opsiText,
              isCorrect: formOpsi.isCorrect,
              order: index,
            });
          }
        });
        
        // Remove opsis that are no longer in the form
        if (currentOpsis.length > data.opsis.length) {
          for (let i = data.opsis.length; i < currentOpsis.length; i++) {
            const opsiToRemove = currentOpsis[i];
            const opsiId = opsiToRemove.tempId || opsiToRemove.id;
            if (opsiId) {
              removeOpsi(koleksiId, soalId, opsiId);
            }
          }
        }
      }
      
      // Save to database
      await saveAllAssessments();
      
      console.log("Question saved to database");
    } catch (error) {
      console.error("Failed to save question:", error);
      toast.error("Failed to save question");
    } finally {
      setIsLoading(false);
    }
  }, [koleksiId, soalId, updateSoal, currentSoal, updateOpsi, addOpsi, removeOpsi, saveAllAssessments]);

  // Watch form values and update store immediately (no database save)
  useEffect(() => {
    if (soalId) {
      const subscription = watch((data) => {
        // Only update store, no database save
        if (koleksiId && soalId) {
          updateSoal(koleksiId, soalId, {
            pertanyaan: data.pertanyaan,
            difficulty: data.difficulty,
            explanation: data.explanation,
            isActive: data.isActive,
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, koleksiId, soalId, updateSoal]);

  // UI helpers
  const correctOpsiCount = formValues.opsis?.filter(opsi => opsi.isCorrect).length ?? 0;

  return (
    <FormProvider {...methods}>
      <form className="space-y-4">
        {/* Save Status */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isNewQuestion ? 'Creating New Question' : isEditing ? 'Editing Question' : 'Question Form'}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                Auto-saving...
              </div>
            )}
            <Badge variant={isNewQuestion ? "default" : isEditing ? "secondary" : "outline"} className="text-xs">
              {isNewQuestion ? "Create Mode" : isEditing ? "Edit Mode" : "Form"}
            </Badge>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <div className="border rounded-lg">
            <NovelEditor
              initialContent={currentSoal?.pertanyaan || null}
              onUpdate={handleQuestionUpdate}
              saveStatus="Unsaved"
            />
          </div>
        </div>

        {/* Difficulty and Active Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Difficulty.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={Difficulty.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={Difficulty.ADVANCED}>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
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
                disabled={fields.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <Card key={field._fieldId} className="p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs min-w-8">
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  
                  <div className="flex-1">
                    <Controller
                      name={`opsis.${index}.opsiText`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="text-sm"
                        />
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const currentValue = formValues.opsis[index]?.isCorrect ?? false;
                      handleOpsiCorrectChange(index, !currentValue);
                    }}
                    className={formValues.opsis[index]?.isCorrect ? "text-green-600" : "text-muted-foreground"}
                  >
                    {formValues.opsis[index]?.isCorrect ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOpsi(index)}
                    disabled={fields.length <= 2}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label>Explanation (Optional)</Label>
          <div className="border rounded-lg">
            <NovelEditor
              initialContent={currentSoal?.explanation || null}
              onUpdate={handleExplanationUpdate}
              saveStatus="Unsaved"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>• Click the circle icon to mark the correct answer</p>
            <p>• Changes are saved when you close the form</p>
          </div>
          <Button
            type="button"
            onClick={async () => {
              const currentData = watch();
              if (currentData && soalId) {
                await saveChanges(currentData);
              }
              onClose();
            }}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Close"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
