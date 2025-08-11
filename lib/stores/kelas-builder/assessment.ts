import type { StateCreator } from 'zustand';
import { toast } from 'sonner';
import type {
  KelasBuilderState,
  SoalSetData,
  KoleksiSoalData,
  SoalData,
  SoalOpsiData,
  ActionResult,
} from './types';
import {
  deleteKoleksiSoal,
  deleteSoal,
  deleteOpsi,
  reorderSoals as reorderSoalsAction,
  saveKoleksiSoal as saveKoleksiSoalAction,
  saveSoal as saveSoalAction,
  saveOpsi as saveOpsiAction,
} from '@/app/actions/kelas';
import { saveSoalSetLink } from '@/app/actions/kelas/soal-set';
import { Difficulty } from '@prisma/client';
import {
  generateTempId,
  reindexOrder,
  validateText,
  findKoleksiById,
  findSoalById,
  findOpsiById,
} from './helpers';

export interface Assessment {
  soalSets: SoalSetData[];
  koleksiSoals: KoleksiSoalData[];
  deletedKoleksiSoals: number[];
  deletedSoals: number[];
  deletedOpsi: number[];
  dirtyKoleksiSoals: Set<number>;
  dirtySoals: Set<number>;
  dirtyOpsis: Set<number>;
  addSoalSet: (soalSet: Omit<SoalSetData, 'id' | 'tempId'>) => void;
  removeSoalSet: (id: string) => void;
  saveSoalSet: (id: string) => Promise<void>;
  addKoleksiSoal: (
    koleksiSoal: Omit<KoleksiSoalData, 'id' | 'soals' | 'tempId'> & {
      soals?: Omit<SoalData, 'id' | 'opsis' | 'tempId'>[];
    }
  ) => void;
  updateKoleksiSoal: (
    id: number | string,
    koleksiSoal: Partial<KoleksiSoalData>
  ) => void;
  removeKoleksiSoal: (id: number | string) => void;
  saveKoleksiSoal: (index: number) => Promise<void>;
  addSoal: (
    koleksiId: number | string,
    soal: Omit<SoalData, 'id' | 'opsis' | 'tempId'> & {
      opsis?: Omit<SoalOpsiData, 'id' | 'tempId'>[];
    }
  ) => void;
  updateSoal: (
    koleksiId: number | string,
    soalId: number | string,
    soal: Partial<SoalData>
  ) => void;
  removeSoal: (koleksiId: number | string, soalId: number | string) => void;
  reorderSoals: (
    koleksiId: number | string,
    fromIndex: number,
    toIndex: number
  ) => void;
  addOpsi: (
    koleksiId: number | string,
    soalId: number | string,
    opsi: Omit<SoalOpsiData, 'id' | 'tempId'>
  ) => void;
  updateOpsi: (
    koleksiId: number | string,
    soalId: number | string,
    opsiId: number | string,
    opsi: Partial<SoalOpsiData>
  ) => void;
  removeOpsi: (
    koleksiId: number | string,
    soalId: number | string,
    opsiId: number | string
  ) => void;
  saveAllAssessments: () => Promise<void>;
}

export const createAssessment: StateCreator<
  KelasBuilderState,
  [['zustand/immer', never]],
  [],
  Assessment
