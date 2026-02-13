import { config } from "dotenv";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { gunzipSync } from "node:zlib";

config({ path: ".env.local" });
const execAsync = promisify(exec);

async function testD1Read() {
  try {
    // Query one post
    const result = await execAsync(
      `pnpm wrangler d1 execute blog-db --local --command="SELECT id, slug, title, content_base64 FROM posts LIMIT 1;" --json`
    );

    const data = JSON.parse(result.stdout);
    const post = data[0].results[0];

    console.log("📖 Post ID:", post.id);
    console.log("📝 Title:", post.title);
    console.log("🔗 Slug:", post.slug);
    console.log("");

    // Decode Base64 and decompress
    const compressed = Buffer.from(post.content_base64, "base64");
    const decompressed = gunzipSync(compressed);
    const content = decompressed.toString("utf-8");

    console.log("📄 Content Preview (first 500 chars):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(content.substring(0, 500));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log(`✅ Gzip decompression works!`);
    console.log(`📊 Original size: ${compressed.length} bytes (compressed)`);
    console.log(`📊 Decompressed size: ${content.length} characters`);
    console.log(`📊 Compression ratio: ${((1 - compressed.length / content.length) * 100).toFixed(1)}%`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testD1Read();
