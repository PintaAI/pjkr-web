import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, VocabularySetData, VocabularyItemData } from './types';
import {
  saveVocabularySet as saveVocabularySetAction,
  deleteVocabularyItem as deleteVocabularyItemAction,
  deleteVocabularySet as deleteVocabularySetAction,
} from '@/app/actions/kelas';

// Helper types for better type safety
type VocabSetId = number | string;
type VocabItemId = number | string;

// Helper utilities for ID handling
const createTempId = (prefix: string) => `temp-${prefix}-${Date.now()}`;

const isTempId = (id: VocabSetId | VocabItemId): boolean => 
  typeof id === 'string' && id.startsWith('temp-');

const toNumericId = (id: VocabSetId | VocabItemId): number => 
  typeof id === 'number' ? id : Number(id);

// Helper to find vocabulary set by ID
const findVocabSetIndex = (vocabSets: VocabularySetData[], setId: VocabSetId): number => {
  return isTempId(setId) 
    ? vocabSets.findIndex(vs => vs.tempId === setId)
    : vocabSets.findIndex(vs => vs.id === toNumericId(setId));
};

// Helper to find vocabulary item by ID
const findVocabItemIndex = (items: VocabularyItemData[], itemId: VocabItemId): number => {
  return isTempId(itemId)
    ? items.findIndex(item => item.tempId === itemId)
    : items.findIndex(item => item.id === toNumericId(itemId));
};

// Helper to mark vocabulary set as dirty
const markSetDirty = (state: any, vocabSet: VocabularySetData) => {
  if (vocabSet.id) {
    state.dirtyVocabSets.add(vocabSet.id);
  }
  state.stepDirtyFlags.vocabulary = true;
};

// Helper to clean up temp IDs after save
const cleanupTempIds = (vocabSet: VocabularySetData) => {
  delete vocabSet.tempId;
  vocabSet.items.forEach(item => {
    delete item.tempId;
  });
};

export interface Vocabulary {
  vocabSets: VocabularySetData[];
  dirtyVocabSets: Set<number>;
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (setId: VocabSetId, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (setId: VocabSetId) => Promise<void>;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: VocabSetId, itemId: VocabItemId, itemData: Partial<VocabularyItemData>) => void;
  removeVocabularyItem: (vocabSetId: VocabSetId, itemId: VocabItemId) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;
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
      const tempId = createTempId('vocab');
      const newItems = vocabSet.items.map((item, index) => ({
        ...item,
        order: index,
        tempId: createTempId(`item-${index}`),
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
      const vocabSetIndex = findVocabSetIndex(state.vocabSets, setId);
      if (vocabSetIndex === -1) return;

      const vocabSet = state.vocabSets[vocabSetIndex];
      Object.assign(vocabSet, updates);
      
      markSetDirty(state, vocabSet);
    });
  },

  removeVocabularySet: async (setId) => {
    // Handle database deletion for real IDs
    if (!isTempId(setId)) {
      try {
        const numericSetId = toNumericId(setId);
        const result = await deleteVocabularySetAction(numericSetId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete vocabulary set from database.');
        }
        
        toast.success('Vocabulary set deleted from database.');
      } catch (error) {
        console.error('Failed to delete vocab set from database:', error);
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        return;
      }
    }

    // Remove from local state
    set((state) => {
      const vocabSetIndex = findVocabSetIndex(state.vocabSets, setId);
      if (vocabSetIndex === -1) return;

      state.vocabSets.splice(vocabSetIndex, 1);
      
      // Clean up dirty tracking for real IDs
      if (!isTempId(setId)) {
        state.dirtyVocabSets.delete(toNumericId(setId));
      }
    });
  },

  saveVocabularySet: async (index) => {
    const { vocabSets, draftId } = get();
    
    if (index < 0 || index >= vocabSets.length || !vocabSets[index] || !draftId) {
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

      if (!result.success || !result.data?.id) {
        throw new Error(result.error || 'Failed to save vocabulary set');
      }

      set((state) => {
        const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
        if (vocabSetIndex === -1) return;
        
        const savedVocabSet = state.vocabSets[vocabSetIndex];
        savedVocabSet.id = result.data!.id;
        
        cleanupTempIds(savedVocabSet);
        
        state.dirtyVocabSets.delete(result.data!.id);
        state.isLoading = false;
        state.stepDirtyFlags.vocabulary = false;
      });

      toast.success('Vocabulary set saved successfully');
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
      const vocabSetIndex = findVocabSetIndex(state.vocabSets, vocabSetId);
      if (vocabSetIndex === -1) return;

      const vocabSet = state.vocabSets[vocabSetIndex];
      const itemIndex = findVocabItemIndex(vocabSet.items, itemId);
      
      if (itemIndex === -1) return;

      Object.assign(vocabSet.items[itemIndex], itemData);
      markSetDirty(state, vocabSet);
    });
  },

  removeVocabularyItem: async (vocabSetId, itemId) => {
    // Handle database deletion for real IDs
    if (!isTempId(itemId)) {
      try {
        const vocabId = toNumericId(itemId);
        await deleteVocabularyItemAction(vocabId);
      } catch (error) {
        console.error('Failed to delete vocabulary item from database:', error);
        // Continue with local removal even if database deletion fails
      }
    }
    
    // Remove from local state
    set((state) => {
      const vocabSetIndex = findVocabSetIndex(state.vocabSets, vocabSetId);
      if (vocabSetIndex === -1) return;
      
      const targetVocabSet = state.vocabSets[vocabSetIndex];
      
      // Remove item and reorder
      targetVocabSet.items = targetVocabSet.items
        .filter(item => isTempId(itemId) ? item.tempId !== itemId : item.id !== toNumericId(itemId))
        .map((item, index) => ({ ...item, order: index }));
      
      markSetDirty(state, targetVocabSet);
    });
  },

  reorderVocabularyItems: async (vocabSetId, itemOrders) => {
    set((state) => {
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
      if (vocabSetIndex === -1) return;

      // Reorder items based on the provided orders
      state.vocabSets[vocabSetIndex].items.sort((a, b) => {
        const orderA = itemOrders.find(order => order.id === a.id)?.order || 0;
        const orderB = itemOrders.find(order => order.id === b.id)?.order || 0;
        return orderA - orderB;
      });
      
      state.stepDirtyFlags.vocabulary = true;
    });
  },
});