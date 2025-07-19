import {
  Recipe,
  RecipeProvider,
  CookingTechniqueProvider,
  StoreBoughtIngredientProvider,
  UnitOfMeasureProvider,
  validateRecipeInternalReferences
} from '@cucinalist/core';

export type RecipeInfo = Omit<Recipe, 'id'>;

export interface RecipeService extends RecipeProvider {
  createRecipe: (recipeInfo: RecipeInfo) => Promise<Recipe>;
  updateRecipe: (id: string, recipeInfo: Partial<RecipeInfo>) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
}

export interface RecipeStorage {
  createRecipe: (recipeInfo: RecipeInfo) => Promise<Recipe>;
  updateRecipe: (id: string, recipeInfo: Partial<RecipeInfo>) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
}

export interface RecipeServiceDependencies {
  recipeStorage: RecipeStorage;
  recipeProvider: RecipeProvider;
  cookingTechniqueProvider: CookingTechniqueProvider;
  storeBoughtIngredientProvider: StoreBoughtIngredientProvider;
  unitOfMeasureProvider: UnitOfMeasureProvider;
}

export function createRecipeService(
  dependencies: RecipeServiceDependencies,
): RecipeService {
  const {
    recipeStorage,
    recipeProvider,
    cookingTechniqueProvider,
    storeBoughtIngredientProvider,
    unitOfMeasureProvider
  } = dependencies;

  return {
    ...recipeProvider,
    createRecipe: async (recipeInfo) => {
      const existingRecipes = await recipeProvider.getRecipesByName(recipeInfo.name);
      if (existingRecipes.some((r) => r.name === recipeInfo.name)) {
        throw new Error(`Recipe with name "${recipeInfo.name}" already exists.`);
      }
      // Validate references

      return recipeStorage.createRecipe(recipeInfo);
    },
    updateRecipe: (id, recipeInfo) =>
      recipeStorage.updateRecipe(id, recipeInfo),
    deleteRecipe: (id) => recipeStorage.deleteRecipe(id),
  };
}
