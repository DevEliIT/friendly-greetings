-- Add story_date and location to posts table for news filtering
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS story_date DATE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS location TEXT;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_posts_story_date ON public.posts(story_date);
CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts(location);