
-- Create gallery categories table
CREATE TABLE public.gallery_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read gallery_categories"
ON public.gallery_categories
FOR SELECT
USING (true);

-- Admin full access
CREATE POLICY "Admin full access gallery_categories"
ON public.gallery_categories
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add category_id and media_type to gallery_photos
ALTER TABLE public.gallery_photos
ADD COLUMN category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image';

-- Insert default categories
INSERT INTO public.gallery_categories (name, slug, is_protected, position)
VALUES 
  ('Notícias Postadas', 'noticias-postadas', true, 0),
  ('Malu Dormindo', 'malu-dormindo', false, 1);
