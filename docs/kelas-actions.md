# Kelas Server Actions Documentation

This document describes the server actions for managing Kelas (Class) entities in the application.

## Overview

The Kelas server actions provide a secure, type-safe API layer for managing classes with proper authentication, validation, and error handling. All actions are implemented as Next.js Server Actions with Zod validation and custom error handling.

## Error Handling

All actions throw one of three custom error types:

- `AuthError`: Authentication or authorization failures
- `ValidationError`: Input validation failures
- `NotFoundError`: Resource not found errors

## Actions

### 1. createDraftKelas(payload)

Creates a new draft class.

**Purpose**: Insert draft row, return id with isDraft=true; authorId=auth.uid

**Parameters**:
```typescript
{
  title: string;              // Required, 1-255 characters
  description?: string;       // Optional
  jsonDescription?: any;      // Optional, JSON content
  htmlDescription?: string;   // Optional, HTML content
  type?: KelasType;          // Optional, defaults to REGULAR
  level: Difficulty;         // Required: BEGINNER | INTERMEDIATE | ADVANCED
  thumbnail?: string;        // Optional, must be valid URL
  icon?: string;            // Optional
  isPaidClass?: boolean;    // Optional, defaults to false
  price?: number;           // Optional, must be >= 0
  discount?: number;        // Optional, must be >= 0
  promoCode?: string;       // Optional
}
```

**Returns**:
```typescript
{
  success: true;
  data: Kelas & {
    author: { id, name, email, image };
    _count: { materis, members, completions };
  };
}
```

**Example Usage**:
```typescript
const result = await createDraftKelas({
  title: "Korean Basics",
  description: "Learn basic Korean vocabulary and grammar",
  level: Difficulty.BEGINNER,
  type: KelasType.REGULAR,
  isPaidClass: false
});
```

### 2. updateKelasMeta(id, payload)

Updates class metadata (title, type, level, price, promo etc.).

**Purpose**: Patch title, type, level, price, promo etc. with Zod validation

**Parameters**:
- `id`: number - The class ID
- `payload`: Partial update object with optional fields

**Returns**: Updated class with related data

**Example Usage**:
```typescript
const result = await updateKelasMeta(1, {
  title: "Updated Korean Basics",
  price: 29.99,
  isPaidClass: true
});
```

### 3. addMateriQuick(id, materiList)

Bulk inserts Materi (draft) with automatic order assignment.

**Purpose**: Bulk insert Materi (draft) with order, providing optimistic response

**Parameters**:
- `id`: number - The class ID
- `materiList`: Array of materi objects

**Materi Schema**:
```typescript
{
  title: string;              // Required, 1-255 characters
  description: string;        // Required
  jsonDescription: any;       // Required, JSON content
  htmlDescription: string;    // Required, HTML content
  order?: number;            // Optional, auto-assigned if not provided
  isDemo?: boolean;          // Optional, defaults to false
}
```

**Returns**: Updated class with new materis

**Example Usage**:
```typescript
const result = await addMateriQuick(1, [
  {
    title: "Lesson 1: Greetings",
    description: "Learn basic Korean greetings",
    jsonDescription: { content: "lesson content" },
    htmlDescription: "<p>Lesson content</p>",
    isDemo: true
  },
  {
    title: "Lesson 2: Numbers",
    description: "Learn Korean numbers",
    jsonDescription: { content: "numbers lesson" },
    htmlDescription: "<p>Numbers lesson</p>",
    isDemo: false
  }
]);
```

### 4. addVocabularySetQuick(id, set)

Creates and links a vocabulary set to a class.

**Purpose**: Upsert VocabularySet + items, returns setId

**Parameters**:
- `id`: number - The class ID
- `set`: VocabularySet object with items

**VocabularySet Schema**:
```typescript
{
  title: string;              // Required, 1-255 characters
  description?: string;       // Optional
  icon?: string;             // Optional, defaults to "FaBook"
  isPublic?: boolean;        // Optional, defaults to false
  items: VocabularyItem[];   // Required, minimum 1 item
}
```

