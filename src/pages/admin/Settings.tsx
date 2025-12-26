import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Settings state
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [storyHim, setStoryHim] = useState('');
  const [storyHer, setStoryHer] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      // Fetch Spotify URL
      const { data: spotifyData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'spotify_playlist_url')
        .maybeSingle();

      if (spotifyData) {
        setSpotifyUrl(spotifyData.value || '');
      }

      // Fetch Our Story page
      const { data: pageData } = await supabase
        .from('pages')
        .select('content_him, content_her')
        .eq('slug', 'nossa-historia')
        .maybeSingle();

      if (pageData) {
        setStoryHim(pageData.content_him || '');
        setStoryHer(pageData.content_her || '');
      }

      setLoading(false);
    }

    fetchSettings();
  }, []);

  async function saveSpotify() {
    setSaving(true);

    // Check if exists
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'spotify_playlist_url')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('settings')
        .update({ value: spotifyUrl })
        .eq('key', 'spotify_playlist_url');
    } else {
      await supabase
        .from('settings')
        .insert({ key: 'spotify_playlist_url', value: spotifyUrl });
    }

    toast({ title: 'Playlist salva' });
    setSaving(false);
  }

  async function saveStory() {
    setSaving(true);

    // Check if exists
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'nossa-historia')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('pages')
        .update({ content_him: storyHim, content_her: storyHer, title: 'Nossa História' })
        .eq('slug', 'nossa-historia');
    } else {
      await supabase
        .from('pages')
        .insert({ slug: 'nossa-historia', title: 'Nossa História', content_him: storyHim, content_her: storyHer });
    }

    toast({ title: 'História salva' });
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Configurações - Admin</title>
      </Helmet>

      <AdminLayout title="Configurações">
        <div className="space-y-6">
          {/* Spotify */}
          <Card>
            <CardHeader>
              <CardTitle>Playlist do Spotify</CardTitle>
              <CardDescription>
                Cole o link de embed da playlist do Spotify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spotify">URL do Embed</Label>
                <Input
                  id="spotify"
                  placeholder="https://open.spotify.com/embed/playlist/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vá ao Spotify, clique em "..." na playlist → Compartilhar → Incorporar playlist → Copiar o link do iframe (atributo src)
                </p>
              </div>
              <Button onClick={saveSpotify} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </CardContent>
          </Card>

          {/* Our Story */}
          <Card>
            <CardHeader>
              <CardTitle>Nossa História</CardTitle>
              <CardDescription>
                Escreva a história do casal em duas versões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="him">
                <TabsList className="mb-4">
                  <TabsTrigger value="him">Versão dele</TabsTrigger>
                  <TabsTrigger value="her">Versão dela</TabsTrigger>
                </TabsList>
                <TabsContent value="him">
                  <Textarea
                    value={storyHim}
                    onChange={(e) => setStoryHim(e.target.value)}
                    placeholder="Escreva a versão dele da história do casal..."
                    rows={12}
                  />
                </TabsContent>
                <TabsContent value="her">
                  <Textarea
                    value={storyHer}
                    onChange={(e) => setStoryHer(e.target.value)}
                    placeholder="Escreva a versão dela da história do casal..."
                    rows={12}
                  />
                </TabsContent>
              </Tabs>
              <Button onClick={saveStory} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
