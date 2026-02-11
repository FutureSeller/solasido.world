export interface Env {
  DB: D1Database;
}

export interface DBRecipe {
  id: string;
  name: string;
  ingredients: string;
  cook_time: string | null;
  recipe_text: string | null;
  thumbnail_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: string;
  recipeText: string;
  thumbnailUrl: string;
}

export function transformRecipe(dbRecipe: DBRecipe): Recipe {
  return {
    id: dbRecipe.id,
    name: dbRecipe.name,
    ingredients: JSON.parse(dbRecipe.ingredients) as string[],
    cookTime: dbRecipe.cook_time || '',
    recipeText: dbRecipe.recipe_text || '',
    thumbnailUrl: dbRecipe.thumbnail_url || '',
  };
}
