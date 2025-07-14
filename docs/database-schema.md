# Database Schema Documentation

This document provides a comprehensive overview of the PJKR application database schema, including models, relationships, and design patterns.

## Table of Contents

1. [Overview](#overview)
2. [Core Models](#core-models)
3. [User Management](#user-management)
4. [Course & Education](#course--education)
5. [Assessment & Quiz](#assessment--quiz)
6. [Vocabulary & Learning](#vocabulary--learning)
7. [Social Features](#social-features)
8. [Utility Models](#utility-models)
9. [Relationships](#relationships)
10. [Design Patterns](#design-patterns)
11. [Migration Guide](#migration-guide)

## Overview

The PJKR database is built with PostgreSQL and Prisma ORM, designed for a Korean language learning platform with comprehensive course management, assessment tools, and social features.

### Key Features
- 🔐 **Better Auth Integration** - Modern authentication with session management
- 📚 **Course Management** - Structured classes with materials and live sessions
- 📝 **Assessment System** - Flexible quiz/tryout system with attachments
- 🗣️ **Vocabulary Learning** - Individual and set-based vocabulary management
- 💬 **Social Features** - Posts, comments, likes, and class discussions
- 💳 **Payment Integration** - Midtrans payment tracking and subscriptions

### Database Technology Stack
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma with driver adapters
- **Connection**: Pooled connections for serverless optimization
- **Deployment**: Vercel + Neon integration

## Core Models

### User Model
The central user entity supporting multiple roles and comprehensive tracking.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRoles @default(MURID)
  emailVerified Boolean   @default(false)
  image         String?
  
  // User Stats
  currentStreak Int @default(0)
  xp            Int @default(0)
  level         Int @default(1)
  
  // Relations: 20+ relation fields
}
```

#### User Roles
- **MURID** - Student (default)
- **GURU** - Teacher/Instructor
- **ADMIN** - Administrator

#### User Stats
- `currentStreak` - Daily learning streak counter
- `xp` - Experience points earned
- `level` - User level based on XP

## User Management

### Authentication Models

#### Session Model
```prisma
model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  
  // Optional tracking
  ipAddress String?
  userAgent String?
}
```

#### Account Model
```prisma
model Account {
  id                   String    @id @default(cuid())
  userId               String
  providerId           String    // "google", "email"
  accountId            String
  refreshToken         String?
  accessToken          String?
  accessTokenExpiresAt DateTime?
  
  // For email/password auth
  password             String?
}
```

#### Verification Model
```prisma
model Verification {
  id         String    @id
  identifier String    // email or phone
  value      String    // verification code
  expiresAt  DateTime
}
```

### Activity Tracking

#### ActivityLog Model
```prisma
model ActivityLog {
  id             String       @id @default(cuid())
  userId         String
  type           ActivityType
  description    String?
  xpEarned       Int?
  streakUpdated  Boolean      @default(false)
  previousStreak Int?
  newStreak      Int?
  previousLevel  Int?
  newLevel       Int?
  metadata       Json?        @db.JsonB
}
```

#### Activity Types
- `LOGIN`, `COMPLETE_MATERI`, `COMPLETE_KELAS`
- `COMPLETE_QUIZ`, `VOCABULARY_PRACTICE`
- `DAILY_CHALLENGE`, `PARTICIPATE_LIVE_SESSION`
- `PLAY_GAME`, `CREATE_POST`, `COMMENT_POST`
- `LIKE_POST`, `LIKE_COMMENT`, `SHARE_POST`

## Course & Education

### Class Management

#### Kelas (Class) Model
```prisma
model Kelas {
  id              Int       @id @default(autoincrement())
  title           String
  description     String?
  jsonDescription Json?     @db.JsonB
  htmlDescription String?
  type            KelasType @default(REGULAR)
  level           Difficulty
  thumbnail       String?
  icon            String?
  
  // Pricing (New)
  isPaidClass     Boolean   @default(false)
  price           Decimal?  @db.Decimal(10,2)
  discount        Decimal?  @db.Decimal(10,2)
  promoCode       String?
  
  authorId        String
  
  // Relations
  author          User                  @relation("KelasAuthor")
  materis         Materi[]              @relation("KelasMateri")
  liveSessions    LiveSession[]         @relation("KelasLiveSessions")
  members         User[]                @relation("KelasMembers")
  vocabularySets  VocabularySet[]
  completions     UserKelasCompletion[]
  posts           Post[]                @relation("KelasPosts") // New: Class discussions
}
```

#### Class Types
- `REGULAR` - Standard course
- `EVENT` - Special event/workshop
- `GROUP` - Group learning
- `PRIVATE` - One-on-one instruction
- `FUN` - Gamified learning

#### Difficulty Levels
- `BEGINNER` - Starter level
- `INTERMEDIATE` - Mid level
- `ADVANCED` - Expert level

### Materials & Content

#### Materi (Material) Model
```prisma
model Materi {
  id              Int    @id @default(autoincrement())
  title           String
  description     String
  jsonDescription Json   @db.JsonB
  htmlDescription String
  order           Int
  isDemo          Boolean @default(false)
  
  kelasId         Int
  kelas           Kelas @relation("KelasMateri")
  completions     UserMateriCompletion[]
}
```

### Progress Tracking

#### User Material Completion
```prisma
model UserMateriCompletion {
  id          Int     @id @default(autoincrement())
  userId      String
  materiId    Int
  isCompleted Boolean @default(false)
  
  @@unique([userId, materiId])
}
```

#### User Class Completion
```prisma
model UserKelasCompletion {
  id          Int       @id @default(autoincrement())
  userId      String
  kelasId     Int
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  
  @@unique([userId, kelasId])
}
```

### Live Sessions

#### LiveSession Model
```prisma
model LiveSession {
  id             String            @id @default(cuid())
  name           String
  description    String?
  streamCallId   String?           // Stream Video Call ID
  status         LiveSessionStatus @default(SCHEDULED)
  scheduledStart DateTime
  scheduledEnd   DateTime?
  actualStart    DateTime?
  actualEnd      DateTime?
  recordingUrl   String?
  
  creatorId      String
  kelasId        Int
  
  creator        User   @relation("LiveSessionCreator")
  kelas          Kelas  @relation("KelasLiveSessions")
  participants   User[] @relation("LiveSessionParticipants")
}
```

#### Live Session Status
- `SCHEDULED` - Planned session
- `LIVE` - Currently active
- `ENDED` - Completed session

## Assessment & Quiz

### Question Collections

#### KoleksiSoal (Question Collection)
```prisma
model KoleksiSoal {
  id        Int     @id @default(autoincrement())
  nama      String
  deskripsi String?
  isPrivate Boolean @default(false)
  
  userId    String
  user      User     @relation("KoleksiSoalAuthor")
  soals     Soal[]
  tryouts   Tryout[]
}
```

### Questions & Answers

#### Soal (Question) Model
```prisma
model Soal {
  id             Int         @id @default(autoincrement())
  koleksiSoalId  Int
  authorId       String
  pertanyaan     String
  difficulty     Difficulty?
  explanation    String?
  isActive       Boolean     @default(true)
  
  koleksiSoal    KoleksiSoal      @relation
  author         User             @relation("SoalAuthor")
  opsis          Opsi[]
  attachments    SoalAttachment[] @relation("SoalAttachments")
}
```

#### Opsi (Option) Model
```prisma
model Opsi {
  id             Int    @id @default(autoincrement())
  soalId         Int
  opsiText       String
  isCorrect      Boolean @default(false)
  order          Int     @default(0)
  
  soal           Soal             @relation
  attachments    OpsiAttachment[] @relation("OpsiAttachments")
}
```

### File Attachments

#### SoalAttachment Model
```prisma
model SoalAttachment {
  id       Int     @id @default(autoincrement())
  soalId   Int
  url      String
  type     String  // "image", "audio", "video", "document"
  filename String?
  size     Int?    // File size in bytes
  mimeType String?
  order    Int     @default(0)
  
  soal     Soal @relation("SoalAttachments")
}
```

#### OpsiAttachment Model
```prisma
model OpsiAttachment {
  id       Int     @id @default(autoincrement())
  opsiId   Int
  url      String
  type     String  // "image", "audio", "video", "document"
  filename String?
  size     Int?    // File size in bytes
  mimeType String?
  order    Int     @default(0)
  
  opsi     Opsi @relation("OpsiAttachments")
}
```

### Tryouts & Exams

#### Tryout Model
```prisma
model Tryout {
  id            Int      @id @default(autoincrement())
  nama          String
  startTime     DateTime
  endTime       DateTime
  duration      Int      @default(30) // minutes
  koleksiSoalId Int
  isActive      Boolean  @default(false)
  guruId        String
  
  koleksiSoal   KoleksiSoal         @relation
  guru          User                @relation("TryoutGuru")
  participants  TryoutParticipant[]
}
```

#### TryoutParticipant Model
```prisma
model TryoutParticipant {
  id               Int       @id @default(autoincrement())
  tryoutId         Int
  userId           String
  score            Int       @default(0)
  submittedAt      DateTime?
  timeTakenSeconds Int?
  
  tryout           Tryout @relation
  user             User   @relation
  
  @@unique([tryoutId, userId])
}
```

## Vocabulary & Learning

### Vocabulary Sets

#### VocabularySet Model
```prisma
model VocabularySet {
  id          Int     @id @default(autoincrement())
  title       String
  description String?
  icon        String? @default("FaBook")
  isPublic    Boolean @default(false)
  
  userId      String?
  kelasId     Int?    // Optional relation to Kelas
  
  user        User?            @relation
  kelas       Kelas?           @relation
  items       VocabularyItem[]
}
```

### Individual Vocabulary Items

#### VocabularyItem Model (Updated)
```prisma
model VocabularyItem {
  id               Int            @id @default(autoincrement())
  korean           String
  indonesian       String
  isLearned        Boolean        @default(false)
  type             VocabularyType @default(WORD)
  pos              PartOfSpeech?  // Part of Speech
  audioUrl         String?
  exampleSentences String[]       @default([]) // Multiple examples
  
  creatorId        String         // User who created this item
  collectionId     Int?           // Optional relation to VocabularySet
  
  creator          User           @relation("VocabularyItemCreator")
  collection       VocabularySet? @relation
}
```

#### Vocabulary Types
- `WORD` - Single word
- `SENTENCE` - Full sentence
- `IDIOM` - Idiomatic expression

#### Part of Speech
- `KATA_KERJA` - Verb
- `KATA_BENDA` - Noun
- `KATA_SIFAT` - Adjective
- `KATA_KETERANGAN` - Adverb

### Key Features
- **✅ Independent Items**: Vocabulary items can exist without collections
- **✅ Creator Tracking**: Know who created each vocabulary item
- **✅ Multiple Examples**: Array of example sentences
- **✅ Audio Support**: URL for pronunciation audio
- **✅ Flexible Collections**: Optional grouping by sets or classes

## Social Features

### Posts & Discussions

#### Post Model (Updated with Class Discussions)
```prisma
model Post {
  id              Int      @id @default(autoincrement())
  title           String
  description     String?
  jsonDescription Json     @db.JsonB
  htmlDescription String
  type            PostType @default(DISCUSSION)
  isPublished     Boolean  @default(true)
  isPinned        Boolean  @default(false)
  viewCount       Int      @default(0)
  likeCount       Int      @default(0)  // Denormalized
  commentCount    Int      @default(0)  // Denormalized
  shareCount      Int      @default(0)  // Denormalized
  tags            String[] @default([])
  
  authorId        String
  kelasId         Int?     // New: Optional relation for class discussions
  
  author          User     @relation("PostAuthor")
  kelas           Kelas?   @relation("KelasPosts") // New: Class relation
  comments        Comment[] @relation("PostComments")
  likes           PostLike[] @relation("PostLikes")
  shares          PostShare[] @relation("PostShares")
}
```

#### Post Types
- `DISCUSSION` - General discussion
- `ANNOUNCEMENT` - Official announcements
- `QUESTION` - Q&A posts
- `SHARE` - Shared content
- `TUTORIAL` - How-to guides

### Comments & Replies

#### Comment Model
```prisma
model Comment {
  id            Int    @id @default(autoincrement())
  content       String
  jsonContent   Json?  @db.JsonB
  htmlContent   String?
  isEdited      Boolean @default(false)
  likeCount     Int     @default(0)  // Denormalized
  replyCount    Int     @default(0)  // Denormalized
  
  authorId      String
  postId        Int
  parentId      Int?   // For nested replies
  
  author        User      @relation("CommentAuthor")
  post          Post      @relation("PostComments")
  parent        Comment?  @relation("CommentReplies")
  replies       Comment[] @relation("CommentReplies")
  likes         CommentLike[] @relation("CommentLikes")
}
```

### Engagement Features

#### PostLike Model
```prisma
model PostLike {
  id     Int @id @default(autoincrement())
  userId String
  postId Int
  
  user   User @relation("UserPostLikes")
  post   Post @relation("PostLikes")
  
  @@unique([userId, postId])
}
```

#### CommentLike Model
```prisma
model CommentLike {
  id        Int @id @default(autoincrement())
  userId    String
  commentId Int
  
  user      User    @relation("UserCommentLikes")
  comment   Comment @relation("CommentLikes")
  
  @@unique([userId, commentId])
}
```

#### PostShare Model
```prisma
model PostShare {
  id       Int           @id @default(autoincrement())
  userId   String
  postId   Int
  platform SharePlatform @default(COPY_LINK)
  
  user     User @relation("UserPostShares")
  post     Post @relation("PostShares")
}
```

#### Share Platforms
- `TWITTER`, `FACEBOOK`, `TELEGRAM`
- `WHATSAPP`, `COPY_LINK`, `EMAIL`

## Utility Models

### Payment & Subscriptions

#### Subscription Model
```prisma
model Subscription {
  id              String         @id @default(cuid())
  userId          String
  midtransOrderId String         @unique
  status          MidtransStatus
  accessTier      String         // "FREE", "PREMIUM"
  startDate       DateTime?
  endDate         DateTime?
  
  user            User @relation
}
```

#### Midtrans Status
- `PENDING`, `SUCCESS`, `FAILED`
- `CHALLENGE`, `SETTLEMENT`, `CAPTURE`
- `EXPIRE`, `CANCEL`

### Push Notifications

#### PushNotification Model
```prisma
model PushNotification {
  id       String @id @default(cuid())
  endpoint String @unique
  p256dh   String
  auth     String
  userId   String
  
  user     User @relation
}
```

### Drawing Tool

#### ExcalidrawDrawing Model
```prisma
model ExcalidrawDrawing {
  id       String @id @default(cuid())
  name     String
  elements Json   @db.JsonB // Excalidraw elements
  appState Json?  @db.JsonB // Excalidraw app state
  files    Json?  @db.JsonB // Files data
  userId   String
  
  user     User @relation
}
```

## Relationships

### User-Centric Relationships

#### Educational Relationships
- **User → Kelas** (authored): `authoredKelas`
- **User ↔ Kelas** (membership): `joinedKelas` / `members`
- **User → VocabularySet**: `vocabularySets`
- **User → VocabularyItem**: `vocabularyItems` (New)
- **User → LiveSession** (created): `createdLiveSessions`
- **User ↔ LiveSession** (participation): `joinedLiveSessions` / `participants`

#### Assessment Relationships
- **User → KoleksiSoal**: `koleksiSoals`
- **User → Soal**: `soals`
- **User → Tryout** (created): `createdTryouts`
- **User ↔ Tryout** (participation): `tryoutParticipations` / `participants`

#### Social Relationships
- **User → Post**: `authoredPosts`
- **User → Comment**: `comments`
- **User ↔ Post** (likes): `postLikes` / `likes`
- **User ↔ Comment** (likes): `commentLikes` / `likes`
- **User → PostShare**: `postShares`

#### Progress Tracking
- **User ↔ Materi**: `materiCompletions`
- **User ↔ Kelas**: `kelasCompletions`
- **User → ActivityLog**: `activityLogs`

### Class-Centric Relationships

#### Core Content
- **Kelas → Materi**: `materis`
- **Kelas → LiveSession**: `liveSessions`
- **Kelas → VocabularySet**: `vocabularySets`
- **Kelas → Post**: `posts` (New: Class discussions)

#### Progress & Membership
- **Kelas ↔ User** (membership): `members` / `joinedKelas`
- **Kelas ↔ User** (completions): `completions` / `kelasCompletions`

### Assessment Relationships

#### Question Structure
- **KoleksiSoal → Soal**: `soals`
- **KoleksiSoal → Tryout**: `tryouts`
- **Soal → Opsi**: `opsis`
- **Soal → SoalAttachment**: `attachments`
- **Opsi → OpsiAttachment**: `attachments`

### Social Content Relationships

#### Post Structure
- **Post → Comment**: `comments`
- **Post ↔ User** (likes): `likes` / `postLikes`
- **Post → PostShare**: `shares`
- **Post ↔ Kelas**: `kelas` / `posts` (New)

#### Comment Structure
- **Comment ↔ Comment** (replies): `replies` / `parent`
- **Comment ↔ User** (likes): `likes` / `commentLikes`

## Design Patterns

### 1. Polymorphic Content
**Pattern**: Rich content support with multiple formats
```prisma
description     String?   // Plain text
jsonDescription Json      @db.JsonB // Structured data
htmlDescription String    // Rendered HTML
```

**Used in**: `Post`, `Kelas`, `Materi`

### 2. Denormalized Counters
**Pattern**: Performance optimization for frequently accessed counts
```prisma
likeCount    Int @default(0)  // Cached count
commentCount Int @default(0)  // Cached count
shareCount   Int @default(0)  // Cached count
```

**Used in**: `Post`, `Comment`

### 3. Soft Delete Pattern
**Pattern**: Logical deletion with status flags
```prisma
isActive     Boolean @default(true)
isPublished  Boolean @default(true)
```

**Used in**: `Soal`, `Post`, `Tryout`

### 4. Hierarchical Content
**Pattern**: Self-referencing for nested structures
```prisma
parentId Int?
parent   Comment? @relation("CommentReplies")
replies  Comment[] @relation("CommentReplies")
```

**Used in**: `Comment`

### 5. Flexible Attachments
**Pattern**: Type-aware file attachments with metadata
```prisma
url      String
type     String  // "image", "audio", "video", "document"
filename String?
size     Int?
mimeType String?
order    Int     @default(0)
```

**Used in**: `SoalAttachment`, `OpsiAttachment`

### 6. Optional Relationships
**Pattern**: Flexible associations for reusable content
```prisma
kelasId     Int?  // Optional class association
collectionId Int? // Optional collection association
```

**Used in**: `VocabularySet`, `VocabularyItem`, `Post`

### 7. Enumerated Types
**Pattern**: Controlled vocabularies for consistency
```prisma
enum UserRoles {
  GURU
  MURID
  ADMIN
}
```

**Benefits**:
- Type safety
- Clear constraints
- Better documentation

### 8. Composite Indexes
**Pattern**: Optimized database performance
```prisma
@@index([userId, type])
@@index([userId, createdAt])
@@index([type, createdAt])
```

**Used extensively** for query optimization

### 9. Timestamp Tracking
**Pattern**: Automatic timestamp management
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

**Standard across** all models

### 10. Unique Constraints
**Pattern**: Data integrity enforcement
```prisma
@@unique([userId, materiId])
@@unique([tryoutId, userId])
```

**Prevents** duplicate records in junction tables

## Migration Guide

### Recent Schema Changes

#### 1. Added Pricing to Kelas Model
```sql
-- Add pricing fields
ALTER TABLE "Kelas" ADD COLUMN "price" DECIMAL(10,2);
ALTER TABLE "Kelas" ADD COLUMN "discount" DECIMAL(10,2);
ALTER TABLE "Kelas" ADD COLUMN "promoCode" TEXT;
```

#### 2. Added Class Discussions
```sql
-- Add kelasId to Post for class discussions
ALTER TABLE "Post" ADD COLUMN "kelasId" INTEGER;

-- Add foreign key constraint
ALTER TABLE "Post" ADD CONSTRAINT "Post_kelasId_fkey" 
FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE;
```

#### 3. Updated VocabularyItem Model
```sql
-- Make collectionId optional
ALTER TABLE "VocabularyItem" ALTER COLUMN "collectionId" DROP NOT NULL;

-- Add creator tracking
ALTER TABLE "VocabularyItem" ADD COLUMN "creatorId" TEXT NOT NULL;

-- Add multiple example sentences
ALTER TABLE "VocabularyItem" DROP COLUMN "exampleSentence";
ALTER TABLE "VocabularyItem" ADD COLUMN "exampleSentences" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add foreign key for creator
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_creatorId_fkey" 
FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Update collection foreign key for optional relationship
ALTER TABLE "VocabularyItem" DROP CONSTRAINT "VocabularyItem_collectionId_fkey";
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_collectionId_fkey" 
FOREIGN KEY ("collectionId") REFERENCES "VocabularySet"("id") ON DELETE SET NULL;
```

### Migration Commands

#### Generate Migration
```bash
# Generate new migration
bun prisma migrate dev --name descriptive-migration-name

# Deploy to production
bun prisma migrate deploy
```

#### Reset Database (Development Only)
```bash
# Reset and regenerate
bun prisma migrate reset

# Push schema without migration (development)
bun prisma db push
```

### Best Practices

#### Schema Changes
1. **Always use migrations** for schema changes
2. **Test migrations** on staging environment first
3. **Backup production** before major changes
4. **Use descriptive names** for migrations

#### Data Migration
1. **Plan data transformations** carefully
2. **Use transactions** for complex migrations
3. **Validate data** after migration
4. **Have rollback plan** ready

#### Performance Considerations
1. **Add indexes** for frequently queried fields
2. **Monitor query performance** after changes
3. **Consider denormalization** for read-heavy operations
4. **Use connection pooling** for serverless deployments

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Serverless PostgreSQL](https://neon.tech/docs)
- [Database Design Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)
