import { config } from "dotenv";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

config({ path: ".env.local" });

const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const OUTPUT_DIR = join(process.cwd(), "notion-exports");

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

async function exportAllPages() {
  try {
    // Create output directory
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    let allPages: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    // Fetch all pages (handle pagination)
    while (hasMore) {
      console.log("🔍 Fetching pages...");
      const data = await queryDatabase(startCursor);
      allPages = allPages.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      console.log(`  Fetched ${data.results.length} pages`);
    }

    console.log(`\n📊 Total pages: ${allPages.length}\n`);

    // Process each page
    let successCount = 0;
    let errorCount = 0;

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
        const metadata: any = {
          id: page.id,
          title,
          created: page.created_time,
          tags: [],
          cover: null,
        };

        // Tags
        for (const [key, value] of Object.entries(properties)) {
          const prop: any = value;
          if (prop.type === "multi_select") {
            metadata.tags = prop.multi_select.map((tag: any) => tag.name);
          }
        }

        // Cover image
        if (page.cover) {
          if (page.cover.type === "external") {
            metadata.cover = page.cover.external.url;
          } else if (page.cover.type === "file") {
            metadata.cover = page.cover.file.url;
          }
        }

        // Fetch page content
        const mdblocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdblocks);

        // Create frontmatter
        const frontmatter = `---
title: "${title}"
id: ${page.id}
created: ${page.created_time}
tags: ${JSON.stringify(metadata.tags)}
cover: ${metadata.cover || "null"}
---

${mdString.parent}`;

        // Save to file
        const slug = slugify(title);
        const filename = `${slug}.md`;
        const filepath = join(OUTPUT_DIR, filename);
        await writeFile(filepath, frontmatter, "utf-8");

        console.log(`  ✅ Saved: ${filename}\n`);
        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
  } catch (error: any) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
  }
}

exportAllPages();
