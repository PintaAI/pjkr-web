"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Difficulty } from "@prisma/client";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import NovelEditor from "@/components/novel/novel-editor";

interface OpsiItem {
  id?: number | string;
  opsiText: string;
  isCorrect: boolean;
}

interface SoalItem {
  id?: number | string;
  pertanyaan: string;
  difficulty?: Difficulty | null;
  explanation?: string;
  opsis?: OpsiItem[];
}

interface SoalItemFormProps {
  item?: SoalItem;
  onSave: (item: SoalItem) => void;
  onCancel: () => void;
}

export function SoalItemForm({ item, onSave, onCancel }: SoalItemFormProps) {
  const [formData, setFormData] = useState<SoalItem>({
    id: item?.id,
    pertanyaan: item?.pertanyaan || "",
    difficulty: item?.difficulty || Difficulty.BEGINNER,
    explanation: item?.explanation || "",
    opsis: item?.opsis && item.opsis.length > 0
      ? item.opsis
      : [
          { opsiText: "", isCorrect: false },
          { opsiText: "", isCorrect: false },
          { opsiText: "", isCorrect: false },
          { opsiText: "", isCorrect: false },
        ],
  });

  const updateOpsi = (index: number, field: keyof OpsiItem, value: string | boolean) => {
    // If setting as correct, make all other options incorrect (radio button behavior)
    if (field === 'isCorrect' && value === true) {
      const updatedOpsis = formData.opsis!.map((opsi, i) => ({
        ...opsi,
        isCorrect: i === index
      }));
      setFormData({ ...formData, opsis: updatedOpsis });
    } else if (field === 'isCorrect' && value === false) {
      // If unchecking, just uncheck this one (allow no correct answer)
      const updatedOpsis = formData.opsis!.map((opsi, i) =>
        i === index ? { ...opsi, isCorrect: false } : opsi
      );
      setFormData({ ...formData, opsis: updatedOpsis });
    } else {
      // For text updates
      const updatedOpsis = formData.opsis!.map((opsi, i) =>
        i === index ? { ...opsi, [field]: value } : opsi
      );
      setFormData({ ...formData, opsis: updatedOpsis });
    }
  };

  const addOpsi = () => {
    setFormData({
      ...formData,
      opsis: [...formData.opsis!, { opsiText: "", isCorrect: false }],
    });
  };

  const removeOpsi = (index: number) => {
    if (formData.opsis!.length > 2) {
      const updatedOpsis = formData.opsis!.filter((_, i) => i !== index);
      setFormData({ ...formData, opsis: updatedOpsis });
    }
  };

  const handleQuestionUpdate = (data: { json: any; html: string }) => {
    setFormData({ ...formData, pertanyaan: data.html });
  };

  const handleExplanationUpdate = (data: { json: any; html: string }) => {
    setFormData({ ...formData, explanation: data.html });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty options
    const filteredOpsis = formData.opsis!.filter(o => o.opsiText.trim());
    const finalItem = {
      ...formData,
      opsis: filteredOpsis.length > 0 ? filteredOpsis : [],
    };
    onSave(finalItem);
  };

  // Convert HTML to JSON for initial content if editing
  const getInitialContent = (content?: string) => {
    if (content) {
      // For now, we'll use a simple text node. In a real implementation,
      // you might want to parse HTML back to JSON or store JSON separately
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: content.replace(/<[^>]*>/g, ''), // Strip HTML for initial text
              },
            ],
          },
        ],
      };
    }
    return null;
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium text-foreground flex items-center gap-2">
              Question
              <span className="text-destructive">*</span>
            </Label>
            
            {/* Compact Difficulty Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Difficulty:</span>
              <Select
                value={formData.difficulty || ""}
                onValueChange={(value) => setFormData({
                  ...formData,
                  difficulty: value as Difficulty || null
                })}
              >
                <SelectTrigger className="w-32 h-8 text-xs border-0 bg-muted/50 focus:bg-background focus:border focus:border-primary/20 transition-all">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Difficulty.BEGINNER}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs">Beginner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Difficulty.INTERMEDIATE}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-xs">Intermediate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Difficulty.ADVANCED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs">Advanced</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <NovelEditor
            initialContent={getInitialContent(item?.pertanyaan)}
            onUpdate={handleQuestionUpdate}
            className="min-h-[120px] border-0 bg-muted/30 rounded-xl focus-within:bg-background focus-within:border focus-within:border-primary/20 transition-all"
          />
        </div>

        {/* Answer Options Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium text-foreground">Answer Options</Label>
            <span className="text-sm text-muted-foreground">Select one correct answer</span>
          </div>
          
          <div className="space-y-3">
            {formData.opsis!.map((opsi, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
              
              return (
                <div
                  key={index}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                    opsi.isCorrect
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border'
                  }`}
                >
                  {/* Option Letter & Radio Button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all cursor-pointer ${
                        opsi.isCorrect
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                      }`}
                      onClick={() => updateOpsi(index, 'isCorrect', true)}
                    >
                      {opsi.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : optionLetter}
                    </div>
                  </div>

                  {/* Option Text Input */}
                  <div className="flex-1 relative">
                    <Input
                      value={opsi.opsiText}
                      onChange={(e) => updateOpsi(index, 'opsiText', e.target.value)}
                      placeholder={`Enter option ${optionLetter}`}
                      className={`w-full border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 ${
                        opsi.isCorrect ? 'font-medium' : ''
                      } ${
                        formData.opsis!.length > 2 ? 'group-hover:pr-10' : ''
                      }`}
                    />
                  </div>

                  {/* Delete Button */}
                  {formData.opsis!.length > 2 && (
                    <div className="w-0 group-hover:w-8 overflow-hidden transition-all duration-200 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOpsi(index)}
                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Option Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addOpsi}
            className="w-full h-11 border-2 border-dashed border-muted-foreground/30 bg-transparent hover:border-primary/50 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Option
          </Button>
        </div>

        {/* Explanation Section */}
        <div className="space-y-3">
          <Label className="text-lg font-medium text-foreground">Explanation</Label>
          <p className="text-sm text-muted-foreground">Provide additional context or reasoning for the correct answer</p>
          <NovelEditor
            initialContent={getInitialContent(item?.explanation)}
            onUpdate={handleExplanationUpdate}
            className="min-h-[100px] border-0 bg-muted/30 rounded-xl focus-within:bg-background focus-within:border focus-within:border-primary/20 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            {item ? "Update Question" : "Create Question"}
          </Button>
        </div>
      </form>
    </div>
  );
}