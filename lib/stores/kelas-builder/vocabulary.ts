import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, VocabularySetData, VocabularyItemData } from './types';
import {
  saveVocabularySet as saveVocabularySetAction,
  deleteVocabularyItem as deleteVocabularyItemAction,
} from '@/app/actions/kelas';

export interface Vocabulary {
  vocabSets: VocabularySetData[];
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (index: number) => void;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: number, itemData: Partial<VocabularyItemData>) => Promise<void>;
  removeVocabularyItem: (vocabSetId: number, itemId?: number) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;
}

export const createVocabulary: StateCreator<
  KelasBuilderState,
  [],
  [],
  Vocabulary
> = (set, get) => ({
  vocabSets: [],
  addVocabularySet: (vocabSet) => {
    set((state) => {
      const tempId = `temp-vocab-${Date.now()}`;
      const newVocabSet: VocabularySetData = {
        ...vocabSet,
        items: vocabSet.items.map((item, index) => ({
          ...item,
          order: index,
          tempId: `temp-item-${Date.now()}-${index}`,
        })),
        tempId,
      };
      return {
        vocabSets: [...state.vocabSets, newVocabSet],
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
        optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
      };
    });
  },
  updateVocabularySet: (index, vocabSet) => {
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      if (newVocabSets[index]) {
        newVocabSets[index] = { ...newVocabSets[index], ...vocabSet };
      }
      return {
        vocabSets: newVocabSets,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
      };
    });
  },
  removeVocabularySet: (index) => {
    set((state) => {
      const vocabSet = state.vocabSets[index];
      if (!vocabSet) return state;

      const newOptimisticUpdates = new Set(state.optimisticUpdates);
      if (vocabSet.tempId) {
        newOptimisticUpdates.delete(vocabSet.tempId);
      }
      const newVocabSets = state.vocabSets.filter((_, i) => i !== index);
      return {
        vocabSets: newVocabSets,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
        optimisticUpdates: newOptimisticUpdates,
      };
    });
  },
  saveVocabularySet: async (index) => {
    const { vocabSets, draftId } = get();
    if (!vocabSets[index] || !draftId) return;

    const vocabSet = vocabSets[index];
    if (!vocabSet.tempId) return; // Already saved

    set({ isLoading: true, error: null });

    try {
      const result = await saveVocabularySetAction(
        draftId,
        {
          title: vocabSet.title,
          description: vocabSet.description,
          icon: vocabSet.icon,
          isPublic: vocabSet.isPublic,
          items: vocabSet.items.map(item => ({
            korean: item.korean,
            indonesian: item.indonesian,
            type: item.type,
            pos: item.pos,
            audioUrl: item.audioUrl,
            exampleSentences: item.exampleSentences,
          })),
        },
        vocabSet.id
      );

      if (result.success && result.data) {
        // Update the vocabulary set with the real ID
        set((state) => {
          const newVocabSets = [...state.vocabSets];
          const updatedVocabSet = { ...newVocabSets[index] };
          updatedVocabSet.id = result.data.id;
          const newOptimisticUpdates = new Set(state.optimisticUpdates);
          if (updatedVocabSet.tempId) {
            newOptimisticUpdates.delete(updatedVocabSet.tempId);
            delete updatedVocabSet.tempId;
          }
          newVocabSets[index] = updatedVocabSet;
          return {
            vocabSets: newVocabSets,
            isLoading: false,
            stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: false },
            optimisticUpdates: newOptimisticUpdates,
          };
        });

        toast.success('Vocabulary set saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save vocabulary set');
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save vocabulary set',
      });
      toast.error('Failed to save vocabulary set');
    }
  },
  updateVocabularyItem: async (vocabSetId, itemData) => {
    // Find the vocabulary set and update the item
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const vocabSetIndex = newVocabSets.findIndex(vs => vs.id === vocabSetId);
      if (vocabSetIndex !== -1) {
        const newItems = [...newVocabSets[vocabSetIndex].items];
        const itemIndex = newItems.findIndex(item => item.id === itemData.id);
        if (itemIndex !== -1) {
          newItems[itemIndex] = { ...newItems[itemIndex], ...itemData };
          newVocabSets[vocabSetIndex] = { ...newVocabSets[vocabSetIndex], items: newItems };
          return {
            vocabSets: newVocabSets,
            isDirty: true,
            stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
          };
        }
      }
      return state;
    });
  },
  removeVocabularyItem: async (vocabSetId, itemId) => {
    const { vocabSets } = get();
    const vocabSetIndex = vocabSets.findIndex(vs => vs.id === vocabSetId);

    if (vocabSetIndex === -1) return;

    // If no itemId provided, use the last item's ID or return
    if (!itemId) {
      const lastItem = vocabSets[vocabSetIndex].items[vocabSets[vocabSetIndex].items.length - 1];
      if (!lastItem) return;
      itemId = lastItem.id;
    }

    if (!itemId) return;

    // First, update local state optimistically
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const vocabSet = newVocabSets[vocabSetIndex];
      const newItems = vocabSet.items.filter(item => item.id !== itemId);
      const reorderedItems = newItems.map((item, index) => ({ ...item, order: index }));
      newVocabSets[vocabSetIndex] = { ...vocabSet, items: reorderedItems };
      return {
        vocabSets: newVocabSets,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
      };
    });

    try {
      // Use the server action to delete from database
      const result = await deleteVocabularyItemAction(itemId);

      if (result.success) {
        console.log('✅ [VOCAB ITEM] Vocabulary item deleted from database successfully');
        // The local state is already updated, just clear dirty flags
        set((state) => ({
          isDirty: false,
          stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: false },
        }));
      } else {
        throw new Error(result.error || 'Failed to delete vocabulary item');
      }
    } catch (error) {
      console.error('❌ [VOCAB ITEM] Failed to delete vocabulary item from database:', error);
      // Revert local state if database delete fails
      set((state) => {
        // Note: We can't easily revert without the original item, so we'll just keep the local state
        // and mark as dirty so user can try again
        return {
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
        };
      });
      throw error;
    }
  },
  reorderVocabularyItems: async (vocabSetId, itemOrders) => {
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const vocabSetIndex = newVocabSets.findIndex(vs => vs.id === vocabSetId);
      if (vocabSetIndex !== -1) {
        // Reorder items based on the provided orders
        const items = [...newVocabSets[vocabSetIndex].items];
        const reorderedItems = items.sort((a, b) => {
          const orderA = itemOrders.find(order => order.id === a.id)?.order || 0;
          const orderB = itemOrders.find(order => order.id === b.id)?.order || 0;
          return orderA - orderB;
        });

        newVocabSets[vocabSetIndex] = { ...newVocabSets[vocabSetIndex], items: reorderedItems };
        return {
          vocabSets: newVocabSets,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
        };
      }
      return state;
    });
  },
});