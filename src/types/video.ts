export interface VideoFile {
  id: string;
  name: string;
  url: string;
  file: File;
  duration?: number;
  thumbnail?: string;
}
