
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';
import type {

  KelasBuilderState,
} from './types';

// UI
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ID Generation
export const generateTempId = (prefix: string) => `${prefix}_${nanoid(8)}`;
export const generateTempIdWithIndex = (prefix: string, index: number) =>
  `${prefix}_${nanoid(8)}_${index}`;

// Array Manipulation
export function reorderArray<T extends { order?: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

// Validation
export const validateText = (text: string | null | undefined): boolean => {
  return !!text && text.trim().length > 0;
};

// State helpers
export const findKoleksiById = (
  koleksiId: number | string,
  state: KelasBuilderState
) => {
  const idKey = typeof koleksiId === 'string' ? 'tempId' : 'id';
  return state.koleksiSoals.find((k) => k[idKey] === koleksiId);
};

export const findSoalById = (
  koleksiId: number | string,
  soalId: number | string,
  state: KelasBuilderState
) => {
  const koleksi = findKoleksiById(koleksiId, state);
  if (!koleksi) return undefined;

  const idKey = typeof soalId === 'string' ? 'tempId' : 'id';
  return koleksi.soals.find((s) => s[idKey] === soalId);
};

export const findOpsiById = (
  koleksiId: number | string,
  soalId: number | string,
  opsiId: number | string,
  state: KelasBuilderState
) => {
  const soal = findSoalById(koleksiId, soalId, state);
  if (!soal) return undefined;

  const idKey = typeof opsiId === 'string' ? 'tempId' : 'id';
  return soal.opsis.find((o) => o[idKey] === opsiId);
};

export const computeAssessmentDirty = (state: KelasBuilderState): boolean => {
  const hasDirtyKoleksi = state.dirtyKoleksiSoals.size > 0;
  const hasDirtySoals = state.dirtySoals.size > 0;
  const hasDirtyOpsis = state.dirtyOpsis.size > 0;
  const hasOptimisticUpdates =
    state.optimisticUpdates.koleksi.size > 0 ||
    state.optimisticUpdates.soal.size > 0 ||
    state.optimisticUpdates.soalSet.size > 0 ||
    state.optimisticUpdates.opsi.size > 0;
  const hasDeletedItems =
    state.deletedKoleksiSoals.length > 0 ||
    state.deletedSoals.length > 0 ||
    state.deletedOpsi.length > 0;

  return (
    hasDirtyKoleksi ||
    hasDirtySoals ||
    hasDirtyOpsis ||
    hasOptimisticUpdates ||
    hasDeletedItems
  );
};

export const reindexOrder = <T extends { order?: number }>(items: T[]): T[] => {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
};