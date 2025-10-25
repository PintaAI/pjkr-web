# Materi Assessment Schema Design

## Overview

This document outlines a simplified schema enhancement to add optional assessments to materi with passing requirements and sequential unlock functionality.

## Schema Changes

### 1. Enhanced Materi Model

```prisma
model Materi {
  id              Int                    @id @default(autoincrement())
  title           String
  description     String
  jsonDescription Json                   @db.JsonB
  htmlDescription String
  order           Int
  isDemo          Boolean                @default(false)
  isDraft         Boolean                @default(true)
  // NEW: Simple assessment fields
  koleksiSoalId   Int?                   // Optional assessment
  passingScore    Int?                   // Required score (0-100), null = no assessment
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt
  kelasId         Int
  kelas           Kelas                  @relation("KelasMateri", fields: [kelasId], references: [id], onDelete: Cascade)
  completions     UserMateriCompletion[]
  // NEW: Optional relation to assessment
  koleksiSoal     KoleksiSoal?           @relation("MateriAssessments", fields: [koleksiSoalId], references: [id], onDelete: SetNull)

  @@index([kelasId])
  @@index([order])
  @@index([isDemo])
  @@index([isDraft])
  @@index([koleksiSoalId])
}
```

### 2. New UserMateriAssessment Model

```prisma
model UserMateriAssessment {
  id          Int      @id @default(autoincrement())
  userId      String
  materiId    Int
  score       Int      // 0-100
  isPassed    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation("UserMateriAssessments", fields: [userId], references: [id], onDelete: Cascade)
  materi      Materi   @relation("UserMateriAssessments", fields: [materiId], references: [id], onDelete: Cascade)

  @@unique([userId, materiId])
  @@index([userId])
  @@index([materiId])
  @@index([isPassed])
}
```

### 3. Enhanced UserMateriCompletion Model

```prisma
model UserMateriCompletion {
  id          Int      @id @default(autoincrement())
  userId      String
  materiId    Int
  isCompleted Boolean  @default(false)
  // NEW: Track assessment completion
  assessmentPassed Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  materi      Materi   @relation(fields: [materiId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, materiId])
  @@index([userId])
  @@index([materiId])
  @@index([assessmentPassed])
}
```

### 4. Updated User Model

```prisma
model User {
  // ... existing fields ...
  
  // NEW: Simple assessment tracking
  materiAssessments UserMateriAssessment[]
  
  // ... existing relations ...
}
```

### 5. Updated KoleksiSoal Model

```prisma
model KoleksiSoal {
  // ... existing fields ...
  
  // NEW: Materis that use this as assessment
  materis Materi[] @relation("MateriAssessments")
  
  // ... existing relations ...
}
```

## Migration Strategy

### Step 1: Add New Fields to Materi Table

```sql
-- Add optional assessment fields to materi
ALTER TABLE materi 
ADD COLUMN koleksi_soal_id INTEGER REFERENCES koleksi_soal(id) ON DELETE SET NULL,
ADD COLUMN passing_score INTEGER CHECK (passing_score >= 0 AND passing_score <= 100);

-- Create index for performance
CREATE INDEX idx_materi_koleksi_soal_id ON materi(koleksi_soal_id);
```

### Step 2: Create UserMateriAssessment Table

```sql
CREATE TABLE user_materi_assessment (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    materi_id INTEGER NOT NULL REFERENCES materi(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    is_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, materi_id)
);

-- Create indexes
CREATE INDEX idx_user_materi_assessment_user_id ON user_materi_assessment(user_id);
CREATE INDEX idx_user_materi_assessment_materi_id ON user_materi_assessment(materi_id);
CREATE INDEX idx_user_materi_assessment_is_passed ON user_materi_assessment(is_passed);
```

### Step 3: Add Assessment Field to UserMateriCompletion

