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
    console.log('🔥 [VOCAB STORE] addVocabularySet called:', vocabSet);
    set((state) => {
      const tempId = `temp-vocab-${Date.now()}`;
      const newItems = vocabSet.items.map((item, index) => ({
        ...item,
        order: index,
        tempId: `temp-item-${Date.now()}-${index}`,
      }));
      console.log('🔥 [VOCAB STORE] Generated tempIds for items:', newItems.map(item => ({ tempId: item.tempId, korean: item.korean })));
      console.log('🔥 [VOCAB STORE] Current vocabSets before add:', state.vocabSets.map(vs => ({ id: vs.id, tempId: vs.tempId, title: vs.title, itemCount: vs.items.length })));
      
      state.vocabSets.push({
        ...vocabSet,
        items: newItems,
        tempId,
      });
      
      console.log('🔥 [VOCAB STORE] Added vocabSet:', {
        tempId,
        title: vocabSet.title,
        itemCount: newItems.length,
        totalVocabSets: state.vocabSets.length
      });
      console.log('🔥 [VOCAB STORE] Current vocabSets after add:', state.vocabSets.map(vs => ({ id: vs.id, tempId: vs.tempId, title: vs.title, itemCount: vs.items.length })));
      
      console.log('🔍 [VOCAB DEBUG] Setting stepDirtyFlags.vocabulary = true in addVocabularySet');
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  updateVocabularySet: (setId, updates) => {
    console.log('🔥 [VOCAB STORE] updateVocabularySet called:', { setId, updates });
    set((state) => {
      const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
      if (vocabSetIndex === -1) {
        console.warn('🔥 [VOCAB STORE] Vocab set not found for setId:', setId);
        return;
      }

      const vocabSet = state.vocabSets[vocabSetIndex];
      console.log('🔥 [VOCAB STORE] Updating vocabSet:', { setId, oldData: vocabSet, newData: updates });
      
      Object.assign(vocabSet, updates);
      console.log('🔥 [VOCAB STORE] VocabSet updated to:', vocabSet);

      if (vocabSet.id) {
        state.dirtyVocabSets.add(vocabSet.id);
        console.log('🔥 [VOCAB STORE] Added vocabSet to dirty sets:', vocabSet.id);
      }
      console.log('🔍 [VOCAB DEBUG] Setting stepDirtyFlags.vocabulary = true in updateVocabularySet');
      state.stepDirtyFlags.vocabulary = true;
    });
  },
  removeVocabularySet: async (setId) => {
    console.log('🔥 [VOCAB STORE] removeVocabularySet called with setId:', setId);

    const vocabSet = get().vocabSets.find(vs => vs.id === setId || vs.tempId === setId);
    if (!vocabSet) {
      console.warn('🔥 [VOCAB STORE] Vocab set not found for setId:', setId);
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
        console.error('🔥 [VOCAB STORE] Failed to delete vocab set from database:', error);
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
    console.log('🔥 [VOCAB STORE] saveVocabularySet called:', { index, draftId, vocabSet: vocabSets[index] });
    
    // DEBUG: Check for potential index out of bounds
    if (index < 0 || index >= vocabSets.length) {
      console.error('🚨 [VOCAB DEBUG] CRITICAL: Invalid vocabSetIndex:', { index, vocabSetsLength: vocabSets.length });
      return;
    }
    
    if (!vocabSets[index] || !draftId) {
      console.warn('🔥 [VOCAB STORE] Cannot save: missing vocab set or draftId');
      return;
    }

    const vocabSet = vocabSets[index];
    const setId = vocabSet.id || vocabSet.tempId;

    set({ isLoading: true, error: null });

    try {
      console.log('🔥 [VOCAB STORE] Calling saveVocabularySetAction with:', {
        draftId,
        title: vocabSet.title,
        itemCount: vocabSet.items.length,
        hasExistingId: !!vocabSet.id
      });
      
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

      console.log('🔥 [VOCAB STORE] Save result:', result);

      if (result.success && result.data?.id) {
        set((state) => {
          const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === setId || vs.tempId === setId);
          if (vocabSetIndex === -1) {
             console.warn('🔥 [VOCAB STORE] Vocab set not found for update after save:', setId);
             return;
          }
          
          const vocabSet = state.vocabSets[vocabSetIndex];
          const oldId = vocabSet.id;
          const oldTempId = vocabSet.tempId;
          
          vocabSet.id = result.data!.id;
          delete vocabSet.tempId;
          
          // Clean up tempIds for items too
          let itemsWithTempIds = 0;
          vocabSet.items.forEach(item => {
            if (item.tempId) {
              itemsWithTempIds++;
              delete item.tempId;
            }
          });
          
          console.log('🔥 [VOCAB STORE] Vocab set saved:', {
            oldId,
            newId: vocabSet.id,
            oldTempId,
            itemsWithTempIdsCleaned: itemsWithTempIds,
            isDirty: state.dirtyVocabSets.has(result.data!.id)
          });
          
          state.dirtyVocabSets.delete(result.data!.id);
          state.isLoading = false;
          // DEBUG: Log stepDirtyFlags access
          console.log('🔍 [VOCAB DEBUG] About to set stepDirtyFlags.vocabulary = false');
          if (state.stepDirtyFlags && typeof state.stepDirtyFlags.vocabulary !== 'undefined') {
            state.stepDirtyFlags.vocabulary = false;
            console.log('🔍 [VOCAB DEBUG] Successfully set stepDirtyFlags.vocabulary = false');
          } else {
            console.error('🚨 [VOCAB DEBUG] CRITICAL: stepDirtyFlags is undefined or missing vocabulary property!');
          }
        });

        toast.success('Vocabulary set saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save vocabulary set');
      }
    } catch (error) {
      console.error('🔥 [VOCAB STORE] Error saving vocabulary set:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save vocabulary set',
      });
      toast.error('Failed to save vocabulary set');
    }
  },
  updateVocabularyItem: (vocabSetId, itemId, itemData) => {
    console.log('updateVocabularyItem called:', { vocabSetId, itemId, itemData });
    set((state) => {
      let vocabSetIndex = -1;
      if (typeof vocabSetId === 'number') {
        vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
      } else {
        vocabSetIndex = state.vocabSets.findIndex(vs => vs.tempId === vocabSetId);
      }

      if (vocabSetIndex === -1) {
        console.warn('🔥 [VOCAB STORE] Vocab set not found for updateVocabularyItem:', vocabSetId);
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
        console.log('Updating vocabulary item:', vocabSet.items[itemIndex]);
        Object.assign(vocabSet.items[itemIndex], itemData);
        console.log('Updated vocabulary item:', vocabSet.items[itemIndex]);
        
        if (vocabSet.id) {
          state.dirtyVocabSets.add(vocabSet.id!);
        }
      } else {
        console.warn('Vocabulary item not found for update:', { vocabSetId, itemId });
      }
      console.log('🔍 [VOCAB DEBUG] Setting stepDirtyFlags.vocabulary = true in updateVocabularyItem');
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

    console.log('removeVocabularyItem called:', { vocabSetId, itemId, item });

    if (!item) {
      console.warn('Vocabulary item not found for removal:', { vocabSetId, itemId });
      return;
    }

    if (item.id) {
      console.log('Deleting vocabulary item from server:', item.id);
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
            console.log('Removing vocabulary item from local state:', item);
            // Remove item and reorder properly using Immer's draft capabilities
            targetVocabSet.items.splice(itemIndex, 1);
            targetVocabSet.items.forEach((item, index) => {
              item.order = index;
            });
            
            if (targetVocabSet.id) {
              state.dirtyVocabSets.add(targetVocabSet.id);
            }
            console.log('Vocabulary items after removal:', targetVocabSet.items);
        }
      }
      console.log('🔍 [VOCAB DEBUG] Setting stepDirtyFlags.vocabulary = true in removeVocabularyItem');
      console.log('🔍 [VOCAB DEBUG] Setting stepDirtyFlags.vocabulary = true in reorderVocabularyItems');
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
    console.log('🔥 [VOCAB STORE] DEBUG STATE:', {
      totalVocabSets: vocabSets.length,
      dirtyVocabSets: Array.from(dirtyVocabSets),
      vocabSets: vocabSets.map(vs => ({
        id: vs.id,
        tempId: vs.tempId,
        title: vs.title,
        isDirty: vs.id ? dirtyVocabSets.has(vs.id) : false,
        items: vs.items.map(item => ({
          id: item.id,
          tempId: item.tempId,
          korean: item.korean,
          indonesian: item.indonesian
        }))
      }))
    });
  }
});