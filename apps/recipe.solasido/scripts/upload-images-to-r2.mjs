import { execSync } from 'child_process';
import { basename, extname, resolve } from 'path';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'solasido-static-assets';
const STATIC_IMAGES_URL =
  process.env.R2_PUBLIC_BASE_URL || 'https://static-images.solasido.world';

function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return contentTypes[ext] || 'image/jpeg';
}

function uploadOne(filePath) {
  const resolvedPath = resolve(filePath);
  const filename = basename(resolvedPath);
  const contentType = getContentType(filename);
  const key = `recipe/${filename}`;
  const publicUrl = `${STATIC_IMAGES_URL}/${key}`;

  execSync(
    `wrangler r2 object put ${BUCKET_NAME}/${key} --file "${resolvedPath}" --content-type ${contentType} --remote`,
    { stdio: 'pipe' },
  );

  return { filename, key, publicUrl, contentType };
}

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const filePaths = args.filter((a) => a !== '--json');

  if (filePaths.length === 0) {
    console.log('Usage: node upload-images-to-r2.mjs <file1> <file2> ... [--json]');
    process.exit(1);
  }

  const results = [];
  for (const filePath of filePaths) {
    try {
      const r = uploadOne(filePath);
      results.push({ ok: true, ...r });
      if (!jsonMode) {
        console.log(`✅ ${r.filename} -> ${r.publicUrl}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ ok: false, filePath, error: msg });
      if (!jsonMode) {
        console.error(`❌ ${filePath}: ${msg}`);
      }
    }
  }

  if (jsonMode) {
    console.log(JSON.stringify({ bucket: BUCKET_NAME, baseUrl: STATIC_IMAGES_URL, results }, null, 2));
  }

  if (results.some((r) => !r.ok)) process.exit(1);
}

main();
