export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: string;
  recipeText: string;
  localThumb: string;
  thumb: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface RecipesListResponse {
  recipes: Recipe[];
  pagination: PaginationInfo;
}