**VocabularyItem Schema**:
```typescript
{
  korean: string;                    // Required
  indonesian: string;                // Required
  type?: "WORD" | "SENTENCE" | "IDIOM"; // Optional, defaults to "WORD"
  pos?: "KATA_KERJA" | "KATA_BENDA" | "KATA_SIFAT" | "KATA_KETERANGAN"; // Optional
  audioUrl?: string;                 // Optional, must be valid URL
  exampleSentences?: string[];       // Optional, defaults to []
  order?: number;                    // Optional, auto-assigned if not provided
}
```

**Returns**: Created vocabulary set with setId

**Example Usage**:
```typescript
const result = await addVocabularySetQuick(1, {
  title: "Basic Greetings",
  description: "Common Korean greetings",
  isPublic: true,
  items: [
    {
      korean: "안녕하세요",
      indonesian: "Halo",
      type: "WORD",
      pos: "KATA_KERJA",
      exampleSentences: ["안녕하세요, 만나서 반가워요"]
    },
    {
      korean: "감사합니다",
      indonesian: "Terima kasih",
      type: "WORD"
    }
  ]
});
```

### 5. addSoalSetQuick(id, koleksiSoalId)

Links an existing KoleksiSoal to a class.

**Purpose**: Link existing or create new KoleksiSoal, ensures author owns set

**Parameters**:
- `id`: number - The class ID
- `koleksiSoalId`: number - The question collection ID

**Returns**: Success message with linked IDs

**Example Usage**:
```typescript
const result = await addSoalSetQuick(1, 5);
```

### 6. reorderMateri(id, newOrder)

Updates the order of materis in a class using drag-and-drop.

**Purpose**: Update order column for drag-n-drop using single transaction

**Parameters**:
- `id`: number - The class ID
- `newOrder`: Array of { id: number, order: number }

**Returns**: Updated materis in new order

**Example Usage**:
```typescript
const result = await reorderMateri(1, [
  { id: 3, order: 0 },
  { id: 1, order: 1 },
  { id: 2, order: 2 }
]);
```

### 7. publishKelas(id)

Publishes a draft class (flips isDraft to false).

**Purpose**: Flip isDraft → false, only if required fields satisfied

**Parameters**:
- `id`: number - The class ID

**Validation Requirements**:
- Title and description must be present
- At least one materi must exist
- User must be the author
- Class must be in draft state

**Returns**: Published class with full data

**Example Usage**:
```typescript
const result = await publishKelas(1);
```

### 8. deleteDraftKelas(id)

Hard deletes a draft class and cascades to children.

**Purpose**: Hard delete if still draft, cascade children

**Parameters**:
- `id`: number - The class ID

**Validation Requirements**:
- Class must be in draft state
- User must be the author

**Returns**: Success message

**Example Usage**:
```typescript
const result = await deleteDraftKelas(1);
```

## Authentication & Authorization

All actions require authentication and validate that:
1. User is authenticated
2. User has permission to perform the action
3. User owns the resources they're trying to modify

## Error Examples

```typescript
// Authentication Error
throw new AuthError("You can only update your own kelas");

// Validation Error  
throw new ValidationError("Title and description are required for publishing");

// Not Found Error
throw new NotFoundError("Kelas not found");
```

## Usage in Components

```typescript
import { createDraftKelas, publishKelas } from '@/app/actions/kelas';

// In a React component
const handleCreateClass = async (formData) => {
  try {
    const result = await createDraftKelas(formData);
    console.log('Class created:', result.data);
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation errors
      console.error('Validation failed:', error.message);
    } else if (error instanceof AuthError) {
      // Handle auth errors
      console.error('Authentication failed:', error.message);
    }
  }
};
```

## Type Safety

All actions use Zod schemas for runtime validation and TypeScript interfaces for compile-time type checking. The schemas ensure data integrity and provide helpful error messages for invalid inputs.
