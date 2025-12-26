import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, User, Calendar, Play, Pause, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Post, PostVersion, PostMedia, Persona } from '@/types/blog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PersonaToggle } from '@/components/ui/PersonaToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function Story() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [activePersona, setActivePersona] = useState<Persona>('him');
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      const [postRes, versionsRes, mediaRes] = await Promise.all([
        supabase.from('posts').select('*').eq('id', id).eq('is_published', true).maybeSingle(),
        supabase.from('post_versions').select('*').eq('post_id', id),
        supabase.from('post_media').select('*').eq('post_id', id).order('position', { ascending: true }),
      ]);

      if (postRes.data) setPost(postRes.data as Post);
      if (versionsRes.data) setVersions(versionsRes.data as PostVersion[]);
      if (mediaRes.data) setMedia(mediaRes.data as PostMedia[]);
      
      setIsLoading(false);
    }

    fetchPost();
  }, [id]);

  const currentVersion = versions.find(v => v.persona === activePersona);
  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');
  const audios = media.filter(m => m.media_type === 'audio');

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <Skeleton className="mb-8 h-8 w-32" />
            <Skeleton className="mb-4 h-12 w-3/4" />
            <Skeleton className="mb-8 h-6 w-48" />
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
            <h1 className="font-display text-3xl font-semibold">História não encontrada</h1>
            <p className="mt-4 text-muted-foreground">Esta história não existe ou não foi publicada.</p>
            <Link to="/">
              <Button variant="outline" className="mt-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Nós Dois</title>
        <meta name="description" content={`${post.title} - Uma história contada por ${post.author_persona === 'him' ? 'ele' : 'ela'}`} />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <article className="container mx-auto max-w-4xl px-4 py-12">
            {/* Back button */}
            <Link 
              to="/" 
              className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar às notícias
            </Link>

            {/* Title and meta */}
            <header className="mb-8">
              <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Cadastrado por {post.author_persona === 'him' ? 'ele' : 'ela'}</span>
                </div>
              </div>
            </header>

            {/* Cover */}
            {post.cover_url && (
              <div className="mb-10 overflow-hidden rounded-xl border border-border/50">
                {post.cover_type === 'video' ? (
                  <video
                    src={post.cover_url}
                    controls
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Version toggle */}
            <PersonaToggle
              activePersona={activePersona}
              onPersonaChange={setActivePersona}
              className="mx-auto mb-10 max-w-md"
            />

            {/* Content */}
            <div className="rounded-xl border border-border/50 bg-card p-8 md:p-12">
              {currentVersion?.content ? (
                <div 
                  className="prose prose-lg max-w-none text-foreground prose-headings:font-display prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentVersion.content.replace(/\n/g, '<br/>') }}
                />
              ) : (
                <p className="text-center text-muted-foreground italic">
                  {activePersona === 'him' 
                    ? 'A versão dele ainda não foi escrita...' 
                    : 'A versão dela ainda não foi escrita...'}
                </p>
              )}
            </div>

            {/* Media gallery */}
            {(images.length > 0 || videos.length > 0 || audios.length > 0) && (
              <section className="mt-12">
                <h2 className="mb-6 font-display text-2xl font-semibold">Mídia</h2>

                {/* Images */}
                {images.length > 0 && (
                  <div className="mb-8 grid gap-4 md:grid-cols-2">
                    {images.map((img) => (
                      <figure key={img.id} className="overflow-hidden rounded-lg border border-border/50">
                        <img
                          src={img.url}
                          alt={img.caption || 'Foto'}
                          className="w-full object-cover"
                          loading="lazy"
                        />
                        {img.caption && (
                          <figcaption className="bg-card p-3 text-sm text-muted-foreground">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div className="mb-8 space-y-4">
                    {videos.map((vid) => (
                      <figure key={vid.id} className="overflow-hidden rounded-lg border border-border/50">
                        <video
                          src={vid.url}
                          controls
                          className="w-full"
                        />
                        {vid.caption && (
                          <figcaption className="bg-card p-3 text-sm text-muted-foreground">
                            {vid.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {/* Audios */}
                {audios.length > 0 && (
                  <div className="space-y-3">
                    {audios.map((aud) => (
                      <div key={aud.id} className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4">
                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                        <audio src={aud.url} controls className="flex-1" />
                        {aud.caption && (
                          <span className="text-sm text-muted-foreground">{aud.caption}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
