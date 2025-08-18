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
  [["zustand/immer", never]],
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
      state.vocabSets.push(newVocabSet);
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  updateVocabularySet: (index, vocabSet) => {
    set((state) => {
      if (state.vocabSets[index]) {
        state.vocabSets[index] = { ...state.vocabSets[index], ...vocabSet };
        if (state.vocabSets[index].id) {
          state.dirtyVocabSets.add(state.vocabSets[index].id!);
        }
      }
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  removeVocabularySet: (index) => {
    set((state) => {
      const vocabSet = state.vocabSets[index];
      if (!vocabSet) return;

      // Remove from dirty sets if it was there
      if (vocabSet.id) {
        state.dirtyVocabSets.delete(vocabSet.id);
      }

      state.vocabSets.splice(index, 1);
      state.stepDirtyFlags.vocabulary = true;
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
          const updatedVocabSet = { ...state.vocabSets[index], id: result.data!.id };
          
          if (updatedVocabSet.tempId) {
            delete updatedVocabSet.tempId;
          }
          state.vocabSets[index] = updatedVocabSet;
          state.dirtyVocabSets.delete(result.data!.id);
          state.isLoading = false;
          state.stepDirtyFlags.vocabulary = false;
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
      state.stepDirtyFlags.vocabulary = true;
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
      const vocabSet = state.vocabSets[vocabSetIndex];
      if (vocabSet) {
        // Remove item and reorder properly
        vocabSet.items.splice(itemIndex, 1);
        vocabSet.items.forEach((item, index) => {
          item.order = index;
        });
        
        if (vocabSet.id) {
          state.dirtyVocabSets.add(vocabSet.id);
        }
      }
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  reorderVocabularyItems: async (vocabSetId, itemOrders) => {
    set((state) => {
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
      if (vocabSetIndex !== -1) {
        // Reorder items based on the provided orders
        const reorderedItems = state.vocabSets[vocabSetIndex].items.sort((a, b) => {
          const orderA = itemOrders.find(order => order.id === a.id)?.order || 0;
          const orderB = itemOrders.find(order => order.id === b.id)?.order || 0;
          return orderA - orderB;
        });

        state.vocabSets[vocabSetIndex].items = reorderedItems;
        state.stepDirtyFlags.vocabulary = true;
      }
    });
  },
});