import { PHLEG_UA_PREFIX } from '@phleg/shared';
export function assertPhlegUA(request, env) {
    const ua = request.headers.get('user-agent') || '';
    if (!ua.startsWith(env.ALLOWED_UA_PREFIX || PHLEG_UA_PREFIX)) {
        return new Response('Forbidden', { status: 403 });
    }
    return null;
}
async function handleUpload(request, env) {
    const uaCheck = assertPhlegUA(request, env);
    if (uaCheck)
        return uaCheck;
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > (env.MAX_FILE_BYTES || 104857600)) {
        return new Response('File too large', { status: 413 });
    }
    const filename = request.headers.get('x-filename') || 'unknown';
    const mime = request.headers.get('x-mime') || 'application/octet-stream';
    try {
        const body = await request.arrayBuffer();
        const id = crypto.randomUUID().slice(0, 8);
        const meta = {
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
    }
    catch (error) {
        return new Response('Upload failed', { status: 500 });
    }
}
async function handleDownload(request, env, ctx) {
    const uaCheck = assertPhlegUA(request, env);
    if (uaCheck)
        return uaCheck;
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
        const meta = JSON.parse(await metaObj.text());
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
        // Mark as downloaded
        meta.downloaded = true;
        await env.PHLEG_BUCKET.put(`meta/${id}`, JSON.stringify(meta));
        // Create a transform stream to delete file after download completes
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        // Start streaming the file
        if (fileObj.body) {
            fileObj.body.pipeTo(writable).catch(error => {
                console.error(`❌ Stream error for ${id}:`, error);
            });
        }
        // Delete file after stream completes
        writer.closed.then(async () => {
            try {
                console.log(`📥 Download completed for ${id}, deleting files...`);
                await env.PHLEG_BUCKET.delete(`files/${id}`);
                await env.PHLEG_BUCKET.delete(`meta/${id}`);
                console.log(`✅ File ${id} deleted successfully from R2`);
            }
            catch (error) {
                console.error(`❌ Failed to delete file ${id}:`, error);
            }
        }).catch(error => {
            console.error(`❌ Writer closed with error for ${id}:`, error);
        });
        return new Response(readable, { headers });
    }
    catch (error) {
        return new Response('Download failed', { status: 500 });
    }
}
export default {
    async fetch(request, env, ctx) {
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
                    return handleDownload(request, env, ctx);
                }
                return new Response('Not found', { status: 404 });
        }
    }
};
