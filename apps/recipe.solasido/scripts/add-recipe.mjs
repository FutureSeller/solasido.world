#!/usr/bin/env node
/**
 * Usage:
 *   pnpm db:add-recipe --name="레시피명" --ingredients="재료1,재료2" --cook-time="10분" --recipe-text="레시피步骤" --thumb="/images/img.jpg"
 *
 * Or with environment:
 *   RECIPE_NAME="레시피명" RECIPE_INGREDIENTS="재료1,재료2" pnpm db:add-recipe
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value?.trim()?.replace(/^["']|["']$/g, '');
  return acc;
}, {});

const name = args.name || process.env.RECIPE_NAME;
const ingredients = args.ingredients || process.env.RECIPE_INGREDIENTS;
const cookTime = args['cook-time'] || process.env.RECIPE_COOK_TIME || '';
const recipeText = args['recipe-text'] || process.env.RECIPE_TEXT || '';
const thumb = args.thumb || process.env.RECIPE_THUMB || '';

if (!name || !ingredients) {
  console.error('Error: --name and --ingredients are required');
  console.error(
    'Usage: pnpm db:add-recipe --name="레시피명" --ingredients="재료1,재료2"',
  );
  process.exit(1);
}

// Generate unique ID
const id = execSync('uuidgen | tr -d "-"').toString().trim();

// Convert ingredients to JSON array
const ingredientsJson = JSON.stringify(
  ingredients.split(',').map((i) => i.trim()),
);

const sql = `INSERT INTO recipes (id, name, ingredients, cook_time, recipe_text, thumbnail_url) VALUES ('${id}', '${name}', '${ingredientsJson}', '${cookTime}', '${recipeText.replace(/'/g, "''")}', '${thumb}')`;

console.log('Executing SQL:');
console.log(sql);
console.log('');

try {
  const isLocal = args.local || process.env.LOCAL_DB;
  const command = isLocal
    ? `wrangler d1 execute recipe_db --local --command="${sql}"`
    : `wrangler d1 execute recipe_db --remote --command="${sql}"`;

  execSync(command, { stdio: 'inherit' });
  console.log(`\n✅ Recipe added successfully! ID: ${id}`);
} catch (error) {
  console.error('Error executing SQL:', error);
  process.exit(1);
}
