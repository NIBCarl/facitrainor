-- Migration: Add Module Review Quiz support

-- 1. Add review_content column to modules table for storing the review quiz
ALTER TABLE modules ADD COLUMN IF NOT EXISTS review_content JSONB DEFAULT '[]'::jsonb;

-- 2. Create module_reviews table for tracking review quiz submissions
CREATE TABLE IF NOT EXISTS module_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC NOT NULL,
    is_passing BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Trainees can read own module reviews" ON module_reviews
  FOR SELECT USING (auth.uid() = trainee_id);

CREATE POLICY "Trainees can insert own module reviews" ON module_reviews
  FOR INSERT WITH CHECK (auth.uid() = trainee_id);

CREATE POLICY "Admins can read all module reviews" ON module_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Allow admins to update modules (needed for saving review_content)
-- (This may already exist, the IF NOT EXISTS prevents errors)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Admins can update modules'
  ) THEN
    CREATE POLICY "Admins can update modules" ON modules FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;
