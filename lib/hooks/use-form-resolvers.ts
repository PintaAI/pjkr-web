import { zodResolver } from "@hookform/resolvers/zod";
import { 
  KelasMetaSchema,
  MateriQuickSchema,
  VocabularyQuickSchema,
  SoalSetLinkSchema,
  ReorderSchema,
  StepMetaSchema,
  StepContentSchema,
  StepPricingSchema,
  CompleteKelasSchema,
  RefinedKelasMetaSchema,
  VocabularyItemSchema,
  type KelasMetaFormData,
  type MateriQuickFormData,
  type VocabularyQuickFormData,
  type SoalSetLinkFormData,
  type ReorderFormData,
  type StepMetaFormData,
  type StepContentFormData,
  type StepPricingFormData,
  type CompleteKelasFormData,
  type VocabularyItemFormData,
} from "@/lib/validation/kelas-schemas";

// Form resolvers for React Hook Form
export const useKelasMetaResolver = () => zodResolver(KelasMetaSchema);
export const useRefinedKelasMetaResolver = () => zodResolver(RefinedKelasMetaSchema);
export const useMateriQuickResolver = () => zodResolver(MateriQuickSchema);
export const useVocabularyQuickResolver = () => zodResolver(VocabularyQuickSchema);
export const useVocabularyItemResolver = () => zodResolver(VocabularyItemSchema);
export const useSoalSetLinkResolver = () => zodResolver(SoalSetLinkSchema);
export const useReorderResolver = () => zodResolver(ReorderSchema);
export const useStepMetaResolver = () => zodResolver(StepMetaSchema);
export const useStepContentResolver = () => zodResolver(StepContentSchema);
export const useStepPricingResolver = () => zodResolver(StepPricingSchema);
export const useCompleteKelasResolver = () => zodResolver(CompleteKelasSchema);

// Default values for forms
export const kelasMetaDefaults: Partial<KelasMetaFormData> = {
  title: "",
  description: "",
  type: "REGULAR",
  level: "BEGINNER",
  thumbnail: "",
  icon: "",
  isPaidClass: false,
  price: undefined,
  discount: undefined,
  promoCode: "",
};

export const materiQuickDefaults: Partial<MateriQuickFormData> = {
  materis: [{
    title: "",
    description: "",
    jsonDescription: {},
    htmlDescription: "",
    isDemo: false,
  }],
};

export const vocabularyItemDefaults: Partial<VocabularyItemFormData> = {
  korean: "",
  indonesian: "",
  type: "WORD",
  pos: undefined,
  audioUrl: "",
  exampleSentences: [],
};

export const vocabularyQuickDefaults: Partial<VocabularyQuickFormData> = {
  title: "",
  description: "",
  icon: "FaBook",
  isPublic: false,
  items: [{
    korean: "",
    indonesian: "",
    type: "WORD" as const,
    pos: undefined,
    audioUrl: "",
    exampleSentences: [],
  }],
};

export const soalSetLinkDefaults: Partial<SoalSetLinkFormData> = {
  koleksiSoalId: undefined,
  title: "",
  description: "",
};

export const stepMetaDefaults: Partial<StepMetaFormData> = {
  title: "",
  description: "",
  type: "REGULAR",
  level: "BEGINNER",
  thumbnail: "",
  icon: "",
};

export const stepContentDefaults: Partial<StepContentFormData> = {
  materis: [{
    title: "",
    description: "",
    htmlDescription: "",
    isDemo: false,
  }],
};

export const stepPricingDefaults: Partial<StepPricingFormData> = {
  isPaidClass: false,
  price: undefined,
  discount: undefined,
  promoCode: "",
};

