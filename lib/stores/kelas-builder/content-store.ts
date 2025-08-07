import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { addMateris, reorderMateris, deleteMateri, updateMateri } from '@/app/actions/kelas';
import { toast } from 'sonner';

export interface MateriData {
  id?: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  tempId?: string; // For optimistic updates
}

interface ContentStoreState {
  materis: MateriData[];
  deletedMateris: number[]; // IDs of deleted materis
  isDirty: boolean;
  stepDirtyFlags: Record<string, boolean>;
  optimisticUpdates: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface ContentStoreActions {
  addMateri: (materi: Omit<MateriData, 'order'>) => void;
  updateMateri: (index: number, materi: Partial<MateriData>) => void;
  removeMateri: (index: number) => void;
  reorderMateris: (fromIndex: number, toIndex: number) => void;
  toggleMateriDraft: (index: number, draftId: number) => Promise<void>;
  saveMateris: (draftId: number) => Promise<void>;
  setStepDirty: (step: string, dirty: boolean) => void;
  clearStepDirty: (step: string) => void;
  resetContent: () => void;
}

export const useContentStore = create<ContentStoreState & ContentStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        materis: [],
        deletedMateris: [],
        isDirty: false,
        stepDirtyFlags: {},
        optimisticUpdates: new Set(),
        isLoading: false,
        error: null,

        // Actions
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
            state.stepDirtyFlags.content = true;
            state.optimisticUpdates.add(tempId);
          });
        },

        updateMateri: (index: number, materi: Partial<MateriData>) => {
          set((state) => {
            if (state.materis[index]) {
              Object.assign(state.materis[index], materi);
              state.isDirty = true;
              state.stepDirtyFlags.content = true;
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
              state.stepDirtyFlags.content = true;
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
              state.stepDirtyFlags.content = true;
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
            state.stepDirtyFlags.content = true;
          });
        },

        toggleMateriDraft: async (index: number, draftId: number) => {
          const { materis } = get();
          if (!draftId || !materis[index] || !materis[index].id) return;

          const materi = materis[index];
          const newDraftStatus = !materi.isDraft;

          set((state) => {
            if (state.materis[index]) {
              state.materis[index].isDraft = newDraftStatus;
              state.isDirty = true;
              state.stepDirtyFlags.content = true;
            }
          });

          try {
            // Update the materi in the database
            if (!materi.id) throw new Error('Materi ID is required');
            const result = await updateMateri(materi.id, { isDraft: newDraftStatus });
            
            if (result.success) {
              set((state) => {
                if (state.materis[index]) {
                  state.materis[index].isDraft = newDraftStatus;
                  state.isDirty = false;
                  state.stepDirtyFlags.content = false;
                }
              });
              
              const action = newDraftStatus ? 'marked as draft' : 'published';
              toast.success(`Lesson ${action} successfully`);
            } else {
              throw new Error(result.error || 'Failed to update lesson status');
            }
          } catch (error) {
            // Revert the local state if save fails
            set((state) => {
              if (state.materis[index]) {
                state.materis[index].isDraft = !newDraftStatus;
              }
            });
            
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update lesson status';
            });
            
            const action = newDraftStatus ? 'mark as draft' : 'publish';
            toast.error(`Failed to ${action} lesson`);
          }
        },

        saveMateris: async (draftId: number) => {
          const { materis, deletedMateris } = get();
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
              state.stepDirtyFlags.content = false;
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

        resetContent: () => {
          set((state) => {
            state.materis = [];
            state.deletedMateris = [];
            state.isDirty = false;
            state.stepDirtyFlags.content = false;
            state.optimisticUpdates.clear();
          });
        },
      }))
    ),
    {
      name: 'kelas-builder-content-store',
    }
  )
);