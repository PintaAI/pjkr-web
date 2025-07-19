import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { KelasType, Difficulty, VocabularyType, PartOfSpeech } from '@prisma/client';

// Enable MapSet plugin for Immer before using it
enableMapSet();
import { 
  createDraftKelas, 
  updateKelas, 
  addMateris, 
  reorderMateris, 
  publishKelas, 
  deleteDraftKelas 
} from '@/app/actions/kelas';
import { toast } from 'sonner';

// Types for the store
export interface KelasMetaData {
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type: KelasType;
  level: Difficulty;
  thumbnail?: string;
  icon?: string;
  isPaidClass: boolean;
  price?: number;
  discount?: number;
  promoCode?: string;
}

export interface MateriData {
  id?: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  tempId?: string; // For optimistic updates
}

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

export interface SoalSetData {
  id?: number;
  koleksiSoalId: number;
  title: string;
  description?: string;
  tempId?: string; // For optimistic updates
}

export type BuilderStep = 'meta' | 'content' | 'vocabulary' | 'assessment' | 'review' | 'publish';

interface KelasBuilderState {
  // Core state
  draftId: number | null;
  currentStep: BuilderStep;
  isLoading: boolean;
  error: string | null;
  
  // Data state
  meta: KelasMetaData;
  materis: MateriData[];
  vocabSets: VocabularySetData[];
  soalSets: SoalSetData[];
  
  // UI state
  isDirty: boolean;
  optimisticUpdates: Set<string>;
}

