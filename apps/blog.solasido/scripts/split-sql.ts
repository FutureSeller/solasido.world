import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

async function splitSql() {
  const sql = await readFile("sync-data-compressed.sql", "utf-8");
  const statements = sql.split(/\n\n/).filter(s => s.trim());

  console.log(`Total statements: ${statements.length}`);

  const batchSize = 1; // 1 statement per file
  const batchDir = "sql-batches-compressed";

  await mkdir(batchDir, { recursive: true });

  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const filename = join(batchDir, `batch-${batchNum.toString().padStart(3, "0")}.sql`);
    await writeFile(filename, batch.join("\n\n"), "utf-8");
    console.log(`Created ${filename} (${batch.length} statements)`);
  }

  console.log(`\nCreated ${Math.ceil(statements.length / batchSize)} batch files`);
}

splitSql();
