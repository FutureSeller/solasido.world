import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { gzipSync } from "node:zlib";
import { Client } from "@notionhq/client";
import { config } from "dotenv";
import { NotionToMarkdown } from "notion-to-md";

config({ path: ".env.local" });

const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "solasido-static-assets";
const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL || "https://static-images.solasido.world";
const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

interface NotionCover {
  type?: string;
  external?: { url?: string };
  file?: { url?: string };
}

interface NotionPage {
  id: string;
  created_time: string;
  properties: Record<string, unknown>;
  cover?: NotionCover | null;
}

async function queryDatabase(startCursor?: string) {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractTitle(page: NotionPage): string {
  for (const value of Object.values(page.properties)) {
    if (!isRecord(value)) continue;
    if (value.type !== "title" || !Array.isArray(value.title)) continue;

    const first = value.title[0];
    if (!isRecord(first) || typeof first.plain_text !== "string") continue;
    return first.plain_text;
  }

  return "Untitled";
}

function extractTags(page: NotionPage): string[] {
  const tags: string[] = [];

  for (const value of Object.values(page.properties)) {
    if (!isRecord(value)) continue;
    if (value.type !== "multi_select" || !Array.isArray(value.multi_select)) {
      continue;
    }

    for (const tag of value.multi_select) {
      if (!isRecord(tag) || typeof tag.name !== "string") continue;
      tags.push(tag.name);
    }
  }

  return tags;
}

function extractCoverUrl(page: NotionPage): string | null {
  const cover = page.cover;
  if (!cover) return null;
  if (cover.type === "external" && cover.external?.url)
    return cover.external.url;
  if (cover.type === "file" && cover.file?.url) return cover.file.url;
  return null;
}

function toSafeExt(contentType: string, url: string): string {
  const contentTypeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };

  const fromContentType = contentTypeMap[contentType.toLowerCase()];
  if (fromContentType) return fromContentType;

  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })();
  const ext = extname(path).toLowerCase().replace(".", "");
  if (ext) return ext;

  return "jpg";
}

function buildR2Key(buffer: Buffer, ext: string): string {
  const hash = createHash("sha256").update(buffer).digest("hex");
  return `blog/${hash.slice(0, 2)}/${hash}.${ext}`;
}

function runR2Put(filePath: string, key: string, contentType: string) {
  execFileSync(
    "pnpm",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `${R2_BUCKET_NAME}/${key}`,
      "--file",
      filePath,
      "--content-type",
      contentType,
      "--remote",
    ],
    { stdio: "pipe" },
  );
}

function findMarkdownImageUrls(content: string): string[] {
  const urls = new Set<string>();
  const markdownImageRegex =
    /!\[[^\]]*]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImageRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/g;

  for (const match of content.matchAll(markdownImageRegex)) {
    if (match[1]) urls.add(match[1]);
  }

  for (const match of content.matchAll(htmlImageRegex)) {
    if (match[1]) urls.add(match[1]);
  }

  return [...urls];
}

function replaceUrls(
  content: string,
  replacements: Map<string, string>,
): string {
  let next = content;
  for (const [from, to] of replacements.entries()) {
    next = next.split(from).join(to);
  }
  return next;
}

async function uploadImageUrlToR2(
  sourceUrl: string,
  cache: Map<string, string>,
): Promise<string> {
  const cached = cache.get(sourceUrl);
  if (cached) return cached;

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} (${sourceUrl})`);
  }

  const contentTypeHeader =
    response.headers.get("content-type") || "image/jpeg";
  const contentType = contentTypeHeader.split(";")[0] || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = toSafeExt(contentType, sourceUrl);
  const key = buildR2Key(buffer, ext);
  const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`;

  try {
    const existsResponse = await fetch(publicUrl, { method: "HEAD" });
    if (existsResponse.ok) {
      cache.set(sourceUrl, publicUrl);
      return publicUrl;
    }
  } catch {
    // If HEAD check fails, continue with upload path.
  }

  const tempDir = await mkdtemp(join(tmpdir(), "blog-r2-"));
  const tempFilePath = join(tempDir, `upload.${ext}`);
  try {
    try {
      await writeFile(tempFilePath, buffer);
      runR2Put(tempFilePath, key, contentType);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`R2 upload failed for key ${key}: ${message}`);
  }

  cache.set(sourceUrl, publicUrl);
  return publicUrl;
}

