/**
 * Migration script to migrate vocabulary item learned status
 * from the deprecated global `isLearned` column to the new
 * user-specific `VocabularyItemProgress` table.
 *
 * This script:
 * 1. Finds all vocabulary items with `isLearned: true`
 * 2. Creates VocabularyItemProgress records for the creator of each item
 * 3. Sets `learnedAt` to the item's `updatedAt` (assuming that's when it was marked)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateVocabularyProgress() {
  console.log('Starting vocabulary progress migration...');

  try {
    // Find all vocabulary items with isLearned: true
    const learnedItems = await prisma.vocabularyItem.findMany({
      where: {
        isLearned: true,
      },
      select: {
        id: true,
        creatorId: true,
        updatedAt: true,
      },
    });

    console.log(`Found ${learnedItems.length} vocabulary items with isLearned: true`);

    // Create VocabularyItemProgress records for each learned item
    let successCount = 0;
    let skippedCount = 0;

    for (const item of learnedItems) {
      try {
        // Check if a progress record already exists
        const existingProgress = await prisma.vocabularyItemProgress.findUnique({
          where: {
            itemId_userId: {
              itemId: item.id,
              userId: item.creatorId,
            },
          },
        });

        if (existingProgress) {
          console.log(`Progress record already exists for item ${item.id} and user ${item.creatorId}`);
          skippedCount++;
          continue;
        }

        // Create a new progress record
        await prisma.vocabularyItemProgress.create({
          data: {
            itemId: item.id,
            userId: item.creatorId,
            isLearned: true,
            learnedAt: item.updatedAt,
          },
        });

        console.log(`Created progress record for item ${item.id} and user ${item.creatorId}`);
        successCount++;
      } catch (error) {
        console.error(`Error creating progress record for item ${item.id}:`, error);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Successfully migrated: ${successCount} items`);
    console.log(`- Skipped (already exists): ${skippedCount} items`);
    console.log(`- Total processed: ${learnedItems.length} items`);

    console.log('\nNext steps:');
    console.log('1. Verify the migration was successful by checking the VocabularyItemProgress table');
    console.log('2. Once verified, remove the deprecated `isLearned` column from the VocabularyItem model');
    console.log('3. Run `npx prisma db push` to apply the schema change');
    console.log('4. Run `npx prisma generate` to regenerate the Prisma client');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateVocabularyProgress()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
