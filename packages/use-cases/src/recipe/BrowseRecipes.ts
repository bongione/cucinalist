import { ResultAsync } from "@cucinalist/fp-types";
import type { Recipe } from "@cucinalist/core";
import type {RecipeStorage} from '../entities-storage/recipeStorage.js';

export type QueryFilters = {
  nameContains?: string;
};

export interface BrowseRecipesInputBoundary {
  getRecipeById: (id: string) => ResultAsync<Recipe | null, Error>;
  queryRecipes: (filter: QueryFilters) => ResultAsync<Recipe[], Error>;
}

export function createBrowseRecipesInteractor(
  dataProvider: RecipeStorage,
): BrowseRecipesInputBoundary {
  return {
    getRecipeById: dataProvider.recipe.getRecipeById,
    queryRecipes: (filter: QueryFilters) => {
      return dataProvider.recipe.getRecipesByName(filter.nameContains || "");
    }
  }
}
