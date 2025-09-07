import { okAsync, errAsync, ResultAsync } from "@cucinalist/fp-types";
import { Meal, MealProvider, validateMealContents } from "@cucinalist/core";
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
      const createdMeal = await mealProvider
        .getMealsByName(mealInfo.name)
        .andThen((existingMeals) =>
          existingMeals.findIndex(
            (m) =>
              m.name
                .toLocaleLowerCase()
                .localeCompare(mealInfo.name.toLocaleLowerCase()) === 0,
          ) === -1
            ? okAsync(existingMeals)
            : errAsync(
                new Error(`Meal with name "${mealInfo.name}" already exists.`),
              ),
        )
        .andThen(() => validateMealContents(mealInfo, dependencies))
        .andThen((isValid) =>
          isValid
            ? ResultAsync.fromThrowable(
                () => mealStorage.createMeal(mealInfo),
                (e) => new Error(String(e)),
              )()
            : errAsync(new Error("Invalid references in meal information.")),
        )
        .orTee(() => new Error("Error while validating meal information"));
      if (createdMeal.isErr()) {
        throw createdMeal.error;
      } else {
        return createdMeal.value;
      }
    },
    updateMeal: async (id, mealInfo) => {
      const updatedMeal = await mealProvider
        .getMealById(id)
        .andThen((m) =>
          m
            ? okAsync(m)
            : errAsync(new Error(`Meal with id "${id}" does not exist.`)),
        )
        .andTee((existingMeal) => {
          const updatedMealInfo = {
            ...existingMeal,
            ...mealInfo,
          };
          return validateMealContents(updatedMealInfo, dependencies);
        })
        .map(() => mealStorage.updateMeal(id, mealInfo))
        .orTee(() => new Error("Error while validating meal information"));
      if (updatedMeal.isErr()) {
        throw updatedMeal.error;
      } else {
        return updatedMeal.value;
      }
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
