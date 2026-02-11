import type { DBRecipe, Env } from './types.ts';
import { transformRecipe } from './types.ts';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  try {
    const result = await context.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ?',
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
