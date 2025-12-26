import { useEffect, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GalleryPhoto } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SleepingGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('position', { ascending: true });

      if (!error && data) {
        setPhotos(data as GalleryPhoto[]);
      }
      setIsLoading(false);
    }

    fetchPhotos();
  }, []);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const nextPhoto = () => setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
  const prevPhoto = () => setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedIndex, photos.length]);

  if (isLoading) {
    return (
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Malu dormindo</h2>
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

  if (photos.length === 0) {
    return (
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Camera className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Malu dormindo</h2>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-background py-16 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Nenhuma foto na galeria ainda.</p>
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
            <h2 className="font-display text-3xl font-semibold">Malu dormindo</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="group aspect-square overflow-hidden rounded-lg border border-border/50 bg-muted transition-all hover:border-border hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Malu dormindo'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && (
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

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <img
            src={photos[selectedIndex].url}
            alt={photos[selectedIndex].caption || 'Malu dormindo'}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {photos[selectedIndex].caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-sm">
              {photos[selectedIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
