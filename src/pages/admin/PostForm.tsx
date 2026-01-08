import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Upload, X, Plus, Trash2, CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import type { Persona, PostMedia } from '@/types/blog';

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useTheme();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [authorPersona, setAuthorPersona] = useState<Persona | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverType, setCoverType] = useState<'image' | 'video'>('image');
  const [contentHim, setContentHim] = useState('');
  const [contentHer, setContentHer] = useState('');
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [storyDate, setStoryDate] = useState<Date | undefined>();
  const [location, setLocation] = useState('');

  // Auto-select author based on logged user's persona (only for new posts)
  useEffect(() => {
    if (!isEditing && currentUser?.persona && authorPersona === null) {
      setAuthorPersona(currentUser.persona);
    }
  }, [currentUser, isEditing, authorPersona]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  async function fetchPost() {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      toast({ variant: 'destructive', title: 'Erro ao carregar', description: postError?.message });
      navigate('/admin/historias');
      return;
    }

    setTitle(post.title);
    setAuthorPersona(post.author_persona as Persona);
    setIsPublished(post.is_published || false);
    setCoverUrl(post.cover_url);
    setCoverType((post.cover_type as 'image' | 'video') || 'image');
    setStoryDate(post.story_date ? new Date(post.story_date) : undefined);
    setLocation(post.location || '');

    // Fetch versions
    const { data: versions } = await supabase
      .from('post_versions')
      .select('*')
      .eq('post_id', id);

    if (versions) {
      const himVersion = versions.find((v) => v.persona === 'him');
      const herVersion = versions.find((v) => v.persona === 'her');
      setContentHim(himVersion?.content || '');
      setContentHer(herVersion?.content || '');
    }

    // Fetch media
    const { data: mediaData } = await supabase
      .from('post_media')
      .select('*')
      .eq('post_id', id)
      .order('position');

    if (mediaData) {
      setMedia(mediaData as PostMedia[]);
    }

    setLoading(false);
  }

  async function uploadFile(file: File, bucket: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: error.message });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const isVideo = file.type.startsWith('video/');
    const url = await uploadFile(file, 'covers');
    
    if (url) {
      setCoverUrl(url);
      setCoverType(isVideo ? 'video' : 'image');
    }
    setUploading(false);
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, 'post-media');
      if (url) {
        const mediaType = file.type.startsWith('video/') ? 'video' : 
                         file.type.startsWith('audio/') ? 'audio' : 'image';
        
        setMedia((prev) => [...prev, {
          id: `temp-${Date.now()}-${Math.random()}`,
          post_id: id || '',
          url,
          media_type: mediaType,
          caption: null,
          position: prev.length,
          created_at: new Date().toISOString(),
        }]);
      }
    }
    setUploading(false);
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Título obrigatório' });
      return;
    }

    setSaving(true);

    try {
      let postId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update({
            title,
            author_persona: authorPersona,
            is_published: isPublished,
            cover_url: coverUrl,
            cover_type: coverType,
            story_date: storyDate ? format(storyDate, 'yyyy-MM-dd') : null,
            location: location || null,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            title,
            author_persona: authorPersona,
            is_published: isPublished,
            cover_url: coverUrl,
            cover_type: coverType,
            story_date: storyDate ? format(storyDate, 'yyyy-MM-dd') : null,
            location: location || null,
          })
          .select()
          .single();

        if (error) throw error;
        postId = data.id;
      }

      // Upsert versions
      if (postId) {
        // Delete existing versions and recreate
        await supabase.from('post_versions').delete().eq('post_id', postId);
        
        await supabase.from('post_versions').insert([
          { post_id: postId, persona: 'him', content: contentHim },
          { post_id: postId, persona: 'her', content: contentHer },
        ]);

        // Handle media - also copy NEW media to gallery "Notícias Postadas" category
        // Filter out new media (those with temp IDs)
        const newMedia = media.filter((m) => m.id.startsWith('temp-'));
        const existingMedia = media.filter((m) => !m.id.startsWith('temp-'));

        // Delete media that was removed
        if (isEditing) {
          const existingIds = existingMedia.map((m) => m.id);
          if (existingIds.length > 0) {
            await supabase
              .from('post_media')
              .delete()
              .eq('post_id', postId)
              .not('id', 'in', `(${existingIds.join(',')})`);
          } else {
            await supabase.from('post_media').delete().eq('post_id', postId);
          }

          // Update positions of existing media
          for (let i = 0; i < existingMedia.length; i++) {
            await supabase
              .from('post_media')
              .update({ position: i })
              .eq('id', existingMedia[i].id);
          }
        }

        // Insert only new media
        if (newMedia.length > 0) {
          await supabase.from('post_media').insert(
            newMedia.map((m, i) => ({
              post_id: postId,
              url: m.url,
              media_type: m.media_type,
              caption: m.caption,
              position: existingMedia.length + i,
            }))
          );

          // Get the "Notícias Postadas" category - only add NEW media to gallery
          const { data: newsCategory } = await supabase
            .from('gallery_categories')
            .select('id')
            .eq('slug', 'noticias-postadas')
            .maybeSingle();

          if (newsCategory) {
            // Add only NEW media to gallery under the news category
            await supabase.from('gallery_photos').insert(
              newMedia.map((m, i) => ({
                url: m.url,
                media_type: m.media_type,
                caption: m.caption || title,
                position: i,
                category_id: newsCategory.id,
              }))
            );
          }
        } else if (!isEditing && media.length > 0) {
          // For new posts, insert all media
          await supabase.from('post_media').insert(
            media.map((m, i) => ({
              post_id: postId,
              url: m.url,
              media_type: m.media_type,
              caption: m.caption,
              position: i,
            }))
          );

          const { data: newsCategory } = await supabase
            .from('gallery_categories')
            .select('id')
            .eq('slug', 'noticias-postadas')
            .maybeSingle();

          if (newsCategory) {
            await supabase.from('gallery_photos').insert(
              media.map((m, i) => ({
                url: m.url,
                media_type: m.media_type,
                caption: m.caption || title,
                position: i,
                category_id: newsCategory.id,
              }))
            );
          }
        }
      }

      toast({ title: isEditing ? 'História atualizada' : 'História criada' });
      navigate('/admin/historias');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Editar História' : 'Nova História'}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar História' : 'Nova História'} - Admin</title>
      </Helmet>

      <AdminLayout title={isEditing ? 'Editar História' : 'Nova História'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da história"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Select value={authorPersona || 'him'} onValueChange={(v) => setAuthorPersona(v as Persona)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="him">Ele</SelectItem>
                      <SelectItem value="her">Ela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-md border border-input p-3">
                  <Label htmlFor="published" className="cursor-pointer">Publicado</Label>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </div>

              {/* Story date and location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data da história</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !storyDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {storyDate ? format(storyDate, "d 'de' MMMM, yyyy", { locale: ptBR }) : 'Selecionar data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={storyDate}
                        onSelect={setStoryDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Fortaleza, CE"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover */}
          <Card>
            <CardHeader>
              <CardTitle>Capa</CardTitle>
            </CardHeader>
            <CardContent>
              {coverUrl ? (
                <div className="relative aspect-video max-w-md overflow-hidden rounded-lg">
                  {coverType === 'video' ? (
                    <video src={coverUrl} controls className="h-full w-full object-cover" />
                  ) : (
                    <img src={coverUrl} alt="Capa" className="h-full w-full object-cover" />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setCoverUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex aspect-video max-w-md cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50">
                  <div className="text-center">
                    {uploading ? (
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Clique para enviar imagem ou vídeo</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Content versions */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="him">
                <TabsList className="mb-4">
                  <TabsTrigger value="him">Versão dele</TabsTrigger>
                  <TabsTrigger value="her">Versão dela</TabsTrigger>
                </TabsList>
                <TabsContent value="him">
                  <Textarea
                    value={contentHim}
                    onChange={(e) => setContentHim(e.target.value)}
                    placeholder="Escreva a versão dele da história..."
                    rows={10}
                  />
                </TabsContent>
                <TabsContent value="her">
                  <Textarea
                    value={contentHer}
                    onChange={(e) => setContentHer(e.target.value)}
                    placeholder="Escreva a versão dela da história..."
                    rows={10}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Media gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mídia</CardTitle>
              <label>
                <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Adicionar
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaUpload}
                  disabled={uploading}
                />
              </label>
            </CardHeader>
            <CardContent>
              {media.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Nenhuma mídia adicionada</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {media.map((item, index) => (
                    <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                      {item.media_type === 'video' ? (
                        <video src={item.url} className="h-full w-full object-cover" />
                      ) : item.media_type === 'audio' ? (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-2xl">🎵</span>
                        </div>
                      ) : (
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeMedia(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar alterações' : 'Criar história'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/historias')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
