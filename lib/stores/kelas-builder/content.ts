import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, MateriData } from './types';
import { addMateris,deleteMateri, updateMateri } from '@/app/actions/kelas';

export interface Content {
  materis: MateriData[];
  deletedMateris: number[];
  dirtyMateris: Set<number>;
  addMateri: (materi: Omit<MateriData, 'order'>) => void;
  updateMateri: (index: number, materi: Partial<MateriData>) => void;
  removeMateri: (index: number) => void;
  reorderMateris: (fromIndex: number, toIndex: number) => void;
  toggleMateriDraft: (index: number) => Promise<void>;
  saveMateris: () => Promise<void>;
}

export const createContent: StateCreator<
  KelasBuilderState,
  [],
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
      return {
        materis: [...state.materis, newMateri],
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          koleksi: new Set(state.optimisticUpdates.koleksi).add(tempId),
        },
      };
    });
  },
  updateMateri: (index, materi) => {
    set((state) => {
      const newMateris = [...state.materis];
      const newDirtyMateris = new Set(state.dirtyMateris);
      if (newMateris[index]) {
        newMateris[index] = { ...newMateris[index], ...materi };
        if (newMateris[index].id) {
          newDirtyMateris.add(newMateris[index].id!);
        }
      }
      return {
        materis: newMateris,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
        dirtyMateris: newDirtyMateris,
      };
    });
  },
  removeMateri: (index) => {
    const { materis } = get();
    if (!materis[index]) return;

    const materi = materis[index];

    if (materi.tempId) {
      // Remove unsaved materi (only from local state)
      set((state) => {
        const newOptimisticUpdates = {
          ...state.optimisticUpdates,
          koleksi: new Set(state.optimisticUpdates.koleksi),
        };
        if (materi.tempId) {
          newOptimisticUpdates.koleksi.delete(materi.tempId);
        }
        const newMateris = state.materis.filter((_, i) => i !== index);
        // Reorder remaining materis
        const reorderedMateris = newMateris.map((m, i) => ({ ...m, order: i }));
        return {
          optimisticUpdates: newOptimisticUpdates,
          materis: reorderedMateris,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
        };
      });
    } else {
      // Mark saved materi for deletion (will be deleted on save)
      set((state) => {
        const newMateris = state.materis.filter((_, i) => i !== index);
        // Reorder remaining materis
        const reorderedMateris = newMateris.map((m, i) => ({ ...m, order: i }));
        return {
          deletedMateris: [...state.deletedMateris, materi.id!],
          materis: reorderedMateris,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
        };
      });
    }
  },
  reorderMateris: (fromIndex, toIndex) => {
    set((state) => {
      const newMateris = [...state.materis];
      const [movedItem] = newMateris.splice(fromIndex, 1);
      newMateris.splice(toIndex, 0, movedItem);

      const newDirtyMateris = new Set(state.dirtyMateris);
      // Update order for all materis and mark them as dirty
      const reorderedMateris = newMateris.map((materi, index) => {
        if (materi.id) {
          newDirtyMateris.add(materi.id);
        }
        return {
          ...materi,
          order: index,
        };
      });

      return {
        materis: reorderedMateris,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
        dirtyMateris: newDirtyMateris,
      };
    });
  },
  toggleMateriDraft: async (index) => {
    const { draftId, materis } = get();
    if (!draftId || !materis[index] || !materis[index].id) return;

    const materi = materis[index];
    const newDraftStatus = !materi.isDraft;

    set((state) => {
      const newMateris = [...state.materis];
      if (newMateris[index]) {
        newMateris[index] = { ...newMateris[index], isDraft: newDraftStatus };
      }
      return {
        materis: newMateris,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
      };
    });

    try {
      // Update the materi in the database
      if (!materi.id) throw new Error('Materi ID is required');
      const result = await updateMateri(materi.id, { isDraft: newDraftStatus });

      if (result.success) {
        set((state) => {
          const newMateris = [...state.materis];
          if (newMateris[index]) {
            newMateris[index] = { ...newMateris[index], isDraft: newDraftStatus };
          }
          return {
            materis: newMateris,
            isDirty: false,
            stepDirtyFlags: { ...state.stepDirtyFlags, content: false },
          };
        });

        const action = newDraftStatus ? 'marked as draft' : 'published';
        toast.success(`Lesson ${action} successfully`);
      } else {
        throw new Error(result.error || 'Failed to update lesson status');
      }
    } catch (error) {
      // Revert the local state if save fails
      set((state) => {
        const newMateris = [...state.materis];
        if (newMateris[index]) {
          newMateris[index] = { ...newMateris[index], isDraft: !newDraftStatus };
        }
        return {
          materis: newMateris,
          error: error instanceof Error ? error.message : 'Failed to update lesson status',
        };
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
          jsonDescription: JSON.parse(JSON.stringify(materi.jsonDescription || {})),
        }));

        const result = await addMateris(draftId, serializedMateris);
        if (result.success) {
          set((state) => {
            const newOptimisticUpdates = {
              ...state.optimisticUpdates,
              koleksi: new Set(state.optimisticUpdates.koleksi),
            };
            const updatedMateris = state.materis.map((m) => {
              if (m.tempId) {
                newOptimisticUpdates.koleksi.delete(m.tempId);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, ...rest } = m;
                return rest;
              }
              return m;
            });
            return {
              materis: updatedMateris as MateriData[],
              optimisticUpdates: newOptimisticUpdates,
            };
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
      set((state) => ({
        deletedMateris: [],
        dirtyMateris: new Set(),
        isDirty: false,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: false },
        isLoading: false,
      }));
      toast.success('Content saved successfully');
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save content',
      });
      toast.error('Failed to save content');
    }
  },
});