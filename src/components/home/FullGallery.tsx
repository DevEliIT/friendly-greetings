import { useEffect, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Folder, Image, Video, Music, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GalleryCategory, GalleryMedia } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FullGallery() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      const [{ data: catData }, { data: mediaData }] = await Promise.all([
        supabase.from('gallery_categories').select('*').order('position'),
        supabase.from('gallery_photos').select('*').order('position'),
      ]);

      if (catData) {
        // Filter out the "Notícias Postadas" category for public view unless it has content
        const publicCategories = catData as GalleryCategory[];
        setCategories(publicCategories);
      }
      if (mediaData) setMedia(mediaData as GalleryMedia[]);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const filteredMedia = activeCategory === 'all' 
    ? media 
    : media.filter(m => m.category_id === activeCategory);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const nextItem = () => setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredMedia.length : 0));
  const prevItem = () => setSelectedIndex((prev) => (prev !== null ? (prev - 1 + filteredMedia.length) % filteredMedia.length : 0));

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') nextItem();
      if (e.key === 'ArrowLeft') prevItem();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedIndex, filteredMedia.length]);

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
            <Play className="h-10 w-10 text-background" />
          </div>
        </div>
      );
    }
    if (item.media_type === 'audio') {
      return (
        <div className="flex h-full items-center justify-center bg-muted">
          <Music className="h-12 w-12 text-muted-foreground" />
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

  const renderLightboxContent = (item: GalleryMedia) => {
    if (item.media_type === 'video') {
      return (
        <video 
          src={item.url} 
          controls 
          autoPlay
          className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    if (item.media_type === 'audio') {
      return (
        <div className="rounded-lg bg-background p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <Music className="mx-auto mb-4 h-16 w-16 text-primary" />
          <audio src={item.url} controls autoPlay className="w-full min-w-[300px]" />
          {item.caption && <p className="mt-4 text-center text-sm">{item.caption}</p>}
        </div>
      );
    }
    return (
      <img
        src={item.url}
        alt={item.caption || 'Galeria'}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  if (isLoading) {
    return (
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Galeria</h2>
          </div>
          <div className="mb-6 flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Galeria</h2>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-background py-16 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Nenhuma mídia na galeria ainda.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Galeria</h2>
          </div>

          {/* Category tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              Todas
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
          {filteredMedia.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background py-16 text-center">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">Nenhuma mídia nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredMedia.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => openLightbox(index)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/50 bg-muted transition-all hover:border-border hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {renderThumbnail(item)}
                  <div className="absolute bottom-2 left-2 rounded bg-background/80 p-1">
                    {getMediaIcon(item.media_type)}
                  </div>
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs text-background line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && filteredMedia[selectedIndex] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-background hover:bg-background/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {filteredMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
                onClick={(e) => { e.stopPropagation(); prevItem(); }}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
                onClick={(e) => { e.stopPropagation(); nextItem(); }}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {renderLightboxContent(filteredMedia[selectedIndex])}

          {filteredMedia[selectedIndex].caption && filteredMedia[selectedIndex].media_type !== 'audio' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-sm">
              {filteredMedia[selectedIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
