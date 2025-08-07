# Kelas Builder Documentation

## Overview

The Kelas Builder is a comprehensive course creation system built with Next.js, React, and Zustand state management. It provides an intuitive multi-step interface for educators to create, manage, and publish educational courses with rich content, vocabulary sets, and assessments.

## Architecture

### Main Components

#### 1. Main Page: `app/dashboard/guru/kelas-builder/page.tsx`
The main entry point that orchestrates the entire course building experience.

**Key Features:**
- Uses Zustand store for state management
- Handles loading states and error handling
- Manages URL parameters for editing existing courses (`?edit=123`)
- Renders appropriate step components based on current step
- Auto-loads existing drafts when editing

**Data Flow:**
```typescript
// Load existing course when edit parameter is present
useEffect(() => {
  const editId = searchParams.get('edit');
  if (editId && !draftId) {
    const kelasId = parseInt(editId, 10);
    if (!isNaN(kelasId)) {
      loadDraft(kelasId);
    }
  }
}, [searchParams, draftId, loadDraft]);
```

#### 2. Layout Component: `components/kelas-builder/kelas-builder-layout.tsx`
Provides the overall layout with navigation, progress tracking, and step management.

**Key Features:**
- **Step Navigation:** 5-step wizard with visual progress indicators
- **Progress Tracking:** Real-time progress calculation for each step
- **Save State Management:** Tracks unsaved changes with visual indicators
- **Responsive Design:** Works across desktop and mobile devices
- **Smart Validation:** Step-specific validation logic
- **Auto-save Integration:** Context-aware save functionality

**Step Structure:**
```typescript
const steps = [
  { id: 'meta', title: 'Basic Info', description: 'Course title, description, and settings', icon: BookOpen },
  { id: 'content', title: 'Content', description: 'Add lessons and learning materials', icon: FileText },
  { id: 'vocabulary', title: 'Vocabulary', description: 'Add vocabulary sets (optional)', icon: MessageSquare },
  { id: 'assessment', title: 'Assessment', description: 'Link question sets (optional)', icon: ClipboardList },
  { id: 'review', title: 'Review & Publish', description: 'Review and publish your course', icon: Rocket },
];
```

**Navigation Logic:**
```typescript
const canGoNext = () => {
  switch (currentStep) {
    case 'meta':
      return meta.title.trim() !== '' && meta.description;
    case 'content':
      return materis.length > 0;
    case 'vocabulary':
    case 'assessment':
      return true; // Optional steps
    case 'review':
      return true; // Final step
    default:
      return true;
  }
};
```

#### 3. State Management: `lib/stores/kelas-builder.ts`
Centralized state management using Zustand with immer for immutable updates.

**State Structure:**
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
  koleksiSoals: KoleksiSoalData[];
  
  // UI state
  isDirty: boolean;
  stepDirtyFlags: Record<BuilderStep, boolean>;
  optimisticUpdates: Set<string>;
  
  // Deletion tracking
  deletedMateris: number[];
  deletedKoleksiSoals: number[];
  deletedSoals: number[];
  deletedOpsi: number[];
}
```

**Key Store Features:**
- **Auto-draft Creation:** Automatically creates draft when leaving meta step
- **Progress Calculation:** Real-time progress tracking per step
- **Optimistic Updates:** Immediate UI feedback with rollback capability
- **Dirty State Management:** Tracks unsaved changes across all steps
- **Step-level Validation:** Validates completion requirements for each step

**Auto-save Mechanism:**
```typescript
// Auto-create draft when navigating away from meta
if (step !== 'meta' && !draftId && meta.title.trim() !== '') {
  try {
    await createDraft(meta);
  } catch (error) {
    set((state) => {
      state.error = 'Failed to create draft: ' + (error instanceof Error ? error.message : 'Unknown error');
    });
  }
}
```

## Data Storage Architecture

### 1. Local State Management
**Technology:** Zustand with immer middleware

**Local Storage Features:**
- **Optimistic Updates:** UI updates immediately before server confirmation
- **Dirty State Tracking:** Monitors unsaved changes across all steps
- **Step-level State Management:** Tracks which steps have unsaved changes
- **Temporary IDs:** Uses `tempId` for new items before database persistence
- **Real-time Validation:** Form validation with immediate feedback
- **Auto-sync:** Automatic state synchronization between form and store

**Example: Local State Flow**
```typescript
// Add new lesson (immediate UI update)
addMateri: (materi: Omit<MateriData, 'order'>) => {
  set((state) => {
    const tempId = `temp-${Date.now()}`;
    const newMateri: MateriData = {
      ...materi,
      order: state.materis.length,
      tempId,
    };
    state.materis.push(newMateri);
    state.isDirty = true;
    state.stepDirtyFlags.content = true;
    state.optimisticUpdates.add(tempId);
  });
}

