import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type { Post } from '@/types/blog';

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar histórias', description: error.message });
    } else {
      setPosts((data || []) as Post[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function togglePublish(post: Post) {
    const { error } = await supabase
      .from('posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: post.is_published ? 'História despublicada' : 'História publicada' });
      fetchPosts();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    // Delete related records first
    await supabase.from('post_media').delete().eq('post_id', deleteId);
    await supabase.from('post_versions').delete().eq('post_id', deleteId);
    
    const { error } = await supabase.from('posts').delete().eq('id', deleteId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'História excluída' });
      fetchPosts();
    }
    setDeleteId(null);
  }

  return (
    <>
      <Helmet>
        <title>Histórias - Admin</title>
      </Helmet>

      <AdminLayout title="Histórias">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">Gerencie as histórias do blog</p>
          <Button asChild>
            <Link to="/admin/historias/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova História
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Carregando...</div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma história criada ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  {post.cover_url && (
                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      {post.cover_type === 'video' ? (
                        <video src={post.cover_url} className="h-full w-full object-cover" />
                      ) : (
                        <img src={post.cover_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold">{post.title}</h3>
                      <Badge variant={post.is_published ? 'default' : 'secondary'}>
                        {post.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Por {post.author_persona === 'him' ? 'Ele' : 'Ela'} • {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(post)}
                      title={post.is_published ? 'Despublicar' : 'Publicar'}
                    >
                      {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/historias/${post.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir história?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A história e todo o conteúdo relacionado serão excluídos permanentemente.
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
