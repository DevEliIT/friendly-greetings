-- Create user_personas table to associate users with their persona
CREATE TABLE public.user_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  persona text NOT NULL CHECK (persona IN ('him', 'her')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;

-- Admin can manage all personas
CREATE POLICY "Admin full access user_personas"
ON public.user_personas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read their own persona
CREATE POLICY "Users can read own persona"
ON public.user_personas
FOR SELECT
USING (auth.uid() = user_id);