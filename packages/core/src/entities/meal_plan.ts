import { IndexOf, Reference } from "./reference";

/**
 * Represents a plan to deliver a meal, modelled as one or more preparation phases.
 * Each phase contains a set of preparation steps in a sequence that exploits
 * the parallelism of the meal preparation.
 */
export interface MealPlan {
  id: string;
  mealId: Reference<'Meal'>;
  prepPhases: MealPreparationPhase[];
}

/**
 * Structure to represent a step in a recipe, including the course and recipe.
 */
export interface MealPrepStep {
  courseIndex: IndexOf<'meal.courses'>;
  recipeIndex: IndexOf<'meal.courses.recipes'>;
  stepIndex: IndexOf<'meal.courses.recipes.steps'>;
}

/**
 * A meal preparation phase is a collection of steps. It allows breaking long
 * meal plans in distinct phases that can be done hours if not days apart.
 */
export interface MealPreparationPhase {
  id: string;
  name: string;
  description?: string;

  preparationSteps: MealPrepStep[];
}

/**
 * A meal plan generator is responsible for generating a meal plan based on
 * a meal and the number of diners.
 */
export interface MealPlanGenerator {
  generateMealPlan: (
    mealId: Reference<'Meal'>,
    diners: number,
  ) => Promise<MealPlan | null>;
}

/**
 * A meal plan provider is responsible for retrieving meal plans that have already been generated
 * from a data source.
 */
export interface MealPlanProvider {
  getMealPlanById: (id: string) => Promise<MealPlan | null>;
  getMealPlansByMealId: (
    mealId: Reference<'Meal'>,
  ) => Promise<MealPlan[]>;
}
