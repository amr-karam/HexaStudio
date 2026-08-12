export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // Editorial Content (Master Directive Requirement)
  editorial: {
    challenge?: string;
    solution?: string;
    credits?: {
      role: string;
      name: string;
      link?: string;
    }[];
    technicalDetails?: string;
  };

  // Media & Assets
  coverImage: string;
  heroMedia: {
    type: 'image' | 'video' | '3d';
    url: string;
    alt?: string;
  };
  gallery: ProjectMediaAsset[];
  
  // Project Metadata
  category?: Category;
  client?: string;
  architect?: string;
  location?: string;
  year?: number;
  area?: string;
  status?: string;
  
  // Storytelling Engine (Modular Blocks)
  storyBlocks: StoryBlock[];
  
  // Technical/3D Integration
  modelUrl?: string;
  hotspots: ProjectHotspot[];
  
  // Business/Odoo Integration
  milestones?: { total: number; completed: number };
  liveStatus?: ProjectLiveStatus;
  services?: string[];
  
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Assets for the Portfolio Gallery */
export interface ProjectMediaAsset {
  id: string;
  type: 'image' | 'video' | '3d' | 'before_after';
  url: string;
  alt?: string;
  caption?: string;
  beforeUrl?: string; // For before/after sliders
  afterUrl?: string;  // For before/after sliders
  metadata?: Record<string, unknown>;
}

/** Modular Storytelling Blocks (Master Directive Section 5) */
export type StoryBlock = 
  | { type: 'hero'; content: HeroBlockContent }
  | { type: 'text'; content: TextBlockContent }
  | { type: 'image'; content: ImageBlockContent }
  | { type: 'gallery'; content: GalleryBlockContent }
  | { type: 'video'; content: VideoBlockContent }
  | { type: 'quote'; content: QuoteBlockContent }
  | { type: 'stats'; content: StatsBlockContent }
  | { type: 'timeline'; content: TimelineBlockContent }
  | { type: 'comparison'; content: ComparisonBlockContent }
  | { type: 'scene3d'; content: Scene3DBlockContent }
  | { type: 'cta'; content: CTABlockContent };

export interface HeroBlockContent {
  title: string;
  subtitle?: string;
  mediaUrl: string;
  overlayColor?: string;
}

export interface TextBlockContent {
  content: RichTextBlock[];
  alignment: 'left' | 'center' | 'right';
  width: 'full' | 'medium' | 'small';
}

export interface ImageBlockContent {
  url: string;
  alt: string;
  caption?: string;
  layout: 'full' | 'split-left' | 'split-right' | 'grid';
}

export interface GalleryBlockContent {
  assets: ProjectMediaAsset[];
  layout: 'carousel' | 'grid' | 'horizontal-scroll';
}

export interface VideoBlockContent {
  url: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  poster?: string;
}

export interface QuoteBlockContent {
  text: string;
  author: string;
  role: string;
}

export interface StatsBlockContent {
  items: { label: string; value: string }[];
}

export interface TimelineBlockContent {
  events: { date: string; title: string; description: string }[];
}

export interface ComparisonBlockContent {
  beforeUrl: string;
  afterUrl: string;
  labelBefore?: string;
  labelAfter?: string;
}

export interface Scene3DBlockContent {
  modelUrl: string;
  initialCamera: [number, number, number];
  config: Record<string, unknown>;
}

export interface CTABlockContent {
  title: string;
  description: string;
  buttonText: string;
  link: string;
}


/** Live Odoo-derived project status attached to public portfolio responses. */
export interface ProjectLiveStatus {
  stage: string;
  progress: number;
  lastUpdate: string;
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
  phone?: string;
  service?: string;
  budget?: 'under_50k' | '50k_100k' | '100k_500k' | '500k_plus';
  message: string;
}

export interface AuthResponse {
  user: User;
  jwt: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface PushTokenRegistration {
  token: string;
  platform: 'ios' | 'android' | 'web' | string;
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

export interface PageMedia {
  url: string;
  alternativeText?: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: RichTextBlock[];
  excerpt?: string;
  featuredImage?: PageMedia;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PageResponse {
  pages: Page[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Achievement {
  id: number;
  title: string;
  value: string;
  description?: string;
  order: number;
}

export interface AchievementResponse {
  achievements: Achievement[];
  total: number;
}

export type WebhookEvent =
  | 'approval:action'
  | 'annotation:add'
  | 'project:update'
  | 'project:create'
  | 'phase:submit'
  | 'phase:approve'
  | 'phase:reject'
  | 'figma:update'
  | 'figma:comment';

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

// --- Portal Document types ---

export interface PortalDocument {
  id: string;
  projectId: string | number;
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
  signedUrl?: string;
}


export interface Transform3D {
  targetId: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

/** A single keyframe in a camera storyboard animation. */
export interface CameraKeyframe {
  progress: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  rotation?: [number, number, number];
}

/** A sequence of camera keyframes for smooth camera transitions. */
export type CameraStoryboard = CameraKeyframe[];

export * from './odoo';
export * from './workflow';
export * from './lead-qualification';
