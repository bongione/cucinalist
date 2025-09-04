import {
  Recipe,
  RecipeProvider,
  CookingTechniqueProvider,
  StoreBoughtIngredientProvider,
  UnitOfMeasureProvider,
  MeasuringFeatureProvider,
  validateRecipeInternalReferences,
} from "@cucinalist/core";
import isEqual from "fast-deep-equal";

export type RecipeInfo = Omit<Recipe, "id">;

export interface RecipeService extends RecipeProvider {
  createRecipe: (recipeInfo: RecipeInfo) => Promise<Recipe>;
  updateRecipe: (
    id: string,
    recipeInfo: Partial<RecipeInfo>,
  ) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
}

export interface RecipeStorage {
  createRecipe: (recipeInfo: RecipeInfo) => Promise<Recipe>;
  updateRecipe: (
    id: string,
    recipeInfo: Partial<RecipeInfo>,
  ) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
}

export interface RecipeServiceDependencies {
  recipeStorage: RecipeStorage;
  recipeProvider: RecipeProvider;
  cookingTechniqueProvider: CookingTechniqueProvider;
  ingredientProvider: StoreBoughtIngredientProvider;
  measuringFeatureProvider: MeasuringFeatureProvider;
  unitOfMeasureProvider: UnitOfMeasureProvider;
}

export function createRecipeService(
  dependencies: RecipeServiceDependencies,
): RecipeService {
  const { recipeStorage, recipeProvider } = dependencies;

  return {
    ...recipeProvider,
    createRecipe: async (recipeInfo) => {
      const existingRecipes = await recipeProvider.getRecipesByName(
        recipeInfo.name,
      );
      if (existingRecipes.some((r) => r.name === recipeInfo.name)) {
        throw new Error(
          `Recipe with name "${recipeInfo.name}" already exists.`,
        );
      }
      // Validate references
      const isValid = await validateRecipeInternalReferences(
        recipeInfo,
        dependencies,
      );
      if (!isValid) {
        throw new Error("Recipe contains invalid references.");
      }
      return recipeStorage.createRecipe(recipeInfo);
    },
    updateRecipe: async (id, recipeInfo) => {
      const existingRecipe = await recipeProvider.getRecipeById(id);
      if (!existingRecipe) {
        throw new Error(`Recipe with id "${id}" does not exist.`);
      }
      const updatedRecipe = Object.assign({}, existingRecipe, recipeInfo);
      if (isEqual(existingRecipe, updatedRecipe)) {
        return existingRecipe;
      }
      const isValid = await validateRecipeInternalReferences(
        updatedRecipe,
        dependencies,
      );
      if (!isValid) {
        throw new Error("Recipe contains invalid references.");
      }
      return recipeStorage.updateRecipe(id, recipeInfo);
    },

    deleteRecipe: async (id) => {
      const existingRecipe = await recipeProvider.getRecipeById(id);
      if (!existingRecipe) {
        throw new Error(`Recipe with id "${id}" does not exist.`);
      }
      return recipeStorage.deleteRecipe(id);
    },
  };
}
