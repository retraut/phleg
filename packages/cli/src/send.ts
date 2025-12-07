import fs from "node:fs";
import path from "path";
import fetch from "node-fetch";
import { PHLEG_UA_PREFIX } from "../../shared/src/index";

const PHLEG_ENDPOINT =
  process.env.PHLEG_ENDPOINT || "https://phleg-worker.retraut.workers.dev";
const UA = `${PHLEG_UA_PREFIX}/0.1.0`;

export async function sendFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(1);
    }

    const stats = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const mime = "application/octet-stream"; // Simple mime detection

    const fileStream = fs.createReadStream(filePath);

    const response = await fetch(`${PHLEG_ENDPOINT}/upload`, {
      method: "PUT",
      headers: {
        "User-Agent": UA,
        "Content-Type": mime,
        "Content-Length": stats.size.toString(),
        "x-filename": filename,
        "x-mime": mime,
      },
      body: fileStream,
    });

    if (!response.ok) {
      console.error("Upload failed:", response.statusText);
      process.exit(1);
    }

    const { id } = (await response.json()) as { id: string };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    console.log(`📁 File: ${filename} (${formatFileSize(stats.size)})`);
    console.log(`🔗 Share ID: ${id}`);
    console.log(`⏳ Expires: After first download`);
    console.log(`✅ Upload complete. The Oracle has spoken.`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
