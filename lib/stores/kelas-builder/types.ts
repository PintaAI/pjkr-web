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


// The steps in the builder UI
export type BuilderStep = 'meta' | 'content' | 'vocabulary' | 'questions' | 'review';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// The complete state of the Zustand store, combining all slices
export interface KelasBuilderState {
  // Core state
  draftId: number | null;
  // Tracks whether the loaded kelas (course) is still a draft on the server
  // When false, the kelas is already published and subsequent action is "save changes"
  kelasIsDraft: boolean;
  isLoading: boolean;
  error: string | null;
  optimisticUpdates: {
    // Removed assessment-related optimistic updates
  };

  // Deletion tracking
  deletedMateris: number[];
  dirtyMateris: Set<number>;
  dirtyVocabSets: Set<number>;
  // Removed assessment-related deletion tracking

  // Slices
  meta: KelasMetaData;
  materis: MateriData[];
  vocabSets: VocabularySetData[];
  // Removed assessment-related slices
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
  updateMateri: (id: number | string, materi: Partial<MateriData>) => void;
  removeMateri: (id: number | string) => void;
  reorderMateris: (fromId: number | string, toId: number | string) => void;
  toggleMateriDraft: (id: number | string) => Promise<void>;
  saveMateris: () => Promise<void>;

  // Vocabulary
  addVocabularySet: (vocabSet: Omit<VocabularySetData, 'items'> & { items: Omit<VocabularyItemData, 'order'>[] }) => void;
  updateVocabularySet: (setId: number | string, vocabSet: Partial<VocabularySetData>) => void;
  removeVocabularySet: (setId: number | string) => Promise<void>;
  saveVocabularySet: (index: number) => Promise<void>;
  updateVocabularyItem: (vocabSetId: number | string, itemId: number | string, itemData: Partial<VocabularyItemData>) => void;
  removeVocabularyItem: (vocabSetId: number | string, itemId: number | string) => Promise<void>;
  reorderVocabularyItems: (vocabSetId: number, itemOrders: { id: number; order: number }[]) => Promise<void>;

  // Assessment actions removed
 
  // Global Actions
  createDraft: (initialMeta: KelasMetaData) => Promise<void>;
  loadDraft: (kelasId: number) => Promise<void>;
  publishDraft: () => Promise<void>;
  // Unpublish a previously published kelas (sets it back to draft state)
  unpublishDraft: () => Promise<void>;
  deleteDraft: () => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Debug helper from vocabulary slice
  debugLog: () => void;
}