import type { KelasType, Difficulty, VocabularyType, PartOfSpeech } from '@prisma/client';

// Base data structures from the database, used for form data
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
  isDraft: boolean;
  tempId?: string; // For optimistic UI updates
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
  tempId?: string; // For optimistic UI updates
}

export interface VocabularySetData {
  id?: number;
  title: string;
  description?: string;
  icon: string;
  isPublic: boolean;
  items: VocabularyItemData[];
  tempId?: string; // For optimistic UI updates
}

export interface SoalOpsiData {
  id?: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
  tempId?: string; // For optimistic UI updates
}

export interface SoalData {
  id?: number;
  pertanyaan: string;
  difficulty?: Difficulty;
  explanation?: string;
  isActive: boolean;
  order?: number;
  opsis: SoalOpsiData[];
  tempId?: string; // For optimistic UI updates
}

export interface KoleksiSoalData {
  id?: number;
  nama: string;
  deskripsi?: string;
  isPrivate: boolean;
  isDraft: boolean;
  soals: SoalData[];
  tempId?: string; // For optimistic UI updates
}

export interface SoalSetData {
  id?: number;
  koleksiSoalId: number;
  title: string;
  description?: string;
  tempId?: string; // For optimistic UI updates
}

// The steps in the builder UI
export type BuilderStep = 'meta' | 'content' | 'vocabulary' | 'assessment' | 'review';

// The complete state of the Zustand store, combining all slices
export interface KelasBuilderState {
  // Core state
  draftId: number | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  optimisticUpdates: Set<string>;

  // Deletion tracking
  deletedMateris: number[];
  deletedKoleksiSoals: number[];
  deletedSoals: number[];
  deletedOpsi: number[];

  // Slices
  meta: KelasMetaData;
  materis: MateriData[];
  vocabSets: VocabularySetData[];
  soalSets: SoalSetData[];
  koleksiSoals: KoleksiSoalData[];
  currentStep: BuilderStep;
  stepDirtyFlags: Record<BuilderStep, boolean>;

  // Actions from all slices will be merged here
  // Progress
  calculateStepProgress: (step: BuilderStep) => number;
  calculateOverallProgress: () => number;

  // Navigation
  setCurrentStep: (step: BuilderStep) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;

  // Meta
  updateMeta: (meta: Partial<KelasMetaData>) => void;
  saveMeta: () => Promise<void>;

  // Content
  addMateri: (materi: Omit<MateriData, 'order'>) => void;
  updateMateri: (index: number, materi: Partial<MateriData>) => void;
  removeMateri: (index: number) => void;
  reorderMateris: (fromIndex: number, toIndex: number) => void;
  toggleMateriDraft: (index: number) => Promise<void>;
  saveMateris: () => Promise<void>;

  // Vocabulary
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (index: number, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (index: number) => void;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: number, itemData: Partial<VocabularyItemData>) => Promise<void>;
  removeVocabularyItem: (vocabSetId: number, itemId?: number) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;

  // Assessment
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

  // Global Actions
  createDraft: (initialMeta: KelasMetaData) => Promise<void>;
  loadDraft: (kelasId: number) => Promise<void>;
  publishDraft: () => Promise<void>;
  deleteDraft: () => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setIsDirty: (dirty: boolean) => void;
}