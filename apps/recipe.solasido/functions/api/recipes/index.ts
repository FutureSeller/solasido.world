import type { DBRecipe, Env } from './types.ts';
import { transformRecipe } from './types.ts';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q') || '';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let recipesResult: D1Result<DBRecipe>;
    let countResult: { count: number } | null;

    if (query.trim()) {
      // Use FTS5 full-text search when query is provided
      recipesResult = await context.env.DB.prepare(
        `SELECT r.* FROM recipes r
         INNER JOIN recipes_fts fts ON r.rowid = fts.rowid
         WHERE recipes_fts MATCH ?
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
      )
        .bind(query, limit, offset)
        .all<DBRecipe>();

      countResult = await context.env.DB.prepare(
        `SELECT COUNT(*) as count FROM recipes r
         INNER JOIN recipes_fts fts ON r.rowid = fts.rowid
         WHERE recipes_fts MATCH ?`,
      )
        .bind(query)
        .first<{ count: number }>();
    } else {
      // No search query - return all recipes
      recipesResult = await context.env.DB.prepare(
        'SELECT * FROM recipes ORDER BY created_at DESC LIMIT ? OFFSET ?',
      )
        .bind(limit, offset)
        .all<DBRecipe>();

      countResult = await context.env.DB.prepare(
        'SELECT COUNT(*) as count FROM recipes',
      ).first<{ count: number }>();
    }

    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const recipes = (recipesResult.results || []).map(transformRecipe);

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
          'Cache-Control': 'public, max-age=300', // 5 minutes
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
