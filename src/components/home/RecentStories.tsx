import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Newspaper, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentStories() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setPosts(data as Post[]);
      }
      setIsLoading(false);
    }

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Notícias mais recentes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-accent" />
            <h2 className="font-display text-3xl font-semibold">Notícias mais recentes</h2>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">Nenhuma história publicada ainda.</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Em breve teremos novidades!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-accent" />
          <h2 className="font-display text-3xl font-semibold">Notícias mais recentes</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/historia/${post.id}`}
              className="group overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
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
      </div>
    </section>
  );
}
