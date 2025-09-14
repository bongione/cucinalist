import type { ResultAsync } from "@cucinalist/fp-types";
import type { Meal, MealProvider } from "@cucinalist/core";

export type MealInfo = Omit<Meal, "id">;

export interface MealStorageOps extends MealProvider {
  createMeal: (mealInfo: MealInfo) => ResultAsync<Meal, Error>;
  updateMeal: (id: string, mealInfo: Partial<MealInfo>) => ResultAsync<Meal, Error>;
  deleteMeal: (id: string) => ResultAsync<void, Error>;
}


export interface MealStorage {
  meal: MealStorageOps;
}
