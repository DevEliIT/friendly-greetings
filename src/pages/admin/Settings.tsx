import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Save, Palette, User } from 'lucide-react';
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
  
  // Names and colors
  const [nameHim, setNameHim] = useState('');
  const [nameHer, setNameHer] = useState('');
  const [primaryHim, setPrimaryHim] = useState('#3b82f6');
  const [secondaryHim, setSecondaryHim] = useState('#60a5fa');
  const [primaryHer, setPrimaryHer] = useState('#ec4899');
  const [secondaryHer, setSecondaryHer] = useState('#f472b6');

  useEffect(() => {
    async function fetchSettings() {
      // Fetch all settings at once
      const { data: settingsData } = await supabase
        .from('settings')
        .select('key, value');

      if (settingsData) {
        const settingsMap: Record<string, string> = {};
        settingsData.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });

        setSpotifyUrl(settingsMap['spotify_playlist_url'] || '');
        setNameHim(settingsMap['name_him'] || '');
        setNameHer(settingsMap['name_her'] || '');
        setPrimaryHim(settingsMap['primary_him'] || '#3b82f6');
        setSecondaryHim(settingsMap['secondary_him'] || '#60a5fa');
        setPrimaryHer(settingsMap['primary_her'] || '#ec4899');
        setSecondaryHer(settingsMap['secondary_her'] || '#f472b6');
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

  async function saveSetting(key: string, value: string) {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('settings')
        .update({ value })
        .eq('key', key);
    } else {
      await supabase
        .from('settings')
        .insert({ key, value });
    }
  }

  async function saveSpotify() {
    setSaving(true);
    await saveSetting('spotify_playlist_url', spotifyUrl);
    toast({ title: 'Playlist salva' });
    setSaving(false);
  }

  async function saveNamesAndColors() {
    setSaving(true);
    
    await Promise.all([
      saveSetting('name_him', nameHim),
      saveSetting('name_her', nameHer),
      saveSetting('primary_him', primaryHim),
      saveSetting('secondary_him', secondaryHim),
      saveSetting('primary_her', primaryHer),
      saveSetting('secondary_her', secondaryHer),
    ]);

    toast({ title: 'Nomes e cores salvos' });
    setSaving(false);
    
    // Reload page to apply new colors
    window.location.reload();
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
          {/* Names and Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Nomes e Cores
              </CardTitle>
              <CardDescription>
                Configure os nomes e a paleta de cores para ele e ela
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Him section */}
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="font-semibold">Ele</h3>
                  <div className="space-y-2">
                    <Label htmlFor="nameHim">Nome</Label>
                    <Input
                      id="nameHim"
                      value={nameHim}
                      onChange={(e) => setNameHim(e.target.value)}
                      placeholder="Nome dele"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryHim">Cor primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryHim"
                          type="color"
                          value={primaryHim}
                          onChange={(e) => setPrimaryHim(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={primaryHim}
                          onChange={(e) => setPrimaryHim(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryHim">Cor secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryHim"
                          type="color"
                          value={secondaryHim}
                          onChange={(e) => setSecondaryHim(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={secondaryHim}
                          onChange={(e) => setSecondaryHim(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Her section */}
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="font-semibold">Ela</h3>
                  <div className="space-y-2">
                    <Label htmlFor="nameHer">Nome</Label>
                    <Input
                      id="nameHer"
                      value={nameHer}
                      onChange={(e) => setNameHer(e.target.value)}
                      placeholder="Nome dela"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryHer">Cor primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryHer"
                          type="color"
                          value={primaryHer}
                          onChange={(e) => setPrimaryHer(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={primaryHer}
                          onChange={(e) => setPrimaryHer(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryHer">Cor secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryHer"
                          type="color"
                          value={secondaryHer}
                          onChange={(e) => setSecondaryHer(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={secondaryHer}
                          onChange={(e) => setSecondaryHer(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={saveNamesAndColors} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar nomes e cores
              </Button>
            </CardContent>
          </Card>

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
