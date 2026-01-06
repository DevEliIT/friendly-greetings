import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Page, Persona } from '@/types/blog';
import { PersonaToggle } from '@/components/ui/PersonaToggle';
import { Skeleton } from '@/components/ui/skeleton';

export function OurStory() {
  const [page, setPage] = useState<Page | null>(null);
  const [activePersona, setActivePersona] = useState<Persona>('him');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'nossa-historia')
        .maybeSingle();

      if (!error && data) {
        setPage(data as Page);
      }
      setIsLoading(false);
    }

    fetchPage();
  }, []);

  const content = activePersona === 'him' ? page?.content_him : page?.content_her;
  const hasContent = content && content.trim().length > 0;

  return (
    <section id="nossa-historia" className="bg-card/50 py-16 h-full">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <h2 className="font-display text-3xl font-semibold">Nossa História</h2>
        </div>

        {isLoading ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="mx-auto h-10 w-80" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <PersonaToggle
              activePersona={activePersona}
              onPersonaChange={setActivePersona}
              className="mx-auto mb-8 max-w-md"
            />
            
            <div className="rounded-lg border border-border/50 bg-background p-8">
              {hasContent ? (
                <div 
                  className="prose prose-lg max-w-none text-foreground prose-headings:font-display prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
                />
              ) : (
                <p className="text-center text-muted-foreground italic">
                  {activePersona === 'him' 
                    ? 'A versão dele ainda não foi escrita...' 
                    : 'A versão dela ainda não foi escrita...'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