// Form synchronization with store
useEffect(() => {
  const hasActualChanges = JSON.stringify(watchedValues) !== JSON.stringify(meta);
  if (hasActualChanges) {
    updateMeta(watchedValues);
  }
}, [watchedValues, updateMeta, meta]);
```

### 2. Database Integration
**Technology:** Prisma ORM with PostgreSQL

**Database Schema:**
- **Kelas:** Main course entity
- **Materi:** Course lessons/units
- **VocabularySet & VocabularyItem:** Vocabulary management
- **KoleksiSoal, Soal, Opsi:** Assessment/question management

**Server Actions Pattern:**
```typescript
// Server action for creating course draft
export async function createDraftKelas(data: z.infer<typeof createKelasSchema>) {
  try {
    const session = await assertAuthenticated();
    const validData = createKelasSchema.parse(data);
    
    const kelas = await prisma.kelas.create({
      data: {
        ...validData,
        isDraft: true,
        authorId: session.user.id,
      },
    });
    
    return { success: true, data: serializedKelas };
  } catch (error) {
    return { success: false, error: "Failed to create kelas" };
  }
}
```

### 3. Form Validation & Error Handling
**Technology:** React Hook Form + Zod schemas

**Validation Features:**
- **Schema-based Validation:** Type-safe validation with Zod
- **Real-time Feedback:** Immediate validation feedback
- **Step-specific Validation:** Different validation rules per step
- **Error Recovery:** Graceful error handling with user-friendly messages

**Example Validation Schema:**
```typescript
// Meta step validation
const KelasMetaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.nativeEnum(KelasType),
  level: z.nativeEnum(Difficulty),
  isPaidClass: z.boolean(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
});

// Vocabulary set validation
const VocabularySetBasicSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  icon: z.string().default("FaBook"),
  isPublic: z.boolean().default(false),
});
```

### 4. Rich Content Management
**Technology:** Novel Editor component

**Content Features:**
- **Rich Text Editing:** Advanced editor with formatting options
- **JSON/HTML Storage:** Dual storage for content preservation
- **Real-time Updates:** Live content synchronization
- **Media Integration:** Support for images and other media

**Content Storage Pattern:**
```typescript
// Rich content handling in step-meta.tsx
<NovelEditor
  initialContent={watch("jsonDescription")}
  onUpdate={(data) => {
    form.setValue("jsonDescription", data.json, { shouldTouch: true, shouldDirty: true });
    form.setValue("htmlDescription", data.html, { shouldTouch: true, shouldDirty: true });
  }}
  className="min-h-[300px]"
  compact={true}
