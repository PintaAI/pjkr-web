"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Edit, Trash2, GripVertical, Plus, Edit2 } from "lucide-react";
import { VocabularyType, PartOfSpeech } from "@prisma/client";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { VocabularyItemForm } from "./vocabulary-item-form";

interface VocabularyItem {
  id?: number;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  tempId?: string;
}

interface ManageVocabularyItemsProps {
  vocabSetIndex: number;
}

export function ManageVocabularyItems({ vocabSetIndex }: ManageVocabularyItemsProps) {
  const {
    vocabSets,
    updateVocabularySet,
    removeVocabularySet,
    updateVocabularyItem,
    removeVocabularyItem,
    reorderVocabularyItems,
    setIsDirty,
  } = useKelasBuilderStore();

  const [editingItem, setEditingItem] = useState<{ setIndex: number; itemIndex: number } | null>(null);

  const vocabSet = vocabSets[vocabSetIndex];

  const handleEditItem = (setIndex: number, itemIndex: number) => {
    setEditingItem({ setIndex, itemIndex });
  };

  const handleSaveItem = (item: VocabularyItem) => {
    if (!editingItem) return;

    const { setIndex, itemIndex } = editingItem;
    const vocabSetId = vocabSets[setIndex].id;
    
    if (vocabSetId) {
      // Update existing item
      updateVocabularyItem(vocabSetId, { ...item, order: itemIndex });
    } else {
      // For new items (itemIndex === -1), add to the end of the array
      if (itemIndex === -1) {
        updateVocabularySet(setIndex, {
          ...vocabSet,
          items: [...vocabSet.items, { ...item, order: vocabSet.items.length }],
        });
      } else {
        // Update existing item in local state
        updateVocabularySet(setIndex, {
          ...vocabSet,
          items: vocabSet.items.map((i, idx) =>
            idx === itemIndex ? { ...item, order: idx } : i
          ),
        });
      }
    }

    setEditingItem(null);
    setIsDirty(true);
  };

  const handleDeleteItem = (setIndex: number, itemIndex: number) => {
    if (confirm("Are you sure you want to delete this vocabulary item?")) {
      const vocabSetId = vocabSets[setIndex].items[itemIndex].id;
      
      if (vocabSetId) {
        removeVocabularyItem(vocabSetId);
      } else {
        // For new items, update the local state
        updateVocabularySet(setIndex, {
          ...vocabSet,
          items: vocabSet.items.filter((_, i) => i !== itemIndex),
        });
      }
      
      setIsDirty(true);
    }
  };

  const handleAddItem = () => {
    setEditingItem({ setIndex: vocabSetIndex, itemIndex: -1 });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newItems = [...vocabSet.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    updateVocabularySet(vocabSetIndex, {
      ...vocabSet,
      items: newItems.map((item, index) => ({ ...item, order: index })),
    });
    
    setIsDirty(true);
  };

  const renderVocabularyItem = (item: VocabularyItem, itemIndex: number) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <span className="font-medium">Item {itemIndex + 1}</span>
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
              {item.pos && (
                <Badge variant="outline" className="text-xs">
                  {item.pos}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Korean</div>
                <div className="font-medium">{item.korean || <span className="text-muted-foreground">Not set</span>}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Indonesian</div>
                <div className="font-medium">{item.indonesian || <span className="text-muted-foreground">Not set</span>}</div>
              </div>
            </div>

            {item.exampleSentences.length > 0 && item.exampleSentences.some(s => s.trim()) && (
              <div className="mb-3">
                <div className="text-sm text-muted-foreground mb-1">Examples</div>
                <div className="text-sm">
                  {item.exampleSentences
                    .filter(s => s.trim())
                    .map((sentence, i) => (
                      <div key={i} className="text-muted-foreground">
                        • {sentence}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {item.audioUrl && (
              <div className="text-sm text-muted-foreground">
                Audio: {item.audioUrl}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditItem(vocabSetIndex, itemIndex)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteItem(vocabSetIndex, itemIndex)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!vocabSet) {
    return <div>Vocabulary set not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Vocabulary Item Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.itemIndex === -1 ? "Add New Vocabulary Item" : "Edit Vocabulary Item"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <VocabularyItemForm
              item={editingItem.itemIndex >= 0 ? vocabSet.items[editingItem.itemIndex] : undefined}
              onSave={handleSaveItem}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{vocabSet.title}</h3>
          <p className="text-sm text-muted-foreground">
            Manage vocabulary items for this set
          </p>
        </div>
        <Button onClick={handleAddItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {vocabSet.items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No vocabulary items added yet.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vocabSet.items.map((item, itemIndex) => (
            <div key={item.id || item.tempId || itemIndex}>
              {renderVocabularyItem(item, itemIndex)}
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Total items: {vocabSet.items.length}
          </div>
          <Button
            variant="outline"
            onClick={() => removeVocabularySet(vocabSet.id!)}
            className="text-destructive hover:text-destructive"
          >
            Delete Vocabulary Set
          </Button>
        </div>
      </div>
    </div>
  );
}