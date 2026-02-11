import { PLACEHOLDER } from './constants';
import type { Recipe } from '../types/recipe';

export function resolveImage(recipe: Recipe): string {
  if (recipe.localThumb) {
    return recipe.localThumb;
  }
  if (recipe.thumb && recipe.thumb.startsWith('http')) {
    return recipe.thumb;
  }
  return PLACEHOLDER;
}
