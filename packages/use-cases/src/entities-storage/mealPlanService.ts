import {Reference, MealPlan, MealPlanProvider} from '@cucinalist/core';

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
