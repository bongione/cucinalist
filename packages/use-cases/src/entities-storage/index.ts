import type { CookingTechniqueStorage } from "./cookingTechniqueStorage.js";
import type { StoreBoughtIngredientStorage } from "./storeBoughtIngredientStorage.js";
import type { RecipeStorage } from "./recipeStorage.js";
import type { MealStorage } from "./mealStorage.js";
import { TransactionalStorage } from "./transactionalStorage.js";

export type {
  CookingTechniqueInfo,
  CookingTechniqueStorage,
} from "./cookingTechniqueStorage.js";

export type {
  StoreBoughtIngredientInfo,
  StoreBoughtIngredientStorage,
} from "./storeBoughtIngredientStorage.js";

export type { RecipeStorage, RecipeInfo } from "./recipeStorage.js";

export type { MealStorage, MealInfo } from "./mealStorage.js";

export type EntitiesStorageApi = CookingTechniqueStorage &
  StoreBoughtIngredientStorage &
  RecipeStorage &
  MealStorage;

export type EntitiesStorageProvider = TransactionalStorage<EntitiesStorageApi>;
