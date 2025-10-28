# PJKR Class Progress API Documentation

## Overview

The PJKR Class Progress API provides comprehensive progress tracking for users enrolled in classes. This API handles the sequential learning progression, material accessibility, and overall completion tracking.

## Core Concepts

### Sequential Learning Progression

The system enforces a **sequential learning path** where users must complete materials in order:

1. **First Material**: Always accessible to enrolled users
2. **Subsequent Materials**: Unlocked only after completing previous material
3. **Assessment Requirements**: If previous material has assessment, user must pass it to unlock next material

### Progress Calculation

The API calculates progress based on two completion states:

- **Content Completion**: User has marked material as complete
- **Assessment Completion**: User has passed the material's assessment (if required)

## API Endpoint

### Get Class Progress
**GET** `/api/kelas/[id]/progress`

Returns completion status for all materials in a class and determines accessibility.

**Parameters:**
- `id` (path): Class ID

**Headers:**
- `Authorization`: User authentication token

**Response:**
```json
{
  "success": true,
  "data": {
    "materis": [
      {
        "id": 1,
        "title": "Introduction to Korean",
        "order": 1,
        "isAccessible": true,
        "isCompleted": true,
        "isFullyCompleted": true,
        "hasAssessment": true,
        "assessmentPassed": true,
        "score": 85,
        "canRetake": true
      },
      {
        "id": 2,
        "title": "Basic Greetings",
        "order": 2,
        "isAccessible": true,
        "isCompleted": false,
        "isFullyCompleted": false,
        "hasAssessment": true,
        "assessmentPassed": false,
        "score": null,
        "canRetake": true
      },
      {
        "id": 3,
        "title": "Korean Numbers",
        "order": 3,
        "isAccessible": false,
        "isCompleted": false,
        "isFullyCompleted": false,
        "hasAssessment": false,
        "assessmentPassed": false,
        "score": null,
        "canRetake": false
      }
    ],
    "overallProgress": {
      "completedCount": 1,
      "totalCount": 5,
      "completionPercentage": 20
    }
  }
}
```

## Material Status Fields

### Response Field Explanations

- **id**: Material identifier
- **title**: Material title
- **order**: Sequential order within the class
- **isAccessible**: Whether user can currently access this material
- **isCompleted**: Whether user has marked content as complete
- **isFullyCompleted**: Whether both content and assessment are complete
- **hasAssessment**: Whether material has a required assessment
- **assessmentPassed**: Whether user has passed the assessment (if applicable)
- **score**: User's latest assessment score (null if not attempted)
- **canRetake**: Whether user can retake the assessment

## Access Control Logic

### Material Accessibility Algorithm

```typescript
function isMaterialAccessible(materialIndex: number, materials: Material[]): boolean {
  // First material is always accessible
  if (materialIndex === 0) {
    return true;
  }

  // Check if previous material is completed
  const previousMaterial = materials[materialIndex - 1];
  const previousCompletion = previousMaterial.completions[0];

  if (!previousCompletion?.isCompleted) {
    return false;
  }

  // If previous material has assessment, check if user passed it
  if (previousMaterial.passingScore && !previousCompletion.assessmentPassed) {
    return false;
  }

  return true;
}
```

### Full Completion Determination

```typescript
function isFullyCompleted(material: Material, completion: Completion): boolean {
  if (!completion?.isCompleted) {
    return false;
  }

  // If material has assessment, both content and assessment must be completed
  if (material.passingScore) {
    return completion.assessmentPassed || false;
  }

  // No assessment required - content completion is enough
  return true;
}
```

## Progress Calculation

The API calculates overall progress based on fully completed materials:

```typescript
const completedCount = materis.filter(m => m.isFullyCompleted).length;
const totalCount = materis.length;
const completionPercentage = Math.round((completedCount / totalCount) * 100);
```

## Error Handling

### Common Error Responses

**Unauthorized (401)**
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

**Not a Member (403)**
```json
{
  "error": "Not a member of this kelas",
  "status": 403
}
```

**Invalid Class ID (400)**
```json
{
  "error": "Invalid kelas ID",
  "status": 400
}
```

