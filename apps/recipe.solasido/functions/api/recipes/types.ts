export interface Env {
  DB: D1Database;
}

export interface DBRecipeRow {
  id: string;
  name: string;
  cook_time: string | null;
  recipe_text: string | null;
  source_url: string | null;
  thumbnail_url: string | null;
  created_at: number | null;
  updated_at: number | null;
}

export interface DBRecipeTagRow {
  id: string;
  recipe_id: string;
  tag: string;
  display_text: string;
  sort_order: number | null;
  created_at: number | null;
}

export interface DBRecipeIngredientRow {
  id: string;
  recipe_id: string;
  name: string;
  measure_text: string | null;
  note: string | null;
  sort_order: number | null;
  created_at: number | null;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: string;
  recipeText: string;
  sourceUrl: string;
  thumbnailUrl: string;
}

interface HydratedRecipeRelations {
  tags: DBRecipeTagRow[];
  ingredients: DBRecipeIngredientRow[];
}

function formatIngredientLabel(ingredient: DBRecipeIngredientRow): string {
  const measure = ingredient.measure_text?.trim();
  const note = ingredient.note?.trim();

  let label = ingredient.name;
  if (measure) {
    label += ` · ${measure}`;
  }
  if (note) {
    label += ` (${note})`;
  }
  return label;
}

export function transformRecipe(
  dbRecipe: DBRecipeRow,
  relations?: Partial<HydratedRecipeRelations>,
): Recipe {
  const ingredients = (relations?.ingredients || []).map(formatIngredientLabel);

  return {
    id: dbRecipe.id,
    name: dbRecipe.name,
    ingredients,
    cookTime: dbRecipe.cook_time || '',
    recipeText: dbRecipe.recipe_text || '',
    sourceUrl: dbRecipe.source_url || '',
    thumbnailUrl: dbRecipe.thumbnail_url || '',
  };
}

export async function getRecipesByIds(d1: D1Database, ids: string[]): Promise<Recipe[]> {
  if (ids.length === 0) {
    return [];
  }

  const placeholders = ids.map(() => '?').join(', ');

  const recipeRowsResult = await d1
    .prepare(
      `SELECT id, name, cook_time, recipe_text, source_url, thumbnail_url, created_at, updated_at
       FROM recipes
       WHERE id IN (${placeholders})`,
    )
    .bind(...ids)
    .all<DBRecipeRow>();

  const ingredientRowsResult = await d1
    .prepare(
      `SELECT id, recipe_id, name, measure_text, note, sort_order, created_at
       FROM recipe_ingredients
       WHERE recipe_id IN (${placeholders})
       ORDER BY sort_order ASC, created_at ASC, id ASC`,
    )
    .bind(...ids)
    .all<DBRecipeIngredientRow>();

  const recipeRows = recipeRowsResult.results || [];
  const ingredientRows = ingredientRowsResult.results || [];

  const recipeMap = new Map(recipeRows.map((row) => [row.id, row]));
  const ingredientsByRecipeId = new Map<string, DBRecipeIngredientRow[]>();

  for (const ingredient of ingredientRows) {
    const bucket = ingredientsByRecipeId.get(ingredient.recipe_id) || [];
    bucket.push(ingredient);
    ingredientsByRecipeId.set(ingredient.recipe_id, bucket);
  }

  return ids
    .map((id) => {
      const recipe = recipeMap.get(id);
      if (!recipe) {
        return null;
      }

      return transformRecipe(recipe, {
        ingredients: ingredientsByRecipeId.get(id) || [],
      });
    })
    .filter((recipe): recipe is Recipe => recipe !== null);
}
