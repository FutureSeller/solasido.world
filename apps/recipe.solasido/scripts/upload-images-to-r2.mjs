import { execSync } from 'child_process';
import { basename, extname, resolve } from 'path';

const BUCKET_NAME = 'solasido-static-assets';
const STATIC_IMAGES_URL = 'https://static-images.solasido.world';

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

function generateSqlUpdate(filename) {
  const key = `recipe/${filename}`;
  const r2Url = `${STATIC_IMAGES_URL}/${key}`;
  const nameWithoutExt = basename(filename, extname(filename));

  return `UPDATE recipes SET thumbnail_url = '${r2Url}' WHERE name LIKE '%${nameWithoutExt}%';`;
}

async function uploadImages() {
  const filePaths = process.argv.slice(2);

  if (filePaths.length === 0) {
    console.log('Usage: node upload-images-to-r2.mjs <file1> <file2> ...');
    console.log(
      'Example: node upload-images-to-r2.mjs ./public/images/photo1.jpg ./public/images/photo2.png',
    );
    process.exit(1);
  }

  console.log(`Uploading ${filePaths.length} image(s)...\n`);

  const uploadedFiles = [];

  for (const filePath of filePaths) {
    const resolvedPath = resolve(filePath);
    const filename = basename(resolvedPath);
    const contentType = getContentType(filename);
    const key = `recipe/${filename}`;

    console.log(`📤 Uploading: ${filename}`);
    console.log(`   → ${key} (${contentType})`);

    try {
      execSync(
        `wrangler r2 object put ${BUCKET_NAME}/${key} --file "${resolvedPath}" --content-type ${contentType} --remote`,
        { stdio: 'inherit' },
      );
      console.log(`   ✅ Success\n`);
      uploadedFiles.push(filename);
    } catch (e) {
      console.error(`   ❌ Failed:`, e.message, '\n');
    }
  }

  if (uploadedFiles.length > 0) {
    console.log('\n✨ Upload complete!');
    console.log(`\nImages are now available at:`);
    console.log(`https://static-images.solasido.world/recipe/<filename>`);

    console.log('\n📝 SQL UPDATE statements for migrating DB:');
    console.log('--- COPY BELOW ---');
    uploadedFiles.forEach((filename) => {
      console.log(generateSqlUpdate(filename));
    });
    console.log('--- COPY ABOVE ---');
    console.log(
      '\nRun these SQL statements to update thumbnail_url to R2 URLs',
    );
  }
}

uploadImages();