/>
```

### 3. Data Persistence Strategy

#### Auto-save Mechanism
- **Step Navigation:** Auto-saves when moving between steps
- **Manual Save:** Explicit save buttons for each step
- **Batch Save:** Comprehensive save before publishing

#### Error Handling
```typescript
// Optimistic update rollback on error
saveMateris: async () => {
  try {
    // Database operations
  } catch (error) {
    // Revert local state if save fails
    set((state) => {
      state.materis.forEach((m: MateriData) => {
        if (m.tempId) {
          state.optimisticUpdates.delete(m.tempId);
          delete m.tempId;
        }
      });
    });
  }
}
```

## Step-by-Step Components

### Step 1: Meta Information (`step-meta.tsx`)
**Purpose:** Collect basic course information

**Features:**
- Course title and description
- Rich text editor for detailed description using NovelEditor
- Course type and difficulty level with visual badges
- Visual settings (thumbnail upload via MediaUpload, icon selection)
- Pricing configuration (free/paid, discounts, promo codes)
- Real-time form validation with immediate feedback
- Auto-save on form changes

**Implementation Details:**
```typescript
// Form with real-time validation
const form = useForm({
  resolver: zodResolver(KelasMetaSchema),
  defaultValues: meta,
  mode: "onChange", // Validate on change
});

// Rich content handling
<NovelEditor
  initialContent={watch("jsonDescription")}
  onUpdate={(data) => {
    form.setValue("jsonDescription", data.json, { shouldTouch: true, shouldDirty: true });
    form.setValue("htmlDescription", data.html, { shouldTouch: true, shouldDirty: true });
  }}
  className="min-h-[300px]"
  compact={true}
/>

// Media upload integration
<MediaUpload
  onUpload={(files) => {
    if (files.length > 0) {
      field.onChange(files[0].url);
    }
  }}
  maxFiles={1}
  maxSize={5}
  allowedTypes={['image']}
  accept="image/*"
  className="max-w-md"
/>
```

### Step 2: Content Creation (`step-content.tsx`)
**Purpose:** Add course lessons and materials

**Features:**
- **Drag & Drop:** Reorder lessons with @dnd-kit interface
- **Rich Content:** Each lesson supports JSON/HTML content
- **Demo Mode:** Mark lessons as preview/demo content
- **Draft Management:** Toggle between draft and published states
- **Visual Indicators:** Show unsaved status and demo badges
- **Sortable Items:** Drag-and-drop reordering with visual feedback

**Implementation Details:**
```typescript
// Sortable lesson items using @dnd-kit
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={materis.map((_, index) => `materi-${index}`)} strategy={verticalListSortingStrategy}>
    {materis.map((materi, index) => (
      <SortableMateriItem
        key={materi.tempId || materi.id}
        materi={materi}
        index={index}
        onUpdateMateri={updateMateri}
        onRemoveMateri={removeMateri}
        onToggleMateriDraft={toggleMateriDraft}
      />
    ))}
  </SortableContext>
</DndContext>

// Lesson item with visual indicators
{materi.isDemo && (
  <Badge key={`demo-${index}`} variant="secondary" className="text-xs">Demo</Badge>
)}
{materi.tempId && (
  <Badge key={`unsaved-${index}`} variant="outline" className="text-xs">Unsaved</Badge>
)}
```

### Step 3: Vocabulary Management (`step-vocabulary.tsx`)
**Purpose:** Add vocabulary sets and items (optional)

**Features:**
- **Vocabulary Sets:** Create organized collections of terms
- **Item Management:** Add individual vocabulary items with translations
- **Rich Content:** Support for audio, examples, and part of speech
- **Public/Private:** Control vocabulary visibility
- **Modal Management:** Separate modal for set creation and item management
- **Click-to-Edit:** Hover effects and click interactions

**Implementation Details:**
```typescript
// Vocabulary set creation modal
<Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <VocabularySetBasicForm
      vocabSet={editingIndex !== undefined ? vocabSets[editingIndex] : undefined}
      onCancel={handleCancel}
      onSave={handleSaveSet}
    />
  </DialogContent>
</Dialog>

// Item management sheet
<Sheet open={managingItemsIndex !== undefined} onOpenChange={handleCloseManageItems}>
  <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
    <ManageVocabularyItems vocabSetIndex={managingItemsIndex} />
  </SheetContent>
