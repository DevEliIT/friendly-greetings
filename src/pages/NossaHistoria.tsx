import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { OurStory } from '@/components/home/OurStory';

export default function NossaHistoria() {
  return (
    <>
      <Helmet>
        <title>Nossa História - Nós Dois</title>
        <meta name="description" content="A história do nosso relacionamento contada por nós dois." />
      </Helmet>

      <MainLayout>
        <div className="py-8 h-full">
          <OurStory />
        </div>
      </MainLayout>
    </>
  );
}