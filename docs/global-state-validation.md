# Global State & Validation Documentation

This document describes the Global State management and Validation layer for the Kelas Builder functionality.

## Overview

The Global State & Validation layer provides:
- **Zustand Store**: `useKelasBuilderStore` with optimistic updates
- **Zod Schemas**: Type-safe validation schemas
- **Form Resolvers**: React Hook Form integration with Zod validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Components                               │
├─────────────────────────────────────────────────────────────┤
│                useKelasBuilderStore                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   State     │  │   Actions   │  │  Optimistic Updates │  │
│  │             │  │             │  │                     │  │
│  │ • draftId   │  │ • updateMeta│  │ • tempId tracking   │  │
│  │ • meta      │  │ • addMateri │  │ • rollback support  │  │
│  │ • materis   │  │ • saveMeta  │  │ • loading states    │  │
│  │ • vocabSets │  │ • publish   │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Validation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Zod Schemas │  │ Form Resolv.│  │   Type Safety       │  │
│  │             │  │             │  │                     │  │
│  │ • MetaSchema│  │ • useResolver│  │ • Compile-time     │  │
│  │ • MateriSch.│  │ • defaults  │  │ • Runtime checks   │  │
│  │ • VocabSch. │  │ • validation│  │ • Error messages   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Server Actions                          │
│          (createDraftKelas, updateKelasMeta, etc.)         │
└─────────────────────────────────────────────────────────────┘
```

## Zustand Store (`useKelasBuilderStore`)

### State Structure

```typescript
interface KelasBuilderState {
  // Core state
  draftId: number | null;
  currentStep: BuilderStep;
  isLoading: boolean;
  error: string | null;
  
  // Data state
  meta: KelasMetaData;
  materis: MateriData[];
  vocabSets: VocabularySetData[];
  soalSets: SoalSetData[];
  
  // UI state
  isDirty: boolean;
  optimisticUpdates: Set<string>;
}
```

### Key Actions

#### Step Navigation
```typescript
const { 
  currentStep, 
  setCurrentStep, 
  nextStep, 
  prevStep 
} = useKelasBuilderStore();

// Usage
setCurrentStep('content');
nextStep(); // meta -> content -> vocabulary -> assessment -> review -> publish
```

#### Meta Management
```typescript
const { 
  meta, 
  updateMeta, 
  saveMeta 
} = useKelasBuilderStore();

// Usage
updateMeta({ title: 'New Title' }); // Optimistic update
await saveMeta(); // Persist to server
```

#### Content Management
```typescript
const { 
  materis, 
  addMateri, 
  updateMateri, 
  removeMateri, 
  reorderMateris, 
  saveMateris 
} = useKelasBuilderStore();

// Usage
addMateri({
  title: 'New Lesson',
  description: 'Lesson description',
  jsonDescription: { content: 'Rich content' },
  htmlDescription: '<p>HTML content</p>',
  isDemo: false
});

reorderMateris(0, 2); // Move first item to third position
await saveMateris(); // Persist changes
```

#### Vocabulary Management
```typescript
const { 
  vocabSets, 
  addVocabularySet, 
  updateVocabularySet, 
  removeVocabularySet, 
  saveVocabularySet 
} = useKelasBuilderStore();

// Usage
addVocabularySet({
  title: 'Basic Greetings',
  description: 'Common Korean greetings',
  icon: 'FaBook',
  isPublic: true,
  items: [
    {
      korean: '안녕하세요',
      indonesian: 'Halo',
      type: 'WORD',
      exampleSentences: ['안녕하세요, 만나서 반가워요']
    }
  ]
});

await saveVocabularySet(0); // Save first vocabulary set
```

#### Global Actions
```typescript
const { 
  createDraft, 
  publishDraft, 
  deleteDraft, 
  reset 
} = useKelasBuilderStore();

// Usage
await createDraft({
  title: 'Korean Basics',
  level: 'BEGINNER',
  type: 'REGULAR',
  isPaidClass: false
});