**Class Not Found (404)**
```json
{
  "error": "Class not found",
  "status": 404
}
```

## Implementation Details

### Database Query

The API performs a comprehensive database query to fetch all materials with user progress:

```typescript
const materis = await prisma.materi.findMany({
  where: {
    kelasId: kelasId,
    isDraft: false
  },
  include: {
    completions: {
      where: {
        userId: session.user.id
      }
    },
    assessments: {
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    }
  },
  orderBy: {
    order: 'asc'
  }
});
```

### Sequential Processing

The API processes materials in order to determine accessibility:

1. First material is always accessible
2. For each subsequent material, check if previous material is completed
3. If previous material has assessment, verify user passed it
4. Set accessibility status accordingly

## Integration with Material APIs

The Class Progress API works in conjunction with Material APIs:

1. **Material Detail API** (`/api/materi/[id]`): Provides individual material information
2. **Material Assessment API** (`/api/materi/[id]/assessment`): Handles assessment taking
3. **Class Progress API** (`/api/kelas/[id]/progress`): Provides overall class progress

## Use Cases

### Student Dashboard
Display overall class progress and accessible materials:

```typescript
// Fetch progress
const response = await fetch(`/api/kelas/${kelasId}/progress`);
const { materis, overallProgress } = response.data;

// Show progress bar
<ProgressBar value={overallProgress.completionPercentage} />

// Show material list
{materis.map(materi => (
  <MaterialCard 
    key={materi.id}
    materi={materi}
    accessible={materi.isAccessible}
  />
))}
```

### Learning Path Navigation
Implement sequential material navigation:

```typescript
// Get next accessible material
const nextMaterial = materis.find(m => m.isAccessible && !m.isCompleted);

// Navigate to next material
if (nextMaterial) {
  router.push(`/materi/${nextMaterial.id}`);
}
```

### Progress Tracking
Monitor user learning progress:

```typescript
// Track completion events
const trackCompletion = (materiId: number, isCompleted: boolean) => {
  // Update local state
  setMateris(prev => prev.map(m => 
    m.id === materiId ? { ...m, isCompleted } : m
  ));
  
  // Send analytics event
  analytics.track('material_completed', { materiId });
};
```

## Performance Considerations

### Database Optimization

- Materials are fetched with indexed queries on `kelasId` and `order`
- User progress is included in single query to avoid N+1 problems
- Draft materials are filtered out at database level

### Caching Strategy

- Progress data changes frequently, so minimal caching is recommended
- Material metadata can be cached longer than progress data
- Consider implementing real-time updates for live progress tracking

## Security Considerations

### Access Control

- Users can only access progress for classes they're enrolled in
- Material accessibility is enforced server-side
- Assessment results are validated before updating progress

### Data Privacy

- Progress data is isolated per user
- No cross-user data leakage
- Sensitive assessment data is properly secured

## Testing

### Test Scenarios

1. **Sequential Access**: Verify materials unlock in correct order
2. **Assessment Impact**: Test how passing/failing assessments affects accessibility
3. **Progress Calculation**: Ensure completion percentages are accurate
4. **Edge Cases**: Test with empty classes, single material classes, etc.
5. **Permission Tests**: Verify users can't access other users' progress

### Sample Test Data

```typescript
// Test class with 3 materials
const testClass = {
  id: 1,
  materis: [
    { id: 1, order: 1, passingScore: 80 },
    { id: 2, order: 2, passingScore: null },
    { id: 3, order: 3, passingScore: 70 }
  ]
};

// Test user progress
const testProgress = {
  completions: [
    { materiId: 1, isCompleted: true, assessmentPassed: true },
    { materiId: 2, isCompleted: false, assessmentPassed: false }
  ]
};
```

## Future Enhancements

1. **Real-time Progress**: WebSocket updates for live progress tracking
2. **Progress Analytics**: Detailed learning analytics and insights
3. **Adaptive Learning**: AI-powered material recommendations based on progress
4. **Progress Export**: Allow users to export their learning progress
5. **Social Features**: Progress sharing and leaderboards

This documentation provides a comprehensive overview of the PJKR Class Progress API. For implementation details, refer to the source code in the API route file.