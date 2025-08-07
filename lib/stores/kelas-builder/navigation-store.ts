import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { KelasType, Difficulty } from '@prisma/client';
import { createDraftKelas } from '@/app/actions/kelas';
import { toast } from 'sonner';

export type BuilderStep = 'meta' | 'content' | 'vocabulary' | 'assessment' | 'review';

interface NavigationStoreState {
  draftId: number | null;
  currentStep: BuilderStep;
  isLoading: boolean;
  error: string | null;
}

interface NavigationStoreActions {
  setCurrentStep: (step: BuilderStep, metaStore?: any, createDraft?: (meta: any) => Promise<void>) => Promise<void>;
  nextStep: (metaStore?: any, createDraft?: (meta: any) => Promise<void>) => Promise<void>;
  prevStep: () => void;
  calculateStepProgress: (step: BuilderStep, metaStore?: any, contentStore?: any, vocabularyStore?: any, assessmentStore?: any) => number;
  calculateOverallProgress: (metaStore?: any, contentStore?: any, vocabularyStore?: any, assessmentStore?: any) => number;
  setDraftId: (draftId: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetNavigation: () => void;
}

const stepOrder: BuilderStep[] = ['meta', 'content', 'vocabulary', 'assessment', 'review'];

export const useNavigationStore = create<NavigationStoreState & NavigationStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        draftId: null,
        currentStep: 'meta',
        isLoading: false,
        error: null,

        // Actions
        setCurrentStep: async (step: BuilderStep, metaStore?: any, createDraft?: (meta: any) => Promise<void>) => {
          const { draftId } = get();
          
          // Auto-create draft if navigating away from meta and no draft exists
          if (step !== 'meta' && !draftId && metaStore && createDraft && metaStore.meta.title.trim() !== '') {
            try {
              await createDraft(metaStore.meta);
              // Update draftId in navigation store after creation
              set((state) => {
                state.draftId = metaStore.draftId;
              });
            } catch (error) {
              console.error('Failed to auto-create draft:', error);
              // Set error state so user knows what happened
              set((state) => {
                state.error = 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error');
              });
            }
          }
          
          set((state) => {
            state.currentStep = step;
          });
        },

        nextStep: async (metaStore?: any, createDraft?: (meta: any) => Promise<void>) => {
          const { currentStep, draftId } = get();
          
          console.log('⏭️ [AUTO-SAVE TRIGGER] nextStep called:', {
            currentStep,
            hasDraft: !!draftId,
            hasTitle: metaStore?.meta?.title?.trim() !== ''
          });
          
          // Auto-create draft if leaving meta step and no draft exists
          if (currentStep === 'meta' && !draftId && metaStore && createDraft && metaStore.meta.title.trim() !== '') {
            console.log('📝 [AUTO-SAVE] Auto-creating draft in nextStep...');
            try {
              if (createDraft && metaStore.meta) {
                await createDraft(metaStore.meta);
              }
              console.log('✅ [AUTO-SAVE] Draft auto-created in nextStep successfully');
              // Update draftId in navigation store after creation
              set((state) => {
                state.draftId = metaStore.draftId;
              });
            } catch (error) {
              console.error('❌ [AUTO-SAVE] Failed to auto-create draft in nextStep:', error);
              // Set error state
              set((state) => {
                state.error = 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error');
              });
            }
          }
          
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);
            if (currentIndex < stepOrder.length - 1) {
              const nextStep = stepOrder[currentIndex + 1];
              state.currentStep = nextStep;
              console.log('🎯 [AUTO-SAVE] Navigated to next step:', nextStep);
            }
          });
        },

        prevStep: () => {
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);
            if (currentIndex > 0) {
              state.currentStep = stepOrder[currentIndex - 1];
            }
          });
        },

        calculateStepProgress: (step: BuilderStep, metaStore?: any, contentStore?: any, vocabularyStore?: any, assessmentStore?: any): number => {
          
          switch (step) {
            case 'meta':
              if (!metaStore) return 0;
              const hasTitle = metaStore.meta.title.trim() !== '';
              const hasDescription = metaStore.meta.description && metaStore.meta.description.trim() !== '';
              const hasLevel = metaStore.meta.level;
              const hasType = metaStore.meta.type;
              const hasValidPricing = !metaStore.meta.isPaidClass || (metaStore.meta.price && metaStore.meta.price > 0);
              
              let metaProgress = 0;
              if (hasTitle) metaProgress += 25;
              if (hasDescription) metaProgress += 25;
              if (hasLevel) metaProgress += 25;
              if (hasType) metaProgress += 25;
              if (hasValidPricing) metaProgress += 10; // Bonus for valid pricing
              
              return Math.min(100, metaProgress);
              
            case 'content':
              if (!contentStore) return 0;
              if (contentStore.materis.length === 0) return 0;
              return Math.min(100, (contentStore.materis.length / 5) * 100); // Assuming 5 lessons is target
              
            case 'vocabulary':
              if (!vocabularyStore) return 0;
              // Optional step - any vocabulary sets added is progress
              return Math.min(100, (vocabularyStore.vocabSets.length / 3) * 100); // Assuming 3 sets is target
              
            case 'assessment':
              if (!assessmentStore) return 0;
              // Optional step - any question collections added is progress
              return Math.min(100, (assessmentStore.koleksiSoals.length / 2) * 100); // Assuming 2 collections is target
              
            case 'review':
              if (!metaStore || !contentStore) return 0;
              // Review step progress based on completion of previous steps
              const metaComplete = metaStore.meta.title.trim() !== '' && metaStore.meta.description;
              const contentComplete = contentStore.materis.length > 0;
              
              if (metaComplete && contentComplete) return 100;
              if (metaComplete || contentComplete) return 50;
              return 0;
              
            default:
              return 0;
          }
        },

        calculateOverallProgress: (metaStore?: any, contentStore?: any, vocabularyStore?: any, assessmentStore?: any): number => {
          const steps: BuilderStep[] = ['meta', 'content', 'vocabulary', 'assessment', 'review'];
          
          const totalProgress = steps.reduce((sum, step) => {
            return sum + get().calculateStepProgress(step, metaStore, contentStore, vocabularyStore, assessmentStore);
          }, 0);
          
          return Math.round(totalProgress / steps.length);
        },

        setDraftId: (draftId: number | null) => {
          set((state) => {
            state.draftId = draftId;
          });
        },

        setLoading: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        resetNavigation: () => {
          set((state) => {
            state.draftId = null;
            state.currentStep = 'meta';
            state.isLoading = false;
            state.error = null;
          });
        },
      }))
    ),
    {
      name: 'kelas-builder-navigation-store',
    }
  )
);