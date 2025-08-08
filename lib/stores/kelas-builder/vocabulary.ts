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
        optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
      };
    });
  },
  updateVocabularySet: (index, vocabSet) => {
    set((state) => {
      const newVocabSets = [...state.vocabSets];
      if (newVocabSets[index]) {
        newVocabSets[index] = { ...newVocabSets[index], ...vocabSet };
        if (newVocabSets[index].id) {
          (get().dirtyVocabSets as Set<number>).add(newVocabSets[index].id!);
        }
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

      if (result.success && result.data) {
        set((state) => {
          const newVocabSets = [...state.vocabSets];
          const updatedVocabSet = { ...newVocabSets[index], id: result.data.id };
          const newOptimisticUpdates = new Set(state.optimisticUpdates);
          if (updatedVocabSet.tempId) {
            newOptimisticUpdates.delete(updatedVocabSet.tempId);
            delete updatedVocabSet.tempId;
          }
          newVocabSets[index] = updatedVocabSet;
          const newDirtyVocabSets = new Set(state.dirtyVocabSets);
          newDirtyVocabSets.delete(result.data.id);

          return {
            vocabSets: newVocabSets,
            isLoading: false,
            stepDirtyFlags: { ...state.stepDirtyFlags, vocabulary: false },
            optimisticUpdates: newOptimisticUpdates,
            dirtyVocabSets: newDirtyVocabSets,
            isDirty: newDirtyVocabSets.size > 0,
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
      if (state.vocabSets[vocabSetIndex] && state.vocabSets[vocabSetIndex].items[itemIndex]) {
        state.vocabSets[vocabSetIndex].items[itemIndex] = {
          ...state.vocabSets[vocabSetIndex].items[itemIndex],
          ...itemData,
        };
        if (state.vocabSets[vocabSetIndex].id) {
          state.dirtyVocabSets.add(state.vocabSets[vocabSetIndex].id!);
        }
      }
      state.isDirty = true;
      state.stepDirtyFlags.vocabulary = true;
      return state;
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
      const vocabSet = newVocabSets[vocabSetIndex];
      if (vocabSet) {
        const newItems = vocabSet.items.filter((_, i) => i !== itemIndex);
        const reorderedItems = newItems.map((item, index) => ({ ...item, order: index }));
        newVocabSets[vocabSetIndex] = { ...vocabSet, items: reorderedItems };
        if (vocabSet.id) {
          (get().dirtyVocabSets as Set<number>).add(vocabSet.id);
        }
      }
      return {
        vocabSets: newVocabSets,
        isDirty: true,
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