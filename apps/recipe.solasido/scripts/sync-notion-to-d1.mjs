#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

function getArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function runD1Sql(sql, { local = false } = {}) {
  const mode = local ? '--local' : '--remote';
  const escaped = sql.replaceAll('"', '\\"');
  const cmd = `npx wrangler d1 execute recipe_db ${mode} --command="${escaped}" --json`;
  const out = execSync(cmd, { encoding: 'utf8' });
  return JSON.parse(out);
}

function sqlQuote(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replaceAll("'", "''")}'`;
}

function normalizeId(v) {
  return String(v || '').replaceAll('-', '').trim();
}

function generateUuidV7() {
  const ts = BigInt(Date.now());
  const rand = randomBytes(10); // 80 bits

  const bytes = new Uint8Array(16);

  // 48-bit unix timestamp (ms)
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  // version 7 (high 4 bits) + 12 bits random
  bytes[6] = 0x70 | (rand[0] & 0x0f);
  bytes[7] = rand[1];

  // variant 10xx + 62 bits random
  bytes[8] = 0x80 | (rand[2] & 0x3f);
  bytes[9] = rand[3];
  bytes[10] = rand[4];
  bytes[11] = rand[5];
  bytes[12] = rand[6];
  bytes[13] = rand[7];
  bytes[14] = rand[8];
  bytes[15] = rand[9];

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function extFromContentType(contentType = '') {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('svg')) return 'svg';
  return 'jpg';
}