</Sheet>
```

### Step 4: Assessment Creation (`step-assessment.tsx`)
**Purpose:** Create question collections and assessments (optional)

**Features:**
- **Question Collections:** Organize questions into sets
- **Question Management:** Add, edit, and reorder questions
- **Multiple Choice:** Support for multiple choice questions with options
- **Difficulty Levels:** Categorize questions by difficulty with color coding
- **Visual Indicators:** Show question counts and difficulty distribution

**Implementation Details:**
```typescript
// Question collection management
<div className="grid gap-4">
  {koleksiSoals.map((koleksi, index) => (
    <Card
      key={koleksi.tempId || koleksi.id || index}
      className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
      onClick={() => handleManageQuestions(index)}
    >
      {/* Difficulty badges */}
      {koleksi.soals.length > 0 && (
        <div className="flex items-center gap-2">
          {Object.entries(
            koleksi.soals.reduce((acc, soal) => {
              if (soal.difficulty) {
                acc[soal.difficulty] = (acc[soal.difficulty] || 0) + 1;
              }
              return acc;
            }, {} as Record<Difficulty, number>)
          ).map(([difficulty, count]) => (
            <Badge
              key={difficulty}
              variant={
                difficulty === Difficulty.BEGINNER ? "default" :
                difficulty === Difficulty.INTERMEDIATE ? "secondary" : "destructive"
              }
              className="text-xs"
            >
              {difficulty}: {count}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  ))}
</div>
```

### Step 5: Review & Publish (`step-review.tsx`)
**Purpose:** Final review and course publication

**Features:**
- **Course Preview:** Live preview of how the course will appear
- **Publish Checklist:** Verify all requirements are met
- **Publish Actions:** Finalize course publication
- **Success State:** Confirmation and next steps
- **Progress Summary:** Show completion status for all steps

**Implementation Details:**
```typescript
// Publish validation
const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

// Mock course data for preview
const mockKelasData = {
  id: 999,
  title: meta.title || "Your Course Title",
  description: meta.description || "Your course description will appear here",
  jsonDescription: meta.jsonDescription || null,
  htmlDescription: meta.htmlDescription || null,
  type: meta.type as any,
  level: meta.level as any,
  thumbnail: meta.thumbnail || null,
  icon: meta.icon || null,
  isPaidClass: meta.isPaidClass,
  price: meta.price || 0,
  discount: meta.discount || 0,
  author: {
    name: session?.user?.name || "Instructor",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  materis: materis,
  vocabSets: vocabSets,
  koleksiSoals: koleksiSoals,
};
```

## Data Flow Summary

### 1. Initial Load
```
User Access → Check URL for edit ID → Load existing course → Populate store → Render current step
```

### 2. Content Creation
```
User Input → Update local state → Mark as dirty → Enable save button → Optimistic UI update
```

### 3. Save Process
```
User Clicks Save → Validate data → Send to server → Update local state → Clear dirty flags
```

### 4. Navigation Flow
```
User Changes Step → Auto-save if needed → Update current step → Render new step component
```

### 5. Publishing Flow
```
User Clicks Publish → Validate all steps → Save all unsaved content → Update draft status → Redirect to dashboard
```

## Key Features

### 1. Progressive Enhancement
- **Optional Steps:** Vocabulary and assessment steps are optional
- **Flexible Content:** Support for various content types and formats
- **Draft System:** Work-in-progress courses saved as drafts

### 2. User Experience
- **Real-time Validation:** Immediate feedback on form inputs
- **Progress Tracking:** Visual indicators for completion status
- **Error Handling:** Graceful error recovery with user-friendly messages
- **Responsive Design:** Works seamlessly across devices

### 3. Data Integrity
- **Optimistic Updates:** Immediate UI feedback with rollback on errors
- **Transaction Safety:** Database operations wrapped in transactions
- **Ownership Validation:** Users can only modify their own content
- **Data Validation:** Comprehensive validation at all levels

### 4. Performance Optimization
- **Lazy Loading:** Step components loaded on demand
- **State Management:** Efficient state updates with Zustand
- **Batch Operations:** Efficient database operations for bulk updates
- **Caching:** Smart caching of frequently accessed data

## Technical Implementation Details

### State Management Pattern
```typescript
// Centralized store with immer for immutable updates
export const useKelasBuilderStore = create<KelasBuilderState & KelasBuilderActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // State and actions implementation
      }))
    )
  )
);
```

### Server Actions Integration
```typescript
// Type-safe server actions with validation
export async function createDraftKelas(data: z.infer<typeof createKelasSchema>) {
  const session = await assertAuthenticated();
  const validData = createKelasSchema.parse(data);
  
  // Database operation
  const kelas = await prisma.kelas.create({
    data: { ...validData, isDraft: true, authorId: session.user.id }
  });
  
  return { success: true, data: serializedKelas };
}
```

### Component Architecture
```typescript
// Reusable step component pattern
export function StepMeta() {
  const { meta, updateMeta, saveMeta } = useKelasBuilderStore();
  const form = useForm({ resolver: zodResolver(KelasMetaSchema), defaultValues: meta });
  
  // Form handling and validation
  return (
    <Form {...form}>
      {/* Step-specific UI components */}
    </Form>
  );
}
```

## Debugging & Development Tools

### Debug Component: `debug-publish-state.tsx`
A comprehensive debugging tool that provides real-time insights into the application state.

**Features:**
- **State Visualization:** Shows current store state with visual indicators
- **Progress Analysis:** Detailed breakdown of step completion status
- **Publish Requirements:** Real-time validation of publish requirements
- **Error Diagnosis:** Identifies missing components and validation issues

**Debug Information:**
```typescript
// Debug component showing store state
<div className="grid grid-cols-2 gap-4">
  <div>
    <h4 className="font-semibold mb-2">Store State</h4>
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-mono">draftId:</span>
        <Badge variant={draftId ? "default" : "destructive"}>
          {draftId || "null"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono">currentStep:</span>
        <Badge variant="outline">{currentStep}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono">isLoading:</span>
        <Badge variant={isLoading ? "secondary" : "outline"}>
          {isLoading.toString()}
        </Badge>
      </div>
    </div>
  </div>
</div>
```

## Performance Considerations

### 1. State Management Optimization
- **Selective Updates:** Only update relevant parts of state
- **Memoization:** Use React.memo for expensive components
- **Lazy Loading:** Load step components only when needed
- **Virtualization:** Consider virtualization for large lists

### 2. Database Optimization
- **Batch Operations:** Group multiple database operations
- **Indexing:** Ensure proper indexing on frequently queried fields
- **Connection Pooling:** Efficient database connection management
- **Caching:** Implement Redis caching for frequently accessed data

### 3. UI Performance
- **Debouncing:** Debounce rapid form inputs
- **Throttling:** Throttle scroll and resize events
- **Image Optimization:** Use Next.js Image component for thumbnails
- **Code Splitting:** Dynamic imports for heavy components

## Security Considerations

### 1. Data Validation
- **Input Sanitization:** Validate all user inputs
- **Type Safety:** Use TypeScript for compile-time validation
- **Schema Validation:** Zod schemas for runtime validation
- **SQL Injection Prevention:** Parameterized queries via Prisma

### 2. Access Control
- **Authentication:** Session-based authentication
- **Authorization:** Role-based access control (RBAC)
- **Ownership Validation:** Users can only modify their own content
- **Draft Protection:** Prevent unauthorized access to draft content

### 3. Content Security
- **XSS Prevention:** Sanitize rich content before rendering
- **File Upload Security:** Validate file types and sizes
- **Rate Limiting:** Prevent abuse of API endpoints
- **CSRF Protection:** Implement CSRF tokens for form submissions

## Testing Strategy

### 1. Unit Testing
- **Store Testing:** Test Zustand store actions and selectors
- **Component Testing:** Test individual components with React Testing Library
- **Hook Testing:** Test custom hooks and their side effects

### 2. Integration Testing
- **Form Integration:** Test form validation and submission flow
- **Database Integration:** Test database operations and data persistence
- **API Integration:** Test server actions and API endpoints

### 3. End-to-End Testing
- **User Journey:** Test complete course creation workflow
- **Error Scenarios:** Test error handling and recovery
- **Performance Testing:** Test application under load

## Deployment & Maintenance

### 1. Build Optimization
- **Bundle Analysis:** Monitor bundle size and dependencies
- **Tree Shaking:** Remove unused code
- **Environment Variables:** Manage environment-specific configurations
- **Static Assets:** Optimize static asset delivery

### 2. Monitoring & Analytics
- **Error Tracking:** Implement error monitoring and alerting
- **Performance Monitoring:** Track application performance metrics
- **User Behavior:** Monitor user interactions and drop-off points
- **Database Monitoring:** Track query performance and database health

### 3. Maintenance Strategy
- **Regular Updates:** Keep dependencies up to date
- **Code Reviews:** Implement peer review process
- **Documentation:** Keep documentation updated with code changes
- **Backup Strategy:** Regular backups of database and media files

## Future Enhancements

### 1. AI-Powered Features
- **Content Suggestions:** AI-powered content recommendations
- **Auto-Generation:** Generate course outlines and content
- **Smart Validation:** AI-powered content quality assessment
- **Personalization:** Adaptive learning paths based on student performance

### 2. Collaboration Features
- **Multi-User Editing:** Support for multiple instructors
- **Version Control:** Track changes and enable rollbacks
- **Comments & Feedback:** In-app collaboration tools
- **Real-time Collaboration:** Live editing capabilities

### 3. Advanced Analytics
- **Student Progress Tracking:** Monitor student engagement and progress
- **Performance Metrics:** Detailed analytics on course performance
- **Revenue Tracking:** Track course sales and revenue
- **Content Analytics:** Analyze content effectiveness and engagement

## Troubleshooting Guide

### Common Issues

#### 1. Draft Not Saving
**Symptoms:** Changes to course drafts are not being saved
**Solutions:**
- Check browser console for JavaScript errors
- Verify network connectivity
- Clear browser cache and cookies
- Check server logs for database errors

#### 2. Rich Content Editor Not Loading
**Symptoms:** NovelEditor component fails to load or render
**Solutions:**
- Verify all required dependencies are installed
- Check for CSS import conflicts
- Ensure proper component initialization
- Test in different browsers

#### 3. Drag & Drop Not Working
**Symptoms:** Lesson reordering functionality is not working
**Solutions:**
- Check @dnd-kit library imports
- Verify sensor configuration
- Ensure sortable items have proper IDs
- Test drag and drop in different browsers

#### 4. Form Validation Errors
**Symptoms:** Forms showing unexpected validation errors
**Solutions:**
- Verify Zod schema definitions
- Check form field names match schema
- Ensure proper form initialization
- Test with valid and invalid inputs

### Performance Issues

#### 1. Slow Page Loading
**Solutions:**
- Implement lazy loading for heavy components
- Optimize images and media files
- Reduce bundle size with code splitting
- Enable compression and caching

#### 2. Database Performance
**Solutions:**
- Add database indexes for frequently queried fields
- Optimize SQL queries
- Implement connection pooling
- Consider read replicas for high traffic

## Conclusion

This comprehensive documentation provides a complete understanding of the Kelas Builder system, from its high-level architecture to detailed implementation patterns and data flow management. The system demonstrates modern web development practices including:

- **State Management:** Efficient global state management with Zustand
- **Data Persistence:** Robust database integration with optimistic updates
- **User Experience:** Intuitive multi-step interface with real-time feedback
- **Performance Optimization:** Efficient rendering and data handling
- **Security:** Comprehensive validation and access control
- **Maintainability:** Clean code structure and comprehensive documentation

The Kelas Builder serves as a robust foundation for educational content creation, with extensibility built-in for future enhancements and feature additions.