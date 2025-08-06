"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { VocabularyType, PartOfSpeech } from "@prisma/client";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";

interface VocabularyItem {
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
}

interface VocabularyItemFormProps {
  item?: VocabularyItem;
  onSave: (data: VocabularyItem) => void;
  onCancel: () => void;
}

export function VocabularyItemForm({ item, onSave, onCancel }: VocabularyItemFormProps) {
  const [formData, setFormData] = useState<VocabularyItem>({
    korean: item?.korean || "",
    indonesian: item?.indonesian || "",
    type: item?.type || VocabularyType.WORD,
    pos: item?.pos,
    audioUrl: item?.audioUrl || "",
    exampleSentences: item?.exampleSentences || [""],
    order: item?.order || 0,
  });

  // Define validation schema
  const VocabularyItemSchema = z.object({
    korean: z.string().min(1, "Korean word is required"),
    indonesian: z.string().min(1, "Indonesian translation is required"),
    type: z.nativeEnum(VocabularyType).default(VocabularyType.WORD),
    pos: z.nativeEnum(PartOfSpeech).optional(),
    audioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    exampleSentences: z.array(z.string()).default([]),
  });

  const { setError } = useKelasBuilderStore();

  const form = useForm({
    resolver: zodResolver(VocabularyItemSchema),
    defaultValues: formData,
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      exampleSentences: [...prev.exampleSentences, ""],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exampleSentences: prev.exampleSentences.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (field: keyof VocabularyItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExampleSentence = (sentenceIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      exampleSentences: prev.exampleSentences.map((sentence, j) =>
        j === sentenceIndex ? value : sentence
      ),
    }));
  };

  const onSubmit = (data: any) => {
    try {
      onSave(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save vocabulary item");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="korean">Korean *</Label>
              <Input
                id="korean"
                {...form.register("korean")}
                value={form.watch("korean")}
                onChange={(e) => {
                  form.setValue("korean", e.target.value);
                  updateItem("korean", e.target.value);
                }}
                placeholder="e.g., 안녕하세요"
                className={form.formState.errors.korean ? "border-destructive" : ""}
              />
              {form.formState.errors.korean && (
                <p className="text-sm text-destructive">{form.formState.errors.korean.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indonesian">Indonesian *</Label>
              <Input
                id="indonesian"
                {...form.register("indonesian")}
                value={form.watch("indonesian")}
                onChange={(e) => {
                  form.setValue("indonesian", e.target.value);
                  updateItem("indonesian", e.target.value);
                }}
                placeholder="e.g., Halo"
                className={form.formState.errors.indonesian ? "border-destructive" : ""}
              />
              {form.formState.errors.indonesian && (
                <p className="text-sm text-destructive">{form.formState.errors.indonesian.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => {
                  form.setValue("type", value as VocabularyType);
                  updateItem("type", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VocabularyType.WORD}>Word</SelectItem>
                  <SelectItem value={VocabularyType.SENTENCE}>Sentence</SelectItem>
                  <SelectItem value={VocabularyType.IDIOM}>Idiom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pos">Part of Speech</Label>
              <Select
                value={form.watch("pos") || "none"}
                onValueChange={(value) => {
                  const parsedValue = value === "none" ? undefined : (value as PartOfSpeech);
                  form.setValue("pos", parsedValue);
                  updateItem("pos", parsedValue);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">pilih...</SelectItem>
                  <SelectItem value={PartOfSpeech.KATA_KERJA}>Verb</SelectItem>
                  <SelectItem value={PartOfSpeech.KATA_BENDA}>Noun</SelectItem>
                  <SelectItem value={PartOfSpeech.KATA_SIFAT}>Adjective</SelectItem>
                  <SelectItem value={PartOfSpeech.KATA_KETERANGAN}>Adverb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio URL (optional)</Label>
            <Input
              id="audio"
              {...form.register("audioUrl")}
              value={form.watch("audioUrl")}
              onChange={(e) => {
                form.setValue("audioUrl", e.target.value);
                updateItem("audioUrl", e.target.value);
              }}
              placeholder="https://example.com/audio.mp3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Example Sentences</Label>
              <Button
                type="button"
                onClick={addItem}
                variant="ghost"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Example
              </Button>
            </div>
            <div className="space-y-2">
              {formData.exampleSentences.map((sentence, sentenceIndex) => (
                <div key={sentenceIndex} className="flex gap-2">
                  <Input
                    value={sentence}
                    onChange={(e) => {
                      updateExampleSentence(sentenceIndex, e.target.value);
                      form.setValue("exampleSentences", [
                        ...formData.exampleSentences.map((s, i) =>
                          i === sentenceIndex ? e.target.value : s
                        )
                      ]);
                    }}
                    placeholder={`Example ${sentenceIndex + 1}`}
                  />
                  {formData.exampleSentences.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        removeItem(sentenceIndex);
                        form.setValue("exampleSentences", [
                          ...formData.exampleSentences.filter((_, i) => i !== sentenceIndex)
                        ]);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </div>
  );
}