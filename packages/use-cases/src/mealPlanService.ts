import {Reference, MealPlan, MealPlanProvider} from '@cucinalist/core';
import { MealServiceDependencies } from "./mealService";

export type MealPlanInfo = Omit<MealPlan, "id">;

/**
 * A meal plan generator is responsible for generating a meal plan based on
 * a meal and the number of diners.
 */
export interface MealPlanGenerator {
  generateMealPlan: (
    mealId: Reference<"Meal">,
    diners: number,
  ) => Promise<MealPlanInfo>;
}

/**
 * A meal plan service is responsible for managing meal plans, including
 * generating new meal plans and retrieving existing ones.
 */
export interface MealPlanService extends MealPlanGenerator {
  saveMealPlan: (meal: MealPlanInfo) => Promise<MealPlan>;
  replaceMealPlan: (mealId: string, meal: MealPlanInfo) => Promise<MealPlan>;
  deleteMealPlan: (mealId: string) => Promise<void>;
}

export interface MealPlanServiceDependencies extends MealServiceDependencies {
  mealPlanGenerator: MealPlanGenerator;
  mealPlanStorage: {
    saveMealPlan: (meal: MealPlanInfo) => Promise<MealPlan>;
    replaceMealPlan: (mealId: string, meal: MealPlanInfo) => Promise<MealPlan>;
    deleteMealPlan: (mealId: string) => Promise<void>;
  };
  mealPlanProvider: MealPlanProvider;
}
