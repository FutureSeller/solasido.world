import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Execute a D1 query using wrangler CLI (for local development)
 * Includes retry logic for SQLITE_BUSY errors
 */
export async function executeD1Query<T = any>(
  query: string,
  retries = 3
): Promise<T[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { stdout } = await execAsync(
        `pnpm wrangler d1 execute blog-db --local --command="${query.replace(/"/g, '\\"')}" --json`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      const result = JSON.parse(stdout);

      if (Array.isArray(result) && result.length > 0) {
        return result[0].results || [];
      }

      return [];
    } catch (error: any) {
      const isBusyError =
        error.message.includes("SQLITE_BUSY") ||
        error.message.includes("database is locked");

      if (isBusyError && attempt < retries) {
        // Exponential backoff: wait 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error("D1 Query Error:", error.message);
      throw new Error(`Failed to execute D1 query: ${error.message}`);
    }
  }

  return [];
}

/**
 * For production: use Cloudflare D1 binding
 * This will be used when deployed to Cloudflare Pages
 */
export function getD1Binding() {
  // @ts-ignore - This will be available in Cloudflare Workers environment
  return globalThis.DB || null;
}
