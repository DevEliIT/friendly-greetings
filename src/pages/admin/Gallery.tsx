import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { GalleryPhoto } from '@/types/blog';

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('position');

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      setPhotos((data || []) as GalleryPhoto[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

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

      const { error: insertError } = await supabase
        .from('gallery_photos')
        .insert({ url: publicUrl, position: photos.length });

      if (insertError) {
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: insertError.message });
      }
    }

    setUploading(false);
    fetchPhotos();
    toast({ title: 'Fotos adicionadas' });
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

  async function handleDelete() {
    if (!deleteId) return;

    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Foto excluída' });
      fetchPhotos();
    }
    setDeleteId(null);
  }

  return (
    <>
      <Helmet>
        <title>Galeria - Admin</title>
      </Helmet>

      <AdminLayout title="Galeria">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Malu Dormindo</CardTitle>
            <label>
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Adicionar fotos
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : photos.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Nenhuma foto na galeria</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Galeria'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <Input
                      className="mt-2 text-sm"
                      placeholder="Legenda (opcional)"
                      defaultValue={photo.caption || ''}
                      onBlur={(e) => updateCaption(photo.id, e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => setDeleteId(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </>
  );
}
