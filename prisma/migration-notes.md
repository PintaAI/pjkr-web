# Schema Cleanup Migration Notes

## ⚠️ IMPORTANT: Database Migration Required

This schema update includes breaking changes that require careful migration:

### 1. Enum Rename: UserPlan → UserTier
```sql
-- Update enum values first
ALTER TYPE "UserPlan" RENAME TO "UserTier";
```

### 2. Column Renames
```sql
-- Rename User.plan to User.accessTier
ALTER TABLE "user" RENAME COLUMN "plan" TO "accessTier";

-- Rename Subscription.plan to Subscription.accessTier
ALTER TABLE "Subscription" RENAME COLUMN "plan" TO "accessTier";

-- Rename Soal.koleksiId to Soal.koleksiSoalId
ALTER TABLE "Soal" RENAME COLUMN "koleksiId" TO "koleksiSoalId";

-- Create MidtransStatus enum and update Subscription.status
CREATE TYPE "MidtransStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CHALLENGE', 'SETTLEMENT', 'CAPTURE', 'EXPIRE', 'CANCEL');
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "MidtransStatus" USING "status"::"MidtransStatus";
```

### 3. New Required Fields
```sql
-- Add userId to KoleksiSoal (requires manual data migration)
ALTER TABLE "KoleksiSoal" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'temp-user-id';
-- Update with actual user IDs before removing default
```

### 4. Dropped Columns/Tables
```sql
-- Remove unused fields
ALTER TABLE "Module" DROP COLUMN "isCompleted";

-- Drop unused table
DROP TABLE "VerificationToken";
```

### 5. JSON Fields Updated to JsonB
```sql
-- Update JSON fields to use PostgreSQL JsonB for better performance
ALTER TABLE "Course" ALTER COLUMN "jsonDescription" TYPE jsonb USING "jsonDescription"::jsonb;
ALTER TABLE "Module" ALTER COLUMN "jsonDescription" TYPE jsonb USING "jsonDescription"::jsonb;
ALTER TABLE "Article" ALTER COLUMN "jsonDescription" TYPE jsonb USING "jsonDescription"::jsonb;
ALTER TABLE "ExcalidrawDrawing" ALTER COLUMN "elements" TYPE jsonb USING "elements"::jsonb;
ALTER TABLE "ExcalidrawDrawing" ALTER COLUMN "appState" TYPE jsonb USING "appState"::jsonb;
ALTER TABLE "ExcalidrawDrawing" ALTER COLUMN "files" TYPE jsonb USING "files"::jsonb;
ALTER TABLE "ActivityLog" ALTER COLUMN "metadata" TYPE jsonb USING "metadata"::jsonb;
```

### 6. New Indexes Added
- `Module`: courseId, order
- `UserModuleCompletion`: userId, moduleId
- `LiveSession`: courseId
- `KoleksiSoal`: userId
- `VocabularyItem`: collectionId
- `ActivityLog`: Enhanced with composite indexes (userId+type, userId+createdAt, type+createdAt)

## Migration Steps:

1. **Backup your database first!**
2. Run the manual SQL migrations above
3. Update KoleksiSoal records with proper userId values
4. Run `prisma db push` or `prisma migrate dev`
5. Test all relationships work correctly

## Better Auth Compatibility:

✅ **Corrected password storage**:
- Password field moved from User table to Account table (Better Auth standard)
- Account table stores credential-based authentication data
- User table stores core user information only

✅ **Optimized JSON storage**:
- All JSON fields now use `@db.JsonB` for better PostgreSQL performance
- Enables efficient JSON querying and indexing
- Affects: Course, Module, Article, ExcalidrawDrawing, ActivityLog models

## Code Changes Required:

Update all references to:
- `UserPlan` → `UserTier`
- `user.plan` → `user.accessTier`
- `subscription.plan` → `subscription.accessTier`
- `soal.koleksiId` → `soal.koleksiSoalId`
- Remove references to `module.isCompleted`
- Password operations now handled through Account model (Better Auth manages this)
- Update Subscription.status to use `MidtransStatus` enum instead of String

## Better Auth Configuration Updated:

✅ **Updated `web/lib/auth.ts`**:
- Changed `plan` → `accessTier` in additionalFields
- Added missing `lastActivityDate` field
- Added missing `isCertificateEligible` field
- All fields now match the Prisma schema exactly