import { CookingTechniqueStorage } from "./cookingTechniqueStorage.js";

export {
  CookingTechniqueInfo,
  CookingTechniqueStorage,
  CookingTechnique,
} from "./cookingTechniqueStorage.js";

export {
  IngredientService,
  IngredientStorage,
  StoreBoughtIngredientInfo,
  IngredientServiceDependencies,
} from "./ingredientService.js";

export {
  RecipeService,
  RecipeServiceDependencies,
  RecipeStorage,
  RecipeInfo,
} from "./recipeService.js";

export {
  MealInfo,
  MealService,
  MealServiceDependencies,
  MealStorage,
  createMealService,
} from "./mealService.js";

export type EntitiesStorageApi = CookingTechniqueStorage;

export interface EntitiesStorageTaskOrTx<R> {
  (measurementStorage: EntitiesStorageApi): R;
}

export interface EntitiesStorageProvider {
  tx: <R>(fn: EntitiesStorageTaskOrTx<R>) => R;
  task: <R>(fn: EntitiesStorageTaskOrTx<R>) => R;
}
