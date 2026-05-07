import type { AxiosRequestConfig } from "axios";

// ── Core API envelope ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  errors?: ValidationError[];
}

export interface ValidationError {
  path?: string;
  param?: string;
  message?: string;
  msg?: string;
  location?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: ValidationError[];
  data?: Record<string, unknown>;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

export interface IPagination<T> {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: null | number;
  page: number;
  pagingCounter: number;
  prevPage: null | number;
  totalDocs: number;
  totalPages: number;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface IAuth {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Admin profile (from auth service GET /profile/profile) ────────────────────

export interface IAdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  permissions: string[];
  last_login?: string;
  created_at: string;
}

// ── Author ────────────────────────────────────────────────────────────────────

export type AccessLevel = "writer" | "editor" | "admin";

export interface IAuthor {
  _id: string;
  admin_id: string;
  name: string;
  role: string;
  access_level: AccessLevel;
  additional_permissions: string[];
  restricted_permissions: string[];
  post_count: number;
  created_at: string;
  updated_at: string;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export type PostStatus = "draft" | "review" | "scheduled" | "published";

export interface IPostSeo {
  meta_title: string;
  meta_description: string;
}

export interface IEditHistoryEntry {
  admin_id: string;
  name: string;
  action: string;
  at: string;
}

export interface IPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: Record<string, unknown>;
  status: PostStatus;
  category: string;
  tags: string[];
  author: string;
  featured_image: string | null;
  seo: IPostSeo;
  word_count: number;
  read_time: number;
  view_count: number;
  published_at: string | null;
  scheduled_at: string | null;
  edit_history: IEditHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface CreatePostPayload {
  title: string;
  content: Record<string, unknown>;
  category: string;
  tags?: string[];
  excerpt?: string;
  slug?: string;
  featured_image?: string | null;
  seo?: Partial<IPostSeo>;
  scheduled_at?: string | null;
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {}

export interface TransitionStatusPayload {
  status: PostStatus;
  scheduled_at?: string | null;
}

export interface ListPostsQuery {
  page?: number;
  limit?: number;
  status?: PostStatus;
  category?: string;
  author?: string;
  tag?: string;
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface ICategory {
  _id: string;
  slug: string;
  name: string;
  color: string;
  description: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

// ── Tags ──────────────────────────────────────────────────────────────────────

export interface ITag {
  _id: string;
  slug: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagPayload {
  slug: string;
}

export interface IPostStats {
  total_count:        number;
  draft_count:        number;
  review_count:       number;
  scheduled_count:    number;
  published_30d:      number;
  published_prev_30d: number;
  next_scheduled_at:  string | null;
}

export interface IPostListItem extends Omit<IPost, 'category' | 'author' | 'featured_image'> {
  category:       Pick<ICategory, '_id' | 'name' | 'color' | 'slug'> | null;
  author:         Pick<IAuthor,   '_id' | 'name'> | null;
  featured_image: Pick<IMedia,    '_id' | 'url' | 'name' | 'type'> | null;
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface IMedia {
  _id: string;
  name: string;
  type: string;
  url: string;
  public_id: string;
  size: number;
  uploaded_by: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListMediaQuery {
  page?: number;
  limit?: number;
}
