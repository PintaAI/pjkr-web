// Main store that combines all modular stores
export { useMetaStore } from './meta-store';
export { useContentStore } from './content-store';
export { useVocabularyStore } from './vocabulary-store';
export { useAssessmentStore } from './assessment-store';
export { useNavigationStore, type BuilderStep } from './navigation-store';

// Export types for external use
export type {
  KelasMetaData,
  MateriData,
  VocabularyItemData,
  VocabularySetData,
  SoalOpsiData,
  SoalData,
  KoleksiSoalData,
  SoalSetData
} from './kelas-builder-types';

// Utility hook to access all stores together
import { useMetaStore } from './meta-store';
import { useContentStore } from './content-store';
import { useVocabularyStore } from './vocabulary-store';
import { useAssessmentStore } from './assessment-store';
import { useNavigationStore } from './navigation-store';

export const useKelasBuilderStore = () => {
  const metaStore = useMetaStore();
  const contentStore = useContentStore();
  const vocabularyStore = useVocabularyStore();
  const assessmentStore = useAssessmentStore();
  const navigationStore = useNavigationStore();

  return {
    meta: metaStore,
    content: contentStore,
    vocabulary: vocabularyStore,
    assessment: assessmentStore,
    navigation: navigationStore
  };
};