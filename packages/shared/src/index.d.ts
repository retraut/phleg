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
export interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<void>;
    delete(key: string): Promise<void>;
}
export interface R2Object {
    text(): Promise<string>;
    body: ReadableStream | null;
}
export declare const PHLEG_UA_PREFIX = "phleg-cli";
export declare const DEFAULT_MAX_FILE_BYTES: number;
