import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { VocabularyType, PartOfSpeech } from '@prisma/client';
import { toast } from 'sonner';

export interface VocabularyItemData {
  id?: number;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  tempId?: string; // For optimistic updates
}

export interface VocabularySetData {
  id?: number;
  title: string;
  description?: string;
  icon: string;
  isPublic: boolean;
  items: VocabularyItemData[];
  tempId?: string; // For optimistic updates
}

interface VocabularyStoreState {
  vocabSets: VocabularySetData[];
  isDirty: boolean;
  stepDirtyFlags: Record<string, boolean>;
  optimisticUpdates: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface VocabularyStoreActions {
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (index: number) => void;
  saveVocabularySet: (index: number, draftId: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: number, itemData: Partial<VocabularyItemData>) => Promise<void>;
  removeVocabularyItem: (vocabSetId: number, itemId?: number) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;
  setStepDirty: (step: string, dirty: boolean) => void;
  clearStepDirty: (step: string) => void;
  resetVocabulary: () => void;
}

export const useVocabularyStore = create<VocabularyStoreState & VocabularyStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        vocabSets: [],
        isDirty: false,
        stepDirtyFlags: {},
        optimisticUpdates: new Set(),
        isLoading: false,
        error: null,

        // Actions
        addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => {
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
            state.isDirty = true;
            state.stepDirtyFlags.vocabulary = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => {
          set((state) => {
            if (state.vocabSets[index]) {
              Object.assign(state.vocabSets[index], vocabSet);
              state.isDirty = true;
              state.stepDirtyFlags.vocabulary = true;
            }
          });
        },

        removeVocabularySet: (index: number) => {
          set((state) => {
            if (state.vocabSets[index]) {
              const vocabSet = state.vocabSets[index];
              if (vocabSet.tempId) {
                state.optimisticUpdates.delete(vocabSet.tempId);
              }
              state.vocabSets.splice(index, 1);
              state.isDirty = true;
              state.stepDirtyFlags.vocabulary = true;
            }
          });
        },

        saveVocabularySet: async (index: number, draftId: number) => {
          const { vocabSets } = get();
          if (!vocabSets[index] || !draftId) return;

          const vocabSet = vocabSets[index];
          if (!vocabSet.tempId) return; // Already saved

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Import the vocabulary actions
            const { saveVocabularySet: saveVocabularySetAction } = await import('@/app/actions/kelas');
            
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
                const updatedVocabSet = state.vocabSets[index];
                updatedVocabSet.id = result.data.id;
                if (updatedVocabSet.tempId) {
                  state.optimisticUpdates.delete(updatedVocabSet.tempId);
                  delete updatedVocabSet.tempId;
                }
                state.isLoading = false;
                state.stepDirtyFlags.vocabulary = false;
              });
              
              toast.success('Vocabulary set saved successfully');
            } else {
              throw new Error(result.error || 'Failed to save vocabulary set');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save vocabulary set';
            });
            toast.error('Failed to save vocabulary set');
          }
        },

        // Vocabulary item actions
        updateVocabularyItem: async (vocabSetId: number, itemData: Partial<VocabularyItemData>) => {
          // Find the vocabulary set and update the item
          set((state) => {
            const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
            if (vocabSetIndex !== -1) {
              const itemIndex = state.vocabSets[vocabSetIndex].items.findIndex(item => item.id === itemData.id);
              if (itemIndex !== -1) {
                state.vocabSets[vocabSetIndex].items[itemIndex] = {
                  ...state.vocabSets[vocabSetIndex].items[itemIndex],
                  ...itemData,
                };
                state.isDirty = true;
                state.stepDirtyFlags.vocabulary = true;
              }
            }
          });
        },

        removeVocabularyItem: async (vocabSetId: number, itemId?: number) => {
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
            const vocabSet = state.vocabSets[vocabSetIndex];
            const itemIndex = vocabSet.items.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
              // Remove the item from the array
              vocabSet.items.splice(itemIndex, 1);
              
              // Reorder remaining items
              vocabSet.items.forEach((item, index) => {
                item.order = index;
              });
              
              state.isDirty = true;
              state.stepDirtyFlags.vocabulary = true;
            }
          });
          
          try {
            // Use the server action to delete from database
            const { deleteVocabularyItem: deleteVocabularyItemAction } = await import('@/app/actions/kelas');
            const result = await deleteVocabularyItemAction(itemId);
            
            if (result.success) {
              console.log('✅ [VOCAB ITEM] Vocabulary item deleted from database successfully');
              // The local state is already updated, just clear dirty flags
              set((state) => {
                state.isDirty = false;
                state.stepDirtyFlags.vocabulary = false;
              });
            } else {
              throw new Error(result.error || 'Failed to delete vocabulary item');
            }
          } catch (error) {
            console.error('❌ [VOCAB ITEM] Failed to delete vocabulary item from database:', error);
            // Revert local state if database delete fails
            set((state) => {
              const vocabSet = state.vocabSets[vocabSetIndex];
              // Note: We can't easily revert without the original item, so we'll just keep the local state
              // and mark as dirty so user can try again
              state.isDirty = true;
              state.stepDirtyFlags.vocabulary = true;
            });
            throw error;
          }
        },

        reorderVocabularyItems: async (vocabSetId: number, itemOrders: { id: number; order: number }[]) => {
          set((state) => {
            const vocabSetIndex = state.vocabSets.findIndex(vs => vs.id === vocabSetId);
            if (vocabSetIndex !== -1) {
              // Reorder items based on the provided orders
              const items = state.vocabSets[vocabSetIndex].items;
              const reorderedItems = items.sort((a, b) => {
                const orderA = itemOrders.find(order => order.id === a.id)?.order || 0;
                const orderB = itemOrders.find(order => order.id === b.id)?.order || 0;
                return orderA - orderB;
              });
              
              state.vocabSets[vocabSetIndex].items = reorderedItems;
              state.isDirty = true;
              state.stepDirtyFlags.vocabulary = true;
            }
          });
        },

        setStepDirty: (step: string, dirty: boolean) => {
          set((state) => {
            state.stepDirtyFlags[step] = dirty;
            if (dirty) {
              state.isDirty = true;
            }
          });
        },

        clearStepDirty: (step: string) => {
          set((state) => {
            state.stepDirtyFlags[step] = false;
            // Check if any step is still dirty
            const hasDirtySteps = Object.values(state.stepDirtyFlags).some(isDirty => isDirty);
            state.isDirty = hasDirtySteps;
          });
        },

        resetVocabulary: () => {
          set((state) => {
            state.vocabSets = [];
            state.isDirty = false;
            state.stepDirtyFlags.vocabulary = false;
            state.optimisticUpdates.clear();
          });
        },
      }))
    ),
    {
      name: 'kelas-builder-vocabulary-store',
    }
  )
);