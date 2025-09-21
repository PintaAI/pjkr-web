"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveVocabularySet } from "@/app/actions/kelas/vocabulary";
import { VocabularyType, PartOfSpeech } from "@prisma/client";
import { VocabItemList } from "./vocab-item-list";
import { VocabItemForm } from "./vocab-item-form";
import { IconPicker, } from "@/components/shared/icon-picker";
import { z } from "zod";

const vocabularyItemSchema = z.object({
  korean: z.string().min(1, "Korean text is required"),
  indonesian: z.string().min(1, "Indonesian translation is required"),
  type: z.enum(["WORD", "SENTENCE", "IDIOM"]),
  korean_example_sentence: z.string().min(1, "Korean example sentence is required"),
  indonesian_example_sentence: z.string().min(1, "Indonesian example sentence is required")
});

const vocabularyItemsSchema = z.array(vocabularyItemSchema).min(1).max(10);

type GeneratedVocabularyItem = z.infer<typeof vocabularyItemSchema>;

interface VocabItem {
  id?: number | string;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences: string[];
}

interface VocabCollectionFormProps {
  vocabSet?: any; // For edit mode data (includes id)
  kelasId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}


export function VocabCollectionForm({ vocabSet, kelasId, onSuccess, onCancel }: VocabCollectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FaBookOpen",
    isPublic: false,
  });
  const [items, setItems] = useState<VocabItem[]>([
    {
      korean: "",
      indonesian: "",
      type: VocabularyType.WORD,
      exampleSentences: [""],
    },
  ]);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (vocabSet) {
      setLoading(true);
      // Populate form with existing data
      setFormData({
        title: vocabSet.title || "",
        description: vocabSet.description || "",
        icon: vocabSet.icon || "FaBookOpen",
        isPublic: vocabSet.isPublic || false,
      });

      // Populate items with existing data
      if (vocabSet.items && vocabSet.items.length > 0) {
        const existingItems = vocabSet.items.map((item: any) => ({
          id: item.id,
          korean: item.korean || "",
          indonesian: item.indonesian || "",
          type: item.type || VocabularyType.WORD,
          pos: item.pos,
          audioUrl: item.audioUrl,
          exampleSentences: item.exampleSentences && item.exampleSentences.length > 0
            ? item.exampleSentences
            : [""],
        }));
        setItems(existingItems);
      }

      setLoading(false);
    }
  }, [vocabSet]);


  const handleAddItem = () => {
    setEditingItemIndex(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSaveItem = (itemData: VocabItem) => {
    if (editingItemIndex !== null) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = itemData;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, itemData]);
    }
    setItemDialogOpen(false);
    setEditingItemIndex(null);
  };

  const handleCancelItem = () => {
    setItemDialogOpen(false);
    setEditingItemIndex(null);
  };

  const handleQuickAdd = (korean: string, indonesian: string) => {
    if (!korean.trim() || !indonesian.trim()) return;
    const newItem: VocabItem = {
      korean: korean.trim(),
      indonesian: indonesian.trim(),
      type: VocabularyType.WORD,
      exampleSentences: [""],
    };
    setItems([...items, newItem]);
  };

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Based on the title '${formData.title}' and description '${formData.description || ''}', generate 5 vocabulary words in Korean with their Indonesian translations, types, and example sentences.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'vocabulary',
          existingItems: items,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedData = await response.json();
      
      try {
        const validatedItems = vocabularyItemsSchema.parse(generatedData);
        
        const newItems: VocabItem[] = validatedItems.map((item: GeneratedVocabularyItem) => ({
          korean: item.korean,
          indonesian: item.indonesian,
          type: item.type as VocabularyType,
          exampleSentences: [item.korean_example_sentence],
        }));
        
        setItems((prev) => [...prev, ...newItems]);
      } catch (validationError) {
        console.error('Generated data validation failed:', validationError);
        // Fallback to old parsing method if validation fails
        const generated: any[] = Array.isArray(generatedData) ? generatedData : [];
        const newItems: VocabItem[] = generated.map((item) => {
          const rawType = (item?.type ?? "").toString();
          const normalized = rawType.toUpperCase();
          const allowedTypes = ["WORD", "SENTENCE", "IDIOM"];
          const type = allowedTypes.includes(normalized) ? (normalized as VocabularyType) : VocabularyType.WORD;
          
          const example =
            item?.korean_example_sentence ??
            item?.koreanExampleSentence ??
            item?.example_sentence ??
            "";
          
          return {
            korean: item?.korean ?? "",
            indonesian: item?.indonesian ?? "",
            type,
            exampleSentences: example ? [example] : [""],
          } as VocabItem;
        });
        
        setItems((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Error generating vocabulary items:', error);
      // TODO: Show error toast
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty items
      const validItems = items.filter(item => item.korean.trim() && item.indonesian.trim());

      const result = await saveVocabularySet(kelasId || null, {
        title: formData.title,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        isPublic: formData.isPublic,
        items: validItems,
      }, vocabSet?.id);

      if (result.success) {
        onSuccess?.();
      } else {
        console.error("Failed to save:", result.error);
      }
    } catch (error) {
      console.error("Error saving vocabulary set:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl pt-0 mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-1 border border-dashed border-primary hover:border-gray-400 transition-colors">
              <IconPicker
                value={formData.icon}
                onChange={(value) => setFormData({ ...formData, icon: value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-lg font-medium text-foreground flex items-center gap-2">
                Vocabulary Set Title
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="isPublic" className="text-sm text-muted-foreground">Public</Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>
            </div>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title for your vocabulary set"
              required
              className="h-11 border-0 bg-muted/30 rounded-xl focus-visible:bg-background focus-visible:border focus-visible:border-primary/20 transition-all text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-medium text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              className="min-h-[100px] border-0 bg-muted/30 rounded-xl focus-visible:bg-background focus-visible:border focus-visible:border-primary/20 transition-all resize-none"
            />
          </div>
        </div>


        <VocabItemList
          items={items}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onAdd={handleAddItem}
          onQuickAdd={handleQuickAdd}
          onGenerate={handleGenerate}
          generating={generating}
          title={formData.title}
        />

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
            disabled={saving}
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            {saving ? "Saving..." : vocabSet ? "Update Vocabulary Set" : "Create Vocabulary Set"}
          </Button>
        </div>
      </form>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-6xl w-full sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-background border-border/20 shadow-2xl">
          <DialogHeader className="border-b border-border/50">
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              {editingItemIndex !== null ? "Edit Vocabulary Item" : "Add New Vocabulary Item"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {editingItemIndex !== null
                ? "Make changes to your existing vocabulary item"
                : "Create a new vocabulary item for your set"
              }
            </p>
          </DialogHeader>
          <div className="mt-2">
            <VocabItemForm
              item={editingItemIndex !== null ? items[editingItemIndex] : undefined}
              onSave={handleSaveItem}
              onCancel={handleCancelItem}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}