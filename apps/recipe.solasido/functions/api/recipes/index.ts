import type { Env, Recipe } from './types.ts';
import { getRecipesByIds } from './types.ts';

interface RecipeIdRow {
  id: string;
  created_at?: number | null;
}

interface CountRow {
  count: number;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q')?.trim() || '';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let recipeIdRows: RecipeIdRow[] = [];
    let countResult: CountRow | null;

    if (query) {
      const likePattern = `%${query}%`;

      const recipeIdsResult = await context.env.DB.prepare(
        `SELECT DISTINCT r.id, r.created_at
         FROM recipes r
         LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
         LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
         WHERE r.name LIKE ?
            OR ri.name LIKE ?
            OR COALESCE(ri.measure_text, '') LIKE ?
            OR COALESCE(rt.display_text, '') LIKE ?
            OR COALESCE(rt.tag, '') LIKE LOWER(?)
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
      )
        .bind(likePattern, likePattern, likePattern, likePattern, likePattern, limit, offset)
        .all<RecipeIdRow>();

      recipeIdRows = recipeIdsResult.results || [];

      countResult = await context.env.DB.prepare(
        `SELECT COUNT(DISTINCT r.id) as count
         FROM recipes r
         LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
         LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
         WHERE r.name LIKE ?
            OR ri.name LIKE ?
            OR COALESCE(ri.measure_text, '') LIKE ?
            OR COALESCE(rt.display_text, '') LIKE ?
            OR COALESCE(rt.tag, '') LIKE LOWER(?)`,
      )
        .bind(likePattern, likePattern, likePattern, likePattern, likePattern)
        .first<CountRow>();
    } else {
      const recipeIdsResult = await context.env.DB.prepare(
        `SELECT id
         FROM recipes
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
        .bind(limit, offset)
        .all<RecipeIdRow>();

      recipeIdRows = recipeIdsResult.results || [];

      countResult = await context.env.DB.prepare(
        'SELECT COUNT(*) as count FROM recipes',
      ).first<CountRow>();
    }

    const recipeIds = recipeIdRows.map((row) => row.id);
    const recipes: Recipe[] = await getRecipesByIds(context.env.DB, recipeIds);
    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return new Response(
      JSON.stringify({
        recipes,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch recipes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
