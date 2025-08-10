# Vocabulary vs Assessment Data Saving: Key Differences

## Overview

The vocabulary and assessment components in the kelas-builder system implement fundamentally different approaches to data persistence. These differences reflect the inherent complexity of each data type and their relationships within the application.

## Table of Contents
- [Local Storage Management](#local-storage-management)
- [Database Saving Strategy](#database-saving-strategy)
- [Key Differences Summary](#key-differences-summary)
- [Database Schema Implications](#database-schema-implications)
- [Performance Considerations](#performance-considerations)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Local Storage Management

### Vocabulary Component

#### Data Structure
```typescript
// From lib/stores/kelas-builder/vocabulary.ts:10
vocabSets: VocabularySetData[]
```

#### Optimistic Updates
```typescript
// From lib/stores/kelas-builder/vocabulary.ts:31
const tempId = `temp-vocab-${Date.now()}`;
```

#### Dirty Tracking
```typescript
// From lib/stores/kelas-builder/vocabulary.ts:11
dirtyVocabSets: Set<number>
```

#### State Updates
- Updates local state immediately when user makes changes
- Uses [`updateVocabularySet()`](lib/stores/kelas-builder/vocabulary.ts:49) for real-time UI updates
- Simple state management with direct mutations

### Assessment Component

#### Data Structure
```typescript
// From lib/stores/kelas-builder/assessment.ts:18
koleksiSoals: KoleksiSoalData[]
```

#### Optimistic Updates
```typescript
// From lib/stores/kelas-builder/assessment.ts:136
const tempId = `temp-koleksi-${Date.now()}`;
// For questions: const tempId = `temp-soal-${Date.now()}`;
// For options: const tempId = `temp-opsi-${Date.now()}`;
```

#### Complex State Management
```typescript
// From lib/stores/kelas-builder/assessment.ts:19-21
deletedKoleksiSoals: number[];
deletedSoals: number[];
deletedOpsi: number[];
```

#### Hierarchical Tracking
- Maintains dirty state at multiple levels (collections, questions, options)
- Uses `dirtyKoleksiSoals` Set for tracking unsaved changes
- Implements deletion tracking for deferred processing

## Database Saving Strategy

### Vocabulary Component

#### Atomic Saves
```typescript
// From app/actions/kelas/vocabulary.ts:63
export async function saveVocabularySet(
  kelasId: number | null, 
  vocabSetData: {...}, 
  vocabSetId?: number
)
```

#### Item Synchronization
```typescript
// From app/actions/kelas/vocabulary.ts:8
async function syncVocabularyItems(vocabSetId: number, newItems: any[], existingItems: any[])
```

#### Save Process
1. **Single Transaction**: Each vocabulary set save is one database operation
2. **Bulk Operations**: Creates/updates/deletes multiple items in single call
3. **Direct Mapping**: Vocabulary items use `collectionId` foreign key
4. **Immediate Cleanup**: Removes `tempId` after successful save

### Assessment Component

#### Hierarchical Saves
```typescript
// From lib/stores/kelas-builder/assessment.ts:645
saveAllAssessments: () => Promise<void>
```

#### Layered Saving Process
1. **Collections**: Save `koleksiSoal` records first
2. **Questions**: Save individual `soal` records within collections
3. **Options**: Save `opsi` records for each question
4. **Relationships**: Handle many-to-many via `kelasKoleksiSoal` table

#### Individual Operations
```typescript
// From app/actions/kelas/assessment.ts:88
export async function saveSoal(koleksiSoalId: number, soalData: {...}, soalId?: number)
// From app/actions/kelas/assessment.ts:131
export async function saveOpsi(soalId: number, opsiData: {...}, opsiId?: number)
```

#### Batch Processing Features
- Handles deletions via tracking arrays
- Supports reordering of questions
- Validates data using Zod schemas
- Manages complex relationships

## Key Differences Summary

| Aspect | Vocabulary | Assessment |
|--------|------------|------------|
| **Data Structure** | Flat sets with items | Hierarchical: Collections → Questions → Options |
| **Save Strategy** | Atomic set saves | Individual item saves with batch processing |
| **Deletion Handling** | Immediate deletion | Deferred deletion via tracking arrays |
| **Relationships** | Simple foreign key | Many-to-many via linking table |
| **Validation** | Basic type checking | Zod schema validation |
| **State Management** | Simple dirty tracking | Complex dirty and deletion tracking |
| **Reordering** | Manual order updates | Built-in reordering support |
| **Error Handling** | Basic error states | Comprehensive error handling at each level |
| **Transaction Size** | Larger, fewer transactions | Smaller, more frequent transactions |
| **Concurrency** | Simpler conflict resolution | Complex multi-level conflict handling |

## Database Schema Implications

### Vocabulary Schema
```sql
-- Simple foreign key relationship
VocabularySet (id, title, description, icon, isPublic, userId, kelasId)
└── VocabularyItem (id, korean, indonesian, type, pos, audioUrl, exampleSentences, order, creatorId, collectionId)
```

**Characteristics:**
- Direct relationship: `VocabularySet` → `VocabularyItem`
- Simple foreign key: `collectionId` in `vocabularyItem`
- Order maintained via `order` field
- One-to-many relationship pattern

### Assessment Schema
```sql
-- Hierarchical with many-to-many relationships
KoleksiSoal (id, nama, deskripsi, isPrivate, isDraft, userId)
├── Soal (id, pertanyaan, difficulty, explanation, isActive, order, authorId, koleksiSoalId)
│   └── Opsi (id, opsiText, isCorrect, order, soalId)
└── KelasKoleksiSoal (id, kelasId, koleksiSoalId, title, description, order)
```

**Characteristics:**
- Hierarchical: `KoleksiSoal` → `Soal` → `Opsi`
- Many-to-many: `Kelas` ↔ `KoleksiSoal` via `kelasKoleksiSoal`
- Separate tables for each entity type
- Complex relationship management required

## Performance Considerations

### Vocabulary
**Pros:**
- Fewer database operations
- Simpler queries and indexes
- Better for bulk operations
- Lower overhead for simple CRUD operations

**Cons:**
- Larger transaction sizes
- Potential for conflicts during concurrent edits
- Less granular control over individual items
- All-or-nothing save approach

### Assessment
**Pros:**
- Granular control over individual items
- Better conflict resolution at multiple levels
- Supports partial saves and updates
- More efficient for hierarchical data operations

**Cons:**
- More complex queries and joins
- Potential for race conditions at multiple levels
- Higher overhead due to multiple operations
- Requires careful transaction management

## Code Examples

### Vocabulary Save Pattern
```typescript
// From lib/stores/kelas-builder/vocabulary.ts:97
saveVocabularySet: async (index) => {
  const { vocabSets, draftId } = get();
  if (!vocabSets[index] || !draftId) return;

  const vocabSet = vocabSets[index];
  set({ isLoading: true, error: null });

  try {
    const result = await saveVocabularySetAction(
      draftId,
      {
        title: vocabSet.title,
        description: vocabSet.description,
        icon: vocabSet.icon,
        isPublic: vocabSet.isPublic,
        items: vocabSet.items.map((item) => ({
          korean: item.korean,
          indonesian: item.indonesian,
          type: item.type,
          pos: item.pos,
          audioUrl: item.audioUrl,
          exampleSentences: item.exampleSentences,
        })),
      },
      vocabSet.id
    );

    if (result.success && result.data?.id) {
      // Update state with real ID
      set((state) => {
        const newVocabSets = [...state.vocabSets];
        const updatedVocabSet = { ...newVocabSets[index], id: result.data!.id };
        // Remove tempId and update state
        return { vocabSets: newVocabSets, isLoading: false };
      });
    }
  } catch (error) {
    set({ isLoading: false, error: error.message });
  }
}
```

### Assessment Save Pattern
```typescript
// From lib/stores/kelas-builder/assessment.ts:645
saveAllAssessments: async () => {
  const { koleksiSoals, draftId, deletedKoleksiSoals, deletedSoals, deletedOpsi } = get();
  
  try {
    // Handle deletions first
    if (deletedKoleksiSoals.length > 0) {
      for (const koleksiId of deletedKoleksiSoals) {
        await deleteKoleksiSoal(koleksiId);
      }
    }

    // Save all koleksi soals
    for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
      const koleksiSoal = koleksiSoals[koleksiIndex];
      if (koleksiSoal.tempId || currentState.stepDirtyFlags.assessment) {
        await saveKoleksiSoalAction(draftId, koleksiSoal, koleksiSoal.id);
      }
    }

    // Save all soals and their opsis
    for (let koleksiIndex = 0; koleksiIndex < koleksiSoals.length; koleksiIndex++) {
      const koleksiSoal = koleksiSoals[koleksiIndex];
      if (koleksiSoal.id) {
        for (let soalIndex = 0; soalIndex < koleksiSoal.soals.length; soalIndex++) {
          const soal = koleksiSoal.soals[soalIndex];
          if (soal.tempId || currentState.stepDirtyFlags.assessment) {
            const result = await saveSoalAction(koleksiSoal.id, soal, soal.id);
            // Save opsis for this soal
            for (let opsiIndex = 0; opsiIndex < soal.opsis.length; opsiIndex++) {
              await saveOpsiAction(result.data.id, soal.opsis[opsiIndex]);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Batch save failed:', error);
  }
}
```

## Best Practices

### Vocabulary Component
1. **Use atomic operations** for entire vocabulary sets
2. **Implement proper cleanup** of temporary IDs after successful saves
3. **Consider bulk operations** for better performance
4. **Use simple validation** for data integrity
5. **Implement optimistic updates** for better user experience

### Assessment Component
1. **Implement hierarchical state management** for complex data structures
2. **Use deferred deletion** to maintain data consistency
3. **Implement comprehensive validation** using schemas like Zod
4. **Handle many-to-many relationships** properly with linking tables
5. **Implement granular error handling** at each level
6. **Use batch processing** for better performance with hierarchical data
7. **Implement proper transaction management** for complex operations

## Conclusion

The vocabulary component uses a simpler, more straightforward approach suitable for its relatively flat data structure, while the assessment component implements a more sophisticated system capable of handling the complex hierarchical relationships and many-to-many associations required for question management.

The vocabulary approach is optimal for:
- Simple one-to-many relationships
- Bulk operations
- Applications requiring simple CRUD operations
- Situations where data consistency is critical

The assessment approach is necessary for:
- Complex hierarchical data structures
- Many-to-many relationships
- Applications requiring granular control
- Situations where partial updates are common

Understanding these differences is crucial for maintaining, extending, and debugging the kelas-builder system effectively.