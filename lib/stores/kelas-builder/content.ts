import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, MateriData } from './types';
import { addMateris,deleteMateri, updateMateri } from '@/app/actions/kelas';

export interface Content {
  materis: MateriData[];
  deletedMateris: number[];
  dirtyMateris: Set<number>;
  addMateri: (materi: Omit<MateriData, 'order'>) => void;
  updateMateri: (id: number | string, materi: Partial<MateriData>) => void;
  removeMateri: (id: number | string) => void;
  reorderMateris: (fromId: number | string, toId: number | string) => void;
  toggleMateriDraft: (id: number | string) => Promise<void>;
  saveMateris: () => Promise<void>;
}

export const createContent: StateCreator<
  KelasBuilderState,
  [["zustand/immer", never]],
  [],
  Content
> = (set, get) => ({
  materis: [],
  deletedMateris: [],
  dirtyMateris: new Set(),
  addMateri: (materi) => {
    set((state) => {
      const tempId = `temp-${Date.now()}`;
      const newMateri: MateriData = {
        ...materi,
        order: state.materis.length,
        tempId,
      };
      state.materis.push(newMateri);
      state.stepDirtyFlags.content = true;
    });
  },
  updateMateri: (id, materi) => {
    set((state) => {
      const materiIndex = state.materis.findIndex(m => m.id === id || m.tempId === id);
      
      if (materiIndex !== -1) {
        state.materis[materiIndex] = {
          ...state.materis[materiIndex],
          ...materi,
        };
        if (state.materis[materiIndex].id) {
          state.dirtyMateris.add(state.materis[materiIndex].id!);
        }
      }
      state.stepDirtyFlags.content = true;
    });
  },
  removeMateri: (id) => {
    const { materis } = get();
    const materiIndex = materis.findIndex(m => m.id === id || m.tempId === id);
    
    if (materiIndex === -1) return;

    const materi = materis[materiIndex];

    if (materi.tempId) {
      // Remove unsaved materi (only from local state)
      set((state) => {
        state.materis.splice(materiIndex, 1);
        // Reorder remaining materis
        state.materis.forEach((m, i) => {
          m.order = i;
        });
        state.stepDirtyFlags.content = true;
      });
    } else {
      // Mark saved materi for deletion (will be deleted on save)
      set((state) => {
        state.deletedMateris.push(materi.id!);
        state.materis.splice(materiIndex, 1);
        // Reorder remaining materis
        state.materis.forEach((m, i) => {
          m.order = i;
        });
        state.stepDirtyFlags.content = true;
      });
    }
  },
  reorderMateris: (fromId, toId) => {
    set((state) => {
      const fromItem = state.materis.find(m => m.id === fromId || m.tempId === fromId);
      const toItem = state.materis.find(m => m.id === toId || m.tempId === toId);
      
      if (!fromItem || !toItem) return;

      const fromOrder = fromItem.order;
      const toOrder = toItem.order;
      
      if (fromOrder < toOrder) {
        // Moving down: increase order of items between from and to
        state.materis.forEach(materi => {
          if (materi.id === fromId || materi.tempId === fromId) {
            // Move the from item to the to position
            materi.order = toOrder;
          } else if (materi.order > fromOrder && materi.order <= toOrder) {
            // Shift items down
            if (materi.id) {
              state.dirtyMateris.add(materi.id);
            }
            materi.order = materi.order - 1;
          }
        });
      } else {
        // Moving up: decrease order of items between to and from
        state.materis.forEach(materi => {
          if (materi.id === fromId || materi.tempId === fromId) {
            // Move the from item to the to position
            materi.order = toOrder;
          } else if (materi.order >= toOrder && materi.order < fromOrder) {
            // Shift items up
            if (materi.id) {
              state.dirtyMateris.add(materi.id);
            }
            materi.order = materi.order + 1;
          }
        });
      }

      // Mark all items with real IDs as dirty
      state.materis.forEach(materi => {
        if (materi.id) {
          state.dirtyMateris.add(materi.id);
        }
      });

      state.stepDirtyFlags.content = true;
    });
  },
  toggleMateriDraft: async (id) => {
    const { draftId, materis } = get();
    const materiIndex = materis.findIndex(m => m.id === id || m.tempId === id);
    
    if (!draftId || materiIndex === -1 || !materis[materiIndex].id) return;

    const materi = materis[materiIndex];
    const newDraftStatus = !materi.isDraft;

    set((state) => {
      if (state.materis[materiIndex]) {
        state.materis[materiIndex].isDraft = newDraftStatus;
      }
      state.stepDirtyFlags.content = true;
    });

    try {
      // Update the materi in the database
      if (!materi.id) throw new Error('Materi ID is required');
      const result = await updateMateri(materi.id, { isDraft: newDraftStatus });

      if (result.success) {
        set((state) => {
          if (state.materis[materiIndex]) {
            state.materis[materiIndex].isDraft = newDraftStatus;
          }
          state.stepDirtyFlags.content = false;
        });

        const action = newDraftStatus ? 'marked as draft' : 'published';
        toast.success(`Lesson ${action} successfully`);
      } else {
        throw new Error(result.error || 'Failed to update lesson status');
      }
    } catch (error) {
      // Revert the local state if save fails
      set((state) => {
        if (state.materis[materiIndex]) {
          state.materis[materiIndex].isDraft = !newDraftStatus;
        }
        state.error = error instanceof Error ? error.message : 'Failed to update lesson status';
      });

      const action = newDraftStatus ? 'mark as draft' : 'publish';
      toast.error(`Failed to ${action} lesson`);
    }
  },
  saveMateris: async () => {
    const { draftId, materis, deletedMateris, dirtyMateris } = get();
    if (!draftId) return;

    const newMateris = materis.filter((m) => m.tempId);
    if (newMateris.length === 0 && deletedMateris.length === 0 && dirtyMateris.size === 0) {
      return;
    }

    set({ isLoading: true, error: null });

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

      // Handle additions
      if (newMateris.length > 0) {
        console.log('➕ [SAVE] Adding new materis:', newMateris.length);
        const serializedMateris = newMateris.map((materi) => ({
          ...materi,
          tempId: materi.tempId, // Include tempId for mapping
          jsonDescription: JSON.parse(JSON.stringify(materi.jsonDescription || {})),
        }));

        const result = await addMateris(draftId, serializedMateris);
        if (result.success && result.data && result.tempIdMapping) {
          // Use safe tempId → real ID mapping from backend
          set((state) => {
            state.materis.forEach((m) => {
              // If this is a temp item, use the mapping to get real ID
              if (m.tempId && result.tempIdMapping![m.tempId]) {
                const realId = result.tempIdMapping![m.tempId];
                const serverMateri = result.data!.find(sm => sm.id === realId);
                
                if (serverMateri) {
                  // Replace temp item with server version that has real ID
                  m.id = serverMateri.id;
                  m.tempId = undefined;
                  m.title = serverMateri.title;
                  m.description = serverMateri.description;
                  m.jsonDescription = serverMateri.jsonDescription;
                  m.htmlDescription = serverMateri.htmlDescription;
                  m.order = serverMateri.order;
                  m.isDraft = serverMateri.isDraft;
                  m.isDemo = serverMateri.isDemo;
                }
              }
            });
          });
        } else {
          throw new Error(result.error || 'Failed to save new materis');
        }
      }

      // Handle updates for existing materis
      if (dirtyMateris.size > 0) {
        const materisToUpdate = materis.filter((m) => m.id && dirtyMateris.has(m.id));
        console.log('📝 [SAVE] Updating existing materis:', materisToUpdate.length);
        for (const materi of materisToUpdate) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tempId, ...dataToUpdate } = materi;
          const result = await updateMateri(materi.id!, {
            ...dataToUpdate,
            jsonDescription: JSON.parse(JSON.stringify(dataToUpdate.jsonDescription || {})),
          });
          if (!result.success) {
            throw new Error(`Failed to update materi ${materi.id}: ${result.error}`);
          }
        }
      }

      // Clear deletion and dirty tracking
      set((state) => {
        state.deletedMateris = [];
        state.dirtyMateris = new Set();
        state.stepDirtyFlags.content = false;
        state.isLoading = false;
      });
      toast.success('Content saved successfully');
    } catch (error) {
      set((state) => {
        state.isLoading = false;
        state.error = error instanceof Error ? error.message : 'Failed to save content';
      });
      toast.error('Failed to save content');
    }
  },
});