import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Loader2, FolderPlus, Folder, Image, Video, Music, Home, HomeIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { GalleryCategory, GalleryMedia } from '@/types/blog';

export default function Gallery() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  async function fetchData() {
    const [{ data: catData }, { data: mediaData }] = await Promise.all([
      supabase.from('gallery_categories').select('*').order('position'),
      supabase.from('gallery_photos').select('*').order('position'),
    ]);

    if (catData) setCategories(catData as GalleryCategory[]);
    if (mediaData) setMedia(mediaData as GalleryMedia[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || activeCategory === 'all') return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);

      if (uploadError) {
        toast({ variant: 'destructive', title: 'Erro no upload', description: uploadError.message });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' :
                       file.type.startsWith('audio/') ? 'audio' : 'image';

      const { error: insertError } = await supabase
        .from('gallery_photos')
        .insert({ 
          url: publicUrl, 
          position: media.length,
          category_id: activeCategory,
          media_type: mediaType,
        });

      if (insertError) {
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: insertError.message });
      }
    }

    setUploading(false);
    fetchData();
    toast({ title: 'Mídia adicionada' });
  }

  async function updateCaption(id: string, caption: string) {
    const { error } = await supabase
      .from('gallery_photos')
      .update({ caption })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  }

  async function handleDeleteMedia() {
    if (!deleteMediaId) return;

    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', deleteMediaId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Mídia excluída' });
      fetchData();
    }
    setDeleteMediaId(null);
  }

  const [newCategoryShowOnHome, setNewCategoryShowOnHome] = useState(false);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { error } = await supabase
      .from('gallery_categories')
      .insert({ 
        name: newCategoryName, 
        slug,
        position: categories.length,
        show_on_home: newCategoryShowOnHome,
      });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Categoria criada' });
      setNewCategoryName('');
      setNewCategoryShowOnHome(false);
      setShowNewCategory(false);
      fetchData();
    }
  }

  async function toggleCategoryShowOnHome(id: string, currentValue: boolean) {
    const { error } = await supabase
      .from('gallery_categories')
      .update({ show_on_home: !currentValue })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: currentValue ? 'Removido da home' : 'Adicionado à home' });
      fetchData();
    }
  }

  async function handleDeleteCategory() {
    if (!deleteCategoryId) return;

    const category = categories.find(c => c.id === deleteCategoryId);
    if (category?.is_protected) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Esta categoria não pode ser excluída' });
      setDeleteCategoryId(null);
      return;
    }

    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', deleteCategoryId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Categoria excluída' });
      if (activeCategory === deleteCategoryId) {
        setActiveCategory('all');
      }
      fetchData();
    }
    setDeleteCategoryId(null);
  }

  const filteredMedia = activeCategory === 'all' 
    ? media 
    : media.filter(m => m.category_id === activeCategory);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-8 w-8" />;
      case 'audio': return <Music className="h-8 w-8" />;
      default: return <Image className="h-8 w-8" />;
    }
  };

  const renderMediaPreview = (item: GalleryMedia) => {
    if (item.media_type === 'video') {
      return <video src={item.url} className="h-full w-full object-cover" />;
    }
    if (item.media_type === 'audio') {
      return (
        <div className="flex h-full items-center justify-center bg-muted">
          <Music className="h-12 w-12 text-muted-foreground" />
        </div>
      );
    }
    return <img src={item.url} alt={item.caption || 'Galeria'} className="h-full w-full object-cover transition-transform group-hover:scale-105" />;
  };

  return (
    <>
      <Helmet>
        <title>Galeria - Admin</title>
      </Helmet>

      <AdminLayout title="Galeria">
        <div className="space-y-6">
          {/* Categories management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categorias</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowNewCategory(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                  >
                    Todas
                  </Button>
                  {categories.map((cat) => (
                    <div key={cat.id} className="group relative flex items-center gap-1">
                      <Button
                        variant={activeCategory === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(cat.id)}
                        className={cat.is_protected ? '' : 'pr-8'}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {cat.name}
                        {cat.show_on_home && <HomeIcon className="ml-1 h-3 w-3 text-primary" />}
                        {cat.is_protected && <span className="ml-1 text-xs opacity-60">(protegida)</span>}
                      </Button>
                      {!cat.is_protected && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategoryShowOnHome(cat.id, cat.show_on_home);
                            }}
                            title={cat.show_on_home ? 'Remover da home' : 'Mostrar na home'}
                          >
                            <HomeIcon className={`h-3 w-3 ${cat.show_on_home ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCategoryId(cat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {activeCategory === 'all' 
                  ? 'Todas as mídias' 
                  : categories.find(c => c.id === activeCategory)?.name || 'Mídia'}
              </CardTitle>
              {activeCategory !== 'all' && (
                <label>
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Adicionar mídia
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  {activeCategory === 'all' 
                    ? 'Nenhuma mídia na galeria' 
                    : 'Nenhuma mídia nesta categoria. Selecione uma categoria e clique em "Adicionar mídia".'}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border border-border">
                        {renderMediaPreview(item)}
                      </div>
                      <Input
                        className="mt-2 text-sm"
                        placeholder="Descrição (opcional)"
                        defaultValue={item.caption || ''}
                        onBlur={(e) => updateCaption(item.id, e.target.value)}
                      />
                      <div className="absolute left-2 top-2 rounded bg-background/80 p-1">
                        {getMediaIcon(item.media_type)}
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => setDeleteMediaId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete media dialog */}
        <AlertDialog open={!!deleteMediaId} onOpenChange={() => setDeleteMediaId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir mídia?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMedia} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete category dialog */}
        <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as mídias desta categoria também serão excluídas. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New category dialog */}
        <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome da categoria</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Viagens, Aniversários..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showOnHome">Mostrar na página inicial</Label>
                <Switch
                  id="showOnHome"
                  checked={newCategoryShowOnHome}
                  onCheckedChange={setNewCategoryShowOnHome}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCategory(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCategory}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
