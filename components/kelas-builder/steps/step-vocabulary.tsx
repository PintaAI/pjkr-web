"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MessageSquare, Plus, BookOpen, Edit, Trash2, MousePointerClick } from "lucide-react";
import { VocabularySetBasicForm } from "./vocabulary/vocabulary-set-form";

import { ManageVocabularyItems } from "./vocabulary/manage-vocabulary-items";

export function StepVocabulary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | number | undefined>();
  const [managingSetId, setManagingSetId] = useState<string | number | undefined>();

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
          type: "WORD",
          pos: "NOUN",
          order: 0,
          exampleSentences: ["안녕하세요, 만나서 반갑습니다."]
        },
        {
          id: 2,
          tempId: "temp-1-2",
          korean: "감사합니다",
          indonesian: "Terima kasih",
          type: "WORD",
          pos: "NOUN",
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
          type: "WORD",
          pos: "NOUN",
          order: 0,
          exampleSentences: ["저는 밥을 먹고 싶어요."]
        },
        {
          id: 4,
          tempId: "temp-2-2",
          korean: "김치",
          indonesian: "Kimchi",
          type: "WORD",
          pos: "NOUN",
          order: 1,
          exampleSentences: ["김치는 한국의 전통 음식입니다."]
        }
      ]
    }
  ];

  const handleCreateNew = () => {
    setEditingSetId(undefined);
    setShowCreateForm(true);
  };

  const handleEdit = (setId: string | number) => {
    setEditingSetId(setId);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingSetId(undefined);
  };

  const handleSaveSet = (data: {
    title: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  }) => {
    // Mock save - in real app this would update the store
    console.log("Mock save:", data);
    setShowCreateForm(false);
    setEditingSetId(undefined);
  };

  const handleManageItems = (setId: string | number) => {
    setManagingSetId(setId);
  };

  const handleCloseManageItems = () => {
    setManagingSetId(undefined);
  };

  const handleDelete = (setId: string | number) => {
    const vocabSet = mockVocabSets.find(vs => vs.id === setId);
    if (!vocabSet) return;

    if (confirm(`Are you sure you want to delete "${vocabSet.title}"? This action cannot be undone and all vocabulary items in this set will be permanently removed.`)) {
      // Close the manage items sheet if it's open for the deleted item
      if (managingSetId === setId) {
        setManagingSetId(undefined);
      }
      // In real app, this would call removeVocabularySet from store
      console.log("Mock delete:", setId);
    }
  };


  return (
    <div className="space-y-4">

      {/* Vocabulary Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Vocabulary Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockVocabSets.length}</div>
              <div className="text-sm text-muted-foreground">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockVocabSets.reduce((total: number, vocabSet: any) => total + vocabSet.items.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockVocabSets.filter((v: any) => v.tempId).length}
              </div>
              <div className="text-sm text-muted-foreground">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="font-semibold">Vocabulary Sets ({mockVocabSets.length})</span>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Set
        </Button>
      </div>

      {mockVocabSets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-semibold mb-2">No Vocabulary Sets Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first vocabulary set to help students learn key terms and phrases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockVocabSets.map((vocabSet: any) => (
            <Card
              key={vocabSet.tempId || vocabSet.id}
              className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              onClick={() => {
                const setId = vocabSet.id || vocabSet.tempId;
                if (setId) {
                  handleManageItems(setId);
                }
              }}
            >
              {/* Overlay for click instruction */}
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/10 text-foreground/50 px-3 py-2 rounded-lg">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm">Click to manage items</span>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{vocabSet.title}</CardTitle>
                    </div>
                    {vocabSet.description && (
                      <p className="text-sm text-muted-foreground">{vocabSet.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const setId = vocabSet.id || vocabSet.tempId;
                        if (setId) {
                          handleEdit(setId);
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const setId = vocabSet.id || vocabSet.tempId;
                        if (setId) {
                          handleDelete(setId);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{vocabSet.items.length} items</span>
                  </div>
                  {vocabSet.tempId && (
                    <Badge variant="outline">Unsaved</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {vocabSet.id ? `ID: ${vocabSet.id}` : ` ${vocabSet.tempId?.substring(0, 8)}...`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vocabulary Set Create/Edit Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSetId !== undefined ? "Edit Vocabulary Set" : "Create New Vocabulary Set"}
            </DialogTitle>
          </DialogHeader>
          <VocabularySetBasicForm
            vocabSet={editingSetId !== undefined ? mockVocabSets.find((vs: any) => vs.id === editingSetId || vs.tempId === editingSetId) : undefined}
            onCancel={handleCancel}
            onSave={handleSaveSet}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Vocabulary Items Sheet */}
      <Sheet open={managingSetId !== undefined} onOpenChange={handleCloseManageItems}>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle>Manage Vocabulary Items</SheetTitle>
            </SheetHeader>
          </VisuallyHidden>
          <div className="px-6 pb-6">
            {managingSetId && (
              <ManageVocabularyItems vocabSetId={managingSetId} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="text-center">
        <Badge variant="secondary">Optional Step</Badge>
      </div>
    </div>
  );
}

