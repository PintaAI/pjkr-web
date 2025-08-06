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
  deleteDraftKelas,
  deleteMateri,
  deleteKoleksiSoal,
  deleteSoal,
  deleteOpsi
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

export interface SoalOpsiData {
  id?: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
  tempId?: string;
}

export interface SoalData {
  id?: number;
  pertanyaan: string;
  difficulty?: Difficulty;
  explanation?: string;
  isActive: boolean;
  opsis: SoalOpsiData[];
  tempId?: string;
}

export interface KoleksiSoalData {
  id?: number;
  nama: string;
  deskripsi?: string;
  isPrivate: boolean;
  isDraft: boolean;
  soals: SoalData[];
  tempId?: string;
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
  koleksiSoals: KoleksiSoalData[];
  
  // UI state
  isDirty: boolean;
  optimisticUpdates: Set<string>;
  
  // Deletion tracking
  deletedMateris: number[]; // IDs of deleted materis
  deletedKoleksiSoals: number[]; // IDs of deleted koleksi soals
  deletedSoals: number[]; // IDs of deleted soals
  deletedOpsi: number[]; // IDs of deleted opsi
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
  
  // Koleksi Soal actions
  addKoleksiSoal: (koleksiSoal: Omit<KoleksiSoalData, 'id' | 'soals'> & { soals?: Omit<SoalData, 'opsis'>[] }) => void;
  updateKoleksiSoal: (index: number, koleksiSoal: Partial<KoleksiSoalData>) => void;
  removeKoleksiSoal: (index: number) => void;
  saveKoleksiSoal: (index: number) => Promise<void>;
  
  // Individual Soal actions within KoleksiSoal
  addSoal: (koleksiIndex: number, soal: Omit<SoalData, 'id' | 'opsis'> & { opsis?: Omit<SoalOpsiData, 'id'>[] }) => void;
  updateSoal: (koleksiIndex: number, soalIndex: number, soal: Partial<SoalData>) => void;
  removeSoal: (koleksiIndex: number, soalIndex: number) => void;
  saveSoal: (koleksiIndex: number, soalIndex: number) => Promise<void>;
  
