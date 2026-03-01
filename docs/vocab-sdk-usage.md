# Vocabulary SDK Usage Guide

This guide explains how to use the Hakgyo Expo SDK for vocabulary-related operations.

## Overview

The vocabulary SDK provides methods for managing vocabulary sets and items, including tracking user-specific learned status.

## Key Concepts

### Gamification Integration

When a user marks a vocabulary item as learned:
- **5 XP** is awarded (via `COMPLETE_VOCABULARY` event)
- Streak is updated
- Level progress is calculated
- Activity log is created

Gamification is only triggered when **marking as learned** (`isLearned: true`), not when unmarking.

### User-Specific Progress

The vocabulary system now uses a `VocabularyItemProgress` model to track learned status per user. This means:
- Each user has their own learned status for each vocabulary item
- One user marking an item as learned doesn't affect other users
- The global `isLearned` field has been removed from `VocabularyItem`

### Vocabulary Set vs Vocabulary Item

- **VocabularySet**: A collection/group of vocabulary items (e.g., "Basic Korean Verbs")
- **VocabularyItem**: An individual vocabulary word/phrase with Korean and Indonesian translations

## API Endpoints

### Vocabulary Sets

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vocabulary-sets` | GET | List vocabulary sets with optional filters |
| `/api/vocabulary-sets` | POST | Create a new vocabulary set |
| `/api/vocabulary-sets/{id}` | GET | Get a specific vocabulary set |
| `/api/vocabulary-sets/{id}` | PUT | Update a vocabulary set |
| `/api/vocabulary-sets/{id}` | DELETE | Delete a vocabulary set |

### Vocabulary Items

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vocabulary-items` | GET | List vocabulary items with optional filters |
| `/api/vocabulary-items` | POST | Create a new vocabulary item |
| `/api/vocabulary-items/{id}` | GET | Get a specific vocabulary item |
| `/api/vocabulary-items/{id}` | PUT | Update a vocabulary item |
| `/api/vocabulary-items/{id}` | DELETE | Delete a vocabulary item |
| `/api/vocabulary-items/{id}/learned` | PUT | Mark/unmark item as learned (requires auth) |

## SDK Methods

### Vocabulary Sets API

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

// Get all vocabulary sets
const response = await vocabularyApi.listSets({
  userId: 'user-id',
  kelasId: 123,
  isPublic: 'true',
  limit: 20,
  offset: 0
});

// Get a specific vocabulary set
const set = await vocabularyApi.getSet(123);

// Create a new vocabulary set
const newSet = await vocabularyApi.createSet({
  title: 'Basic Korean Verbs',
  description: 'Essential verbs for beginners',
  icon: 'FaBook',
  isPublic: false,
  userId: 'user-id',
  kelasId: 123
});

// Update a vocabulary set
const updatedSet = await vocabularyApi.updateSet(123, {
  title: 'Updated Title',
  description: 'Updated description',
  icon: 'FaBookOpen',
  isPublic: true
});

// Delete a vocabulary set
await vocabularyApi.deleteSet(123);
```

### Vocabulary Items API

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

// List vocabulary items with filters
const items = await vocabularyApi.listItems({
  creatorId: 'user-id',
  collectionId: 123,
  type: 'WORD',
  pos: 'KATA_KERJA',
  isLearned: true,  // Filter by learned status (requires auth)
  search: '안녕',
  limit: 50
});

// Get a specific vocabulary item
const item = await vocabularyApi.getItem(123);

// Create a new vocabulary item
const newItem = await vocabularyApi.addItem(123, {
  korean: '안녕하세요',
  indonesian: 'Halo',
  type: 'WORD',
  pos: 'KATA_SIFAT',
  audioUrl: 'https://example.com/audio.mp3',
  exampleSentences: ['안녕하세요!', '안녕!']
});

// Update a vocabulary item
const updated = await vocabularyApi.updateItem(123, {
  korean: '안녕하세요',
  indonesian: 'Halo',
  audioUrl: 'https://example.com/new-audio.mp3'
});

// Delete a vocabulary item
await vocabularyApi.deleteItem(123);
```

### Vocabulary Progress API

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

// Set learned status (generic method)
const progress = await vocabularyApi.setLearnedStatus(123, true);  // Mark as learned
const progress = await vocabularyApi.setLearnedStatus(123, false); // Mark as not learned

// Mark as learned (convenience method)
const progress = await vocabularyApi.markLearned(123);

// Mark as not learned (convenience method)
const progress = await vocabularyApi.markUnlearned(123);
```

## Type Definitions

### VocabularySet

```typescript
interface VocabularySet {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  isDraft: boolean;
  userId?: string;
  kelasId?: number;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;      // Total number of items in the set
  learnedCount?: number;   // Number of items learned by current user
  
  // Optional: included when fetching single set with relations
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  kelas?: {
    id: number;
    title: string;
    type: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    thumbnail?: string;
    isDraft?: boolean;
    author?: {
      id: string;
      name: string;
      image?: string;
    };
  };
}
```

### VocabularyItem

```typescript
interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  type: 'WORD' | 'SENTENCE' | 'IDIOM';
  pos?: 'KATA_KERJA' | 'KATA_BENDA' | 'KATA_SIFAT' | 'KATA_KETERANGAN';
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  creatorId: string;
  collectionId?: number;
  createdAt: string;
  updatedAt: string;
  
  // Optional: included when fetching single item with relations
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  collection?: {
    id: number;
    title: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
  };
}
```

### VocabularyItemProgress

```typescript
interface VocabularyItemProgress {
  id: number;
  itemId: number;
  userId: string;
  isLearned: boolean;
  learnedAt?: string | null;  // ISO timestamp when item was marked as learned
  createdAt: string;
  updatedAt: string;
  item?: VocabularyItem;  // Optional: included when fetching with relations
}
```

## Authentication

Most vocabulary endpoints work without authentication for read operations. However:

- **`/api/vocabulary-items/{id}/learned`** endpoint **requires authentication**
- The `isLearned` filter in `listItems()` only works when user is authenticated
- `learnedCount` in vocabulary sets is calculated based on current user's progress

## Common Use Cases

### 1. Displaying Vocabulary Sets with Progress

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

const sets = await vocabularyApi.listSets();

// Display each set with progress
sets.data?.forEach(set => {
  console.log(`${set.title}: ${set.learnedCount}/${set.itemCount} learned`);
});
```

### 2. Creating a Vocabulary Quiz

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

// Get unlearned items for practice
const items = await vocabularyApi.listItems({
  collectionId: 123,
  isLearned: false  // Only get items not yet learned
});

// Display quiz to user
// After quiz, mark items as learned
items.data?.forEach(item => {
  await vocabularyApi.markLearned(item.id);
});
```

### 3. Toggling Learned Status

```typescript
import { vocabularyApi } from '@hakgyo-expo-sdk';

// Set learned status based on user action
const isCorrect = true;
await vocabularyApi.setLearnedStatus(itemId, isCorrect);
```

## Error Handling

All SDK methods return an `ApiResponse` object:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Example:

```typescript
const response = await vocabularyApi.markLearned(123);

if (response.success) {
  console.log('Marked as learned:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## Migration Notes

If you were using the old `isLearned` field on `VocabularyItem`:

1. **The old global `isLearned` field no longer exists**
2. **Use the new `/learned` endpoint** for marking/unmarking items
3. **Learned status is now user-specific** - each user has their own progress
4. **Update any components** that reference `item.isLearned` to fetch progress separately

## Related Documentation

- [SDK Overview](./sdk-overview.md) - General SDK information
- [API Routes](./api-routes.md) - Backend API documentation