// Utility functions for form handling
export const getFormResolver = (formType: string) => {
  switch (formType) {
    case 'kelas-meta':
      return useKelasMetaResolver();
    case 'refined-kelas-meta':
      return useRefinedKelasMetaResolver();
    case 'materi-quick':
      return useMateriQuickResolver();
    case 'vocabulary-quick':
      return useVocabularyQuickResolver();
    case 'vocabulary-item':
      return useVocabularyItemResolver();
    case 'soal-set-link':
      return useSoalSetLinkResolver();
    case 'reorder':
      return useReorderResolver();
    case 'step-meta':
      return useStepMetaResolver();
    case 'step-content':
      return useStepContentResolver();
    case 'step-pricing':
      return useStepPricingResolver();
    case 'complete-kelas':
      return useCompleteKelasResolver();
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
};

export const getFormDefaults = (formType: string) => {
  switch (formType) {
    case 'kelas-meta':
    case 'refined-kelas-meta':
      return kelasMetaDefaults;
    case 'materi-quick':
      return materiQuickDefaults;
    case 'vocabulary-quick':
      return vocabularyQuickDefaults;
    case 'vocabulary-item':
      return vocabularyItemDefaults;
    case 'soal-set-link':
      return soalSetLinkDefaults;
    case 'step-meta':
      return stepMetaDefaults;
    case 'step-content':
      return stepContentDefaults;
    case 'step-pricing':
      return stepPricingDefaults;
    case 'complete-kelas':
      return {
        ...kelasMetaDefaults,
        materis: stepContentDefaults.materis,
        vocabSets: [],
        soalSets: [],
      };
    default:
      return {};
  }
};

// Helper hook for creating forms with proper typing
export const useKelasForm = <T extends Record<string, any>>(
  formType: string,
  defaultValues?: Partial<T>
) => {
  const resolver = getFormResolver(formType);
  const defaults = { ...getFormDefaults(formType), ...defaultValues };
  
  return {
    resolver,
    defaultValues: defaults as T,
  };
};

// Get schema by form type
export const getFormSchema = (formType: string) => {
  switch (formType) {
    case 'kelas-meta':
      return KelasMetaSchema;
    case 'refined-kelas-meta':
      return RefinedKelasMetaSchema;
    case 'materi-quick':
      return MateriQuickSchema;
    case 'vocabulary-quick':
      return VocabularyQuickSchema;
    case 'vocabulary-item':
      return VocabularyItemSchema;
    case 'soal-set-link':
      return SoalSetLinkSchema;
    case 'reorder':
      return ReorderSchema;
    case 'step-meta':
      return StepMetaSchema;
    case 'step-content':
      return StepContentSchema;
    case 'step-pricing':
      return StepPricingSchema;
    case 'complete-kelas':
      return CompleteKelasSchema;
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
};

// Validation helpers
export const validateFormData = (formType: string, data: any) => {
  const schema = getFormSchema(formType);
  return schema.safeParse(data);
};

export const getFormErrors = (formType: string, data: any) => {
  const result = validateFormData(formType, data);
  if (!result.success) {
    return result.error.errors;
  }
  return null;
};

// Form submission helpers
export const prepareFormData = (formType: string, data: any) => {
  const result = validateFormData(formType, data);
  if (!result.success) {
    throw new Error(`Form validation failed: ${result.error.message}`);
  }
  return result.data;
};

// Dynamic array field helpers for React Hook Form
export const createArrayFieldDefaults = (fieldType: string) => {
  switch (fieldType) {
    case 'materi':
      return {
        title: "",
        description: "",
        htmlDescription: "",
        isDemo: false,
      };
    case 'vocabulary-item':
      return vocabularyItemDefaults;
    default:
      return {};
  }
};

// Form field validation helpers
export const validateField = (fieldName: string, value: any, schema: any) => {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return { isValid: true, error: null };
    }
    return { isValid: true, error: null };
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
};

// Export types for convenience
export type {
  KelasMetaFormData,
  MateriQuickFormData,
  VocabularyQuickFormData,
  SoalSetLinkFormData,
  ReorderFormData,
  StepMetaFormData,
  StepContentFormData,
  StepPricingFormData,
  CompleteKelasFormData,
  VocabularyItemFormData,
};
