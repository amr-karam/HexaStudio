export interface UploadMetadata {
  id: number;
  projectId: number;
  taskId: number | null;
  filename: string;
  key: string;
  mimetype: string;
  description: string;
  uploadedBy: string;
  timestamp: string;
  bucket: string;
}