  // Opsi actions within Soal
  addOpsi: (koleksiIndex: number, soalIndex: number, opsi: Omit<SoalOpsiData, 'id'>) => void;
  updateOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number, opsi: Partial<SoalOpsiData>) => void;
  removeOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => void;
  saveOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => Promise<void>;
  
  // Global actions
  createDraft: (initialMeta: KelasMetaData) => Promise<void>;
  loadDraft: (kelasId: number) => Promise<void>;
  publishDraft: () => Promise<void>;
  deleteDraft: () => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setIsDirty: (dirty: boolean) => void;
  
  // Batch saving for all unsaved assessment data
  saveAllAssessments: () => Promise<void>;
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
        koleksiSoals: [],
        isDirty: false,
        optimisticUpdates: new Set(),
        deletedMateris: [],
        deletedKoleksiSoals: [],
        deletedSoals: [],
        deletedOpsi: [],

        // Step navigation
        setCurrentStep: async (step: BuilderStep) => {
          const { draftId, meta, createDraft } = get();
          
          // Auto-create draft if navigating away from meta and no draft exists
          if (step !== 'meta' && !draftId && meta.title.trim() !== '') {
            try {
              await createDraft(meta);
            } catch (error) {
              console.error('Failed to auto-create draft:', error);
              // Set error state so user knows what happened
              set((state) => {
                state.error = 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error');
              });
            }
          }
          
          set((state) => {
            state.currentStep = step;
          });
        },

        nextStep: async () => {
          const { currentStep, draftId, meta, createDraft } = get();
          
          console.log('⏭️ [AUTO-SAVE TRIGGER] nextStep called:', {
            currentStep,
            hasDraft: !!draftId,
            hasTitle: meta.title.trim() !== ''
          });
          
          // Auto-create draft if leaving meta step and no draft exists
          if (currentStep === 'meta' && !draftId && meta.title.trim() !== '') {
            console.log('📝 [AUTO-SAVE] Auto-creating draft in nextStep...');
            try {
              await createDraft(meta);
              console.log('✅ [AUTO-SAVE] Draft auto-created in nextStep successfully');
            } catch (error) {
              console.error('❌ [AUTO-SAVE] Failed to auto-create draft in nextStep:', error);
              // Set error state
              set((state) => {
                state.error = 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error');
              });
            }
          }
          
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);
            if (currentIndex < stepOrder.length - 1) {
              const nextStep = stepOrder[currentIndex + 1];
              state.currentStep = nextStep;
              console.log('🎯 [AUTO-SAVE] Navigated to next step:', nextStep);
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

          try {
            // Serialize JSON data to ensure it's safe for server actions
            const serializedMeta = {
              ...meta,
              jsonDescription: meta.jsonDescription
                ? JSON.parse(JSON.stringify(meta.jsonDescription))
                : undefined
            };
            
            const result = await updateKelas(draftId, serializedMeta);
            if (result.success) {
              set((state) => {
                state.isDirty = false;
              });
              toast.success('Meta information updated successfully');
            } else {
              throw new Error(result.error || 'Failed to update meta');
            }
          } catch (error) {
            set((state) => {
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
          const { materis } = get();
          if (!materis[index]) return;

          const materi = materis[index];
          
          if (materi.tempId) {
            // Remove unsaved materi (only from local state)
            set((state) => {
              if (materi.tempId) {
                state.optimisticUpdates.delete(materi.tempId);
              }
              state.materis.splice(index, 1);
              // Reorder remaining materis
              state.materis.forEach((m: MateriData, i: number) => {
                m.order = i;
              });
              state.isDirty = true;
            });
          } else {
            // Mark saved materi for deletion (will be deleted on save)
            set((state) => {
              state.deletedMateris.push(materi.id!);
              state.materis.splice(index, 1);
              // Reorder remaining materis
              state.materis.forEach((m: MateriData, i: number) => {
                m.order = i;
              });
              state.isDirty = true;
            });
          }
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
          const { draftId, materis, deletedMateris } = get();
          if (!draftId || materis.length === 0 && deletedMateris.length === 0) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Handle deletions first
            if (deletedMateris.length > 0) {
              console.log('🗑️ [SAVE] Deleting materis:', deletedMateris);
              for (const materiId of deletedMateris) {
                const deleteResult = await deleteMateri(materiId);
                if (!deleteResult.success) {
                  throw new Error(`Failed to delete materi ${materiId}: ${deleteResult.error}`);
                }
              }
            }

            // Only save new materis (those with tempId)
            const newMateris = materis.filter(m => m.tempId);
            
            if (newMateris.length > 0) {
              console.log('➕ [SAVE] Adding new materis:', newMateris.length);
              // Serialize JSON data to ensure it's safe for server actions
              const serializedMateris = newMateris.map(materi => ({
                ...materi,
                jsonDescription: JSON.parse(JSON.stringify(materi.jsonDescription || {}))
              }));
              
              const result = await addMateris(draftId, serializedMateris);
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
              console.log('🔄 [SAVE] Reordering existing materis:', existingMateris.length);
              const reorderData = existingMateris.map(m => ({ id: m.id!, order: m.order }));
              const reorderResult = await reorderMateris(draftId, reorderData);
              if (!reorderResult.success) {
                throw new Error(reorderResult.error || 'Failed to reorder materis');
              }
            }

            // Clear deletion tracking
            set((state) => {
              state.deletedMateris = [];
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

        // Koleksi Soal actions
        addKoleksiSoal: (koleksiSoal: Omit<KoleksiSoalData, 'id' | 'soals'> & { soals?: Omit<SoalData, 'opsis'>[] }) => {
          set((state) => {
            const tempId = `temp-koleksi-${Date.now()}`;
            const newKoleksiSoal: KoleksiSoalData = {
              ...koleksiSoal,
              soals: koleksiSoal.soals?.map((soal, index) => ({
                ...soal,
                opsis: [],
                tempId: `temp-soal-${Date.now()}-${index}`,
              })) || [],
              tempId,
            };
            state.koleksiSoals.push(newKoleksiSoal);
            state.isDirty = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        updateKoleksiSoal: (index: number, koleksiSoal: Partial<KoleksiSoalData>) => {
          set((state) => {
            if (state.koleksiSoals[index]) {
              Object.assign(state.koleksiSoals[index], koleksiSoal);
              state.isDirty = true;
            }
          });
        },

        removeKoleksiSoal: (index: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[index]) return;

          const koleksiSoal = koleksiSoals[index];
          
          if (koleksiSoal.tempId) {
            // Remove unsaved koleksi soal (only from local state)
            set((state) => {
              if (koleksiSoal.tempId) {
                state.optimisticUpdates.delete(koleksiSoal.tempId);
              }
              state.koleksiSoals.splice(index, 1);
              state.isDirty = true;
            });
          } else {
            // Mark saved koleksi soal for deletion (will be deleted on save)
            set((state) => {
              state.deletedKoleksiSoals.push(koleksiSoal.id!);
              state.koleksiSoals.splice(index, 1);
              state.isDirty = true;
            });
          }
        },

        saveKoleksiSoal: async (index: number) => {
          const { koleksiSoals, draftId } = get();
          if (!koleksiSoals[index] || !draftId) return;

          const koleksiSoal = koleksiSoals[index];
          if (!koleksiSoal.tempId) return; // Already saved

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { saveKoleksiSoal: saveKoleksiSoalAction } = await import('@/app/actions/kelas');
            
            const result = await saveKoleksiSoalAction(
              draftId, // kelasId
              {
                nama: koleksiSoal.nama,
                deskripsi: koleksiSoal.deskripsi,
                isPrivate: false,
                isDraft: true,
              },
              koleksiSoal.id
            );
            
            if (result.success && result.data) {
              // Update the koleksi with the real ID
              set((state) => {
                state.koleksiSoals[index] = {
                  ...koleksiSoal,
                  id: result.data.id,
                  tempId: undefined, // Clear temp ID as it's now saved
                };
                state.isDirty = false;
                state.isLoading = false;
                if (koleksiSoal.tempId) {
                  state.optimisticUpdates.delete(koleksiSoal.tempId);
                }
              });
              toast.success('Question collection saved successfully');
            } else {
              throw new Error(result.error || 'Failed to save question collection');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save question collection';
            });
            toast.error('Failed to save question collection');
          }
        },

        // Individual Soal actions within KoleksiSoal
        addSoal: (koleksiIndex: number, soal: Omit<SoalData, 'id' | 'opsis'> & { opsis?: Omit<SoalOpsiData, 'id'>[] }) => {
          set((state) => {
            if (state.koleksiSoals[koleksiIndex]) {
              const tempId = `temp-soal-${Date.now()}`;
              const newSoal: SoalData = {
                ...soal,
                opsis: soal.opsis?.map((opsi, index) => ({
                  ...opsi,
                  order: index,
                  tempId: `temp-opsi-${Date.now()}-${index}`,
                })) || [],
                tempId,
              };
              state.koleksiSoals[koleksiIndex].soals.push(newSoal);
              state.isDirty = true;
              state.optimisticUpdates.add(tempId);
            }
          });
        },

        updateSoal: (koleksiIndex: number, soalIndex: number, soal: Partial<SoalData>) => {
          set((state) => {
            if (state.koleksiSoals[koleksiIndex] && state.koleksiSoals[koleksiIndex].soals[soalIndex]) {
              Object.assign(state.koleksiSoals[koleksiIndex].soals[soalIndex], soal);
              state.isDirty = true;
            }
          });
        },

        removeSoal: (koleksiIndex: number, soalIndex: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[koleksiIndex] || !koleksiSoals[koleksiIndex].soals[soalIndex]) return;

          const koleksiSoal = koleksiSoals[koleksiIndex];
          const soal = koleksiSoal.soals[soalIndex];
          
          if (soal.tempId) {
            // Remove unsaved soal (only from local state)
            set((state) => {
              if (soal.tempId) {
                state.optimisticUpdates.delete(soal.tempId);
              }
              state.koleksiSoals[koleksiIndex].soals.splice(soalIndex, 1);
              state.isDirty = true;
            });
          } else {
            // Mark saved soal for deletion (will be deleted on save)
            set((state) => {
              state.deletedSoals.push(soal.id!);
              state.koleksiSoals[koleksiIndex].soals.splice(soalIndex, 1);
              state.isDirty = true;
            });
          }
        },

        // Opsi actions within Soal
        addOpsi: (koleksiIndex: number, soalIndex: number, opsi: Omit<SoalOpsiData, 'id'>) => {
          set((state) => {
            if (state.koleksiSoals[koleksiIndex] && state.koleksiSoals[koleksiIndex].soals[soalIndex]) {
              const tempId = `temp-opsi-${Date.now()}`;
              const currentOpsis = state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis;
              const newOpsi: SoalOpsiData = {
                ...opsi,
                order: currentOpsis.length,
                tempId,
              };
              currentOpsis.push(newOpsi);
              state.isDirty = true;
              state.optimisticUpdates.add(tempId);
            }
          });
        },

        updateOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number, opsi: Partial<SoalOpsiData>) => {
          set((state) => {
            if (state.koleksiSoals[koleksiIndex] && 
                state.koleksiSoals[koleksiIndex].soals[soalIndex] && 
                state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]) {
              Object.assign(state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex], opsi);
              state.isDirty = true;
            }
          });
        },

        removeOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[koleksiIndex] ||
              !koleksiSoals[koleksiIndex].soals[soalIndex] ||
              !koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]) return;

          const soal = koleksiSoals[koleksiIndex].soals[soalIndex];
          const opsi = soal.opsis[opsiIndex];
          
          if (opsi.tempId) {
            // Remove unsaved opsi (only from local state)
            set((state) => {
              if (opsi.tempId) {
                state.optimisticUpdates.delete(opsi.tempId);
              }
              state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis.splice(opsiIndex, 1);
              // Reorder remaining opsis
              state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis.forEach((o: SoalOpsiData, i: number) => {
                o.order = i;
              });
              state.isDirty = true;
            });
          } else {
            // Mark saved opsi for deletion (will be deleted on save)
            set((state) => {
              state.deletedOpsi.push(opsi.id!);
              state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis.splice(opsiIndex, 1);
              // Reorder remaining opsis
              state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis.forEach((o: SoalOpsiData, i: number) => {
                o.order = i;
              });
              state.isDirty = true;
            });
          }
        },

        // Individual Soal saving
        saveSoal: async (koleksiIndex: number, soalIndex: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[koleksiIndex] || !koleksiSoals[koleksiIndex].soals[soalIndex]) return;

          const koleksiSoal = koleksiSoals[koleksiIndex];
          const soal = koleksiSoal.soals[soalIndex];
          
          // Only save if koleksiSoal has a real ID (is saved) and soal has tempId (is unsaved)
          if (!koleksiSoal.id || !soal.tempId) return;

          // Validate the soal data before saving
          if (!soal.pertanyaan || soal.pertanyaan.trim() === '') {
            toast.error('Question is required');
            return;
          }

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { saveSoal: saveSoalAction } = await import('@/app/actions/kelas');
            
            const result = await saveSoalAction(
              koleksiSoal.id,
              {
                pertanyaan: soal.pertanyaan,
                difficulty: soal.difficulty,
                explanation: soal.explanation,
                isActive: soal.isActive,
              },
              soal.id
            );
            
            if (result.success && result.data) {
              // Update the soal with the real ID and save all opsis
              set((state) => {
                const updatedSoal = state.koleksiSoals[koleksiIndex].soals[soalIndex];
                updatedSoal.id = result.data.id;
                if (updatedSoal.tempId) {
                  state.optimisticUpdates.delete(updatedSoal.tempId);
                  delete updatedSoal.tempId;
                }
                state.isLoading = false;
              });

              // Save all opsis for this soal
              const opsisToSave = soal.opsis.filter(opsi => opsi.tempId);
              for (let opsiIndex = 0; opsiIndex < opsisToSave.length; opsiIndex++) {
                await get().saveOpsi(koleksiIndex, soalIndex, opsiIndex);
              }

              toast.success('Question saved successfully');
            } else {
              throw new Error(result.error || 'Failed to save question');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save question';
            });
            toast.error('Failed to save question');
          }
        },

        // Individual Opsi saving
        saveOpsi: async (koleksiIndex: number, soalIndex: number, opsiIndex: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[koleksiIndex] ||
              !koleksiSoals[koleksiIndex].soals[soalIndex] ||
              !koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]) return;

          const soal = koleksiSoals[koleksiIndex].soals[soalIndex];
          const opsi = soal.opsis[opsiIndex];
          
          // Only save if soal has a real ID (is saved) and opsi has tempId (is unsaved)
          if (!soal.id || !opsi.tempId) return;

          try {
            // Validate the opsi data before saving
            if (!opsi.opsiText || opsi.opsiText.trim() === '') {
              console.warn('Skipping save for empty option text');
              return;
            }

            const { saveOpsi: saveOpsiAction } = await import('@/app/actions/kelas');
            
            const result = await saveOpsiAction(
              soal.id,
              {
                opsiText: opsi.opsiText,
                isCorrect: opsi.isCorrect,
                order: opsi.order,
              },
              opsi.id
            );
            
            if (result.success && result.data) {
              // Update the opsi with the real ID
              set((state) => {
                const updatedOpsi = state.koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex];
                updatedOpsi.id = result.data.id;
                if (updatedOpsi.tempId) {
                  state.optimisticUpdates.delete(updatedOpsi.tempId);
                  delete updatedOpsi.tempId;
                }
              });
            } else {
              throw new Error(result.error || 'Failed to save option');
            }
          } catch (error) {
            console.error('Save opsi error:', error);
            // Don't show toast for individual opsi errors as they happen in batch
          }
        },

        // Global actions
        createDraft: async (initialMeta: KelasMetaData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Serialize JSON data to ensure it's safe for server actions
            const serializedMeta = {
              ...initialMeta,
              jsonDescription: initialMeta.jsonDescription 
                ? JSON.parse(JSON.stringify(initialMeta.jsonDescription))
                : undefined
            };
            
            const result = await createDraftKelas(serializedMeta);
            
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

        loadDraft: async (kelasId: number) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { getKelasById } = await import('@/app/actions/kelas');
            const result = await getKelasById(kelasId);
            
            if (result.success && result.data) {
              const kelas = result.data;

              set((state) => {
                state.draftId = kelas.id;
                state.meta = {
                  title: kelas.title,
                  description: kelas.description || '',
                  jsonDescription: kelas.jsonDescription,
                  htmlDescription: kelas.htmlDescription || '',
                  type: kelas.type,
                  level: kelas.level,
                  thumbnail: kelas.thumbnail || '',
                  icon: kelas.icon || '',
                  isPaidClass: kelas.isPaidClass,
                  price: kelas.price ? Number(kelas.price) : undefined,
                  discount: kelas.discount ? Number(kelas.discount) : undefined,
                  promoCode: kelas.promoCode || '',
                };
                
                // Load existing materis
                state.materis = kelas.materis.map((materi: any) => ({
                  id: materi.id,
                  title: materi.title,
                  description: materi.description,
                  jsonDescription: materi.jsonDescription,
                  htmlDescription: materi.htmlDescription,
                  order: materi.order,
                  isDemo: materi.isDemo,
                }));

                // Load existing koleksiSoals
                state.koleksiSoals = (kelas.koleksiSoals || []).map((koleksiSoal: any) => ({
                  id: koleksiSoal.id,
                  nama: koleksiSoal.nama,
                  deskripsi: koleksiSoal.deskripsi,
                  isPrivate: koleksiSoal.isPrivate,
                  isDraft: koleksiSoal.isDraft,
                  soals: (koleksiSoal.soals || []).map((soal: any) => ({
                    id: soal.id,
                    pertanyaan: soal.pertanyaan,
                    difficulty: soal.difficulty,
                    explanation: soal.explanation,
                    isActive: soal.isActive,
                    opsis: (soal.opsis || []).map((opsi: any) => ({
                      id: opsi.id,
                      opsiText: opsi.opsiText,
                      isCorrect: opsi.isCorrect,
                      order: opsi.order,
                    })),
                  })),
                }));

               
                state.isLoading = false;
                state.currentStep = 'meta';
              });
              
              toast.success('Class loaded successfully');
            } else {
              throw new Error(result.error || 'Failed to load draft');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to load draft';
            });
            toast.error('Failed to load draft');
          }
        },

        publishDraft: async () => {
          const { draftId, materis, saveMateris } = get();
          if (!draftId) return;

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Save any unsaved materis before publishing
            const unsavedMateris = materis.filter(m => m.tempId);
            if (unsavedMateris.length > 0) {
              await saveMateris();
            }

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
                state.koleksiSoals = [];
                state.isDirty = false;
                state.optimisticUpdates.clear();
                state.deletedMateris = [];
                state.deletedKoleksiSoals = [];
                state.deletedSoals = [];
                state.deletedOpsi = [];
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
            state.koleksiSoals = [];
            state.isDirty = false;
            state.optimisticUpdates.clear();
            state.deletedMateris = [];
            state.deletedKoleksiSoals = [];
            state.deletedSoals = [];
            state.deletedOpsi = [];
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

        setIsDirty: (dirty: boolean) => {
          set((state) => {
            state.isDirty = dirty;
          });
        },

        // Batch saving for all unsaved assessment data
        saveAllAssessments: async () => {
          const { koleksiSoals, draftId, deletedKoleksiSoals, deletedSoals, deletedOpsi } = get();
          if (!draftId) return;

          console.log('💾 [AUTO-SAVE TRIGGER] saveAllAssessments called:', {
            draftId,
            totalCollections: koleksiSoals.length,
            unsavedCollections: koleksiSoals.filter(k => k.tempId).length,
            totalQuestions: koleksiSoals.reduce((total, k) => total + k.soals.length, 0),
            unsavedQuestions: koleksiSoals.reduce((total, k) => total + k.soals.filter(s => s.tempId).length, 0),
            deletedCollections: deletedKoleksiSoals.length,
            deletedQuestions: deletedSoals.length,
            deletedOptions: deletedOpsi.length
          });

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            console.log('📝 [AUTO-SAVE] Starting batch save of assessments...');
            
            // Handle deletions first
            if (deletedKoleksiSoals.length > 0) {
              console.log('🗑️ [AUTO-SAVE] Deleting koleksi soals:', deletedKoleksiSoals);
              for (const koleksiId of deletedKoleksiSoals) {
                const deleteResult = await deleteKoleksiSoal(koleksiId);
                if (!deleteResult.success) {
                  throw new Error(`Failed to delete koleksi soal ${koleksiId}: ${deleteResult.error}`);
                }
              }
            }

            if (deletedSoals.length > 0) {
              console.log('🗑️ [AUTO-SAVE] Deleting soals:', deletedSoals);
              for (const soalId of deletedSoals) {
                const deleteResult = await deleteSoal(soalId);
                if (!deleteResult.success) {
                  throw new Error(`Failed to delete soal ${soalId}: ${deleteResult.error}`);
                }
              }
            }

            if (deletedOpsi.length > 0) {
              console.log('🗑️ [AUTO-SAVE] Deleting opsi:', deletedOpsi);
              for (const opsiId of deletedOpsi) {
                const deleteResult = await deleteOpsi(opsiId);
                if (!deleteResult.success) {
                  throw new Error(`Failed to delete opsi ${opsiId}: ${deleteResult.error}`);
                }
              }
            }

            // First, save all unsaved koleksi soals
            for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
              const koleksiSoal = koleksiSoals[koleksiIndex];
              
              // Save koleksi soal if it has tempId (unsaved)
              if (koleksiSoal.tempId) {
                console.log(`📝 [AUTO-SAVE] Saving koleksi soal ${koleksiIndex}: ${koleksiSoal.nama}`);
                await get().saveKoleksiSoal(koleksiIndex);
              }
            }

            // Then, save all unsaved soals and their opsis
            for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
              const koleksiSoal = koleksiSoals[koleksiIndex];
              
              // Only proceed if koleksiSoal is saved (has real ID)
              if (koleksiSoal.id) {
                for (let soalIndex = 0; soalIndex < koleksiSoal.soals.length; soalIndex++) {
                  const soal = koleksiSoal.soals[soalIndex];
                  
                  // Save soal if it has tempId (unsaved) and has valid data
                  if (soal.tempId) {
                    // Only save if the question has content
                    if (soal.pertanyaan && soal.pertanyaan.trim() !== '') {
                      console.log(`📝 [AUTO-SAVE] Saving soal ${soalIndex} in koleksi ${koleksiIndex}: ${soal.pertanyaan.substring(0, 50)}...`);
                      await get().saveSoal(koleksiIndex, soalIndex);
                    } else {
                      console.warn(`⚠️ [AUTO-SAVE] Skipping save for empty question in koleksi ${koleksiIndex}, soal ${soalIndex}`);
                    }
                  }
                }
              }
            }

            // Clear deletion tracking
            set((state) => {
              state.deletedKoleksiSoals = [];
              state.deletedSoals = [];
              state.deletedOpsi = [];
              state.isDirty = false;
              state.isLoading = false;
            });

            console.log('✅ [AUTO-SAVE] Batch save of assessments completed successfully');
            toast.success('All assessments saved successfully');
          } catch (error) {
            console.error('❌ [AUTO-SAVE] Batch save of assessments failed:', error);
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save assessments';
            });
            toast.error('Failed to save assessments');
          }
        },
      }))
    ),
    {
      name: 'kelas-builder-store',
    }
  )
);
