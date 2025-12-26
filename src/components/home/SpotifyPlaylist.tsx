import { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

function extractSpotifyId(url: string): string | null {
  // Match playlist or album URLs
  const match = url.match(/spotify\.com\/(playlist|album)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

function getSpotifyType(url: string): 'playlist' | 'album' | null {
  if (url.includes('/playlist/')) return 'playlist';
  if (url.includes('/album/')) return 'album';
  return null;
}

export function SpotifyPlaylist() {
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylist() {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'spotify_playlist_url')
        .maybeSingle();

      if (!error && data?.value) {
        setPlaylistUrl(data.value);
      }
      setIsLoading(false);
    }

    fetchPlaylist();
  }, []);

  const spotifyId = playlistUrl ? extractSpotifyId(playlistUrl) : null;
  const spotifyType = playlistUrl ? getSpotifyType(playlistUrl) : null;

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Music className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Nossa Playlist</h2>
          </div>
          <Skeleton className="mx-auto h-[380px] max-w-2xl rounded-xl" />
        </div>
      </section>
    );
  }

  if (!spotifyId || !spotifyType) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <Music className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Nossa Playlist</h2>
          </div>
          <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Playlist ainda não configurada.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-3">
          <Music className="h-6 w-6 text-accent" />
          <h2 className="font-display text-3xl font-semibold">Nossa Playlist</h2>
        </div>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/50 shadow-lg">
          <iframe
            src={`https://open.spotify.com/embed/${spotifyType}/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="bg-card"
          />
        </div>
      </div>
    </section>
  );
}
