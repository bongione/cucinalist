import type { ResultAsync } from "@cucinalist/fp-types";
import type { Recipe, RecipeProvider } from "@cucinalist/core";

export type RecipeInfo = Omit<Recipe, "id">;

export interface RecipeStorageOps extends RecipeProvider {
  createRecipe: (recipeInfo: RecipeInfo) => ResultAsync<Recipe, Error>;
  updateRecipe: (
    id: string,
    recipeInfo: Partial<RecipeInfo>,
  ) => ResultAsync<Recipe, Error>;
  deleteRecipe: (id: string) => ResultAsync<void, Error>;
}

export interface RecipeStorage {
  recipe: RecipeStorageOps;
}
