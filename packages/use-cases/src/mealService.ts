import {
  Meal,
  MealProvider,
  validateMealInternalReferences,
} from "@cucinalist/core";
import { RecipeServiceDependencies } from "./recipeService";

export type MealInfo = Omit<Meal, "id">;

export interface MealService extends MealProvider {
  createMeal: (mealInfo: MealInfo) => Promise<Meal>;
  updateMeal: (id: string, mealInfo: Partial<MealInfo>) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
}

export interface MealStorage {
  createMeal: (mealInfo: MealInfo) => Promise<Meal>;
  updateMeal: (id: string, mealInfo: Partial<MealInfo>) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
}

export interface MealServiceDependencies extends RecipeServiceDependencies {
  mealStorage: MealStorage;
  mealProvider: MealProvider;
}

export function createMealService(
  dependencies: MealServiceDependencies,
): MealService {
  const { mealStorage, mealProvider } = dependencies;

  return {
    ...mealProvider,
    createMeal: async (mealInfo) => {
      const existingMeals = await mealProvider.getMealsByName(mealInfo.name);
      if (
        existingMeals.findIndex(
          (m) =>
            m.name
              .toLocaleLowerCase()
              .localeCompare(mealInfo.name.toLocaleLowerCase()) === 0,
        )
      ) {
        throw new Error(`Meal with name "${mealInfo.name}" already exists.`);
      }
      // Validate references
      const isValid = await validateMealInternalReferences(
        mealInfo,
        dependencies,
      );
      if (!isValid) {
        throw new Error("Invalid references in meal information.");
      }
      return mealStorage.createMeal(mealInfo);
    },
    updateMeal: async (id, mealInfo) => {
      const existingMeal = await mealProvider.getMealById(id);
      if (!existingMeal) {
        throw new Error(`Meal with id "${id}" does not exist.`);
      }
      const updatedMealInfo = {
        ...existingMeal,
        ...mealInfo,
      };
      // Validate references
      const isValid = await validateMealInternalReferences(
        updatedMealInfo,
        dependencies,
      );
      if (!isValid) {
        throw new Error("Invalid references in updated meal.");
      }
      return mealStorage.updateMeal(id, mealInfo);
    },
    deleteMeal: async (id) => {
      const existingMeal = await mealProvider.getMealById(id);
      if (!existingMeal) {
        throw new Error(`Meal with id "${id}" does not exist.`);
      }
      return mealStorage.deleteMeal(id);
    },
  };
}
