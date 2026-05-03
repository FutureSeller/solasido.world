export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  ingredients: string[];
  cookTime: string;
  recipeText: string;
  sourceUrl: string;
  thumbnailUrl: string;
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
