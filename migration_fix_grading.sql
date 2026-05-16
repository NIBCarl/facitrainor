-- Migration: Fix summative_scores table and grading infrastructure

-- 1. Add missing columns to summative_scores
ALTER TABLE summative_scores 
  ADD COLUMN IF NOT EXISTS is_passing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Add unique constraint on trainee_id so upsert works correctly
-- (Only one summative score per trainee)
ALTER TABLE summative_scores 
  DROP CONSTRAINT IF EXISTS summative_scores_trainee_id_key;

ALTER TABLE summative_scores 
  ADD CONSTRAINT summative_scores_trainee_id_key UNIQUE (trainee_id);

-- 3. RLS Policies for summative_scores
-- Drop first to avoid duplicates
DROP POLICY IF EXISTS "Trainees can read own summative scores" ON summative_scores;
DROP POLICY IF EXISTS "Admins can manage summative scores" ON summative_scores;

-- Trainees can read their own scores
CREATE POLICY "Trainees can read own summative scores" ON summative_scores
  FOR SELECT USING (auth.uid() = trainee_id);

-- Admins can do everything with summative_scores  
CREATE POLICY "Admins can manage summative scores" ON summative_scores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
