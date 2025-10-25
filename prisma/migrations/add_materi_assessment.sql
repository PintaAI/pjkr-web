-- Migration: Add Materi Assessment Support
-- Description: Add optional assessment functionality to materi with passing requirements and unlock mechanism
-- Date: 2025-10-25

-- Step 1: Add new fields to materi table
ALTER TABLE materi 
ADD COLUMN koleksi_soal_id INTEGER REFERENCES koleksi_soal(id) ON DELETE SET NULL,
ADD COLUMN passing_score INTEGER CHECK (passing_score >= 0 AND passing_score <= 100);

-- Create index for performance
CREATE INDEX idx_materi_koleksi_soal_id ON materi(koleksi_soal_id);

-- Step 2: Create user_materi_assessment table
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

-- Create indexes for performance
CREATE INDEX idx_user_materi_assessment_user_id ON user_materi_assessment(user_id);
CREATE INDEX idx_user_materi_assessment_materi_id ON user_materi_assessment(materi_id);
CREATE INDEX idx_user_materi_assessment_is_passed ON user_materi_assessment(is_passed);

-- Step 3: Add assessment tracking to user_materi_completion table
ALTER TABLE user_materi_completion 
ADD COLUMN assessment_passed BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX idx_user_materi_completion_assessment_passed ON user_materi_completion(assessment_passed);

-- Step 4: Update existing data (optional)
-- Mark existing completions as assessment passed if you want to treat existing materis as "passed"
-- Uncomment the following line if you want to update existing data:
-- UPDATE user_materi_completion SET assessment_passed = TRUE WHERE is_completed = TRUE;

-- Step 5: Add trigger to update updated_at timestamp (optional)
-- This trigger automatically updates the updated_at field when records are modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_materi_assessment_updated_at 
    BEFORE UPDATE ON user_materi_assessment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration completed successfully
-- Notes:
-- 1. Existing materis without koleksi_soal_id will continue to work as before
-- 2. Materis with koleksi_soal_id will require assessment passing to complete
-- 3. Default passing score is 80% (can be configured per materi)
-- 4. Users can retake assessments unlimited times
-- 5. First materi in each kelas is always accessible
-- 6. Subsequent materis are unlocked when previous materi is completed