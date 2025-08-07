import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { KelasType, Difficulty } from '@prisma/client';
import { updateKelas } from '@/app/actions/kelas';
import { toast } from 'sonner';

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

interface MetaStoreState {
  meta: KelasMetaData;
  isDirty: boolean;
  stepDirtyFlags: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

interface MetaStoreActions {
  updateMeta: (meta: Partial<KelasMetaData>) => void;
  saveMeta: (draftId: number) => Promise<void>;
  resetMeta: () => void;
  setStepDirty: (step: string, dirty: boolean) => void;
  clearStepDirty: (step: string) => void;
}

const initialMeta: KelasMetaData = {
  title: '',
  description: '',
  type: KelasType.REGULAR,
  level: Difficulty.BEGINNER,
  isPaidClass: false,
};

export const useMetaStore = create<MetaStoreState & MetaStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        meta: initialMeta,
        isDirty: false,
        stepDirtyFlags: {},
        isLoading: false,
        error: null,

        // Actions
        updateMeta: (meta: Partial<KelasMetaData>) => {
          set((state) => {
            Object.assign(state.meta, meta);
            state.isDirty = true;
            state.stepDirtyFlags.meta = true;
          });
        },

        saveMeta: async (draftId: number) => {
          const { meta } = get();
          
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Serialize JSON data to ensure it's safe for server actions
            const serializedMeta = {
              ...meta,
              jsonDescription: meta.jsonDescription
                ? JSON.parse(JSON.stringify(meta.jsonDescription))
                : undefined
            };
            
            const result = await updateKelas(draftId, serializedMeta);
            if (result.success) {
              set((state) => {
                state.isDirty = false;
                state.stepDirtyFlags.meta = false;
                state.isLoading = false;
              });
              toast.success('Meta information updated successfully');
            } else {
              throw new Error(result.error || 'Failed to update meta');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to update meta';
            });
            toast.error('Failed to update meta information');
          }
        },

        resetMeta: () => {
          set((state) => {
            state.meta = initialMeta;
            state.isDirty = false;
            state.stepDirtyFlags.meta = false;
          });
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
      }))
    ),
    {
      name: 'kelas-builder-meta-store',
    }
  )
);