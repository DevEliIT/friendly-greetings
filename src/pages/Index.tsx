import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomeStoriesHighlights } from '@/components/home/HomeStoriesHighlights';
import { OurStory } from '@/components/home/OurStory';
import { SpotifyPlaylist } from '@/components/home/SpotifyPlaylist';
import { HomeGalleryHighlights } from '@/components/home/HomeGalleryHighlights';

export default function Index() {
  return (
    <>
      {/* <Helmet>
        <title>Nós Dois - Blog de Casal</title>
        <meta name="description" content="Um blog de casal onde histórias reais são contadas como notícias, com duas perspectivas diferentes do mesmo momento." />
      </Helmet> */}
      
      <MainLayout>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="animate-fade-up font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Duas versões,<br />
              <span className="text-primary">uma história</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-muted-foreground" style={{ animationDelay: '100ms' }}>
              Cada momento vivido juntos, contado de duas perspectivas. 
              Porque o amor é feito de memórias compartilhadas — e cada um guarda a sua versão.
            </p>
          </div>
          
          {/* Subtle decorative element */}
          <div className="absolute -bottom-24 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </section>

        <HomeStoriesHighlights />
        <OurStory />
        <SpotifyPlaylist />
        <HomeGalleryHighlights />
      </MainLayout>
    </>
  );
}