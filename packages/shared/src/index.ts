export interface FileMeta {
  filename: string;
  mime: string;
  size: number;
  createdAt: number;
  downloaded: boolean;
}

export interface UploadResponse {
  id: string;
}

export interface Env {
  PHLEG_BUCKET: R2Bucket;
  ALLOWED_UA_PREFIX: string;
  MAX_FILE_BYTES: number;
}

// R2Bucket type for Cloudflare Workers
export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface R2Object {
  text(): Promise<string>;
  body: ReadableStream | null;
}

export const PHLEG_UA_PREFIX = "phleg-cli";
export const DEFAULT_MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB