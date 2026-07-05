export type {
  ApiResponse,
  Article,
  ArticleResponse,
  AuthResponse,
  Category,
  Project,
  ProjectModel,
  ProjectResponse,
  Service,
  ServiceResponse,
  User,
} from '@hexastudio/types';

/** Frontend-specific view state for 3D scenes. */
export interface SceneViewState {
  isReady: boolean;
  activeHotspotId: string | null;
}
