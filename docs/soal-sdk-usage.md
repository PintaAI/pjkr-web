# Soal SDK Usage Guide

This guide explains how to use the **Soal API** from the Hakgyo Expo SDK in your Expo application.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Daily Soal](#daily-soal)
- [Collections (Koleksi Soal)](#collections-koleksi-soal)
- [Individual Questions (Soal)](#individual-questions-soal)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

---

## Installation

The SDK is available as a package in your monorepo:

```bash
bun add hakgyo-expo-sdk
```

---

## Setup

Import the `soalApi` from the SDK:

```typescript
import { soalApi } from 'hakgyo-expo-sdk';
```

---

## Daily Soal

Get random daily questions for practice. This endpoint returns personalized questions based on:
- Questions from user's joined classes
- Questions from user's own collections
- Questions created directly by the user

### Get Daily Questions

```typescript
import { soalApi } from 'hakgyo-expo-sdk';

const fetchDailyQuestions = async (userId: string, take: number = 5) => {
  try {
    const questions = await soalApi.getDaily(userId, take);
    console.log('Daily questions:', questions);
  } catch (error) {
    console.error('Error fetching daily questions:', error);
  }
};
```

**Parameters:**
- `userId` (required): The user's ID for personalized questions
- `take` (optional): Number of questions to return (default: 5, max: 10)

**Response:**
Returns an array of `Soal` objects with:
- `id`: Question ID
- `pertanyaan`: Question text
- `difficulty`: Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)
- `explanation`: Explanation for the correct answer
- `opsis`: Array of answer options with `opsiText`, `isCorrect`, and `order`
- `koleksiSoal`: Collection info with `nama` and `deskripsi`

---

## Collections (Koleksi Soal)

A **Koleksi Soal** (Question Collection) is a set/group of questions, like a quiz bank or practice set.

### List All Collections

```typescript
import { soalApi } from 'hakgyo-expo-sdk';

const fetchCollections = async () => {
  try {
    const response = await soalApi.listCollections({
      limit: 20,
      offset: 0,
    });

    if (response.success) {
      console.log('Collections:', response.data);
    }
  } catch (error) {
    console.error('Error fetching collections:', error);
  }
};
```

### List Collections from Joined Classes

```typescript
import { soalApi } from 'hakgyo-expo-sdk';

const fetchJoinedClassCollections = async () => {
  try {
    const response = await soalApi.listCollections({
      onlyJoinedClasses: true,  // Only return collections from user's enrolled classes
      limit: 20,
      offset: 0,
    });

    if (response.success) {
      console.log('Collections from joined classes:', response.data);
    }
  } catch (error) {
    console.error('Error fetching collections:', error);
  }
};
```

### Get Single Collection

```typescript
const fetchCollection = async (collectionId: number) => {
  try {
    const collection = await soalApi.getCollection(collectionId);

    if (collection.success) {
      console.log('Collection:', collection.data);
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
  }
};
```

### Create a New Collection

```typescript
const createCollection = async () => {
  try {
    const newCollection = await soalApi.createCollection({
      title: 'Math Practice Set',
      description: 'Basic algebra questions',
      difficulty: 'MEDIUM',
      tags: ['math', 'algebra'],
      // ... other fields based on KoleksiSoal type
    });

    if (newCollection.success) {
      console.log('Created:', newCollection.data);
    }
  } catch (error) {
    console.error('Error creating collection:', error);
  }
};
```

### Update a Collection

```typescript
const updateCollection = async (collectionId: number) => {
  try {
    const updated = await soalApi.updateCollection(collectionId, {
      title: 'Updated Title',
      description: 'Updated description',
    });

    if (updated.success) {
      console.log('Updated:', updated.data);
    }
  } catch (error) {
    console.error('Error updating collection:', error);
  }
};
```

### Delete a Collection

```typescript
const deleteCollection = async (collectionId: number) => {
  try {
    await soalApi.deleteCollection(collectionId);
    console.log('Collection deleted successfully');
  } catch (error) {
    console.error('Error deleting collection:', error);
  }
};
```

---

## Individual Questions (Soal)

A **Soal** is an individual question with options (opsis) and optional attachments.

### List Questions

```typescript
const fetchQuestions = async () => {
  try {
    const response = await soalApi.listQuestions({
      koleksiSoalId: '5',  // Filter by collection
      authorId: 'user123', // Filter by author
      limit: 10,
      offset: 0,
    });

    if (response.success) {
      console.log('Questions:', response.data);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
};
```

### Get Single Question

```typescript
const fetchQuestion = async (questionId: number) => {
  try {
    const question = await soalApi.getQuestion(questionId);

    if (question.success) {
      console.log('Question:', question.data);
    }
  } catch (error) {
    console.error('Error fetching question:', error);
  }
};
```

### Create a Question

```typescript
const createQuestion = async (collectionId: number) => {
  try {
    const newQuestion = await soalApi.createQuestion({
      koleksiSoalId: collectionId,
      pertanyaan: 'What is 2 + 2?',
      difficulty: 'EASY',
      explanation: '2 plus 2 equals 4',
      isActive: true,
      order: 1,
      opsis: [
        { opsiText: '3', isCorrect: false, order: 0 },
        { opsiText: '4', isCorrect: true, order: 1 },
        { opsiText: '5', isCorrect: false, order: 2 },
        { opsiText: '6', isCorrect: false, order: 3 },
      ],
      attachments: [], // Optional
    });

    if (newQuestion.success) {
      console.log('Created:', newQuestion.data);
    }
  } catch (error) {
    console.error('Error creating question:', error);
  }
};
```

### Update a Question

```typescript
const updateQuestion = async (questionId: number) => {
  try {
    const updated = await soalApi.updateQuestion(questionId, {
      pertanyaan: 'Updated question text',
      difficulty: 'HARD',
    });

    if (updated.success) {
      console.log('Updated:', updated.data);
    }
  } catch (error) {
    console.error('Error updating question:', error);
  }
};
```

### Delete a Question

```typescript
const deleteQuestion = async (questionId: number) => {
  try {
    await soalApi.deleteQuestion(questionId);
    console.log('Question deleted successfully');
  } catch (error) {
    console.error('Error deleting question:', error);
  }
};
```

### Toggle Question Active Status

```typescript
const toggleQuestion = async (questionId: number) => {
  try {
    const result = await soalApi.toggleQuestionActive(questionId);

    if (result.success) {
      console.log('Toggled:', result.data);
    }
  } catch (error) {
    console.error('Error toggling question:', error);
  }
};
```

---

## Type Definitions

### KoleksiSoal (Collection)

```typescript
interface KoleksiSoal {
  id: number;
  title: string;
  description?: string;
  difficulty?: string;
  tags?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // ... other fields
}
```

### Soal (Question)

```typescript
interface Soal {
  id: number;
  koleksiSoalId: number;
  authorId: string;
  pertanyaan: string;        // Question text
  difficulty?: string;
  explanation?: string;
  isActive: boolean;
  order: number;
  opsis: Opsi[];             // Question options
  attachments: Attachment[];  // Optional attachments
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Opsi {
  id: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
}

interface Attachment {
  id: number;
  url: string;
  type: string;
  filename: string;
  size: number;
  mimeType: string;
  order: number;
}
```

---

## Error Handling

All API methods return a response object. Always check the `success` property:

```typescript
const response = await soalApi.getCollection(1);

if (response.success) {
  // Success - use response.data
  console.log(response.data);
} else {
  // Error - handle appropriately
  console.error(response.error);
}
```

For try-catch blocks, handle network errors:

```typescript
try {
  const response = await soalApi.listCollections();
  // Handle response...
} catch (error) {
  // Network error, timeout, etc.
  Alert.alert('Error', 'Failed to fetch collections');
}
```

---

## Query Parameters

For `listCollections()` and `listQuestions()`, you can pass optional query parameters with full TypeScript autocomplete support:

### KoleksiSoalQueryParams

```typescript
interface KoleksiSoalQueryParams {
  limit?: number;              // Maximum results to return
  offset?: number;             // Number of results to skip
  page?: number;               // Page number (alternative to offset)
  sortBy?: string;             // Field to sort by
  sortOrder?: 'asc' | 'desc';  // Sort direction
  search?: string;             // Search query
  userId?: string;             // Filter by specific user
  kelasId?: string;            // Filter by specific class ID
  onlyJoinedClasses?: boolean; // Only return collections from user's enrolled classes
  isPrivate?: string;          // Filter by privacy status ('true' or 'false')
  isDraft?: string;            // Filter by draft status ('true' or 'false')
}
```

### SoalQueryParams

```typescript
interface SoalQueryParams {
  limit?: number;              // Maximum results to return
  offset?: number;             // Number of results to skip
  page?: number;               // Page number (alternative to offset)
  sortBy?: string;             // Field to sort by
  sortOrder?: 'asc' | 'desc';  // Sort direction
  search?: string;             // Search query
  authorId?: string;           // Filter questions by author
  koleksiSoalId?: string;     // Filter questions by collection ID
}
```

### Collection Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Maximum results to return |
| `offset` | number | Number of results to skip (for pagination) |
| `userId` | string | Filter collections by a specific user |
| `kelasId` | string | Filter collections by a specific class ID |
| `onlyJoinedClasses` | boolean | Only return collections from user's enrolled classes (requires authentication) |
| `isPrivate` | string | Filter by privacy status (`'true'` or `'false'`) |
| `isDraft` | string | Filter by draft status (`'true'` or `'false'`) |

### Question Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Maximum results to return |
| `offset` | number | Number of results to skip (for pagination) |
| `authorId` | string | Filter questions by author |
| `koleksiSoalId` | string | Filter questions by collection ID |

---

## API Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;           // The actual data (if successful)
  error?: string;     // Error message (if failed)
  meta?: {            // Metadata (for paginated responses)
    total: number;
    offset: number;
    limit: number;
  };
}
```
