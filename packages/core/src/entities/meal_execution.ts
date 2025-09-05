import {ResultAsync} from '@cucinalist/fp-types'
import { IndexOf, Reference } from "../types/reference";

/**
 * Represents the execution of a meal plan. It tracks the progress of the meal
 * preparation, including the current phase and step being executed.
 */
export interface MealExecution {
  id: string;
  mealPlanId: Reference<"MealPlan">;
  progress: null | {
    currentPhase: IndexOf<'prepPhases'>;
    currentStep: IndexOf<'phaseSteps'>;
  }
  startedAt: Date | null;
}

export interface MealExecutionProvider {
  getMealExecutionById: (id: string) => ResultAsync<MealExecution | null, Error>;
}