function parseRowsInput() {
  const rowJson = getArg('row-json');
  const rowsJson = getArg('rows-json');
  const inputFile = getArg('input-file');

  if (rowJson) {
    return [JSON.parse(rowJson)];
  }
  if (rowsJson) {
    const arr = JSON.parse(rowsJson);
    if (!Array.isArray(arr)) throw new Error('--rows-json must be a JSON array');
    return arr;
  }
  if (inputFile) {
    const raw = fs.readFileSync(path.resolve(inputFile), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  const stdin = fs.readFileSync(0, 'utf8').trim();
  if (stdin) {
    const parsed = JSON.parse(stdin);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  throw new Error(
    'No input rows. Provide one of: --row-json=..., --rows-json=..., --input-file=... or JSON via stdin.',
  );
}

function normalizeInputRow(raw) {
  const id = normalizeId(raw.id ?? raw.notionPageId ?? raw.notion_page_id);

  const name = String(raw.name ?? raw.title ?? raw['이름'] ?? '').trim();

  const ingredientsRaw = raw.ingredients ?? raw['재료 목록'] ?? [];
  const ingredients = Array.isArray(ingredientsRaw)
    ? ingredientsRaw.map((x) => String(x).trim()).filter(Boolean)
    : String(ingredientsRaw)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

  const cookTime = String(raw.cookTime ?? raw.cook_time ?? raw['조리 시간'] ?? '').trim();
  const recipeText = String(raw.recipeText ?? raw.recipe_text ?? raw['레시피'] ?? '').trim();
  const thumbnailSource = String(
    raw.thumbnailUrl ?? raw.thumbnail_url ?? raw.thumbnail ?? raw['썸네일'] ?? '',
  ).trim();

  return {
    id,
    name,
    ingredients: JSON.stringify(ingredients),
    cook_time: cookTime,
    recipe_text: recipeText,
    thumbnail_source: thumbnailSource,
  };
}

function validateNormalizedRow(row) {
  if (!row.id) return { ok: false, reason: 'missing id' };
  if (!row.name) return { ok: false, reason: 'missing name' };

  try {
    const parsed = JSON.parse(row.ingredients);
    if (!Array.isArray(parsed)) return { ok: false, reason: 'ingredients is not an array' };
  } catch {
    return { ok: false, reason: 'ingredients json parse failed' };
  }

  return { ok: true };
}

function assertSchema({ local = false } = {}) {
  const rs = runD1Sql('PRAGMA table_info(recipes);', { local });
  const cols = new Set((rs?.[0]?.results || []).map((r) => r.name));
  const required = ['id', 'name', 'ingredients', 'cook_time', 'recipe_text', 'thumbnail_url'];
  const missing = required.filter((c) => !cols.has(c));
  if (missing.length) {
    throw new Error(`recipes table schema mismatch. Missing columns: ${missing.join(', ')}`);
  }
}

function recipeExists(id, { local = false } = {}) {
  const rs = runD1Sql(
    `SELECT 1 as ok FROM recipes WHERE id = ${sqlQuote(id)} LIMIT 1;`,
    { local },
  );
  const rows = rs?.[0]?.results || [];
  return rows.length > 0;
}

function uploadImageViaR2Script(tempFilePath) {
  const cmd = `node ./scripts/upload-images-to-r2.mjs "${tempFilePath}" --json`;
  const out = execSync(cmd, { encoding: 'utf8' });
  const parsed = JSON.parse(out);
  const first = parsed?.results?.[0];
  if (!first?.ok || !first.publicUrl) {
    throw new Error(`r2:upload failed: ${JSON.stringify(first || parsed)}`);
  }
  return first.publicUrl;
}

async function uploadImageViaR2WithRetry(tempFilePath, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return uploadImageViaR2Script(tempFilePath);
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        const backoffMs = 500 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError;
}

async function resolveThumbnailUrl(row) {
  const src = row.thumbnail_source;
  if (!src || !/^https?:\/\//i.test(src)) return '';

  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Thumbnail download failed (${res.status}) for recipe id=${row.id}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromContentType(res.headers.get('content-type') || '');
  const uuidv7 = generateUuidV7();
  const fileName = `${uuidv7}.${ext}`;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-r2-'));
  const tmpFile = path.join(tmpDir, fileName);
  fs.writeFileSync(tmpFile, buf);

  try {
    return await uploadImageViaR2WithRetry(tmpFile, 2);
  } finally {
    try {
      fs.unlinkSync(tmpFile);
      fs.rmdirSync(tmpDir);
    } catch {
      // ignore cleanup errors
    }
  }
}

function insertRecipe(row, { local = false } = {}) {
  const sql = `
INSERT INTO recipes (id, name, ingredients, cook_time, recipe_text, thumbnail_url)
VALUES (
  ${sqlQuote(row.id)},
  ${sqlQuote(row.name)},
  ${sqlQuote(row.ingredients)},
  ${sqlQuote(row.cook_time)},
  ${sqlQuote(row.recipe_text)},
  ${sqlQuote(row.thumbnail_url)}
);`.trim();

  runD1Sql(sql, { local });
}

async function main() {
  const local = process.argv.includes('--local');
  const normalizedRows = parseRowsInput().map(normalizeInputRow);

  console.log(`Mode: ${local ? 'local' : 'remote'}`);
  console.log(`Input rows: ${normalizedRows.length}`);

  assertSchema({ local });

  let invalidSkipped = 0;
  let existsSkipped = 0;
  let inserted = 0;

  for (const row of normalizedRows) {
    const v = validateNormalizedRow(row);
    if (!v.ok) {
      invalidSkipped += 1;
      console.log(`Skipped invalid row: id=${row.id || '-'} reason=${v.reason}`);
      continue;
    }

    if (recipeExists(row.id, { local })) {
      existsSkipped += 1;
      continue;
    }

    const thumbnailUrl = await resolveThumbnailUrl(row);
    insertRecipe(
      {
        ...row,
        thumbnail_url: thumbnailUrl,
      },
      { local },
    );
    inserted += 1;
    console.log(`Inserted: ${row.name} (${row.id}) thumb=${thumbnailUrl || '-'}`);
  }

  console.log(
    `\nDone. inserted=${inserted}, skipped_existing=${existsSkipped}, skipped_invalid=${invalidSkipped}`,
  );
}

main().catch((err) => {
  console.error(`❌ Sync failed: ${err.message}`);
  process.exit(1);
});
