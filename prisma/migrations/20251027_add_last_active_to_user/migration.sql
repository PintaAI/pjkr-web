-- Add lastActive field to User model
ALTER TABLE "user" ADD COLUMN "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;