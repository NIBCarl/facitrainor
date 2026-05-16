-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'trainee');

-- 1. Profiles Table (extends the Supabase auth.users table)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role user_role DEFAULT 'trainee'::user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Modules Table
CREATE TABLE modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pages Table
CREATE TABLE pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Stores text blocks, video URLs, and quiz arrays
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Submissions Table
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC,
    is_passing BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Summative Scores Table (For physical Saturday meetups)
CREATE TABLE summative_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (Security Best Practice)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE summative_scores ENABLE ROW LEVEL SECURITY;

-- Setup basic read policies (We will handle write security heavily on the Next.js server)
CREATE POLICY "Public read access to modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public read access to pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can read own submissions" ON submissions FOR SELECT USING (auth.uid() = trainee_id);

-- Setup a trigger to automatically create a profile when a new user is created in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'trainee'::user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