> = (set, get) => ({
  soalSets: [],
  koleksiSoals: [],
  deletedKoleksiSoals: [],
  deletedSoals: [],
  deletedOpsi: [],
  dirtyKoleksiSoals: new Set(),
  dirtySoals: new Set(),
  dirtyOpsis: new Set(),

  addSoalSet: (soalSet) => {
    set((state) => {
      const tempId = generateTempId('soalSet');
      const newSoalSet: SoalSetData = {
        ...soalSet,
        tempId,
      };
      state.soalSets.push(newSoalSet);
      state.optimisticUpdates.soalSet.add(tempId);
      state.editVersion += 1;
    });
  },

  removeSoalSet: (id) => {
    set((state) => {
      const index = state.soalSets.findIndex((s) => s.tempId === id);
      if (index === -1) return;

      const soalSet = state.soalSets[index];
      if (soalSet.tempId) {
        state.optimisticUpdates.soalSet.delete(soalSet.tempId);
      }
      state.soalSets.splice(index, 1);
      state.editVersion += 1;
    });
  },

  saveSoalSet: async (id) => {
    const soalSet = get().soalSets.find((s) => s.tempId === id || s.id?.toString() === id);
    const draftId = get().draftId;
    if (!soalSet || !draftId) return;

    const tempId = soalSet.tempId;
    set({ isLoading: true, error: null });

    try {
      const result = await saveSoalSetLink(
        draftId,
        {
          koleksiSoalId: soalSet.koleksiSoalId,
          title: soalSet.title,
          description: soalSet.description,
          order: get().soalSets.indexOf(soalSet),
        },
        soalSet.id
      );

      if (result.success && result.data) {
        set((state) => {
          const savedSoalSet = state.soalSets.find(
            (s) => s.tempId === tempId
          );
          if (savedSoalSet) {
            savedSoalSet.id = result.data.id;
            delete savedSoalSet.tempId;
          }
          if (tempId) {
            state.optimisticUpdates.soalSet.delete(tempId);
          }
          
        });
        toast.success(tempId ? 'Question set linked' : 'Question set updated');
      } else {
        throw new Error(result.error || 'Failed to save question set');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save question set';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  addKoleksiSoal: (koleksiSoal) => {
    set((state) => {
      const tempId = generateTempId('koleksi');
      const newKoleksiSoal: KoleksiSoalData = {
        ...koleksiSoal,
        id: undefined,
        soals:
          koleksiSoal.soals?.map((soal, index) => ({
            ...soal,
            id: undefined,
            opsis: [],
            order: index,
            tempId: generateTempId('soal'),
          })) || [],
        tempId,
      };
      state.koleksiSoals.push(newKoleksiSoal);
      state.optimisticUpdates.koleksi.add(tempId);
      state.editVersion += 1;
    });
  },

  updateKoleksiSoal: (id, koleksiSoal) => {
    set((state) => {
      const koleksi = findKoleksiById(id, state);
      if (koleksi) {
        Object.assign(koleksi, koleksiSoal);
        if (koleksi.id) {
          state.dirtyKoleksiSoals.add(koleksi.id);
        }
        state.editVersion += 1;
      }
    });
  },

  removeKoleksiSoal: (id) => {
    set((state) => {
      const index = state.koleksiSoals.findIndex(
        (k) => k.id === id || k.tempId === id
      );
      if (index === -1) return;

      const koleksiSoal = state.koleksiSoals[index];
      if (koleksiSoal.tempId) {
        state.optimisticUpdates.koleksi.delete(koleksiSoal.tempId);
      } else if (koleksiSoal.id) {
        state.deletedKoleksiSoals.push(koleksiSoal.id);
      }

      state.koleksiSoals.splice(index, 1);
      state.editVersion += 1;
    });
  },

  saveKoleksiSoal: async (index) => {
    const { koleksiSoals, draftId } = get();
    if (!koleksiSoals[index] || !draftId) return;

    const koleksiSoal = koleksiSoals[index];
    set({ isLoading: true, error: null });

    try {
      const result = await saveKoleksiSoalAction(
        draftId,
        {
          nama: koleksiSoal.nama,
          deskripsi: koleksiSoal.deskripsi,
          isPrivate: koleksiSoal.isPrivate,
          isDraft: koleksiSoal.isDraft,
        },
        koleksiSoal.id
      );

      if (result.success && result.data?.id) {
        set((state) => {
          const updatedKoleksiSoal = { ...state.koleksiSoals[index], id: result.data!.id };
          if (updatedKoleksiSoal.tempId) {
            state.optimisticUpdates.koleksi.delete(updatedKoleksiSoal.tempId);
            delete updatedKoleksiSoal.tempId;
          }
          state.koleksiSoals[index] = updatedKoleksiSoal;
          if (result.data!.id) {
            state.dirtyKoleksiSoals.delete(result.data!.id);
          }
          state.isLoading = false;
        });
        toast.success('Question collection saved successfully');
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

  addSoal: (koleksiId, soal) => {
    set((state) => {
      const koleksi = findKoleksiById(koleksiId, state);
      if (koleksi) {
        const tempId = generateTempId('soal');
        const newSoal: SoalData = {
          ...soal,
          id: undefined,
          order: koleksi.soals.length,
          opsis:
            soal.opsis?.map((opsi, index) => ({
              ...opsi,
              id: undefined,
              order: index,
              tempId: generateTempId('opsi'),
            })) || [],
          tempId,
        };
        koleksi.soals.push(newSoal);
        state.optimisticUpdates.soal.add(tempId);
        if (koleksi.id) {
          state.dirtyKoleksiSoals.add(koleksi.id);
        }
        state.editVersion += 1;
      }
    });
  },

  updateSoal: (koleksiId, soalId, soal) => {
    set((state) => {
      const foundSoal = findSoalById(koleksiId, soalId, state);
      if (foundSoal) {
        Object.assign(foundSoal, soal);
        if (foundSoal.id) {
          state.dirtySoals.add(foundSoal.id);
        }
        state.editVersion += 1;
      }
    });
  },

  removeSoal: (koleksiId, soalId) => {
    set((state) => {
      const koleksi = findKoleksiById(koleksiId, state);
      if (!koleksi) return;

      const soalIndex = koleksi.soals.findIndex(
        (s) => s.id === soalId || s.tempId === soalId
      );
      if (soalIndex === -1) return;

      const soal = koleksi.soals[soalIndex];
      if (soal.tempId) {
        state.optimisticUpdates.soal.delete(soal.tempId);
      } else if (soal.id) {
        state.deletedSoals.push(soal.id);
      }

      koleksi.soals.splice(soalIndex, 1);
      koleksi.soals = reindexOrder(koleksi.soals);
      if (koleksi.id) {
        state.dirtyKoleksiSoals.add(koleksi.id);
      }
      state.editVersion += 1;
    });
  },

  reorderSoals: (koleksiId, fromIndex, toIndex) => {
    set((state) => {
      const koleksi = findKoleksiById(koleksiId, state);
      if (koleksi && koleksi.soals[fromIndex] && koleksi.soals[toIndex]) {
        const [movedSoal] = koleksi.soals.splice(fromIndex, 1);
        koleksi.soals.splice(toIndex, 0, movedSoal);
        koleksi.soals = reindexOrder(koleksi.soals);
        if (koleksi.id) {
          state.dirtyKoleksiSoals.add(koleksi.id);
        }
        state.editVersion += 1;
      }
    });
  },

  addOpsi: (koleksiId, soalId, opsi) => {
    set((state) => {
      const soal = findSoalById(koleksiId, soalId, state);
      if (soal) {
        const tempId = generateTempId('opsi');
        const newOpsi: SoalOpsiData = {
          ...opsi,
          id: undefined,
          order: soal.opsis.length,
          tempId,
        };
        soal.opsis.push(newOpsi);
        state.optimisticUpdates.opsi.add(tempId);
        if (soal.id) {
          state.dirtySoals.add(soal.id);
        }
        state.editVersion += 1;
      }
    });
  },

  updateOpsi: (koleksiId, soalId, opsiId, opsi) => {
    set((state) => {
      const foundOpsi = findOpsiById(koleksiId, soalId, opsiId, state);
      if (foundOpsi) {
        Object.assign(foundOpsi, opsi);
        if (foundOpsi.id) {
          state.dirtyOpsis.add(foundOpsi.id);
        }
        const soal = findSoalById(koleksiId, soalId, state);
        if (soal?.id) {
          state.dirtySoals.add(soal.id);
        }
        state.editVersion += 1;
      }
    });
  },

  removeOpsi: (koleksiId, soalId, opsiId) => {
    set((state) => {
      const soal = findSoalById(koleksiId, soalId, state);
      if (!soal) return;

      const opsiIndex = soal.opsis.findIndex(
        (o) => o.id === opsiId || o.tempId === opsiId
      );
      if (opsiIndex === -1) return;

      const opsi = soal.opsis[opsiIndex];
      if (opsi.tempId) {
        state.optimisticUpdates.opsi.delete(opsi.tempId);
      } else if (opsi.id) {
        state.deletedOpsi.push(opsi.id);
      }

      soal.opsis.splice(opsiIndex, 1);
      soal.opsis = reindexOrder(soal.opsis);
      if (soal.id) {
        state.dirtySoals.add(soal.id);
      }
      state.editVersion += 1;
    });
  },

  saveAllAssessments: async () => {
    const {
      draftId,
      koleksiSoals,
      deletedKoleksiSoals,
      deletedSoals,
      deletedOpsi,
      dirtyKoleksiSoals,
      dirtySoals,
      dirtyOpsis,
    } = get();
    if (!draftId) return;

    set({  error: null });

    const upsert = async <T>(
      action: (...args: any[]) => Promise<ActionResult<T>>,
      ...args: any[]
    ): Promise<ActionResult<T>> => {
      try {
        const result = await action(...args);
        if (!result.success) {
          console.error(`Action failed with args ${JSON.stringify(args)}:`, result.error);
        }
        return result;
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Exception in action with args ${JSON.stringify(args)}:`, error);
        return { success: false, error };
      }
    };

    try {
      // 1. Handle Deletions
      const deletionPromises = [
        ...deletedKoleksiSoals.map((id) => deleteKoleksiSoal(id)),
        ...deletedSoals.map((id) => deleteSoal(id)),
        ...deletedOpsi.map((id) => deleteOpsi(id)),
      ];
      await Promise.all(deletionPromises);

      // 2. Upsert Koleksi Soal
      for (const koleksi of koleksiSoals) {
        if (koleksi.tempId || dirtyKoleksiSoals.has(koleksi.id!)) {
          const payload = {
            kelasId: draftId,
            data: {
              nama: koleksi.nama,
              deskripsi: koleksi.deskripsi,
              isPrivate: false,
              isDraft: true,
            },
          };
          const result = await upsert(
            saveKoleksiSoalAction as any,
            draftId,
            payload.data,
            koleksi.id
          );
          if (result.success && result.data && koleksi.tempId) {
            set((state) => {
              const k = findKoleksiById(koleksi.tempId!, state);
              if (k) {
                k.id = (result.data as { id: number }).id;
                state.optimisticUpdates.koleksi.delete(koleksi.tempId!);
                delete k.tempId;
              }
            });
          }
        }
      }

      // 3. Upsert Soal and Opsi
      for (const koleksi of get().koleksiSoals) {
        if (!koleksi.id) continue; // Should have an ID now

        for (const soal of koleksi.soals) {
          const hasNewOpsis = soal.opsis.some((o) => o.tempId);
          if (
            soal.tempId ||
            dirtySoals.has(soal.id!) ||
            (soal.id && hasNewOpsis)
          ) {
            if (!validateText(soal.pertanyaan)) continue;

            const payload = {
              koleksiSoalId: koleksi.id,
              data: {
                pertanyaan: soal.pertanyaan,
                difficulty: soal.difficulty || Difficulty.BEGINNER,
                explanation: soal.explanation,
                isActive: soal.isActive,
              },
            };
            const result = await upsert(
              saveSoalAction as any,
              payload.koleksiSoalId,
              payload.data,
              soal.id
            );

            if (result.success && result.data) {
              const savedSoalId = (result.data as { id: number }).id;
              const tempSoalId = soal.tempId;

              // Update Soal ID if it was new
              if (tempSoalId) {
                set((state) => {
                  const s = findSoalById(koleksi.id!, tempSoalId, state);
                  if (s) {
                    s.id = savedSoalId;
                    state.optimisticUpdates.soal.delete(s.tempId!);
                    delete s.tempId;
                  }
                });
              }

              // Now save its opsis
              const currentSoal = findSoalById(koleksi.id, savedSoalId, get());
              if (!currentSoal) continue;

              for (const opsi of currentSoal.opsis) {
                if (
                  (opsi.tempId || dirtyOpsis.has(opsi.id!)) &&
                  validateText(opsi.opsiText)
                ) {
                  const opsiPayload = {
                    soalId: savedSoalId,
                    data: {
                      opsiText: opsi.opsiText,
                      isCorrect: opsi.isCorrect,
                      order: opsi.order,
                    },
                  };
                  const opsiResult = await upsert(
                    saveOpsiAction as any,
                    opsiPayload.soalId,
                    opsiPayload.data,
                    opsi.id
                  );
                  if (opsiResult.success && opsiResult.data && opsi.tempId) {
                    set((state) => {
                      const o = findOpsiById(
                        koleksi.id!,
                        savedSoalId,
                        opsi.tempId!,
                        state
                      );
                      if (o) {
                        o.id = (opsiResult.data as { id: number }).id;
                        state.optimisticUpdates.opsi.delete(o.tempId!);
                        delete o.tempId;
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }

      // 4. Handle Reordering
      const reorderBatches = get()
        .koleksiSoals.filter((k) => k.id && dirtyKoleksiSoals.has(k.id))
        .map((k) => ({
          koleksiSoalId: k.id!,
          soalOrders: k.soals
            .filter((s) => s.id)
            .map((s) => ({ id: s.id!, order: s.order ?? 0 })),
        }));

      for (const batch of reorderBatches) {
        if (batch.soalOrders.length > 0) {
          await reorderSoalsAction(batch.koleksiSoalId, batch.soalOrders);
        }
      }

      // 5. Final State Cleanup
      set((state) => {
        state.deletedKoleksiSoals = [];
        state.deletedSoals = [];
        state.deletedOpsi = [];
        state.dirtyKoleksiSoals.clear();
        state.dirtySoals.clear();
        state.dirtyOpsis.clear();
      });

      toast.success('All assessments saved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save assessments';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },
});