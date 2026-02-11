#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const NOTION_API_VERSION = '2025-09-03';
const DEFAULT_DATA_SOURCE_ID = '30216edf-fb5d-80bb-b198-000b5df3bb24';

function getArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function readNotionKey() {
  const fromEnv = process.env.NOTION_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  const keyPath = path.join(os.homedir(), '.config', 'notion', 'api_key');
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Notion API key not found: ${keyPath}`);
  }
  return fs.readFileSync(keyPath, 'utf8').trim();
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

function normalizeId(notionPageId) {
  return String(notionPageId || '').replaceAll('-', '');
}

function extractTextProperty(prop, fallback = '') {
  if (!prop) return fallback;
  const rich = prop.rich_text || [];
  if (rich[0]?.plain_text) return rich[0].plain_text;
  return fallback;
}

function extractTitleProperty(prop, fallback = '') {
  if (!prop) return fallback;
  const title = prop.title || [];
  if (title[0]?.plain_text) return title[0].plain_text;
  return fallback;
}

function extractThumbnailUrl(prop) {
  const files = prop?.files || [];
  if (!files.length) return '';
  const f = files[0];
  if (f.file?.url) return f.file.url;
  if (f.external?.url) return f.external.url;
  return '';
}

function toRecipeRow(notionResult) {
  const p = notionResult.properties || {};
  const ingredients = (p['재료 목록']?.multi_select || []).map((x) => x.name).filter(Boolean);

  return {
    id: normalizeId(notionResult.id),
    name: extractTitleProperty(p['이름'], '제목 없음'),
    ingredients: JSON.stringify(ingredients),
    cook_time: extractTextProperty(p['조리 시간'], ''),
    recipe_text: extractTextProperty(p['레시피'], ''),
    thumbnail_url: extractThumbnailUrl(p['썸네일']),
  };
}

function sanitizeFilePart(input) {
  return String(input || '')
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

function getCloudflareImagesConfig() {
  const accountId =
    process.env.CF_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    process.env.CF_IMAGES_ACCOUNT_ID;

  const apiToken =
    process.env.CF_IMAGES_API_TOKEN ||
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      'Cloudflare Images config missing. Set CF_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID) and CF_IMAGES_API_TOKEN (or CLOUDFLARE_API_TOKEN).',
    );
  }

  return { accountId, apiToken };
}

async function uploadThumbnailToCloudflareImages(row) {
  const src = row.thumbnail_url;
  if (!src || !/^https?:\/\//i.test(src)) return row;

  const { accountId, apiToken } = getCloudflareImagesConfig();

  const imageRes = await fetch(src);
  if (!imageRes.ok) {
    throw new Error(`Thumbnail download failed (${imageRes.status}) for recipe id=${row.id}`);
  }

  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
  const fileName = `${sanitizeFilePart(row.name) || 'untitled_recipe'}_${row.id.slice(0, 8)}`;

  const form = new FormData();
  form.append('file', new Blob([imageBuffer], { type: contentType }), fileName);
  form.append('id', row.id);
  form.append('metadata', JSON.stringify({ recipeId: row.id, recipeName: row.name }));

  const uploadRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: form,
    },
  );

  const payload = await uploadRes.json();
  if (!uploadRes.ok || !payload?.success) {
    throw new Error(
      `Cloudflare Images upload failed for recipe id=${row.id}: ${JSON.stringify(payload?.errors || payload)}`,
    );
  }

  const variantUrl = payload?.result?.variants?.[0] || '';
  if (!variantUrl) {
    throw new Error(`Cloudflare Images upload succeeded but variant URL missing for recipe id=${row.id}`);
  }

  return {
    ...row,
    thumbnail_url: variantUrl,
  };
}

async function fetchNotionPage(key, dataSourceId, startCursor) {
  const body = startCursor ? { start_cursor: startCursor } : {};
  const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function fetchAllNotionRecipes(key, dataSourceId) {
  const rows = [];
  let cursor = undefined;

  while (true) {
    const page = await fetchNotionPage(key, dataSourceId, cursor);
    rows.push(...(page.results || []).map(toRecipeRow));
    if (!page.has_more) break;
    cursor = page.next_cursor;
  }

  return rows;
}

function getRemoteIds({ local = false } = {}) {
  const rs = runD1Sql('SELECT id FROM recipes;', { local });
  const rows = rs?.[0]?.results || [];
  return new Set(rows.map((r) => String(r.id)));
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
  const dataSourceId =
    getArg('data-source-id') || process.env.NOTION_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID;

  console.log(`Mode: ${local ? 'local' : 'remote'}`);
  console.log(`Notion data_source_id: ${dataSourceId}`);

  const notionKey = readNotionKey();

  assertSchema({ local });
  const existingIds = getRemoteIds({ local });
  console.log(`Remote recipes in DB: ${existingIds.size}`);

  const notionRows = await fetchAllNotionRecipes(notionKey, dataSourceId);
  console.log(`Recipes fetched from Notion: ${notionRows.length}`);

  const missing = notionRows.filter((r) => !existingIds.has(r.id));
  console.log(`Missing recipes to insert: ${missing.length}`);

  let inserted = 0;
  for (const row of missing) {
    const rowWithCloudflareImage = await uploadThumbnailToCloudflareImages(row);
    insertRecipe(rowWithCloudflareImage, { local });
    inserted += 1;
    console.log(
      `Inserted: ${rowWithCloudflareImage.name} (${rowWithCloudflareImage.id}) thumb=${rowWithCloudflareImage.thumbnail_url || '-'}`,
    );
  }

  console.log(`\nDone. inserted=${inserted}, skipped=${notionRows.length - inserted}`);
}

main().catch((err) => {
  console.error(`❌ Sync failed: ${err.message}`);
  process.exit(1);
});
