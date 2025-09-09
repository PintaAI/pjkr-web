"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Difficulty } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";

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
    difficulty: item?.difficulty || null,
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
    const updatedOpsis = [...formData.opsis!];
    updatedOpsis[index] = { ...updatedOpsis[index], [field]: value };
    setFormData({ ...formData, opsis: updatedOpsis });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="pertanyaan">Question *</Label>
        <Textarea
          id="pertanyaan"
          value={formData.pertanyaan}
          onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
          placeholder="Enter the question text"
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={formData.difficulty || ""}
            onChange={(e) => setFormData({
              ...formData,
              difficulty: e.target.value as Difficulty || null
            })}
          >
            <option value="">Select difficulty</option>
            <option value={Difficulty.BEGINNER}>Beginner</option>
            <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
            <option value={Difficulty.ADVANCED}>Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={formData.explanation || ""}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Provide an explanation for the correct answer"
          rows={2}
        />
      </div>

      <div>
        <Label>Answer Options</Label>
        <div className="space-y-3 mt-2">
          {formData.opsis!.map((opsi, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`correct-${index}`}
                  checked={opsi.isCorrect}
                  onCheckedChange={(checked) => updateOpsi(index, 'isCorrect', checked as boolean)}
                />
                <Label htmlFor={`correct-${index}`} className="text-sm font-medium">
                  Correct
                </Label>
              </div>
              <Input
                value={opsi.opsiText}
                onChange={(e) => updateOpsi(index, 'opsiText', e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {formData.opsis!.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOpsi(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOpsi}
          className="mt-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item ? "Update" : "Add"} Question
        </Button>
      </div>
    </form>
  );
}