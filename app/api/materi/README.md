# PJKR Material Completion API Documentation

## Overview

The PJKR (Platform Jaringan Komunitas Riset) Material Completion System implements a sophisticated sequential learning approach with comprehensive progress tracking and gamification. This API documentation covers material completion functionality, including locking/unlocking mechanisms, assessment handling, and progress tracking.

## Core Concepts

### Two-Tier Completion System

The system implements a **two-tier completion model** for materials:

1. **Content Completion** (`isCompleted`): User manually marks content as complete
2. **Assessment Completion** (`assessmentPassed`): Automatically set when user passes assessment

### Sequential Access Control

Materials are unlocked sequentially based on completion of previous materials:

- **First Material**: Always unlocked for enrolled users
- **Subsequent Materials**: Unlocked only after completing previous material
- **Assessment Requirement**: If previous material has assessment, user must pass it to unlock next material

## Database Schema

### UserMateriCompletion
```sql
- id: Int (Primary Key)
- userId: String (Foreign Key to User)
- materiId: Int (Foreign Key to Materi)
- isCompleted: Boolean (Content completion status)
- assessmentPassed: Boolean (Assessment completion status)
- createdAt: DateTime
- updatedAt: DateTime
```

### UserMateriAssessment
```sql
- id: Int (Primary Key)
- userId: String (Foreign Key to User)
- materiId: Int (Foreign Key to Materi)
- score: Int (0-100 score)
- isPassed: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Materi
```sql
- id: Int (Primary Key)
- title: String
- description: String
- order: Int (Sequential order within class)
- koleksiSoalId: Int? (Optional assessment reference)
- passingScore: Int? (Required score 0-100, null = no assessment)
- kelasId: Int (Foreign Key to Kelas)
```

## API Endpoints

### 1. Get Material Details
**GET** `/api/materi/[id]`

Returns material details with completion information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Korean Alphabet",
    "description": "Learn the basics of Korean writing",
    "order": 1,
    "isDemo": false,
    "koleksiSoalId": 1,
    "passingScore": 80,
    "completions": [
      {
        "id": 1,
        "userId": "user123",
        "isCompleted": true,
        "assessmentPassed": true,
        "createdAt": "2025-01-01T09:00:00Z"
      }
    ],
    "assessments": [
      {
        "id": 1,
        "score": 85,
        "isPassed": true,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ]
  }
}
```

### 2. Get Material Assessment
**GET** `/api/materi/[id]/assessment`

Retrieves assessment questions and user's previous attempts.

**Response:**
```json
{
  "id": 1,
  "title": "Korean Alphabet Quiz",
  "koleksiSoalId": 1,
  "passingScore": 80,
  "questions": [
    {
      "id": 1,
      "pertanyaan": "What is the first letter of Korean alphabet?",
      "opsi": [
        { "id": 1, "opsiText": "ㄱ" },
        { "id": 2, "opsiText": "ㄴ" }
      ]
    }
  ],
  "userAssessment": {
    "id": 1,
    "score": 85,
    "isPassed": true,
    "createdAt": "2025-01-01T10:00:00Z"
  },
  "canRetake": true
}
```

### 3. Submit Assessment
**POST** `/api/materi/[id]/assessment`

Submits assessment answers and updates completion status.

**Request:**
```json
{
  "answers": [
    {
      "soalId": 1,
      "selectedOptionId": 1
    }
  ]
}
```

