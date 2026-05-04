export type PostStatus = 'draft' | 'review' | 'scheduled' | 'published';
export type MediaType = 'PNG' | 'JPG' | 'SVG' | 'MP4';

export interface AdminPost {
  id: string;
  title: string;
  cat: string;
  status: PostStatus;
  tags: string[];
  words: number;
  views: string;
  editedBy: string;
  editedAt: string;
  publishedAt?: string;
  scheduled?: string;
}

export interface AdminMedia {
  id: string;
  name: string;
  type: MediaType;
  w: number;
  h: number;
  size: string;
  hue: number;
  used: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface StatusMeta {
  dot: string;
  label: string;
  chip: string;
}
