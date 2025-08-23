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
  vocabSetId: string | number;
  itemId: string;
}

export function VocabularyItemForm({ vocabSetId, itemId }: VocabularyItemFormProps) {
  const {
    updateVocabularyItem,
  } = useKelasBuilderStore();

  // Get the specific vocabulary set reactively using Zustand selector
  const vocabSet = useKelasBuilderStore((state) => {
    return state.vocabSets.find(vs => vs.id === vocabSetId || vs.tempId === vocabSetId);
  });

  // Find the item directly by ID or temp ID
  const item = vocabSet?.items.find(item => (item.id?.toString() === itemId) || (item.tempId === itemId));

  // Error handling for missing item
  if (!vocabSet) {
    return <div>Error: Vocabulary set not found</div>;
  }

  if (!item) {
    return <div>Error: Vocabulary item not found. This might be a new item that needs to be saved first.</div>;
  }

  const updateItem = (field: keyof VocabularyItem, value: any) => {
    updateVocabularyItem(vocabSetId, itemId, { [field]: value });
  };

  const updateExampleSentence = (sentenceIndex: number, value: string) => {
    const newExampleSentences = [...(item.exampleSentences || [])];
    newExampleSentences[sentenceIndex] = value;
    updateVocabularyItem(vocabSetId, itemId, { exampleSentences: newExampleSentences });
  };

  const addItem = () => {
    const newExampleSentences = [...(item.exampleSentences || []), ""];
    updateVocabularyItem(vocabSetId, itemId, { exampleSentences: newExampleSentences });
  };

  const removeItem = (sentenceIndex: number) => {
    const newExampleSentences = (item.exampleSentences || []).filter((_, i) => i !== sentenceIndex);
    updateVocabularyItem(vocabSetId, itemId, { exampleSentences: newExampleSentences });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="korean">Korean *</Label>
              <Input
                id="korean"
                value={item.korean || ""}
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
                value={item.indonesian || ""}
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
                value={item.type}
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
                value={item.pos || "none"}
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
              value={item.audioUrl || ""}
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
              {item.exampleSentences.map((sentence: string, sentenceIndex: number) => (
                <div key={sentenceIndex} className="flex gap-2">
                  <Input
                    value={sentence || ""}
                    onChange={(e) => {
                      updateExampleSentence(sentenceIndex, e.target.value);
                    }}
                    placeholder={`Example ${sentenceIndex + 1}`}
                  />
                  {item.exampleSentences.length > 1 && (
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