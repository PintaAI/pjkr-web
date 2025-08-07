import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, MateriData } from './types';
import { addMateris, reorderMateris, deleteMateri, updateMateri } from '@/app/actions/kelas';

export interface Content {
  materis: MateriData[];
  deletedMateris: number[];
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
        optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
      };
    });
  },
  updateMateri: (index, materi) => {
    set((state) => {
      const newMateris = [...state.materis];
      if (newMateris[index]) {
        newMateris[index] = { ...newMateris[index], ...materi };
      }
      return {
        materis: newMateris,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
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
        const newOptimisticUpdates = new Set(state.optimisticUpdates);
        if (materi.tempId) {
          newOptimisticUpdates.delete(materi.tempId);
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

      // Update order for all materis
      const reorderedMateris = newMateris.map((materi, index) => ({
        ...materi,
        order: index,
      }));

      return {
        materis: reorderedMateris,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: true },
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
    const { draftId, materis, deletedMateris } = get();
    if (!draftId || (materis.length === 0 && deletedMateris.length === 0)) return;

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
            const newOptimisticUpdates = new Set(state.optimisticUpdates);
            const updatedMateris = state.materis.map(m => {
              if (m.tempId) {
                newOptimisticUpdates.delete(m.tempId);
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
      set((state) => ({
        deletedMateris: [],
        isDirty: false,
        stepDirtyFlags: { ...state.stepDirtyFlags, content: false },
        isLoading: false,
      }));
      toast.success('Materis saved successfully');
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save materis',
      });
      toast.error('Failed to save materis');
    }
  },
});