interface KelasBuilderActions {
  // Step navigation
  setCurrentStep: (step: BuilderStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Meta actions
  updateMeta: (meta: Partial<KelasMetaData>) => void;
  saveMeta: () => Promise<void>;
  
  // Materi actions
  addMateri: (materi: Omit<MateriData, 'order'>) => void;
  updateMateri: (index: number, materi: Partial<MateriData>) => void;
  removeMateri: (index: number) => void;
  reorderMateris: (fromIndex: number, toIndex: number) => void;
  saveMateris: () => Promise<void>;
  
  // Vocabulary actions
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (index: number) => void;
  saveVocabularySet: (index: number) => Promise<void>;
  
  // Soal actions
  addSoalSet: (soalSet: Omit<SoalSetData, 'id'>) => void;
  removeSoalSet: (index: number) => void;
  saveSoalSet: (index: number) => Promise<void>;
  
  // Global actions
  createDraft: (initialMeta: KelasMetaData) => Promise<void>;
  publishDraft: () => Promise<void>;
  deleteDraft: () => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialMeta: KelasMetaData = {
  title: '',
  description: '',
  type: KelasType.REGULAR,
  level: Difficulty.BEGINNER,
  isPaidClass: false,
};

const stepOrder: BuilderStep[] = ['meta', 'content', 'vocabulary', 'assessment', 'review', 'publish'];

export const useKelasBuilderStore = create<KelasBuilderState & KelasBuilderActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        draftId: null,
        currentStep: 'meta',
        isLoading: false,
        error: null,
        meta: initialMeta,
        materis: [],
        vocabSets: [],
        soalSets: [],
        isDirty: false,
        optimisticUpdates: new Set(),

        // Step navigation
        setCurrentStep: (step: BuilderStep) => {
          set((state) => {
            state.currentStep = step;
          });
        },

        nextStep: () => {
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);
            if (currentIndex < stepOrder.length - 1) {
              state.currentStep = stepOrder[currentIndex + 1];
            }
          });
        },

        prevStep: () => {
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);
            if (currentIndex > 0) {
              state.currentStep = stepOrder[currentIndex - 1];
            }
          });
        },

        // Meta actions
        updateMeta: (meta: Partial<KelasMetaData>) => {
          set((state) => {
            Object.assign(state.meta, meta);
            state.isDirty = true;
          });
        },

        saveMeta: async () => {
          const { draftId, meta } = get();
          if (!draftId) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const result = await updateKelas(draftId, meta);
            if (result.success) {
              set((state) => {
                state.isDirty = false;
                state.isLoading = false;
              });
              toast.success('Meta information updated successfully');
            } else {
              throw new Error(result.error || 'Failed to update meta');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to update meta';
            });
            toast.error('Failed to update meta information');
          }
        },

        // Materi actions
        addMateri: (materi: Omit<MateriData, 'order'>) => {
          set((state) => {
            const tempId = `temp-${Date.now()}`;
            const newMateri: MateriData = {
              ...materi,
              order: state.materis.length,
              tempId,
            };
            state.materis.push(newMateri);
            state.isDirty = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        updateMateri: (index: number, materi: Partial<MateriData>) => {
          set((state) => {
            if (state.materis[index]) {
              Object.assign(state.materis[index], materi);
              state.isDirty = true;
            }
          });
        },

        removeMateri: (index: number) => {
          set((state) => {
            if (state.materis[index]) {
              const materi = state.materis[index];
              if (materi.tempId) {
                state.optimisticUpdates.delete(materi.tempId);
              }
              state.materis.splice(index, 1);
              // Reorder remaining materis
              state.materis.forEach((m: MateriData, i: number) => {
                m.order = i;
              });
              state.isDirty = true;
            }
          });
        },

        reorderMateris: (fromIndex: number, toIndex: number) => {
          set((state) => {
            const materis = state.materis;
            const [movedItem] = materis.splice(fromIndex, 1);
            materis.splice(toIndex, 0, movedItem);
            
            // Update order for all materis
            materis.forEach((materi: MateriData, index: number) => {
              materi.order = index;
            });
            
            state.isDirty = true;
          });
        },

        saveMateris: async () => {
          const { draftId, materis } = get();
          if (!draftId || materis.length === 0) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Only save new materis (those with tempId)
            const newMateris = materis.filter(m => m.tempId);
            
            if (newMateris.length > 0) {
              const result = await addMateris(draftId, newMateris);
              if (result.success) {
                // Clear optimistic updates
                set((state) => {
                  state.materis.forEach((m: MateriData) => {
                    if (m.tempId) {
                      state.optimisticUpdates.delete(m.tempId);
                      delete m.tempId;
                    }
                  });
                });
              } else {
                throw new Error(result.error || 'Failed to save materis');
              }
            }

            // Handle reordering if needed
            const existingMateris = materis.filter(m => m.id && !m.tempId);
            if (existingMateris.length > 0) {
              const reorderData = existingMateris.map(m => ({ id: m.id!, order: m.order }));
              const reorderResult = await reorderMateris(draftId, reorderData);
              if (!reorderResult.success) {
                throw new Error(reorderResult.error || 'Failed to reorder materis');
              }
            }

            set((state) => {
              state.isDirty = false;
              state.isLoading = false;
            });
            toast.success('Materis saved successfully');
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save materis';
            });
            toast.error('Failed to save materis');
          }
        },

        // Vocabulary actions
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
            state.optimisticUpdates.add(tempId);
          });
        },

        updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => {
          set((state) => {
            if (state.vocabSets[index]) {
              Object.assign(state.vocabSets[index], vocabSet);
              state.isDirty = true;
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
            }
          });
        },

        saveVocabularySet: async (index: number) => {
          const { vocabSets } = get();
          if (!vocabSets[index]) return;

          const vocabSet = vocabSets[index];
          if (!vocabSet.tempId) return; // Already saved

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Note: Vocabulary functionality not implemented in simplified actions
            // This would need to be implemented if vocabulary features are needed
            toast.info('Vocabulary functionality not implemented yet');
            
            set((state) => {
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save vocabulary set';
            });
            toast.error('Failed to save vocabulary set');
          }
        },

        // Soal actions
        addSoalSet: (soalSet: Omit<SoalSetData, 'id'>) => {
          set((state) => {
            const tempId = `temp-soal-${Date.now()}`;
            const newSoalSet: SoalSetData = {
              ...soalSet,
              tempId,
            };
            state.soalSets.push(newSoalSet);
            state.isDirty = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        removeSoalSet: (index: number) => {
          set((state) => {
            if (state.soalSets[index]) {
              const soalSet = state.soalSets[index];
              if (soalSet.tempId) {
                state.optimisticUpdates.delete(soalSet.tempId);
              }
              state.soalSets.splice(index, 1);
              state.isDirty = true;
            }
          });
        },

        saveSoalSet: async (index: number) => {
          const { soalSets } = get();
          if (!soalSets[index]) return;

          const soalSet = soalSets[index];
          if (!soalSet.tempId) return; // Already saved

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Note: Soal set functionality not implemented in simplified actions
            // This would need to be implemented if assessment features are needed
            toast.info('Question set functionality not implemented yet');
            
            set((state) => {
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to link question set';
            });
            toast.error('Failed to link question set');
          }
        },

        // Global actions
        createDraft: async (initialMeta: KelasMetaData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const result = await createDraftKelas(initialMeta);
            
            if (result.success && result.data) {
              set((state) => {
                state.draftId = result.data.id;
                state.meta = initialMeta;
                state.isDirty = false;
                state.isLoading = false;
              });
              toast.success('Draft created successfully');
            } else {
              throw new Error(result.error || 'Failed to create draft');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to create draft';
            });
            toast.error('Failed to create draft');
          }
        },

        publishDraft: async () => {
          const { draftId } = get();
          if (!draftId) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const result = await publishKelas(draftId);
            
            if (result.success) {
              set((state) => {
                state.isLoading = false;
              });
              toast.success('Class published successfully');
            } else {
              throw new Error(result.error || 'Failed to publish class');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to publish class';
            });
            toast.error('Failed to publish class');
          }
        },

        deleteDraft: async () => {
          const { draftId } = get();
          if (!draftId) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const result = await deleteDraftKelas(draftId);
            
            if (result.success) {
              set((state) => {
                // Reset state
                state.draftId = null;
                state.currentStep = 'meta';
                state.meta = initialMeta;
                state.materis = [];
                state.vocabSets = [];
                state.soalSets = [];
                state.isDirty = false;
                state.optimisticUpdates.clear();
                state.isLoading = false;
              });
              toast.success('Draft deleted successfully');
            } else {
              throw new Error(result.error || 'Failed to delete draft');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to delete draft';
            });
            toast.error('Failed to delete draft');
          }
        },

        reset: () => {
          set((state) => {
            state.draftId = null;
            state.currentStep = 'meta';
            state.isLoading = false;
            state.error = null;
            state.meta = initialMeta;
            state.materis = [];
            state.vocabSets = [];
            state.soalSets = [];
            state.isDirty = false;
            state.optimisticUpdates.clear();
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
      }))
    ),
    {
      name: 'kelas-builder-store',
    }
  )
);
