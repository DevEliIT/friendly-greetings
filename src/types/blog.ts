export type Persona = 'him' | 'her';

export interface Post {
  id: string;
  title: string;
  cover_url: string | null;
  cover_type: 'image' | 'video';
  author_persona: Persona;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostVersion {
  id: string;
  post_id: string;
  persona: Persona;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video' | 'audio';
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content_him: string | null;
  content_her: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface PostWithVersions extends Post {
  post_versions: PostVersion[];
}
