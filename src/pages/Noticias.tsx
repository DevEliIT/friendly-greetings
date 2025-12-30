import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Newspaper, User, Search, MapPin, Calendar, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/blog';
import { MainLayout } from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function Noticias() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Extract unique locations for suggestions
  const uniqueLocations = useMemo(() => {
    const locations = posts
      .map(p => p.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locations)].sort();
  }, [posts]);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('story_date', { ascending: false, nullsFirst: false });

      if (!error && data) {
        setPosts(data as Post[]);
      }
      setIsLoading(false);
    }

    fetchPosts();
  }, []);

  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search query - match title or location
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesLocation = post.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation) return false;
      }

      // Location filter
      if (locationFilter && post.location !== locationFilter) {
        return false;
      }

      // Date range filter
      if (dateFrom && post.story_date) {
        const storyDate = new Date(post.story_date);
        if (storyDate < dateFrom) return false;
      }

      if (dateTo && post.story_date) {
        const storyDate = new Date(post.story_date);
        if (storyDate > dateTo) return false;
      }

      return true;
    });
  }, [posts, searchQuery, locationFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasFilters = searchQuery || locationFilter || dateFrom || dateTo;

  return (
    <>
      <Helmet>
        <title>Vivências - Nós Dois</title>
        <meta name="description" content="Todas as histórias do nosso relacionamento contadas de duas perspectivas." />
      </Helmet>

      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center gap-3">
            <Newspaper className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl font-semibold">Tudo o que já vivemos</h1>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap gap-3">
              {/* Location filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    {locationFilter || 'Local'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setLocationFilter('')}
                    >
                      Todos os locais
                    </Button>
                    {uniqueLocations.map((loc) => (
                      <Button
                        key={loc}
                        variant={locationFilter === loc ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setLocationFilter(loc)}
                      >
                        {loc}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date from */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Data inicial'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Date to */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Data final'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              )}
            </div>

            {/* Active filters badges */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Busca: {searchQuery}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
                {locationFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Local: {locationFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocationFilter('')} />
                  </Badge>
                )}
                {dateFrom && (
                  <Badge variant="secondary" className="gap-1">
                    De: {format(dateFrom, 'dd/MM/yyyy')}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFrom(undefined)} />
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="secondary" className="gap-1">
                    Até: {format(dateTo, 'dd/MM/yyyy')}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setDateTo(undefined)} />
                  </Badge>
                )}
              </div>
            )}
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
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                {hasFilters ? 'Nenhuma história encontrada com os filtros selecionados.' : 'Nenhuma história publicada ainda.'}
              </p>
              {hasFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
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
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.story_date 
                            ? format(new Date(post.story_date), "d 'de' MMMM, yyyy", { locale: ptBR })
                            : format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })
                          }
                        </span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span>{post.author_persona === 'him' ? 'Ele' : 'Ela'}</span>
                        </div>
                      </div>
                      {post.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{post.location}</span>
                        </div>
                      )}
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
