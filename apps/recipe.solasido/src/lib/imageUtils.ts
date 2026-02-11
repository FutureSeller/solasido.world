import { PLACEHOLDER } from './constants';
import type { Recipe } from '../types/recipe';

export function resolveImage(recipe: Recipe): string {
  if (recipe.thumbnailUrl) {
    return recipe.thumbnailUrl;
  }
  return PLACEHOLDER;
}
