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
    updateVocabularySet,
    saveVocabularySet,
    setIsDirty,
  } = useKelasBuilderStore();

  const vocabSet = vocabSets[vocabSetIndex];
  const item = vocabSet?.items[itemIndex];


  const addItem = () => {
    const currentItems = vocabSet?.items || [];
    const newItems = [...currentItems];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      exampleSentences: [...(newItems[itemIndex]?.exampleSentences || []), ""],
    };
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: newItems,
    });
  };

  const removeItem = (sentenceIndex: number) => {
    const currentItems = vocabSet?.items || [];
    const newItems = [...currentItems];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      exampleSentences: newItems[itemIndex]?.exampleSentences.filter((_, i) => i !== sentenceIndex) || [],
    };
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: newItems,
    });
  };

  const updateItem = (field: keyof VocabularyItem, value: any) => {
    const currentItems = vocabSet?.items || [];
    const newItems = [...currentItems];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [field]: value,
    };
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: newItems,
    });
  };

  const updateExampleSentence = (sentenceIndex: number, value: string) => {
    const currentItems = vocabSet?.items || [];
    const newItems = [...currentItems];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      exampleSentences: newItems[itemIndex]?.exampleSentences.map((sentence, j) =>
        j === sentenceIndex ? value : sentence
      ) || [],
    };
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: newItems,
    });
  };

  // Handle real-time updates without form submission
  const handleFormChange = () => {
    // Get current form data from the currentItem
    const formData = {
      ...currentItem,
      order: itemIndex,
    };
    
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: vocabSet.items.map((i, idx) =>
        idx === itemIndex ? formData : i
      ),
    });
    
    // Mark as dirty to trigger save button
    setIsDirty(true);
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
                  handleFormChange();
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
                  handleFormChange();
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
                  handleFormChange();
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
                  handleFormChange();
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
                handleFormChange();
              }}
              placeholder="https://example.com/audio.mp3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Example Sentences</Label>
              <Button
                type="button"
                onClick={() => {
                  addItem();
                  handleFormChange();
                }}
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
                      handleFormChange();
                    }}
                    placeholder={`Example ${sentenceIndex + 1}`}
                  />
                  {currentItem.exampleSentences.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        removeItem(sentenceIndex);
                        handleFormChange();
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