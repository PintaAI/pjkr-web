-- Alter VocabularySet table to add isDraft field
ALTER TABLE "VocabularySet" 
ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- Create index for isDraft field for better query performance
CREATE INDEX "VocabularySet.isDraft_idx" ON "VocabularySet"("isDraft");