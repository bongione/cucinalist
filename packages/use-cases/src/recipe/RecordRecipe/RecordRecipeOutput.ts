import type {Recipe, StoreBoughtIngredientProvider, CookingTechnique, Measurement, StoreBoughtIngredient} from "@cucinalist/core";

/**
 * The RecordRecipeOutput interface represents the output of recording a recipe.
 * It includes the main recipe, any referred recipes, store-bought ingredients,
 * and cooking techniques used in the recipe.
 *
 * @interface RecordRecipeOutput
 */
export interface PresentSavedRecipe {
  type: 'PresentSavedRecipe';
  recipe: Recipe;
  referredRecipes: Recipe[];
  storeIngredients: StoreBoughtIngredient[];
  cookingTechniques: CookingTechnique[];
}

export interface ReportUnexpectedError {
  type: 'ReportUnexpectedError';
  error: Error;
}

export interface ReportInvalidInputError {
  type: 'ReportInvalidInputError';
  validationErrors: string[];
}

export interface ReportUnauthorizedError {
  type: 'ReportUnauthorizedError';
}

export type RecordRecipeOutputPresenterAction = PresentSavedRecipe | ReportUnexpectedError | ReportInvalidInputError | ReportUnauthorizedError;

export interface RecordRecipeRecordOutputBoundary {
  execute: (presentCommand: RecordRecipeOutputPresenterAction) => void;
}
