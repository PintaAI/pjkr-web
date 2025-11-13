import type { StateCreator } from 'zustand';
import type { KelasBuilderState, BuilderStep } from './types';

const stepOrder: BuilderStep[] = ['meta', 'content', 'resources', 'members', 'review'];

export interface Navigation {
  currentStep: BuilderStep;
  stepDirtyFlags: Record<BuilderStep, boolean>;
  setCurrentStep: (step: BuilderStep) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  ensureDraftExists: () => Promise<void>;
}

export const createNavigation: StateCreator<
  KelasBuilderState,
  [["zustand/immer", never]],
  [],
  Navigation
> = (set, get) => ({
  currentStep: 'meta',
  stepDirtyFlags: {
    meta: false,
    content: false,
    resources: false,
    members: false,
    review: false,
  },
  // Helper function to ensure draft exists before navigation
  ensureDraftExists: async () => {
    const { draftId, meta, createDraft, isLoading } = get();

    // Only create draft if we don't have one, have a title, and not currently loading
    if (!draftId && meta.title.trim() !== '' && !isLoading) {
      console.log('📝 [NAVIGATION] Ensuring draft exists before navigation...');
      try {
        await createDraft(meta);
        console.log('✅ [NAVIGATION] Draft ensured successfully');
      } catch (error) {
        console.error('❌ [NAVIGATION] Failed to ensure draft exists:', error);
        // Set error state so user knows what happened
        set({ error: 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error') });
        throw error; // Re-throw to prevent navigation
      }
    }
  },

  setCurrentStep: async (step: BuilderStep) => {
    // Ensure draft exists before navigating away from meta
    if (step !== 'meta') {
      await get().ensureDraftExists();
    }

    set({ currentStep: step });
  },

  nextStep: async () => {
    const { currentStep } = get();

    console.log('⏭️ [AUTO-SAVE TRIGGER] nextStep called:', {
      currentStep,
      hasDraft: !!get().draftId,
      hasTitle: get().meta.title.trim() !== ''
    });

    // Ensure draft exists before leaving meta step
    if (currentStep === 'meta') {
      await get().ensureDraftExists();
    }

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      set({ currentStep: nextStep });
      console.log('🎯 [AUTO-SAVE] Navigated to next step:', nextStep);
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: stepOrder[currentIndex - 1] });
    }
  },
});