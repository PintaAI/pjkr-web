import type { StateCreator } from 'zustand';
import type { KelasBuilderState, BuilderStep } from './types';

export interface Progress {
  calculateStepProgress: (step: BuilderStep) => number;
  calculateOverallProgress: () => number;
}

export const createProgress: StateCreator<
  KelasBuilderState,
  [["zustand/immer", never]],
  [],
  Progress
> = (set, get) => ({
  calculateStepProgress: (step: BuilderStep): number => {
    const state = get();
    
    switch (step) {
      case 'meta':
        const hasTitle = state.meta.title.trim() !== '';
        const hasDescription = state.meta.description && state.meta.description.trim() !== '';
        const hasLevel = state.meta.level;
        const hasType = state.meta.type;
        const hasValidPricing = !state.meta.isPaidClass || (state.meta.price && state.meta.price > 0);
        
        let metaProgress = 0;
        if (hasTitle) metaProgress += 25;
        if (hasDescription) metaProgress += 25;
        if (hasLevel) metaProgress += 25;
        if (hasType) metaProgress += 25;
        if (hasValidPricing) metaProgress += 10; // Bonus for valid pricing
        
        return Math.min(100, metaProgress);
        
      case 'content':
        if (state.materis.length === 0) return 0;
        return Math.min(100, (state.materis.length / 5) * 100); // Assuming 5 lessons is target

      case 'resources':
        // Resources step is optional, so always consider it complete
        return 100;

      case 'review':
        // Review step progress based on completion of previous steps
        const metaComplete = state.meta.title.trim() !== '' && state.meta.description;
        const contentComplete = state.materis.length > 0;
        
        if (metaComplete && contentComplete) return 100;
        if (metaComplete || contentComplete) return 50;
        return 0;
        
      default:
        return 0;
    }
  },

  calculateOverallProgress: (): number => {
    const state = get();
    const steps: BuilderStep[] = ['meta', 'content', 'resources', 'review'];
    
    const totalProgress = steps.reduce((sum, step) => {
      return sum + state.calculateStepProgress(step);
    }, 0);
    
    return Math.round(totalProgress / steps.length);
  },
});