await publishDraft(); // Publish when ready
await deleteDraft(); // Delete if needed
reset(); // Reset store state
```

### Optimistic Updates

The store implements optimistic updates for better UX:

```typescript
// When adding new content
addMateri(newMateri); // Immediately shows in UI with tempId
// ... user continues working
await saveMateris(); // Persists to server, removes tempId
```

**Features:**
- Immediate UI updates
- Rollback support on failure
- Loading states during server sync
- Error handling with toast notifications

## Validation Schemas

### Core Schemas

#### KelasMetaSchema
```typescript
const KelasMetaSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  type: z.nativeEnum(KelasType).default(KelasType.REGULAR),
  level: z.nativeEnum(Difficulty),
  thumbnail: z.string().url().optional().or(z.literal("")),
  isPaidClass: z.boolean().default(false),
  price: z.number().min(0).optional(),
  // ... other fields
});
```

#### MateriQuickSchema
```typescript
const MateriQuickSchema = z.object({
  materis: z.array(
    z.object({
      title: z.string().min(1).max(255),
      description: z.string().min(1),
      jsonDescription: z.any().default({}),
      htmlDescription: z.string().min(1),
      isDemo: z.boolean().default(false),
    })
  ).min(1, "At least one materi is required"),
});
```

#### VocabularyQuickSchema
```typescript
const VocabularyQuickSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  icon: z.string().default("FaBook"),
  isPublic: z.boolean().default(false),
  items: z.array(VocabularyItemSchema).min(1),
});
```

#### SoalSetLinkSchema
```typescript
const SoalSetLinkSchema = z.object({
  koleksiSoalId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});
```

### Step-Specific Schemas

For multi-step forms:
```typescript
const StepMetaSchema = KelasMetaSchema.pick({
  title: true,
  description: true,
  type: true,
  level: true,
  thumbnail: true,
  icon: true,
});

const StepContentSchema = z.object({
  materis: z.array(MateriItemSchema).min(1),
});

const StepPricingSchema = z.object({
  isPaidClass: z.boolean().default(false),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});