```sql
-- Add assessment tracking to existing completion table
ALTER TABLE user_materi_completion 
ADD COLUMN assessment_passed BOOLEAN DEFAULT FALSE;

-- Create index
CREATE INDEX idx_user_materi_completion_assessment_passed ON user_materi_completion(assessment_passed);
```

## Business Logic

### Materi Access Rules

1. **First materi**: Always accessible when user joins kelas
2. **Subsequent materis**: Accessible when previous materi is completed
3. **Assessment materis**: Require both content completion AND assessment pass

### Completion Logic

```typescript
function isMateriFullyCompleted(user: User, materi: Materi): boolean {
  const completion = getUserCompletion(user.id, materi.id);
  
  // No assessment required
  if (!materi.passingScore) {
    return completion.isCompleted;
  }
  
  // Assessment required - need both content AND assessment
  return completion.isCompleted && completion.assessmentPassed;
}
```

### Access Control Logic

```typescript
function canAccessMateri(user: User, materi: Materi, previousMateri?: Materi): boolean {
  // First materi is always accessible
  if (!previousMateri) return true;
  
  // Check if previous materi is completed
  const previousCompletion = getUserCompletion(user.id, previousMateri.id);
  if (!previousCompletion.isCompleted) return false;
  
  // If previous materi has assessment, check if passed
  if (previousMateri.passingScore && !previousCompletion.assessmentPassed) {
    return false;
  }
  
  return true;
}
```

## API Endpoints

### Enhanced Materi Endpoints

#### Get Materi with Assessment Info
```typescript
// GET /api/materi/[id]
interface MateriResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  // NEW: Assessment info
  assessment?: {
    koleksiSoalId: number;
    passingScore: number;
    userScore?: number;
    isPassed?: boolean;
    canRetake: boolean;
  };
  // NEW: Access info
  isAccessible: boolean;
  isCompleted: boolean;
  nextMateriLocked: boolean;
}
```

#### Update Materi with Assessment
```typescript
// PUT /api/materi/[id]
interface UpdateMateriRequest {
  title?: string;
  description?: string;
  content?: string;
  // NEW: Optional assessment
  koleksiSoalId?: number | null;
  passingScore?: number | null;
}
```

### Assessment Endpoints

#### Take Assessment
```typescript
// POST /api/materi/[id]/assessment
interface TakeAssessmentRequest {
  answers: {
    soalId: number;
    selectedOptionId: number;
  }[];
}

interface TakeAssessmentResponse {
  score: number;
  isPassed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  nextMateriUnlocked: boolean;
}
```

#### Get Assessment Questions
```typescript
// GET /api/materi/[id]/assessment/questions
interface AssessmentQuestionsResponse {
  questions: {
    id: number;
    pertanyaan: string;
    opsi: {
      id: number;
      opsiText: string;
    }[];
  }[];
  timeLimit?: number;
  passingScore: number;
}
```

### Progress Endpoints

#### Get Materi Progress in Kelas
```typescript
// GET /api/kelas/[id]/progress
interface KelasProgressResponse {
  materis: {
    id: number;
    title: string;
    order: number;
    isAccessible: boolean;
    isCompleted: boolean;
    hasAssessment: boolean;
    assessmentPassed?: boolean;
    score?: number;
  }[];
  overallProgress: {
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
}
```

## Implementation Priority

1. **Phase 1**: Database schema changes
2. **Phase 2**: Basic materi access control
3. **Phase 3**: Simple assessment functionality
4. **Phase 4**: Progress tracking and UI updates
5. **Phase 5**: Analytics and enhancements

## Key Features Delivered

✅ Optional assessments for materi  
✅ 80% default passing score (configurable)  
✅ Sequential materi unlocking  
✅ Assessment score tracking  
✅ Unlimited immediate retries  
✅ Simple completion logic  
✅ Backward compatibility  
✅ Minimal database changes  

## Future Enhancements (Optional)

- Detailed attempt tracking
- Time limits for assessments
- Question shuffling
- Assessment analytics
- Manual unlock by admin
- Multiple attempt limits
- Assessment feedback and explanations