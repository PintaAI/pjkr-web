"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { VocabularyType, PartOfSpeech } from "@prisma/client";

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
  // Mock data for vocabulary sets
  const mockVocabSets = [
    {
      id: 1,
      tempId: "temp-1",
      title: "Basic Greetings",
      description: "Common Korean greetings and introductions",
      icon: "FaBook",
      isPublic: true,
      items: [
        {
          id: 1,
          tempId: "temp-1-1",
          korean: "안녕하세요",
          indonesian: "Halo",
          type: VocabularyType.WORD,
          pos: PartOfSpeech.KATA_BENDA,
          audioUrl: "",
          order: 0,
          exampleSentences: ["안녕하세요, 만나서 반갑습니다."]
        },
        {
          id: 2,
          tempId: "temp-1-2",
          korean: "감사합니다",
          indonesian: "Terima kasih",
          type: VocabularyType.WORD,
          pos: PartOfSpeech.KATA_BENDA,
          audioUrl: "",
          order: 1,
          exampleSentences: ["감사합니다 도움을 주셔서."]
        }
      ]
    },
    {
      id: 2,
      tempId: "temp-2",
      title: "Food Vocabulary",
      description: "Common Korean food terms",
      icon: "FaUtensils",
      isPublic: true,
      items: [
        {
          id: 3,
          tempId: "temp-2-1",
          korean: "밥",
          indonesian: "Nasi",
          type: VocabularyType.WORD,
          pos: PartOfSpeech.KATA_BENDA,
          audioUrl: "",
          order: 0,
          exampleSentences: ["저는 밥을 먹고 싶어요."]
        },
        {
          id: 4,
          tempId: "temp-2-2",
          korean: "김치",
          indonesian: "Kimchi",
          type: VocabularyType.WORD,
          pos: PartOfSpeech.KATA_BENDA,
          audioUrl: "",
          order: 1,
          exampleSentences: ["김치는 한국의 전통 음식입니다."]
        }
      ]
    }
  ];

  // Find the specific vocabulary set
  const vocabSet = mockVocabSets.find(vs => vs.id === vocabSetId || vs.tempId === vocabSetId);

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
    // Mock update - in real app this would call updateVocabularyItem from store
    console.log("Mock update item:", { vocabSetId, itemId, field, value });
  };

  const updateExampleSentence = (sentenceIndex: number, value: string) => {
    const newExampleSentences = [...(item.exampleSentences || [])];
    newExampleSentences[sentenceIndex] = value;
    // Mock update - in real app this would call updateVocabularyItem from store
    console.log("Mock update example sentence:", { vocabSetId, itemId, sentenceIndex, value });
  };

  const addItem = () => {
    const newExampleSentences = [...(item.exampleSentences || []), ""];
    // Mock update - in real app this would call updateVocabularyItem from store
    console.log("Mock add example sentence:", { vocabSetId, itemId, newExampleSentences });
  };

  const removeItem = (sentenceIndex: number) => {
    const newExampleSentences = (item.exampleSentences || []).filter((_, i) => i !== sentenceIndex);
    // Mock update - in real app this would call updateVocabularyItem from store
    console.log("Mock remove example sentence:", { vocabSetId, itemId, sentenceIndex, newExampleSentences });
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