```

### Schema Refinements

Advanced validation with custom logic:
```typescript
const RefinedKelasMetaSchema = KelasMetaSchema.refine(
  (data) => {
    if (data.isPaidClass && (!data.price || data.price <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Price is required for paid classes",
    path: ["price"],
  }
);
```

## Form Resolvers

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { useKelasMetaResolver, kelasMetaDefaults } from '@/lib/hooks/use-form-resolvers';

const MetaForm = () => {
  const form = useForm({
    resolver: useKelasMetaResolver(),
    defaultValues: kelasMetaDefaults,
  });

  const onSubmit = (data) => {
    // Data is automatically validated
    console.log(data); // TypeScript-safe
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} />
      {form.formState.errors.title && (
        <span>{form.formState.errors.title.message}</span>
      )}
    </form>
  );
};
```

### Available Resolvers

```typescript
// Basic resolvers
useKelasMetaResolver()
useRefinedKelasMetaResolver()
useMateriQuickResolver()
useVocabularyQuickResolver()
useVocabularyItemResolver()
useSoalSetLinkResolver()

// Step-specific resolvers
useStepMetaResolver()
useStepContentResolver()
useStepPricingResolver()

// Utility resolvers
useReorderResolver()
useCompleteKelasResolver()
```

### Default Values

Pre-configured defaults for each form type:
```typescript
import { kelasMetaDefaults, materiQuickDefaults } from '@/lib/hooks/use-form-resolvers';

const form = useForm({
  resolver: useKelasMetaResolver(),
  defaultValues: kelasMetaDefaults,
});
```

### Dynamic Form Helper

```typescript
import { useKelasForm } from '@/lib/hooks/use-form-resolvers';

const DynamicForm = ({ formType }) => {
  const { resolver, defaultValues } = useKelasForm(formType);
  
  const form = useForm({
    resolver,
    defaultValues,
  });
  
  // Form automatically has correct validation and defaults
};
```

## Validation Helpers

### Form Validation
```typescript
import { validateFormData, getFormErrors } from '@/lib/hooks/use-form-resolvers';

// Validate data
const result = validateFormData('kelas-meta', formData);
if (!result.success) {
  console.log(result.error.errors);
}

// Get errors array
const errors = getFormErrors('kelas-meta', formData);
```

### Field Validation
```typescript
import { validateField, getFormSchema } from '@/lib/hooks/use-form-resolvers';

const schema = getFormSchema('kelas-meta');
const result = validateField('title', 'Test Title', schema);
```

### Publishing Validation
```typescript
import { validateKelasForPublish } from '@/lib/validation/kelas-schemas';

const validation = validateKelasForPublish(kelasData);
if (!validation.isValid) {
  console.log(validation.errors);
}
```

## Usage Examples

### Complete Kelas Builder Component

```typescript
import { useKelasBuilderStore } from '@/lib/stores/kelas-builder';
import { useForm } from 'react-hook-form';
import { useStepMetaResolver, stepMetaDefaults } from '@/lib/hooks/use-form-resolvers';

const KelasBuilder = () => {
  const { 
    currentStep, 
    meta, 
    updateMeta, 
    saveMeta, 
    nextStep,
    isLoading 
  } = useKelasBuilderStore();

  const form = useForm({
    resolver: useStepMetaResolver(),
    defaultValues: { ...stepMetaDefaults, ...meta },
  });

  const onSubmit = async (data) => {
    updateMeta(data);
    await saveMeta();
    nextStep();
  };

  if (currentStep !== 'meta') return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input 
        {...form.register('title')} 
        placeholder="Enter class title" 
      />
      {form.formState.errors.title && (
        <span className="text-red-500">
          {form.formState.errors.title.message}
        </span>
      )}
      
      <select {...form.register('level')}>
        <option value="BEGINNER">Beginner</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="ADVANCED">Advanced</option>
      </select>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  );
};
```

### Vocabulary Set Form

```typescript
import { useKelasBuilderStore } from '@/lib/stores/kelas-builder';
import { useForm, useFieldArray } from 'react-hook-form';
import { useVocabularyQuickResolver, vocabularyQuickDefaults } from '@/lib/hooks/use-form-resolvers';

const VocabularyForm = () => {
  const { addVocabularySet, saveVocabularySet } = useKelasBuilderStore();
  
  const form = useForm({
    resolver: useVocabularyQuickResolver(),
    defaultValues: vocabularyQuickDefaults,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data) => {
    addVocabularySet(data);
    // Auto-save after adding
    const index = useKelasBuilderStore.getState().vocabSets.length - 1;
    await saveVocabularySet(index);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} placeholder="Vocabulary set title" />
      
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 mb-4">
          <input 
            {...form.register(`items.${index}.korean`)} 
            placeholder="Korean word" 
          />
          <input 
            {...form.register(`items.${index}.indonesian`)} 
            placeholder="Indonesian translation" 
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={() => append({ korean: '', indonesian: '', type: 'WORD' })}
      >
        Add Word
      </button>
      
      <button type="submit">Save Vocabulary Set</button>
    </form>
  );
};
```

## Error Handling

### Store Error Handling
```typescript
const { error, setError, clearError } = useKelasBuilderStore();

// Display errors
if (error) {
  return <div className="text-red-500">Error: {error}</div>;
}

// Clear errors
useEffect(() => {
  clearError();
}, []);
```

### Form Error Handling
```typescript
const form = useForm({
  resolver: useKelasMetaResolver(),
  defaultValues: kelasMetaDefaults,
});

// Field-level errors
{form.formState.errors.title && (
  <span className="text-red-500">
    {form.formState.errors.title.message}
  </span>
)}

// Form-level errors
{form.formState.errors.root && (
  <div className="text-red-500">
    {form.formState.errors.root.message}
  </div>
)}
```

## Performance Considerations

### Optimistic Updates
- Immediate UI feedback
- Minimal server round-trips
- Rollback on failure

### Selective Re-renders
- Zustand store slices prevent unnecessary re-renders
- Form state is isolated per component

### Validation Optimization
- Client-side validation prevents unnecessary server calls
- Schema caching for performance

## Best Practices

### Store Usage
```typescript
// ✅ Use specific selectors
const title = useKelasBuilderStore(state => state.meta.title);

// ❌ Avoid selecting entire state
const state = useKelasBuilderStore();
```

### Form Handling
```typescript
// ✅ Use appropriate resolver for form type
const resolver = useStepMetaResolver();

// ✅ Provide proper defaults
const defaultValues = { ...stepMetaDefaults, ...existingData };

// ✅ Handle loading states
const isLoading = form.formState.isSubmitting;
```

### Validation
```typescript
// ✅ Validate on both client and server
const clientResult = validateFormData('kelas-meta', data);
// Server actions also validate

// ✅ Use refinements for complex validation
const RefinedSchema = BaseSchema.refine(customLogic);
```

## Testing

### Store Testing
```typescript
import { useKelasBuilderStore } from '@/lib/stores/kelas-builder';

describe('KelasBuilderStore', () => {
  beforeEach(() => {
    useKelasBuilderStore.getState().reset();
  });

  it('should update meta', () => {
    const { updateMeta } = useKelasBuilderStore.getState();
    updateMeta({ title: 'New Title' });
    
    expect(useKelasBuilderStore.getState().meta.title).toBe('New Title');
  });
});
```

### Schema Testing
```typescript
import { KelasMetaSchema } from '@/lib/validation/kelas-schemas';

describe('KelasMetaSchema', () => {
  it('should validate correct data', () => {
    const result = KelasMetaSchema.safeParse({
      title: 'Test',
      level: 'BEGINNER',
      type: 'REGULAR',
      isPaidClass: false,
    });
    
    expect(result.success).toBe(true);
  });
});
```

This comprehensive Global State & Validation layer provides type-safe, optimistic, and performant state management for the Kelas Builder functionality.
