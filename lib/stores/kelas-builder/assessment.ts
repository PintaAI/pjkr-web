import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type { KelasBuilderState, SoalSetData, KoleksiSoalData, SoalData, SoalOpsiData } from './types';
import {
  deleteKoleksiSoal,
  deleteSoal,
  deleteOpsi,
  reorderSoals,
  saveKoleksiSoal as saveKoleksiSoalAction,
  saveSoal as saveSoalAction,
  saveOpsi as saveOpsiAction,
} from '@/app/actions/kelas';

export interface Assessment {
  soalSets: SoalSetData[];
  koleksiSoals: KoleksiSoalData[];
  deletedKoleksiSoals: number[];
  deletedSoals: number[];
  deletedOpsi: number[];
  addSoalSet: (soalSet: Omit<SoalSetData, 'id'>) => void;
  removeSoalSet: (index: number) => void;
  saveSoalSet: (index: number) => Promise<void>;
  addKoleksiSoal: (koleksiSoal: Omit<KoleksiSoalData, 'id' | 'soals'> & { soals?: Omit<SoalData, 'opsis'>[] }) => void;
  updateKoleksiSoal: (index: number, koleksiSoal: Partial<KoleksiSoalData>) => void;
  removeKoleksiSoal: (index: number) => void;
  saveKoleksiSoal: (index: number) => Promise<void>;
  addSoal: (koleksiIndex: number, soal: Omit<SoalData, 'id' | 'opsis'> & { opsis?: Omit<SoalOpsiData, 'id'>[] }) => void;
  updateSoal: (koleksiIndex: number, soalIndex: number, soal: Partial<SoalData>) => void;
  removeSoal: (koleksiIndex: number, soalIndex: number) => void;
  reorderSoals: (koleksiIndex: number, fromIndex: number, toIndex: number) => void;
  saveSoal: (koleksiIndex: number, soalIndex: number) => Promise<void>;
  addOpsi: (koleksiIndex: number, soalIndex: number, opsi: Omit<SoalOpsiData, 'id'>) => void;
  updateOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number, opsi: Partial<SoalOpsiData>) => void;
  removeOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => void;
  saveOpsi: (koleksiIndex: number, soalIndex: number, opsiIndex: number) => Promise<void>;
  saveAllAssessments: () => Promise<void>;
}

export const createAssessment: StateCreator<
  KelasBuilderState,
  [],
  [],
  Assessment
