"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Plus, BookOpen, Edit, Trash2, MousePointerClick } from "lucide-react";
import { VocabularySetBasicForm } from "./vocabulary-set-basic-form";
import { ManageVocabularyItems } from "./manage-vocabulary-items";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";

export function StepVocabulary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();
  const [managingItemsIndex, setManagingItemsIndex] = useState<number | undefined>();
  const [deleteIndex, setDeleteIndex] = useState<number | undefined>();
  const {
    vocabSets,
    addVocabularySet,
    removeVocabularySet,
    setIsDirty
  } = useKelasBuilderStore();

  const handleCreateNew = () => {
    setEditingIndex(undefined);
    setShowCreateForm(true);
    setIsDirty(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowCreateForm(true);
    setIsDirty(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingIndex(undefined);
  };

  const handleSaveSet = (data: {
    title: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  }) => {
    if (editingIndex !== undefined) {
      // Update existing set
      // This would need to be implemented in the store
      setShowCreateForm(false);
      setEditingIndex(undefined);
    } else {
      // Create new set with basic info
      addVocabularySet({
        ...data,
        icon: data.icon || "FaBook",
        items: [],
      });
      setShowCreateForm(false);
      setEditingIndex(undefined);
    }
  };

  const handleManageItems = (index: number) => {
    setManagingItemsIndex(index);
  };

  const handleCloseManageItems = () => {
    setManagingItemsIndex(undefined);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== undefined) {
      removeVocabularySet(deleteIndex);
      setDeleteIndex(undefined);
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
              <div className="text-2xl font-bold text-primary">{vocabSets.length}</div>
              <div className="text-sm text-muted-foreground">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vocabSets.reduce((total, vocabSet) => total + vocabSet.items.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {vocabSets.filter(v => v.tempId).length}
              </div>
              <div className="text-sm text-muted-foreground">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="font-semibold">Vocabulary Sets ({vocabSets.length})</span>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Set
        </Button>
      </div>

      {vocabSets.length === 0 ? (
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
          {vocabSets.map((vocabSet, index) => (
            <Card
              key={vocabSet.tempId || vocabSet.id || index}
              className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              onClick={() => handleManageItems(index)}
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
                        handleEdit(index);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vocabulary Set</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{vocabSet.title}"? This action cannot be undone and all vocabulary items in this set will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
              {editingIndex !== undefined ? "Edit Vocabulary Set" : "Create New Vocabulary Set"}
            </DialogTitle>
          </DialogHeader>
          <VocabularySetBasicForm
            vocabSet={editingIndex !== undefined ? vocabSets[editingIndex] : undefined}
            onCancel={handleCancel}
            onSave={handleSaveSet}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Vocabulary Items Sheet */}
      <Sheet open={managingItemsIndex !== undefined} onOpenChange={handleCloseManageItems}>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="px-6 py-4">
            <SheetTitle>
              Manage Vocabulary Items
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            {managingItemsIndex !== undefined && (
              <ManageVocabularyItems vocabSetIndex={managingItemsIndex} />
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
