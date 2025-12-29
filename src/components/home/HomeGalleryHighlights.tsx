import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight, Folder, Image, Video, Music, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory, GalleryMedia } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function HomeGalleryHighlights() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      const [{ data: catData }, { data: mediaData }] = await Promise.all([
        supabase.from('gallery_categories').select('*').eq('show_on_home', true).order('position'),
        supabase.from('gallery_photos').select('*').order('position'),
      ]);

      if (catData) setCategories(catData as GalleryCategory[]);
      if (mediaData) setMedia(mediaData as GalleryMedia[]);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  // Filter media by categories that show on home
  const categoryIds = categories.map(c => c.id);
  const filteredMedia = activeCategory === 'all'
    ? media.filter(m => m.category_id && categoryIds.includes(m.category_id))
    : media.filter(m => m.category_id === activeCategory);

  // Limit to 8 items for home page
  const displayMedia = filteredMedia.slice(0, 8);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const renderThumbnail = (item: GalleryMedia) => {
    if (item.media_type === 'video') {
      return (
        <div className="relative h-full w-full">
          <video src={item.url} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
            <Play className="h-8 w-8 text-background" />
          </div>
        </div>
      );
    }
    if (item.media_type === 'audio') {
      return (
        <div className="flex h-full items-center justify-center bg-muted">
          <Music className="h-10 w-10 text-muted-foreground" />
        </div>
      );
    }
    return (
      <img
        src={item.url}
        alt={item.caption || 'Galeria'}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    );
  };

  if (isLoading) {
    return (
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-accent" />
              <h2 className="font-display text-3xl font-semibold">Galeria</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories marked for home
  }

  return (
    <section className="bg-card/50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Galeria</h2>
          </div>
          <Link to="/galeria">
            <Button variant="ghost" size="sm">
              Ver tudo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            Destaques
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
            >
              <Folder className="mr-2 h-4 w-4" />
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Media grid */}
        {displayMedia.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background py-16 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Nenhuma mídia nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {displayMedia.map((item) => (
              <Link
                key={item.id}
                to="/galeria"
                className="group relative aspect-square overflow-hidden rounded-lg border border-border/50 bg-muted transition-all hover:border-border hover:shadow-lg"
              >
                {renderThumbnail(item)}
                <div className="absolute bottom-2 left-2 rounded bg-background/80 p-1">
                  {getMediaIcon(item.media_type)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}