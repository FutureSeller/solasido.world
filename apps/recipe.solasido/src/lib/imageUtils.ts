import type { Recipe } from '../types/recipe';
import { PLACEHOLDER } from './constants';

export function resolveImage(recipe: Recipe): string {
  if (recipe.thumbnailUrl) {
    return recipe.thumbnailUrl;
  }
  return PLACEHOLDER;
}
