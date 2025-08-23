import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, VocabularySetData, VocabularyItemData } from './types';
import {
  saveVocabularySet as saveVocabularySetAction,
  deleteVocabularyItem as deleteVocabularyItemAction,
  deleteVocabularySet as deleteVocabularySetAction,
} from '@/app/actions/kelas';

export interface Vocabulary {
  vocabSets: VocabularySetData[];
  dirtyVocabSets: Set<number>;
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (setId: number | string, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (setId: number | string) => Promise<void>;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: number | string, itemId: number | string, itemData: Partial<VocabularyItemData>) => void;
  removeVocabularyItem: (vocabSetId: number | string, itemId: number | string) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;
  debugLog: () => void;
}

export const createVocabulary: StateCreator<
  KelasBuilderState,
  [["zustand/immer", never]],
  [],
  Vocabulary
> = (set, get) => ({
  vocabSets: [],
  dirtyVocabSets: new Set(),
  addVocabularySet: (vocabSet) => {
    set((state) => {
      const tempId = `temp-vocab-${Date.now()}`;
      const newItems = vocabSet.items.map((item, index) => ({
        ...item,
        order: index,
        tempId: `temp-item-${Date.now()}-${index}`,
      }));
      
      state.vocabSets.push({
        ...vocabSet,
        items: newItems,
        tempId,
      });
      
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  updateVocabularySet: (setId, updates) => {
    set((state) => {
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
      if (vocabSetIndex === -1) {
        return;
      }

      const vocabSet = state.vocabSets[vocabSetIndex];
      
      Object.assign(vocabSet, updates);

      if (vocabSet.id) {
        state.dirtyVocabSets.add(vocabSet.id);
      }
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  removeVocabularySet: async (setId) => {
    const vocabSet = get().vocabSets.find(vs => vs.id === setId || vs.tempId === setId);
    if (!vocabSet) {
      return;
    }

    if (typeof vocabSet.id === 'number') {
      try {
        const result = await deleteVocabularySetAction(vocabSet.id);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete vocabulary set from database.');
        }
        toast.success('Vocabulary set deleted from database.');
      } catch (error) {
        console.error('Failed to delete vocab set from database:', error);
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        return; // Stop if the database deletion fails
      }
    }

    set((state) => {
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
      if (vocabSetIndex !== -1) {
        state.vocabSets.splice(vocabSetIndex, 1);
        
        if (typeof setId === 'number') {
          state.dirtyVocabSets.delete(setId);
        }
      }
    });
  },
  saveVocabularySet: async (index) => {
    const { vocabSets, draftId } = get();
    
    if (index < 0 || index >= vocabSets.length) {
      return;
    }
    
    if (!vocabSets[index] || !draftId) {
      return;
    }

    const vocabSet = vocabSets[index];
    const setId = vocabSet.id || vocabSet.tempId;

    set({ isLoading: true, error: null });

    try {
      const result = await saveVocabularySetAction(
        draftId,
        {
          title: vocabSet.title,
          description: vocabSet.description,
          icon: vocabSet.icon,
          isPublic: vocabSet.isPublic,
          items: vocabSet.items.map((item) => ({
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

      if (result.success && result.data?.id) {
        set((state) => {
          const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
          if (vocabSetIndex === -1) {
             return;
          }
          
          const vocabSet = state.vocabSets[vocabSetIndex];
          
          vocabSet.id = result.data!.id;
          delete vocabSet.tempId;
          
          // Clean up tempIds for items too
          vocabSet.items.forEach(item => {
            if (item.tempId) {
              delete item.tempId;
            }
          });
          
          state.dirtyVocabSets.delete(result.data!.id);
          state.isLoading = false;
          if (state.stepDirtyFlags && typeof state.stepDirtyFlags.vocabulary !== 'undefined') {
            state.stepDirtyFlags.vocabulary = false;
          }
        });

        toast.success('Vocabulary set saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save vocabulary set');
      }
    } catch (error) {
      console.error('Error saving vocabulary set:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save vocabulary set',
      });
      toast.error('Failed to save vocabulary set');
    }
  },
  updateVocabularyItem: (vocabSetId, itemId, itemData) => {
    set((state) => {
      let vocabSetIndex = -1;
      if (typeof vocabSetId === 'number') {
        vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
      } else {
        vocabSetIndex = state.vocabSets.findIndex(vs => vs.tempId === vocabSetId);
      }

      if (vocabSetIndex === -1) {
        return;
      }
      const vocabSet = state.vocabSets[vocabSetIndex];
      
      let itemIndex = -1;
      if (typeof itemId === 'number') {
        itemIndex = vocabSet.items.findIndex(item => item.id === itemId);
      } else {
        itemIndex = vocabSet.items.findIndex(item => item.tempId === itemId);
      }
      
      if (itemIndex !== -1 && vocabSet.items[itemIndex]) {
        Object.assign(vocabSet.items[itemIndex], itemData);
        
        if (vocabSet.id) {
          state.dirtyVocabSets.add(vocabSet.id!);
        }
      }
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  removeVocabularyItem: async (vocabSetId, itemId) => {
    const { vocabSets } = get();
    
    let vocabSetIndex = -1;
    if (typeof vocabSetId === 'number') {
      vocabSetIndex = vocabSets.findIndex(vs => vs.id === vocabSetId);
    } else {
      vocabSetIndex = vocabSets.findIndex(vs => vs.tempId === vocabSetId);
    }

    const vocabSet = vocabSets[vocabSetIndex];
    
    let item: VocabularyItemData | undefined;
    if (typeof itemId === 'number') {
      item = vocabSet?.items.find(item => item.id === itemId);
    } else {
      item = vocabSet?.items.find(item => item.tempId === itemId);
    }

    if (!item) {
      return;
    }

    if (item.id) {
      await deleteVocabularyItemAction(item.id);
    }

    set((state) => {
      const targetVocabSet = state.vocabSets[vocabSetIndex];
      if (targetVocabSet) {
        let itemIndex = -1;
        if (typeof itemId === 'number') {
          itemIndex = targetVocabSet.items.findIndex(i => i.id === itemId);
        } else {
          itemIndex = targetVocabSet.items.findIndex(i => i.tempId === itemId);
        }

        if (itemIndex !== -1) {
            // Remove item and reorder properly using Immer's draft capabilities
            targetVocabSet.items.splice(itemIndex, 1);
            targetVocabSet.items.forEach((item, index) => {
              item.order = index;
            });
            
            if (targetVocabSet.id) {
              state.dirtyVocabSets.add(targetVocabSet.id);
            }
        }
      }
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  reorderVocabularyItems: async (vocabSetId, itemOrders) => {
    set((state) => {
      // Find vocab set by ID. This assumes only saved sets (with numeric IDs) can be reordered.
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
      if (vocabSetIndex !== -1) {
        // Reorder items based on the provided orders using Immer's draft capabilities
        state.vocabSets[vocabSetIndex].items.sort((a, b) => {
          const orderA = itemOrders.find(order => order.id === a.id)?.order || 0;
          const orderB = itemOrders.find(order => order.id === b.id)?.order || 0;
          return orderA - orderB;
        });
        state.stepDirtyFlags.vocabulary = true;
      }
    });
  },
  debugLog: () => {
    const { vocabSets, dirtyVocabSets } = get();
    // Debug functionality removed - keeping function signature for compatibility
  }
});