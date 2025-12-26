-- Create posts table (stories)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_url TEXT,
  cover_type TEXT DEFAULT 'image' CHECK (cover_type IN ('image', 'video')),
  author_persona TEXT NOT NULL CHECK (author_persona IN ('him', 'her')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_versions table (his/her versions of each story)
CREATE TABLE public.post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  persona TEXT NOT NULL CHECK (persona IN ('him', 'her')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (post_id, persona)
);

-- Create post_media table (multimedia content for posts)
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pages table (Nossa história content)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_him TEXT,
  content_her TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create gallery_photos table (Malu dormindo)
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settings table (Spotify URL, etc)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES ('spotify_playlist_url', '');

-- Insert default "Nossa história" page
INSERT INTO public.pages (slug, title, content_him, content_her) 
VALUES ('nossa-historia', 'Nossa História', '', '');

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read published posts"
ON public.posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Public read post versions"
ON public.post_versions FOR SELECT
USING (
  post_id IN (SELECT id FROM public.posts WHERE is_published = true)
);

CREATE POLICY "Public read post media"
ON public.post_media FOR SELECT
USING (
  post_id IN (SELECT id FROM public.posts WHERE is_published = true)
);

CREATE POLICY "Public read pages"
ON public.pages FOR SELECT
USING (true);

CREATE POLICY "Public read gallery"
ON public.gallery_photos FOR SELECT
USING (true);

CREATE POLICY "Public read settings"
ON public.settings FOR SELECT
USING (true);

-- Admin full access policies (authenticated users only)
CREATE POLICY "Admin full access posts"
ON public.posts FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access post_versions"
ON public.post_versions FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access post_media"
ON public.post_media FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access pages"
ON public.pages FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access gallery"
ON public.gallery_photos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access settings"
ON public.settings FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_versions_updated_at
BEFORE UPDATE ON public.post_versions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies for public read
CREATE POLICY "Public read covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Public read post-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Public read gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Storage policies for authenticated upload
CREATE POLICY "Auth upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth upload post-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth upload gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

-- Storage policies for authenticated update/delete
CREATE POLICY "Auth update covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth update post-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete post-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth update gallery"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete gallery"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);