**Response:**
```json
{
  "score": 85,
  "isPassed": true,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "passingScore": 80,
  "nextMateriUnlocked": 2,
  "assessment": {
    "id": 1,
    "score": 85,
    "isPassed": true,
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

### 4. Configure Assessment
**PUT** `/api/materi/[id]/assessment-config`

Configures assessment settings for a material (GURU/ADMIN only).

**Request:**
```json
{
  "koleksiSoalId": 1,
  "passingScore": 80
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "koleksiSoalId": 1,
    "passingScore": 80,
    "title": "Korean Alphabet",
    "description": "Learn the basics"
  }
}
```

## Material Locking/Unlocking Logic

### Access Control Algorithm

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

### Completion Status Determination

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

## Integration with Class Progress API

The material completion system integrates with the class progress API (`/api/kelas/[id]/progress`) to provide a complete view of user progress through a class.

**Progress API Response:**
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

## Gamification Integration

### XP Reward Events

- **COMPLETE_MATERI**: Awarded when user completes material content
- **COMPLETE_ASSESSMENT**: Awarded when user passes assessment
- **PERFECT_SCORE**: Bonus XP for achieving 100% on assessment

### Streak System

- Tracks daily activity streaks
- Provides XP multipliers:
  - 3+ consecutive days: 25% XP bonus
  - 7+ consecutive days: 50% XP bonus

### Level Progression

- XP accumulates to determine user level
- Level thresholds increase exponentially
- Progress tracking toward next level

## User Permissions and Restrictions

### What Users CAN Do

1. **Access Materials**:
   - View first material in enrolled classes
   - Access subsequent materials after completing prerequisites

2. **Complete Content**:
   - Mark materials as complete (UI exists, implementation pending)
   - Progress through materials sequentially

3. **Take Assessments**:
   - Attempt assessments unlimited times
   - Receive immediate feedback and scores
   - Retake failed assessments

4. **Track Progress**:
   - View completion status for all materials
   - See overall class progress percentage
   - Access assessment history and scores

5. **Earn Rewards**:
   - Gain XP for completing materials and assessments
   - Build streaks for consistent activity
   - Level up based on accumulated XP

### What Users CANNOT Do

1. **Skip Sequential Order**:
   - Cannot access materials out of sequence
   - Must complete previous material (and pass assessment if required)

2. **Modify Completion Status**:
   - Cannot manually mark assessments as passed
   - Cannot retroactively change completion status

3. **Access Without Enrollment**:
   - Cannot access materials without being enrolled in class
   - Demo content is the only exception

4. **Bypass Assessment Requirements**:
   - Cannot skip assessments if material has `passingScore` configured
   - Must achieve minimum score to proceed

## Error Handling

### Common Error Responses

```json
{
  "error": "Unauthorized",
  "status": 401
}
```

```json
{
  "error": "Materi not found",
  "status": 404
}
```

```json
{
  "error": "No assessment for this materi",
  "status": 404
}
```

```json
{
  "error": "Invalid answers format",
  "status": 400
}
```

## Implementation Notes

### Sequential Processing

The progress API processes materials in order and determines accessibility based on previous material completion status. This ensures users cannot skip ahead in their learning journey.

### Assessment Validation

Assessment submissions are validated server-side to prevent cheating. The system calculates scores based on correct answers and compares against the passing threshold.

### Real-time Updates

Completion status is updated in real-time when users submit assessments or mark materials complete. The progress API reflects current status immediately.

### Data Consistency

The system uses database transactions to ensure data consistency when updating completion status and unlocking subsequent materials.

## Future Enhancements

1. **Manual Content Completion API**: Currently placeholder, needs implementation
2. **Partial Progress Tracking**: Add support for intermediate progress states
3. **Time-based Restrictions**: Add deadlines and time limits
4. **Advanced Assessment Types**: Support for essay questions, file uploads, etc.
5. **Progress Analytics**: Detailed learning analytics and insights

## Testing

### Test Scenarios

1. **Sequential Access**: Verify materials unlock in correct order
2. **Assessment Flow**: Test passing/failing assessments and their impact on unlocking
3. **Progress Calculation**: Ensure completion percentages are accurate
4. **Gamification**: Verify XP rewards and streak calculations
5. **Error Handling**: Test various error conditions and edge cases

This documentation provides a comprehensive overview of the PJKR Material Completion System. For implementation details, refer to the source code in the respective API route files.