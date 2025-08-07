import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Difficulty } from '@prisma/client';
import { 
  deleteKoleksiSoal, 
  deleteSoal, 
  deleteOpsi, 
  reorderSoals,
  saveKoleksiSoal as saveKoleksiSoalAction,
  saveSoal as saveSoalAction,
  saveOpsi as saveOpsiAction
} from '@/app/actions/kelas';
import { toast } from 'sonner';

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
  order?: number;
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

interface AssessmentStoreState {
  soalSets: SoalSetData[];
  koleksiSoals: KoleksiSoalData[];
  deletedKoleksiSoals: number[]; // IDs of deleted koleksi soals
  deletedSoals: number[]; // IDs of deleted soals
  deletedOpsi: number[]; // IDs of deleted opsi
  isDirty: boolean;
  stepDirtyFlags: Record<string, boolean>;
  optimisticUpdates: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface AssessmentStoreActions {
  addSoalSet: (soalSet: Omit<SoalSetData, 'id'>) => void;
  removeSoalSet: (index: number) => void;
  saveSoalSet: (index: number, draftId: number) => Promise<void>;
  
  addKoleksiSoal: (koleksiSoal: Omit<KoleksiSoalData, 'id' | 'soals'> & { soals?: Omit<SoalData, 'opsis'>[] }) => void;
  updateKoleksiSoal: (index: number, koleksiSoal: Partial<KoleksiSoalData>) => void;
  removeKoleksiSoal: (index: number) => void;
  saveKoleksiSoal: (index: number, draftId: number) => Promise<void>;
  
  // Individual Soal actions within KoleksiSoal
  addSoal: (koleksiIndex: number, soal: Omit<SoalData, 'id' | 'opsis'> & { opsis?: Omit<SoalOpsiData, 'id'>[] }) => void;
  updateSoal: (koleksiIndex: number, soalIndex: number, soal: Partial<SoalData>) => void;
  removeSoal: (koleksiIndex: number, soalIndex: number) => void;
  reorderSoals: (koleksiIndex: number, fromIndex: number, toIndex: number) => void;
  saveSoal: (koleksiIndex: number, soalIndex: number, draftId: number) => Promise<void>;
  
  // Opsi actions within Soal
  addOpsi: (koleksiIndex: number, soalIndex: number, opsi: Omit<SoalOpsiData, 'id'>) => void;
  updateOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number, opsi: Partial<SoalOpsiData>) => void;
  removeOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => void;
  saveOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number, draftId: number) => Promise<void>;
  
  setStepDirty: (step: string, dirty: boolean) => void;
  clearStepDirty: (step: string) => void;
  resetAssessment: () => void;
  
  // Batch saving for all unsaved assessment data
  saveAllAssessments: (draftId: number) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentStoreState & AssessmentStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        soalSets: [],
        koleksiSoals: [],
        deletedKoleksiSoals: [],
        deletedSoals: [],
        deletedOpsi: [],
        isDirty: false,
        stepDirtyFlags: {},
        optimisticUpdates: new Set(),
        isLoading: false,
        error: null,

        // Soal Set actions
        addSoalSet: (soalSet: Omit<SoalSetData, 'id'>) => {
          set((state) => {
            const tempId = `temp-soal-${Date.now()}`;
            const newSoalSet: SoalSetData = {
              ...soalSet,
              tempId,
            };
            state.soalSets.push(newSoalSet);
            state.isDirty = true;
            state.stepDirtyFlags.assessment = true;
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
              state.stepDirtyFlags.assessment = true;
            }
          });
        },

        saveSoalSet: async (index: number, draftId: number) => {
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
              state.stepDirtyFlags.assessment = false;
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
            state.stepDirtyFlags.assessment = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        updateKoleksiSoal: (index: number, koleksiSoal: Partial<KoleksiSoalData>) => {
          set((state) => {
            if (state.koleksiSoals[index]) {
              Object.assign(state.koleksiSoals[index], koleksiSoal);
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
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
              state.stepDirtyFlags.assessment = true;
            });
          } else {
            // Mark saved koleksi soal for deletion (will be deleted on save)
            set((state) => {
              state.deletedKoleksiSoals.push(koleksiSoal.id!);
              state.koleksiSoals.splice(index, 1);
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
            });
          }
        },

        saveKoleksiSoal: async (index: number, draftId: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[index] || !draftId) return;

          const koleksiSoal = koleksiSoals[index];
          
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            let result: any;
            if (koleksiSoal.tempId) {
              // New koleksi - create it
              result = await saveKoleksiSoalAction(
                draftId, // kelasId
                {
                  nama: koleksiSoal.nama,
                  deskripsi: koleksiSoal.deskripsi,
                  isPrivate: false,
                  isDraft: true,
                },
                undefined // No ID for new items
              );
              
              if (result.success && result.data) {
                // Update the koleksi with the real ID
                set((state) => {
                  state.koleksiSoals[index] = {
                    ...koleksiSoal,
                    id: result.data.id,
                    tempId: undefined, // Clear temp ID as it's now saved
                  };
                  if (koleksiSoal.tempId) {
                    state.optimisticUpdates.delete(koleksiSoal.tempId);
                  }
                });
              }
            } else {
              // Existing koleksi - update it
              result = await saveKoleksiSoalAction(
                draftId, // kelasId
                {
                  nama: koleksiSoal.nama,
                  deskripsi: koleksiSoal.deskripsi,
                  isPrivate: false,
                  isDraft: true,
                },
                koleksiSoal.id // Existing ID
              );
            }
            
            if (result.success) {
              set((state) => {
                state.isDirty = false;
                state.stepDirtyFlags.assessment = false;
                state.isLoading = false;
              });
              toast.success(koleksiSoal.tempId ? 'Question collection created successfully' : 'Question collection updated successfully');
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
                order: state.koleksiSoals[koleksiIndex].soals.length, // Set order to current length (will be reindexed if needed)
                opsis: soal.opsis?.map((opsi, index) => ({
                  ...opsi,
                  order: index,
                  tempId: `temp-opsi-${Date.now()}-${index}`,
                })) || [],
                tempId,
              };
              state.koleksiSoals[koleksiIndex].soals.push(newSoal);
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
              state.optimisticUpdates.add(tempId);
            }
          });
        },

        updateSoal: (koleksiIndex: number, soalIndex: number, soal: Partial<SoalData>) => {
          set((state) => {
            if (state.koleksiSoals[koleksiIndex] && state.koleksiSoals[koleksiIndex].soals[soalIndex]) {
              Object.assign(state.koleksiSoals[koleksiIndex].soals[soalIndex], soal);
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
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
              // Reorder remaining soals
              state.koleksiSoals[koleksiIndex].soals.forEach((s: SoalData, i: number) => {
                s.order = i;
              });
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
            });
          } else {
            // Mark saved soal for deletion (will be deleted on save)
            set((state) => {
              state.deletedSoals.push(soal.id!);
              state.koleksiSoals[koleksiIndex].soals.splice(soalIndex, 1);
              // Reorder remaining soals
              state.koleksiSoals[koleksiIndex].soals.forEach((s: SoalData, i: number) => {
                s.order = i;
              });
              state.isDirty = true;
              state.stepDirtyFlags.assessment = true;
            });
          }
        },

        reorderSoals: (koleksiIndex: number, fromIndex: number, toIndex: number) => {
          set((state) => {
            const koleksiSoal = state.koleksiSoals[koleksiIndex];
            if (!koleksiSoal || !koleksiSoal.soals[fromIndex] || !koleksiSoal.soals[toIndex]) return;

            const soals = koleksiSoal.soals;
            const [movedSoal] = soals.splice(fromIndex, 1);
            soals.splice(toIndex, 0, movedSoal);
            
            // Update order for all soals in this koleksi
            soals.forEach((soal: SoalData, index: number) => {
              soal.order = index;
            });
            
            state.isDirty = true;
            state.stepDirtyFlags.assessment = true;
          });
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
              state.stepDirtyFlags.assessment = true;
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
              state.stepDirtyFlags.assessment = true;
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
              state.stepDirtyFlags.assessment = true;
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
              state.stepDirtyFlags.assessment = true;
            });
          }
        },

        // Individual Soal saving
        saveSoal: async (koleksiIndex: number, soalIndex: number, draftId: number) => {
          const { koleksiSoals } = get();
          if (!koleksiSoals[koleksiIndex] || !koleksiSoals[koleksiIndex].soals[soalIndex]) return;

          const koleksiSoal = koleksiSoals[koleksiIndex];
          const soal = koleksiSoal.soals[soalIndex];
          
          // Only save if koleksiSoal has a real ID (is saved)
          if (!koleksiSoal.id) return;

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
            const result = await saveSoalAction(
              koleksiSoal.id,
              {
                pertanyaan: soal.pertanyaan,
                difficulty: soal.difficulty,
                explanation: soal.explanation,
                isActive: soal.isActive,
              },
              soal.id || undefined // Pass undefined for new items, existing ID for updates
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
                state.stepDirtyFlags.assessment = false;
              });

              // Save all opsis for this soal
              const opsisToSave = soal.opsis.filter(opsi => opsi.tempId);
              for (let opsiIndex = 0; opsiIndex < opsisToSave.length; opsiIndex++) {
                await get().saveOpsi(koleksiIndex, soalIndex, opsiIndex, draftId);
              }

              toast.success(soal.tempId ? 'Question created successfully' : 'Question updated successfully');
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
        saveOpsi: async (koleksiIndex: number, soalIndex: number, opsiIndex: number, draftId: number) => {
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

        resetAssessment: () => {
          set((state) => {
            state.soalSets = [];
            state.koleksiSoals = [];
            state.deletedKoleksiSoals = [];
            state.deletedSoals = [];
            state.deletedOpsi = [];
            state.isDirty = false;
            state.stepDirtyFlags.assessment = false;
            state.optimisticUpdates.clear();
          });
        },

        // Batch saving for all unsaved assessment data
        saveAllAssessments: async (draftId: number) => {
          const { koleksiSoals, deletedKoleksiSoals, deletedSoals, deletedOpsi } = get();
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

            // Get the current state to check dirty flags
            const currentState = get();
            
            // First, save all koleksi soals (both new and existing)
            for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
              const koleksiSoal = koleksiSoals[koleksiIndex];
              
              // Save koleksi soal if it has tempId (new) OR if it has changes (existing)
              if (koleksiSoal.tempId || currentState.stepDirtyFlags.assessment) {
                console.log(`📝 [AUTO-SAVE] Saving koleksi soal ${koleksiIndex}: ${koleksiSoal.nama}`);
                await get().saveKoleksiSoal(koleksiIndex, draftId);
              }
            }

            // Then, save all soals and their opsis
            for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
              const koleksiSoal = koleksiSoals[koleksiIndex];
              
              // Only proceed if koleksiSoal is saved (has real ID)
              if (koleksiSoal.id) {
                for (let soalIndex = 0; soalIndex < koleksiSoal.soals.length; soalIndex++) {
                  const soal = koleksiSoal.soals[soalIndex];
                  
                  // Save soal if it has tempId (new) OR if it has changes (existing) and has valid data
                  if (soal.tempId || currentState.stepDirtyFlags.assessment) {
                    // Only save if the question has content
                    if (soal.pertanyaan && soal.pertanyaan.trim() !== '') {
                      console.log(`📝 [AUTO-SAVE] Saving soal ${soalIndex} in koleksi ${koleksiIndex}: ${soal.pertanyaan.substring(0, 50)}...`);
                      await get().saveSoal(koleksiIndex, soalIndex, draftId);
                    } else {
                      console.warn(`⚠️ [AUTO-SAVE] Skipping save for empty question in koleksi ${koleksiIndex}, soal ${soalIndex}`);
                    }
                  }
                }
              }
            }

            // Handle reordering for saved soals
            const reorderBatches: {koleksiSoalId: number, soalOrders: {id: number, order: number}[]}[] = [];
            
            for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
              const koleksiSoal = koleksiSoals[koleksiIndex];
              
              // Only proceed if koleksiSoal is saved (has real ID)
              if (koleksiSoal.id) {
                const soalOrders = koleksiSoal.soals
                  .filter(soal => soal.id) // Only include saved soals
                  .map(soal => ({
                    id: soal.id!,
                    order: soal.order ?? 0
                  }));
                
                if (soalOrders.length > 0) {
                  reorderBatches.push({
                    koleksiSoalId: koleksiSoal.id,
                    soalOrders
                  });
                }
              }
            }

            // Execute reordering for each koleksi
            for (const batch of reorderBatches) {
              console.log(`🔄 [AUTO-SAVE] Reordering soals for koleksi ${batch.koleksiSoalId}:`, batch.soalOrders);
              await reorderSoals(batch.koleksiSoalId, batch.soalOrders);
            }

            // Clear deletion tracking
            set((state) => {
              state.deletedKoleksiSoals = [];
              state.deletedSoals = [];
              state.deletedOpsi = [];
              state.isDirty = false;
              state.stepDirtyFlags.assessment = false;
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
      name: 'kelas-builder-assessment-store',
    }
  )
);