> = (set, get) => ({
  soalSets: [],
  koleksiSoals: [],
  deletedKoleksiSoals: [],
  deletedSoals: [],
  deletedOpsi: [],
  addSoalSet: (soalSet) => {
    set((state) => {
      const tempId = `temp-soal-${Date.now()}`;
      const newSoalSet: SoalSetData = {
        ...soalSet,
        tempId,
      };
      return {
        soalSets: [...state.soalSets, newSoalSet],
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
      };
    });
  },
  removeSoalSet: (index) => {
    set((state) => {
      const soalSet = state.soalSets[index];
      if (!soalSet) return state;

      const newOptimisticUpdates = new Set(state.optimisticUpdates);
      if (soalSet.tempId) {
        newOptimisticUpdates.delete(soalSet.tempId);
      }
      const newSoalSets = state.soalSets.filter((_, i) => i !== index);
      return {
        soalSets: newSoalSets,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        optimisticUpdates: newOptimisticUpdates,
      };
    });
  },
  saveSoalSet: async (index) => {
    const { soalSets } = get();
    if (!soalSets[index]) return;

    const soalSet = soalSets[index];
    if (!soalSet.tempId) return; // Already saved

    set({ isLoading: true, error: null });

    try {
      // Note: Soal set functionality not implemented in simplified actions
      // This would need to be implemented if assessment features are needed
      toast.info('Question set functionality not implemented yet');

      set({
        isLoading: false,
        stepDirtyFlags: { ...get().stepDirtyFlags, assessment: false },
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to link question set',
      });
      toast.error('Failed to link question set');
    }
  },
  addKoleksiSoal: (koleksiSoal) => {
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
      return {
        koleksiSoals: [...state.koleksiSoals, newKoleksiSoal],
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
      };
    });
  },
  updateKoleksiSoal: (index, koleksiSoal) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      if (newKoleksiSoals[index]) {
        newKoleksiSoals[index] = { ...newKoleksiSoals[index], ...koleksiSoal };
      }
      return {
        koleksiSoals: newKoleksiSoals,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
      };
    });
  },
  removeKoleksiSoal: (index) => {
    const { koleksiSoals } = get();
    if (!koleksiSoals[index]) return;

    const koleksiSoal = koleksiSoals[index];

    if (koleksiSoal.tempId) {
      // Remove unsaved koleksi soal (only from local state)
      set((state) => {
        const newOptimisticUpdates = new Set(state.optimisticUpdates);
        if (koleksiSoal.tempId) {
          newOptimisticUpdates.delete(koleksiSoal.tempId);
        }
        const newKoleksiSoals = state.koleksiSoals.filter((_, i) => i !== index);
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
          optimisticUpdates: newOptimisticUpdates,
        };
      });
    } else {
      // Mark saved koleksi soal for deletion (will be deleted on save)
      set((state) => ({
        deletedKoleksiSoals: [...state.deletedKoleksiSoals, koleksiSoal.id!],
        koleksiSoals: state.koleksiSoals.filter((_, i) => i !== index),
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
      }));
    }
  },
  saveKoleksiSoal: async (index) => {
    const { koleksiSoals, draftId } = get();
    if (!koleksiSoals[index] || !draftId) return;

    const koleksiSoal = koleksiSoals[index];

    set({ isLoading: true, error: null });

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
            const newKoleksiSoals = [...state.koleksiSoals];
            const newOptimisticUpdates = new Set(state.optimisticUpdates);
            if (koleksiSoal.tempId) {
              newOptimisticUpdates.delete(koleksiSoal.tempId);
            }
            newKoleksiSoals[index] = {
              ...koleksiSoal,
              id: result.data.id,
              tempId: undefined, // Clear temp ID as it's now saved
            };
            return {
              koleksiSoals: newKoleksiSoals,
              optimisticUpdates: newOptimisticUpdates,
            };
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
        set((state) => ({
          isDirty: false,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: false },
          isLoading: false,
        }));
        toast.success(koleksiSoal.tempId ? 'Question collection created successfully' : 'Question collection updated successfully');
      } else {
        throw new Error(result.error || 'Failed to save question collection');
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save question collection',
      });
      toast.error('Failed to save question collection');
    }
  },
  addSoal: (koleksiIndex, soal) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      if (newKoleksiSoals[koleksiIndex]) {
        const tempId = `temp-soal-${Date.now()}`;
        const newSoal: SoalData = {
          ...soal,
          order: newKoleksiSoals[koleksiIndex].soals.length, // Set order to current length (will be reindexed if needed)
          opsis: soal.opsis?.map((opsi, index) => ({
            ...opsi,
            order: index,
            tempId: `temp-opsi-${Date.now()}-${index}`,
          })) || [],
          tempId,
        };
        newKoleksiSoals[koleksiIndex] = {
          ...newKoleksiSoals[koleksiIndex],
          soals: [...newKoleksiSoals[koleksiIndex].soals, newSoal],
        };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
          optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
        };
      }
      return state;
    });
  },
  updateSoal: (koleksiIndex, soalIndex, soal) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      if (newKoleksiSoals[koleksiIndex] && newKoleksiSoals[koleksiIndex].soals[soalIndex]) {
        newKoleksiSoals[koleksiIndex].soals[soalIndex] = {
          ...newKoleksiSoals[koleksiIndex].soals[soalIndex],
          ...soal,
        };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        };
      }
      return state;
    });
  },
  removeSoal: (koleksiIndex, soalIndex) => {
    const { koleksiSoals } = get();
    if (!koleksiSoals[koleksiIndex] || !koleksiSoals[koleksiIndex].soals[soalIndex]) return;

    const koleksiSoal = koleksiSoals[koleksiIndex];
    const soal = koleksiSoal.soals[soalIndex];

    if (soal.tempId) {
      // Remove unsaved soal (only from local state)
      set((state) => {
        const newKoleksiSoals = [...state.koleksiSoals];
        const newOptimisticUpdates = new Set(state.optimisticUpdates);
        if (soal.tempId) {
          newOptimisticUpdates.delete(soal.tempId);
        }
        const newSoals = newKoleksiSoals[koleksiIndex].soals.filter((_, i) => i !== soalIndex);
        const reorderedSoals = newSoals.map((s, i) => ({ ...s, order: i }));
        newKoleksiSoals[koleksiIndex] = { ...newKoleksiSoals[koleksiIndex], soals: reorderedSoals };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
          optimisticUpdates: newOptimisticUpdates,
        };
      });
    } else {
      // Mark saved soal for deletion (will be deleted on save)
      set((state) => {
        const newKoleksiSoals = [...state.koleksiSoals];
        const newSoals = newKoleksiSoals[koleksiIndex].soals.filter((_, i) => i !== soalIndex);
        const reorderedSoals = newSoals.map((s, i) => ({ ...s, order: i }));
        newKoleksiSoals[koleksiIndex] = { ...newKoleksiSoals[koleksiIndex], soals: reorderedSoals };
        return {
          deletedSoals: [...state.deletedSoals, soal.id!],
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        };
      });
    }
  },
  reorderSoals: (koleksiIndex, fromIndex, toIndex) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      const koleksiSoal = newKoleksiSoals[koleksiIndex];
      if (!koleksiSoal || !koleksiSoal.soals[fromIndex] || !koleksiSoal.soals[toIndex]) return state;

      const soals = [...koleksiSoal.soals];
      const [movedSoal] = soals.splice(fromIndex, 1);
      soals.splice(toIndex, 0, movedSoal);

      // Update order for all soals in this koleksi
      const reorderedSoals = soals.map((soal, index) => ({
        ...soal,
        order: index,
      }));
      newKoleksiSoals[koleksiIndex] = { ...koleksiSoal, soals: reorderedSoals };

      return {
        koleksiSoals: newKoleksiSoals,
        isDirty: true,
        stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
      };
    });
  },
  addOpsi: (koleksiIndex, soalIndex, opsi) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      if (newKoleksiSoals[koleksiIndex] && newKoleksiSoals[koleksiIndex].soals[soalIndex]) {
        const tempId = `temp-opsi-${Date.now()}`;
        const currentOpsis = newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis;
        const newOpsi: SoalOpsiData = {
          ...opsi,
          order: currentOpsis.length,
          tempId,
        };
        newKoleksiSoals[koleksiIndex].soals[soalIndex] = {
          ...newKoleksiSoals[koleksiIndex].soals[soalIndex],
          opsis: [...currentOpsis, newOpsi],
        };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
          optimisticUpdates: new Set(state.optimisticUpdates).add(tempId),
        };
      }
      return state;
    });
  },
  updateOpsi: (koleksiIndex, soalIndex, opsiIndex, opsi) => {
    set((state) => {
      const newKoleksiSoals = [...state.koleksiSoals];
      if (
        newKoleksiSoals[koleksiIndex] &&
        newKoleksiSoals[koleksiIndex].soals[soalIndex] &&
        newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]
      ) {
        newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex] = {
          ...newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex],
          ...opsi,
        };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        };
      }
      return state;
    });
  },
  removeOpsi: (koleksiIndex, soalIndex, opsiIndex) => {
    const { koleksiSoals } = get();
    if (
      !koleksiSoals[koleksiIndex] ||
      !koleksiSoals[koleksiIndex].soals[soalIndex] ||
      !koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]
    )
      return;

    const soal = koleksiSoals[koleksiIndex].soals[soalIndex];
    const opsi = soal.opsis[opsiIndex];

    if (opsi.tempId) {
      // Remove unsaved opsi (only from local state)
      set((state) => {
        const newKoleksiSoals = [...state.koleksiSoals];
        const newOptimisticUpdates = new Set(state.optimisticUpdates);
        if (opsi.tempId) {
          newOptimisticUpdates.delete(opsi.tempId);
        }
        const newOpsis = newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis.filter((_, i) => i !== opsiIndex);
        const reorderedOpsis = newOpsis.map((o, i) => ({ ...o, order: i }));
        newKoleksiSoals[koleksiIndex].soals[soalIndex] = {
          ...newKoleksiSoals[koleksiIndex].soals[soalIndex],
          opsis: reorderedOpsis,
        };
        return {
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
          optimisticUpdates: newOptimisticUpdates,
        };
      });
    } else {
      // Mark saved opsi for deletion (will be deleted on save)
      set((state) => {
        const newKoleksiSoals = [...state.koleksiSoals];
        const newOpsis = newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis.filter((_, i) => i !== opsiIndex);
        const reorderedOpsis = newOpsis.map((o, i) => ({ ...o, order: i }));
        newKoleksiSoals[koleksiIndex].soals[soalIndex] = {
          ...newKoleksiSoals[koleksiIndex].soals[soalIndex],
          opsis: reorderedOpsis,
        };
        return {
          deletedOpsi: [...state.deletedOpsi, opsi.id!],
          koleksiSoals: newKoleksiSoals,
          isDirty: true,
          stepDirtyFlags: { ...state.stepDirtyFlags, assessment: true },
        };
      });
    }
  },
  saveSoal: async (koleksiIndex, soalIndex) => {
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

    set({ isLoading: true, error: null });

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
          const newKoleksiSoals = [...state.koleksiSoals];
          const updatedSoal = { ...newKoleksiSoals[koleksiIndex].soals[soalIndex] };
          updatedSoal.id = result.data.id;
          const newOptimisticUpdates = new Set(state.optimisticUpdates);
          if (updatedSoal.tempId) {
            newOptimisticUpdates.delete(updatedSoal.tempId);
            delete updatedSoal.tempId;
          }
          newKoleksiSoals[koleksiIndex].soals[soalIndex] = updatedSoal;
          return {
            koleksiSoals: newKoleksiSoals,
            isLoading: false,
            stepDirtyFlags: { ...state.stepDirtyFlags, assessment: false },
            optimisticUpdates: newOptimisticUpdates,
          };
        });

        // Save all opsis for this soal
        const opsisToSave = soal.opsis.filter(opsi => opsi.tempId);
        for (let opsiIndex = 0; opsiIndex < opsisToSave.length; opsiIndex++) {
          await get().saveOpsi(koleksiIndex, soalIndex, opsiIndex);
        }

        toast.success(soal.tempId ? 'Question created successfully' : 'Question updated successfully');
      } else {
        throw new Error(result.error || 'Failed to save question');
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save question',
      });
      toast.error('Failed to save question');
    }
  },
  saveOpsi: async (koleksiIndex, soalIndex, opsiIndex) => {
    const { koleksiSoals } = get();
    if (
      !koleksiSoals[koleksiIndex] ||
      !koleksiSoals[koleksiIndex].soals[soalIndex] ||
      !koleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex]
    )
      return;

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
          const newKoleksiSoals = [...state.koleksiSoals];
          const updatedOpsi = { ...newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex] };
          updatedOpsi.id = result.data.id;
          const newOptimisticUpdates = new Set(state.optimisticUpdates);
          if (updatedOpsi.tempId) {
            newOptimisticUpdates.delete(updatedOpsi.tempId);
            delete updatedOpsi.tempId;
          }
          newKoleksiSoals[koleksiIndex].soals[soalIndex].opsis[opsiIndex] = updatedOpsi;
          return {
            koleksiSoals: newKoleksiSoals,
            optimisticUpdates: newOptimisticUpdates,
          };
        });
      } else {
        throw new Error(result.error || 'Failed to save option');
      }
    } catch (error) {
      console.error('Save opsi error:', error);
      // Don't show toast for individual opsi errors as they happen in batch
    }
  },
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

    set({ isLoading: true, error: null });

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
          await get().saveKoleksiSoal(koleksiIndex);
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
                await get().saveSoal(koleksiIndex, soalIndex);
              } else {
                console.warn(`⚠️ [AUTO-SAVE] Skipping save for empty question in koleksi ${koleksiIndex}, soal ${soalIndex}`);
              }
            }
          }
        }
      }

      // Handle reordering for saved soals
      const reorderBatches: { koleksiSoalId: number, soalOrders: { id: number, order: number }[] }[] = [];

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
      set({
        deletedKoleksiSoals: [],
        deletedSoals: [],
        deletedOpsi: [],
        isDirty: false,
        stepDirtyFlags: { ...get().stepDirtyFlags, assessment: false },
        isLoading: false,
      });

      console.log('✅ [AUTO-SAVE] Batch save of assessments completed successfully');
      toast.success('All assessments saved successfully');
    } catch (error) {
      console.error('❌ [AUTO-SAVE] Batch save of assessments failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save assessments',
      });
      toast.error('Failed to save assessments');
    }
  },
});