import type { Env } from './types.ts';
import { getRecipesByIds } from './types.ts';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  try {
    const [recipe] = await getRecipesByIds(context.env.DB, [id]);

    if (!recipe) {
      return new Response(JSON.stringify({ error: 'Recipe not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(recipe), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
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
