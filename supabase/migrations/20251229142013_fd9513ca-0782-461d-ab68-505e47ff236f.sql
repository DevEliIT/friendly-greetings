-- Add show_on_home to gallery_categories
ALTER TABLE public.gallery_categories 
ADD COLUMN show_on_home boolean NOT NULL DEFAULT false;

-- Add show_on_home to posts
ALTER TABLE public.posts 
ADD COLUMN show_on_home boolean NOT NULL DEFAULT false;

-- Update the protected category to show on home by default
UPDATE public.gallery_categories 
SET show_on_home = false 
WHERE is_protected = true;