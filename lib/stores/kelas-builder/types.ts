import type { KelasType, Difficulty,} from '@prisma/client';

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

// The steps in the builder UI
export type BuilderStep = 'meta' | 'content' | 'review';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// The complete state of the Zustand store, combining all slices
export interface KelasBuilderState {
  // Core state
  draftId: number | null;
  kelasIsDraft: boolean;
  isLoading: boolean;
  error: string | null;
  optimisticUpdates: Record<string, unknown>;

  // Deletion tracking
  deletedMateris: number[];
  dirtyMateris: Set<number>;

  // Slices
  meta: KelasMetaData;
  materis: MateriData[];
  currentStep: BuilderStep;
  stepDirtyFlags: Record<BuilderStep, boolean>;


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
}