import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Image, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  galleryPhotos: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, galleryPhotos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [postsResult, publishedResult, galleryResult] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('gallery_photos').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalPosts: postsResult.count || 0,
        publishedPosts: publishedResult.count || 0,
        galleryPhotos: galleryResult.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total de Histórias', value: stats.totalPosts, icon: FileText },
    { title: 'Histórias Publicadas', value: stats.publishedPosts, icon: Eye },
    { title: 'Fotos na Galeria', value: stats.galleryPhotos, icon: Image },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin</title>
      </Helmet>

      <AdminLayout title="Dashboard">
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bem-vindo à área administrativa</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>Use o menu lateral para gerenciar o conteúdo do blog:</p>
              <ul className="mt-4 list-inside list-disc space-y-2">
                <li><strong>Histórias</strong> - Criar, editar e publicar histórias</li>
                <li><strong>Galeria</strong> - Gerenciar fotos da galeria "Malu Dormindo"</li>
                <li><strong>Configurações</strong> - Atualizar "Nossa História" e playlist do Spotify</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
