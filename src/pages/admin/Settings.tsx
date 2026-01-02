import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Save, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
// Helper functions to convert between HEX and HSL
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return '#3b82f6';
  
  const h = parseInt(parts[1]) / 360;
  const s = parseInt(parts[2]) / 100;
  const l = parseInt(parts[3]) / 100;
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface UserPersona {
  user_id: string;
  persona: 'him' | 'her';
  email?: string;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { couple, currentUser } = useTheme();

  // Settings state
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [storyHim, setStoryHim] = useState('');
  const [storyHer, setStoryHer] = useState('');
  
  // Names and colors (stored as HEX for color picker, converted to HSL for saving)
  const [nameHim, setNameHim] = useState('');
  const [nameHer, setNameHer] = useState('');
  const [primaryHimHex, setPrimaryHimHex] = useState('#3b82f6');
  const [secondaryHimHex, setSecondaryHimHex] = useState('#60a5fa');
  const [primaryHerHex, setPrimaryHerHex] = useState('#ec4899');
  const [secondaryHerHex, setSecondaryHerHex] = useState('#f472b6');

  // User personas
  const [userPersonas, setUserPersonas] = useState<UserPersona[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newUserPersona, setNewUserPersona] = useState<'him' | 'her'>('him');
  const [savingPersona, setSavingPersona] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
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
        
        // Convert stored HSL to HEX for color picker
        if (settingsMap['primary_him']) setPrimaryHimHex(hslToHex(settingsMap['primary_him']));
        if (settingsMap['secondary_him']) setSecondaryHimHex(hslToHex(settingsMap['secondary_him']));
        if (settingsMap['primary_her']) setPrimaryHerHex(hslToHex(settingsMap['primary_her']));
        if (settingsMap['secondary_her']) setSecondaryHerHex(hslToHex(settingsMap['secondary_her']));
      }

      const { data: pageData } = await supabase
        .from('pages')
        .select('content_him, content_her')
        .eq('slug', 'nossa-historia')
        .maybeSingle();

      if (pageData) {
        setStoryHim(pageData.content_him || '');
        setStoryHer(pageData.content_her || '');
      }

      // Fetch user personas
      const { data: personasData } = await supabase
        .from('user_personas')
        .select('user_id, persona');

      if (personasData) {
        setUserPersonas(personasData as UserPersona[]);
      }

      // Fetch auth users from edge function
      setLoadingUsers(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const response = await supabase.functions.invoke('list-users', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (response.data?.users) {
            setAuthUsers(response.data.users);
          }
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
      setLoadingUsers(false);

      setLoading(false);
    }

    fetchSettings();
  }, []);

  async function saveUserPersona() {
    if (!selectedUserId) {
      toast({ title: 'Selecione um usuário', variant: 'destructive' });
      return;
    }

    setSavingPersona(true);

    // Check if persona already exists
    const { data: existing } = await supabase
      .from('user_personas')
      .select('id')
      .eq('user_id', selectedUserId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_personas')
        .update({ persona: newUserPersona })
        .eq('user_id', selectedUserId);
    } else {
      const { error } = await supabase
        .from('user_personas')
        .insert({ user_id: selectedUserId, persona: newUserPersona });

      if (error) {
        toast({ title: 'Erro ao associar usuário', description: error.message, variant: 'destructive' });
        setSavingPersona(false);
        return;
      }
    }

    // Refresh list
    const { data: personasData } = await supabase
      .from('user_personas')
      .select('user_id, persona');

    if (personasData) {
      setUserPersonas(personasData as UserPersona[]);
    }

    setSelectedUserId('');
    toast({ title: 'Associação salva' });
    setSavingPersona(false);
  }

  async function removeUserPersona(userId: string) {
    await supabase
      .from('user_personas')
      .delete()
      .eq('user_id', userId);

    setUserPersonas(prev => prev.filter(p => p.user_id !== userId));
    toast({ title: 'Associação removida' });
  }

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
    
    // Convert HEX to HSL before saving
    await Promise.all([
      saveSetting('name_him', nameHim),
      saveSetting('name_her', nameHer),
      saveSetting('primary_him', hexToHsl(primaryHimHex)),
      saveSetting('secondary_him', hexToHsl(secondaryHimHex)),
      saveSetting('primary_her', hexToHsl(primaryHerHex)),
      saveSetting('secondary_her', hexToHsl(secondaryHerHex)),
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
          {/* Current User Info */}
          {currentUser && (
            <Card>
              <CardHeader>
                <CardTitle>Usuário Logado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Você está logado como: <strong className="text-primary">{currentUser.name || 'Sem persona definida'}</strong>
                  {currentUser.persona && <span className="ml-2 text-xs">({currentUser.persona === 'him' ? 'Ele' : 'Ela'})</span>}
                </p>
              </CardContent>
            </Card>
          )}

          {/* User Personas Association */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Associação de Usuários
              </CardTitle>
              <CardDescription>
                Associe usuários às personas (Ele/Ela) para aplicar cores personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="userId">Usuário</Label>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Carregando usuários...</span>
                    </div>
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {authUsers
                          .filter(u => !userPersonas.find(p => p.user_id === u.id))
                          .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="w-32">
                  <Label>Persona</Label>
                  <Select value={newUserPersona} onValueChange={(v) => setNewUserPersona(v as 'him' | 'her')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="him">{nameHim || 'Ele'}</SelectItem>
                      <SelectItem value="her">{nameHer || 'Ela'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={saveUserPersona} disabled={savingPersona || !selectedUserId}>
                    {savingPersona && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Associar
                  </Button>
                </div>
              </div>

              {userPersonas.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Usuários associados:</h4>
                  <div className="space-y-2">
                    {userPersonas.map(up => {
                      const userEmail = authUsers.find(u => u.id === up.user_id)?.email || up.user_id;
                      return (
                        <div key={up.user_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{userEmail}</span>
                            <span className={`text-sm font-medium ${up.persona === 'him' ? 'text-him' : 'text-her'}`}>
                              ({up.persona === 'him' ? (nameHim || 'Ele') : (nameHer || 'Ela')})
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeUserPersona(up.user_id)}>
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                  <h3 className="font-semibold text-him">Ele</h3>
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
                          value={primaryHimHex}
                          onChange={(e) => setPrimaryHimHex(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={primaryHimHex}
                          onChange={(e) => setPrimaryHimHex(e.target.value)}
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
                          value={secondaryHimHex}
                          onChange={(e) => setSecondaryHimHex(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={secondaryHimHex}
                          onChange={(e) => setSecondaryHimHex(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="mt-4 flex gap-2">
                    <div 
                      className="h-8 flex-1 rounded" 
                      style={{ backgroundColor: primaryHimHex }}
                    />
                    <div 
                      className="h-8 flex-1 rounded" 
                      style={{ backgroundColor: secondaryHimHex }}
                    />
                  </div>
                </div>

                {/* Her section */}
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="font-semibold text-her">Ela</h3>
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
                          value={primaryHerHex}
                          onChange={(e) => setPrimaryHerHex(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={primaryHerHex}
                          onChange={(e) => setPrimaryHerHex(e.target.value)}
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
                          value={secondaryHerHex}
                          onChange={(e) => setSecondaryHerHex(e.target.value)}
                          className="h-10 w-16 cursor-pointer p-1"
                        />
                        <Input
                          value={secondaryHerHex}
                          onChange={(e) => setSecondaryHerHex(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="mt-4 flex gap-2">
                    <div 
                      className="h-8 flex-1 rounded" 
                      style={{ backgroundColor: primaryHerHex }}
                    />
                    <div 
                      className="h-8 flex-1 rounded" 
                      style={{ backgroundColor: secondaryHerHex }}
                    />
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
