"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, BookOpen, Edit } from "lucide-react";
import { VocabularyType, } from "@prisma/client";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { VocabularyItemForm } from "./vocabulary-items-form";


interface ManageVocabularyItemsProps {
  vocabSetId: string | number;
}

export function ManageVocabularyItems({ vocabSetId }: ManageVocabularyItemsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | undefined>();
  const [quickKorean, setQuickKorean] = useState("");
  const [quickIndonesian, setQuickIndonesian] = useState("");
  const [quickAdding, setQuickAdding] = useState(false);
  
  // Get the specific vocabulary set reactively using Zustand selector
  const vocabSet = useKelasBuilderStore((state) => {
    return state.vocabSets.find(vs => vs.id === vocabSetId || vs.tempId === vocabSetId);
  });
  
  // Get actions for updating
  const { updateVocabularySet, removeVocabularyItem } = useKelasBuilderStore();

  const handleQuickAdd = async () => {
    if (!vocabSet) return;
    if (!quickKorean.trim() || !quickIndonesian.trim()) {
      alert("Please enter both Korean and Indonesian.");
      return;
    }
    setQuickAdding(true);
    try {
      const tempId = `temp-item-${Date.now()}`;
      const newItems = [...vocabSet.items, {
        korean: quickKorean.trim(),
        indonesian: quickIndonesian.trim(),
        type: VocabularyType.WORD,
        exampleSentences: [],
        order: vocabSet.items.length,
        tempId,
      }];
      updateVocabularySet(vocabSetId, {
        ...vocabSet,
        items: newItems,
      });
      setQuickKorean("");
      setQuickIndonesian("");
      // Do not open edit dialog automatically; user can click Edit to add more details
    } catch (error) {
      // Error handling removed for production
    } finally {
      setQuickAdding(false);
    }
  };

  const handleEditItem = (itemId: string) => {
    if (!vocabSet) return;
    
    const item = vocabSet.items.find(item => (item.id?.toString() === itemId) || (item.tempId === itemId));
    setEditingItemId(itemId);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingItemId(undefined);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!vocabSet) return;
    
    const item = vocabSet.items.find(item => (item.id?.toString() === itemId) || (item.tempId === itemId));
    
    if (item) {
      if (confirm("Are you sure you want to delete this vocabulary item?")) {
        try {
          await removeVocabularyItem(vocabSetId, itemId);
        } catch (error) {
          // Error handling removed for production
        }
      }
    }
  };

  if (!vocabSet) {
    return <div>Vocabulary set not found</div>;
  }

  return (
    <div className="space-y-7 mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{vocabSet.title}</h3>
          <p className="text-sm text-muted-foreground">
            Manage vocabulary items for this set
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1">
          <Input
            id="quick-korean"
            value={quickKorean}
            onChange={(e) => setQuickKorean(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleQuickAdd();
              }
            }}
            placeholder="Korean (e.g., 안녕하세요)"
          />
        </div>
        <div className="flex-1">
          <Input
            id="quick-indonesian"
            value={quickIndonesian}
            onChange={(e) => setQuickIndonesian(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleQuickAdd();
              }
            }}
            placeholder="Indonesian (e.g., Halo)"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleQuickAdd} disabled={quickAdding}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {vocabSet.items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold mb-2">No Vocabulary Items Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first vocabulary item using the quick add fields below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {vocabSet.items
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => {
              // Create a unique key that doesn't depend on sorted position
              const uniqueKey = item.id || item.tempId;
              return (
                <Card key={uniqueKey} className="py-2">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="touch-none cursor-move">
                          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">No. {item.order + 1}</Badge>
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Korean: </span>
                              <span className="font-medium">
                                {item.korean || <span className="text-muted-foreground">Not set</span>}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Indonesian: </span>
                              <span className="font-medium">
                                {item.indonesian || <span className="text-muted-foreground">Not set</span>}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.type}
                            </Badge>
                       
                            {item.exampleSentences.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {item.exampleSentences.length} example{item.exampleSentences.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            
                            {/* Display the actual ID of the item */}
                            <Badge variant="outline" className="text-xs">
                              ID: {item.id || item.tempId}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem((item.id?.toString() || item.tempId) as string)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem((item.id?.toString() || item.tempId) as string)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Create/Edit Vocabulary Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItemId !== undefined
                ? `Edit Vocabulary Item`
                : "Create New Vocabulary Item"}
            </DialogTitle>
          </DialogHeader>
          {editingItemId !== undefined && (
            <VocabularyItemForm
              vocabSetId={vocabSetId}
              itemId={editingItemId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}