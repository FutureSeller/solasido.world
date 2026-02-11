interface Env {
  DB: D1Database;
}

interface DBRecipe {
  id: string;
  notion_page_id: string | null;
  name: string;
  ingredients: string;
  cook_time: string | null;
  recipe_text: string | null;
  thumbnail_url: string | null;
  thumbnail_local: string | null;
  created_at: number;
  updated_at: number;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: string;
  recipeText: string;
  localThumb: string;
  thumb: string;
}

function transformRecipe(dbRecipe: DBRecipe): Recipe {
  return {
    id: dbRecipe.id,
    name: dbRecipe.name,
    ingredients: JSON.parse(dbRecipe.ingredients) as string[],
    cookTime: dbRecipe.cook_time || '',
    recipeText: dbRecipe.recipe_text || '',
    localThumb: dbRecipe.thumbnail_local || '',
    thumb: dbRecipe.thumbnail_url || '',
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  try {
    const result = await context.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ?'
    )
      .bind(id)
      .first<DBRecipe>();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Recipe not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recipe = transformRecipe(result);

    return new Response(JSON.stringify(recipe), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // 1 hour
      },
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch recipe' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
