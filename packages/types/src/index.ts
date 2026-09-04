// Shared types for HexaStudio

export type ID = string;

export interface Project {
  id: ID;
  name: string;
  slug: string;
  description?: string;
}

export interface SceneManifest {
  projectId: ID;
  assets: Array<{ url: string; type: string; size?: number }>;
}
