# API Documentation

This document outlines the available API endpoints for the Korean learning platform, covering Kelas (Classes), Materi (Materials), and Vocabulary management.

## Base URL
All API endpoints are prefixed with `/api/`

## Next.js 15 Compatibility
This API is fully compatible with Next.js 15 and uses the latest async dynamic API patterns. All dynamic route handlers properly handle asynchronous `params` objects as required by Next.js 15.

## Response Format
All responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "meta": {
    "total": number,
    "offset": number,
    "limit": number
  },
  "error": string,
  "message": string
}
```

## Authentication
Currently, the API endpoints require user authentication. Make sure to include proper authentication headers when making requests.

---

## Kelas (Classes) API

### GET /api/kelas
Get all classes with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by class type (`REGULAR`, `EVENT`, `GROUP`, `PRIVATE`, `FUN`)
- `level` (optional): Filter by difficulty level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
- `authorId` (optional): Filter by author/creator ID
- `limit` (optional): Limit number of results
- `offset` (optional): Offset for pagination (default: 0)

**Response:** Array of class objects with author info, materials count, and member count.

### POST /api/kelas
Create a new class.

**Required Fields:**
- `title`: Class title
- `level`: Difficulty level
- `authorId`: Creator's user ID

**Optional Fields:**
- `description`: Class description
- `jsonDescription`: Rich text description as JSON
- `htmlDescription`: HTML formatted description
- `type`: Class type (default: `REGULAR`)
- `thumbnail`: Thumbnail image URL
- `icon`: Icon identifier
- `isPaidClass`: Boolean (default: false)
- `price`: Price for paid classes
- `discount`: Discount amount
- `promoCode`: Promotional code

### GET /api/kelas/[id]
Get a specific class by ID.

**Response:** Detailed class object including materials, members, vocabulary sets, and statistics.

### PUT /api/kelas/[id]
Update a specific class.

**Fields:** Same as POST, all optional for partial updates.

### DELETE /api/kelas/[id]
Delete a specific class.

---

## Materi (Materials) API

### GET /api/materi
Get all materials with optional filtering.

**Query Parameters:**
- `kelasId` (optional): Filter by class ID
- `isDemo` (optional): Filter demo materials (`true`/`false`)
- `limit` (optional): Limit number of results
- `offset` (optional): Offset for pagination (default: 0)

**Response:** Array of material objects with class info and completion count.

### POST /api/materi
Create a new material.

**Required Fields:**
- `title`: Material title
- `description`: Material description
- `jsonDescription`: Rich text content as JSON
- `htmlDescription`: HTML formatted content
- `kelasId`: ID of the class this material belongs to

**Optional Fields:**
- `order`: Order position (auto-generated if not provided)
- `isDemo`: Whether this is a demo material (default: false)

### GET /api/materi/[id]
Get a specific material by ID.

**Response:** Detailed material object including class info and user completions.

### PUT /api/materi/[id]
Update a specific material.

**Fields:** Same as POST, all optional for partial updates.

### DELETE /api/materi/[id]
Delete a specific material.

---

## Vocabulary Sets API

### GET /api/vocabulary-sets
Get all vocabulary sets with optional filtering.

**Query Parameters:**
- `userId` (optional): Filter by creator user ID
- `kelasId` (optional): Filter by class ID
- `isPublic` (optional): Filter public sets (`true`/`false`)
- `limit` (optional): Limit number of results
- `offset` (optional): Offset for pagination (default: 0)

**Response:** Array of vocabulary set objects with user info, class info, and item count.

### POST /api/vocabulary-sets
Create a new vocabulary set.

**Required Fields:**
- `title`: Set title
- `userId`: Creator's user ID

**Optional Fields:**
- `description`: Set description
- `icon`: Icon identifier (default: `FaBook`)
- `isPublic`: Whether the set is public (default: false)
- `kelasId`: Associated class ID

### GET /api/vocabulary-sets/[id]
Get a specific vocabulary set by ID.

**Response:** Detailed vocabulary set object including all vocabulary items, user info, and class info.

### PUT /api/vocabulary-sets/[id]
Update a specific vocabulary set.

**Fields:** Same as POST (except userId), all optional for partial updates.

### DELETE /api/vocabulary-sets/[id]
Delete a specific vocabulary set.

---

## Vocabulary Items API

### GET /api/vocabulary-items
Get all vocabulary items with optional filtering.

**Query Parameters:**
- `creatorId` (optional): Filter by creator user ID
- `collectionId` (optional): Filter by vocabulary set ID
- `type` (optional): Filter by type (`WORD`, `SENTENCE`, `IDIOM`)
- `pos` (optional): Filter by part of speech (`KATA_KERJA`, `KATA_BENDA`, `KATA_SIFAT`, `KATA_KETERANGAN`)
- `isLearned` (optional): Filter learned items (`true`/`false`)
- `search` (optional): Search in Korean or Indonesian text
- `limit` (optional): Limit number of results
- `offset` (optional): Offset for pagination (default: 0)

**Response:** Array of vocabulary item objects with creator info and collection info.

### POST /api/vocabulary-items
Create a new vocabulary item.

**Required Fields:**
- `korean`: Korean text
- `indonesian`: Indonesian translation
- `creatorId`: Creator's user ID

**Optional Fields:**
- `isLearned`: Whether the item is learned (default: false)
- `type`: Vocabulary type (default: `WORD`)
- `pos`: Part of speech
- `audioUrl`: Audio pronunciation URL
- `exampleSentences`: Array of example sentences
- `collectionId`: Associated vocabulary set ID

### GET /api/vocabulary-items/[id]
Get a specific vocabulary item by ID.

**Response:** Detailed vocabulary item object including creator info and collection info.

### PUT /api/vocabulary-items/[id]
Update a specific vocabulary item.

**Fields:** Same as POST (except creatorId), all optional for partial updates.

### DELETE /api/vocabulary-items/[id]
Delete a specific vocabulary item.

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `404`: Resource not found
- `500`: Internal server error

Error responses include a descriptive error message in the `error` field.

## Example Usage

### Create a new class
```javascript
const response = await fetch('/api/kelas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Korean Basics',
    description: 'Learn Korean fundamentals',
    level: 'BEGINNER',
    type: 'REGULAR',
    authorId: 'user123'
  })
});

const result = await response.json();
```

### Get vocabulary items for a specific collection
```javascript
const response = await fetch('/api/vocabulary-items?collectionId=1&limit=20');
const result = await response.json();
```

### Search vocabulary items
```javascript
const response = await fetch('/api/vocabulary-items?search=안녕&type=WORD');
const result = await response.json();
