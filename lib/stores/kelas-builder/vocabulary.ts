import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, VocabularySetData, VocabularyItemData } from './types';
import {
  saveVocabularySet as saveVocabularySetAction,
  deleteVocabularyItem as deleteVocabularyItemAction,
} from '@/app/actions/kelas';

export interface Vocabulary {
  vocabSets: VocabularySetData[];
  dirtyVocabSets: Set<number>;
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (index: number) => void;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetIndex: number, itemIndex: number, itemData: Partial<VocabularyItemData>) => void;
  removeVocabularyItem: (vocabSetIndex: number, itemIndex: number) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;
}

export const createVocabulary: StateCreator<
  KelasBuilderState,
  [],
  [],
  Vocabulary
> = (set, get) => ({
  vocabSets: [],
  dirtyVocabSets: new Set(),
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
        optimisticUpdates: {
          ...state.optimisticUpdates,
          koleksi: new Set(state.optimisticUpdates.koleksi).add(tempId),
        },
      };
    });
  },
  updateVocabularySet: (index, vocabSet) => {
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const newDirtyVocabSets = new Set(state.dirtyVocabSets);
      let isDirty = state.isDirty;
      
      if (newVocabSets[index]) {
        newVocabSets[index] = { ...newVocabSets[index], ...vocabSet };
        if (newVocabSets[index].id) {
          newDirtyVocabSets.add(newVocabSets[index].id!);
          isDirty = true;
        }
      }
      
      return {
        vocabSets: newVocabSets,
        dirtyVocabSets: newDirtyVocabSets,
        isDirty,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
      };
    });
  },
  removeVocabularySet: (index) => {
    set((state) => {
      const vocabSet = state.vocabSets[index];
      if (!vocabSet) return state;

      const newOptimisticUpdates = {
        ...state.optimisticUpdates,
        koleksi: new Set(state.optimisticUpdates.koleksi),
      };
      if (vocabSet.tempId) {
        newOptimisticUpdates.koleksi.delete(vocabSet.tempId);
      }
      const newVocabSets = state.vocabSets.filter((_, i) => i !== index);
      const newDirtyVocabSets = new Set(state.dirtyVocabSets);
      
      // Remove from dirty sets if it was there
      if (vocabSet.id) {
        newDirtyVocabSets.delete(vocabSet.id);
      }

      return {
        vocabSets: newVocabSets,
        dirtyVocabSets: newDirtyVocabSets,
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
          const newVocabSets = [...state.vocabSets];
          const updatedVocabSet = { ...newVocabSets[index], id: result.data!.id };
          const newOptimisticUpdates = {
            ...state.optimisticUpdates,
            koleksi: new Set(state.optimisticUpdates.koleksi),
          };
          const newDirtyVocabSets = new Set(state.dirtyVocabSets);
          let isDirty = state.isDirty;
          
          if (updatedVocabSet.tempId) {
            newOptimisticUpdates.koleksi.delete(updatedVocabSet.tempId);
            delete updatedVocabSet.tempId;
          }
          newVocabSets[index] = updatedVocabSet;
          newDirtyVocabSets.delete(result.data!.id);
          isDirty = newDirtyVocabSets.size > 0;

          return {
            vocabSets: newVocabSets,
            isLoading: false,
            stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: false },
            optimisticUpdates: newOptimisticUpdates,
            dirtyVocabSets: newDirtyVocabSets,
            isDirty,
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
  updateVocabularyItem: (vocabSetIndex, itemIndex, itemData) => {
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const newDirtyVocabSets = new Set(state.dirtyVocabSets);
      let isDirty = state.isDirty;
      
      if (newVocabSets[vocabSetIndex] && newVocabSets[vocabSetIndex].items[itemIndex]) {
        // Create new items array to avoid mutation
        const newItems = [...newVocabSets[vocabSetIndex].items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          ...itemData,
        };
        
        newVocabSets[vocabSetIndex] = {
          ...newVocabSets[vocabSetIndex],
          items: newItems,
        };
        
        if (newVocabSets[vocabSetIndex].id) {
          newDirtyVocabSets.add(newVocabSets[vocabSetIndex].id!);
          isDirty = true;
        }
      }
      
      return {
        vocabSets: newVocabSets,
        dirtyVocabSets: newDirtyVocabSets,
        isDirty,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
      };
    });
  },
  removeVocabularyItem: async (vocabSetIndex, itemIndex) => {
    const { vocabSets } = get();
    const vocabSet = vocabSets[vocabSetIndex];
    const item = vocabSet?.items[itemIndex];

    if (!item) return;

    if (item.id) {
      await deleteVocabularyItemAction(item.id);
    }

    set((state) => {
      const newVocabSets = [...state.vocabSets];
      const newDirtyVocabSets = new Set(state.dirtyVocabSets);
      let isDirty = state.isDirty;
      
      const vocabSet = newVocabSets[vocabSetIndex];
      if (vocabSet) {
        // Create new items array and reorder properly
        const newItems = vocabSet.items
          .filter((_, i) => i !== itemIndex)
          .map((item, index) => ({ ...item, order: index }));
        
        newVocabSets[vocabSetIndex] = {
          ...vocabSet,
          items: newItems,
        };
        
        if (vocabSet.id) {
          newDirtyVocabSets.add(vocabSet.id);
          isDirty = true;
        }
      }
      
      return {
        vocabSets: newVocabSets,
        dirtyVocabSets: newDirtyVocabSets,
        isDirty,
        stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: true },
      };
    });
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