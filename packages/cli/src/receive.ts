import fs from 'node:fs';
import path from 'path';
import fetch from 'node-fetch';
import { PHLEG_UA_PREFIX } from '@phleg/shared';

const PHLEG_ENDPOINT = process.env.PHLEG_ENDPOINT || 'http://localhost:8787';
const UA = `${PHLEG_UA_PREFIX}/0.1.0`;

export async function receiveFile(code: string) {
  try {
    const response = await fetch(`${PHLEG_ENDPOINT}/file/${code}`, {
      method: 'GET',
      headers: {
        'User-Agent': UA
      }
    });

    if (response.status === 410) {
      console.error('File already downloaded or expired');
      process.exit(1);
    }

    if (!response.ok) {
      console.error('Download failed:', response.statusText);
      process.exit(1);
    }

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition') || '';
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `phleg-${code}`;

    const filePath = path.join(process.cwd(), filename);
    
    // Avoid overwriting existing files
    let finalPath = filePath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const ext = path.extname(filePath);
      const base = path.basename(filePath, ext);
      finalPath = path.join(process.cwd(), `${base}-${counter}${ext}`);
      counter++;
    }

    const fileStream = fs.createWriteStream(finalPath);
    await new Promise<void>((resolve, reject) => {
      response.body?.pipe(fileStream);
      fileStream.on('finish', () => resolve());
      fileStream.on('error', reject);
    });

    console.log(`Saved ${path.basename(finalPath)}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}