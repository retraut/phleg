import { FileMeta, Env, PHLEG_UA_PREFIX } from '@phleg/shared';

export { generateId, assertPhlegUA };

export function assertPhlegUA(request: Request, env: Env): Response | null {
  const ua = request.headers.get('user-agent') || '';
  if (!ua.startsWith(env.ALLOWED_UA_PREFIX || PHLEG_UA_PREFIX)) {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}

export function generateId(): string {
  return crypto.randomUUID().slice(0, 8);
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const uaCheck = assertPhlegUA(request, env);
  if (uaCheck) return uaCheck;

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > (env.MAX_FILE_BYTES || 104857600)) {
    return new Response('File too large', { status: 413 });
  }

  const filename = request.headers.get('x-filename') || 'unknown';
  const mime = request.headers.get('x-mime') || 'application/octet-stream';
  
  try {
    const body = await request.arrayBuffer();
    const id = generateId();
    
    const meta: FileMeta = {
      filename,
      mime,
      size: body.byteLength,
      createdAt: Date.now(),
      downloaded: false
    };

    await env.PHLEG_BUCKET.put(`files/${id}`, body);
    await env.PHLEG_BUCKET.put(`meta/${id}`, JSON.stringify(meta));

    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Upload failed', { status: 500 });
  }
}

async function handleDownload(request: Request, env: Env): Promise<Response> {
  const uaCheck = assertPhlegUA(request, env);
  if (uaCheck) return uaCheck;

  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id) {
    return new Response('Invalid file ID', { status: 400 });
  }

  try {
    const metaObj = await env.PHLEG_BUCKET.get(`meta/${id}`);
    if (!metaObj) {
      return new Response('File not found', { status: 404 });
    }

    const meta: FileMeta = JSON.parse(await metaObj.text());
    if (meta.downloaded) {
      return new Response('File already downloaded', { status: 410 });
    }

    const fileObj = await env.PHLEG_BUCKET.get(`files/${id}`);
    if (!fileObj) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers({
      'Content-Type': meta.mime,
      'Content-Disposition': `attachment; filename="${meta.filename}"`,
      'Content-Length': meta.size.toString()
    });

    // Mark as downloaded and cleanup
    meta.downloaded = true;
    await env.PHLEG_BUCKET.put(`meta/${id}`, JSON.stringify(meta));
    
    // Delete files after successful download
    setTimeout(async () => {
      await env.PHLEG_BUCKET.delete(`files/${id}`);
      await env.PHLEG_BUCKET.delete(`meta/${id}`);
    }, 100);

    return new Response(fileObj.body, { headers });
  } catch (error) {
    return new Response('Download failed', { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/upload':
        if (request.method !== 'PUT') {
          return new Response('Method not allowed', { status: 405 });
        }
        return handleUpload(request, env);
      
      case '/health':
        return new Response('OK');
      
      default:
        if (url.pathname.startsWith('/file/') && request.method === 'GET') {
          return handleDownload(request, env);
        }
        return new Response('Not found', { status: 404 });
    }
  }
};