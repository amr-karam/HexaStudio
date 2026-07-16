export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  category?: Category;
  modelUrl?: string;
  hotspots: ProjectHotspot[];
  client?: string;
  location?: string;
  year?: number;
  area?: string;
  status?: string;
  services?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectModel {
  url: string;
  format: 'glb' | 'gltf';
  version: string;
  compressed: boolean;
}

export interface ProjectHotspot {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  _enrichmentError?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'editor' | 'user';
}

/** Strapi rich text / dynamic zone block. */
export interface RichTextBlock {
  type: string;
  children?: RichTextBlock[];
  text?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: RichTextBlock[];
  coverImage: string;
  category?: Category;
  author: string;
  readTime: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  features: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactMessage {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export interface AuthResponse {
  user: User;
  jwt: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface VectorEmbedding {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
  score: number;
}

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
  filter?: Record<string, unknown>;
}

export interface SemanticSearchResponse {
  results: VectorEmbedding[];
  total: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientCompany?: string;
  clientRole?: string;
  content: string;
  rating: number;
  projectReference?: string;
  avatar?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialResponse {
  testimonials: Testimonial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  department?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedIn?: string;
  skills: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  teamMembers: TeamMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: RichTextBlock[];
  category?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQResponse {
  faqs: FAQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type WebhookEvent =
  | 'approval:action'
  | 'annotation:add'
  | 'project:update'
  | 'project:create'
  | 'phase:submit'
  | 'phase:approve'
  | 'phase:reject';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  active: boolean;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  secret?: string;
  active?: boolean;
  headers?: Record<string, string>;
}
