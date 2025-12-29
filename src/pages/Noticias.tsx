import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Newspaper, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/blog';
import { MainLayout } from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function Noticias() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data as Post[]);
      }
      setIsLoading(false);
    }

    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Notícias - Nós Dois</title>
        <meta name="description" content="Todas as histórias do nosso relacionamento contadas de duas perspectivas." />
      </Helmet>

      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center gap-3">
            <Newspaper className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl font-semibold">Todas as Notícias</h1>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">Nenhuma história publicada ainda.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/historia/${post.id}`}
                  className="group overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {post.cover_url ? (
                      post.cover_type === 'video' ? (
                        <video
                          src={post.cover_url}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          muted
                        />
                      ) : (
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold leading-tight group-hover:text-primary">
                      {post.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author_persona === 'him' ? 'Ele' : 'Ela'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}