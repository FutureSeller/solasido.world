import { config } from "dotenv";
import { writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

config({ path: ".env.local" });

const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

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
    }
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

async function syncToD1() {
  try {
    console.log("🔍 Fetching all pages from Notion...\n");

    let allPages: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const data = await queryDatabase(startCursor);
      allPages = allPages.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      console.log(`  Fetched ${data.results.length} pages`);
    }

    console.log(`\n📊 Total: ${allPages.length} pages\n`);

    const sqlStatements: string[] = [];

    for (let i = 0; i < allPages.length; i++) {
      const page = allPages[i];
      const pageNum = i + 1;

      try {
        // Extract title
        let title = "Untitled";
        const properties = page.properties;
        for (const [key, value] of Object.entries(properties)) {
          const prop: any = value;
          if (prop.type === "title" && prop.title.length > 0) {
            title = prop.title[0].plain_text;
            break;
          }
        }

        console.log(`[${pageNum}/${allPages.length}] Processing: ${title}`);

        // Extract metadata
        const id = page.id;
        const createdAt = page.created_time;
        const tags: string[] = [];
        let coverUrl: string | null = null;

        // Tags
        for (const [key, value] of Object.entries(properties)) {
          const prop: any = value;
          if (prop.type === "multi_select") {
            tags.push(...prop.multi_select.map((tag: any) => tag.name));
          }
        }

        // Cover image
        if (page.cover) {
          if (page.cover.type === "external") {
            coverUrl = page.cover.external.url;
          } else if (page.cover.type === "file") {
            coverUrl = page.cover.file.url;
          }
        }

        // Fetch content
        const mdblocks = await n2m.pageToMarkdown(id);
        const mdString = n2m.toMarkdownString(mdblocks);
        const content = mdString.parent;

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
        console.log(`  ✅ Prepared SQL\n`);
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }

    // Write SQL file
    const sqlFile = "sync-data-compressed.sql";
    await writeFile(sqlFile, sqlStatements.join("\n\n"), "utf-8");

    console.log(`\n📝 Generated SQL file: ${sqlFile} (gzip compressed)`);
    console.log(`📊 Total statements: ${sqlStatements.length}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Apply schema: pnpm wrangler d1 execute blog-db --local --file=schema.sql`);
    console.log(`   2. Import data: Use the batch import script\n`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

syncToD1();