async function syncToD1() {
  try {
    if (!R2_BUCKET_NAME || !R2_PUBLIC_BASE_URL) {
      throw new Error(
        "Missing R2 config. Set R2_BUCKET_NAME and R2_PUBLIC_BASE_URL in .env.local",
      );
    }

    console.log("🔍 Fetching all pages from Notion...\n");

    let allPages: NotionPage[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const data = await queryDatabase(startCursor);
      allPages = allPages.concat(data.results as NotionPage[]);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      console.log(`  Fetched ${data.results.length} pages`);
    }

    console.log(`\n📊 Total: ${allPages.length} pages\n`);

    const sqlStatements: string[] = [];
    const imageUrlCache = new Map<string, string>();

    for (let i = 0; i < allPages.length; i++) {
      const page = allPages[i];
      const pageNum = i + 1;

      try {
        // Extract title
        const title = extractTitle(page);

        console.log(`[${pageNum}/${allPages.length}] Processing: ${title}`);

        // Extract metadata
        const id = page.id;
        const createdAt = page.created_time;
        const tags = extractTags(page);
        let coverUrl: string | null = extractCoverUrl(page);

        // Fetch content
        const mdblocks = await n2m.pageToMarkdown(id);
        const mdString = n2m.toMarkdownString(mdblocks);
        let content = mdString.parent;

        // Upload markdown images to R2 and replace URLs
        const imageUrls = findMarkdownImageUrls(content);
        const replacements = new Map<string, string>();
        for (const url of imageUrls) {
          try {
            const r2Url = await uploadImageUrlToR2(url, imageUrlCache);
            replacements.set(url, r2Url);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `  ⚠️ Failed to upload image, keep original: ${message}`,
            );
          }
        }
        content = replaceUrls(content, replacements);

        // Upload cover image to R2
        if (coverUrl) {
          try {
            coverUrl = await uploadImageUrlToR2(coverUrl, imageUrlCache);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `  ⚠️ Failed to upload cover, keep original: ${message}`,
            );
          }
        }

        // Gzip compress then Base64 encode
        const compressed = gzipSync(content);
        const contentBase64 = compressed.toString("base64");

        // Generate slug
        const slug = slugify(title);

        // Create SQL INSERT statement
        const sql = `INSERT OR REPLACE INTO posts (id, slug, title, content_base64, created_at, tags, cover_url) VALUES (
  '${escapeSql(id)}',
  '${escapeSql(slug)}',
  '${escapeSql(title)}',
  '${contentBase64}',
  '${escapeSql(createdAt)}',
  '${escapeSql(JSON.stringify(tags))}',
  ${coverUrl ? `'${escapeSql(coverUrl)}'` : "NULL"}
);`;

        sqlStatements.push(sql);
        console.log(
          `  ✅ Prepared SQL (images: ${imageUrls.length}, cache: ${imageUrlCache.size})\n`,
        );
      } catch (error: unknown) {
        console.error(`  ❌ Error: ${getErrorMessage(error)}\n`);
      }
    }

    // Write SQL file
    const sqlFile = "sync-data-compressed.sql";
    await writeFile(sqlFile, sqlStatements.join("\n\n"), "utf-8");

    console.log(`\n📝 Generated SQL file: ${sqlFile} (gzip compressed)`);
    console.log(`📊 Total statements: ${sqlStatements.length}`);
    console.log("\n💡 Next steps:");
    console.log(
      "   1. Apply schema: pnpm wrangler d1 execute blog-db --local --file=schema.sql",
    );
    console.log("   2. Import data: Use the batch import script\n");
  } catch (error: unknown) {
    console.error("❌ Error:", getErrorMessage(error));
    console.error(error);
  }
}

syncToD1();
