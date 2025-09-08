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
import { IconPicker, IconRenderer } from "@/components/ui/icon-picker";


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
    <div className="mx-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full p-1 border border-dashed border-primary hover:border-gray-400 transition-colors">
              <IconPicker
                value={formData.icon}
                onChange={(value) => setFormData({ ...formData, icon: value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="font-bold">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter vocabulary set title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-bold">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
            <Label htmlFor="isPublic" className="font-bold">Make this vocabulary set public</Label>
          </div>
        </div>

        <VocabItemList
          items={items}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onAdd={handleAddItem}
          onQuickAdd={handleQuickAdd}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : vocabSet ? "Update" : "Create"} Vocabulary
          </Button>
        </div>
      </form>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto left-auto right-20 top-1/2 transform -translate-y-1/2 translate-x-0">
          <DialogHeader>
            <DialogTitle>
              {editingItemIndex !== null ? "Edit Vocabulary Item" : "Add Vocabulary Item"}
            </DialogTitle>
          </DialogHeader>
          <VocabItemForm
            item={editingItemIndex !== null ? items[editingItemIndex] : undefined}
            onSave={handleSaveItem}
            onCancel={handleCancelItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}