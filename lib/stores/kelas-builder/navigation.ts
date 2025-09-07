import type { StateCreator } from 'zustand';
import type { KelasBuilderState, BuilderStep } from './types';

const stepOrder: BuilderStep[] = ['meta', 'content', 'review'];

export interface Navigation {
  currentStep: BuilderStep;
  stepDirtyFlags: Record<BuilderStep, boolean>;
  setCurrentStep: (step: BuilderStep) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
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
    review: false,
  },
  setCurrentStep: async (step: BuilderStep) => {
    const { draftId, meta, createDraft } = get();

    // Auto-create draft if navigating away from meta and no draft exists
    if (step !== 'meta' && !draftId && meta.title.trim() !== '') {
      try {
        await createDraft(meta);
      } catch (error) {
        console.error('Failed to auto-create draft:', error);
        // Set error state so user knows what happened
        set({ error: 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error') });
      }
    }

    set({ currentStep: step });
  },
  nextStep: async () => {
    const { currentStep, draftId, meta, createDraft } = get();

    console.log('⏭️ [AUTO-SAVE TRIGGER] nextStep called:', {
      currentStep,
      hasDraft: !!draftId,
      hasTitle: meta.title.trim() !== ''
    });

    // Auto-create draft if leaving meta step and no draft exists
    if (currentStep === 'meta' && !draftId && meta.title.trim() !== '') {
      console.log('📝 [AUTO-SAVE] Auto-creating draft in nextStep...');
      try {
        await createDraft(meta);
        console.log('✅ [AUTO-SAVE] Draft auto-created in nextStep successfully');
      } catch (error) {
        console.error('❌ [AUTO-SAVE] Failed to auto-create draft in nextStep:', error);
        // Set error state
        set({ error: 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error') });
      }
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