"use client";

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
  vocabSetIndex: number;
  itemIndex: number;
}

export function VocabularyItemForm({ vocabSetIndex, itemIndex }: VocabularyItemFormProps) {
  const {
    vocabSets,
    updateVocabularyItem,
  } = useKelasBuilderStore();

  const vocabSet = vocabSets[vocabSetIndex];
  const item = vocabSet?.items[itemIndex];

  const updateItem = (field: keyof VocabularyItem, value: any) => {
    updateVocabularyItem(vocabSetIndex, itemIndex, { [field]: value });
  };

  const updateExampleSentence = (sentenceIndex: number, value: string) => {
    const newExampleSentences = [...(item?.exampleSentences || [])];
    newExampleSentences[sentenceIndex] = value;
    updateVocabularyItem(vocabSetIndex, itemIndex, { exampleSentences: newExampleSentences });
  };

  const addItem = () => {
    const newExampleSentences = [...(item?.exampleSentences || []), ""];
    updateVocabularyItem(vocabSetIndex, itemIndex, { exampleSentences: newExampleSentences });
  };

  const removeItem = (sentenceIndex: number) => {
    const newExampleSentences = (item?.exampleSentences || []).filter((_, i) => i !== sentenceIndex);
    updateVocabularyItem(vocabSetIndex, itemIndex, { exampleSentences: newExampleSentences });
  };

  const currentItem = vocabSet?.items[itemIndex] || {
    korean: "",
    indonesian: "",
    type: VocabularyType.WORD,
    pos: undefined,
    audioUrl: "",
    exampleSentences: [""],
    order: itemIndex || 0,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="korean">Korean *</Label>
              <Input
                id="korean"
                value={currentItem.korean}
                onChange={(e) => {
                  updateItem("korean", e.target.value);
                }}
                placeholder="e.g., 안녕하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indonesian">Indonesian *</Label>
              <Input
                id="indonesian"
                value={currentItem.indonesian}
                onChange={(e) => {
                  updateItem("indonesian", e.target.value);
                }}
                placeholder="e.g., Halo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={currentItem.type}
                onValueChange={(value) => {
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
                value={currentItem.pos || "none"}
                onValueChange={(value) => {
                  const parsedValue = value === "none" ? undefined : (value as PartOfSpeech);
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
              value={currentItem.audioUrl}
              onChange={(e) => {
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
              {currentItem.exampleSentences.map((sentence, sentenceIndex) => (
                <div key={sentenceIndex} className="flex gap-2">
                  <Input
                    value={sentence}
                    onChange={(e) => {
                      updateExampleSentence(sentenceIndex, e.target.value);
                    }}
                    placeholder={`Example ${sentenceIndex + 1}`}
                  />
                  {currentItem.exampleSentences.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        removeItem(sentenceIndex);
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
    </div>
  );
}