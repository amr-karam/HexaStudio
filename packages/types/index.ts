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
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'editor' | 'user';
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: unknown[];
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
