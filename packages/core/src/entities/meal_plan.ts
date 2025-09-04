import { IndexOf, Reference } from "../types/reference";

/**
 * Represents a plan to deliver a meal, modelled as one or more preparation phases.
 * Each phase contains a set of preparation steps in a sequence that exploits
 * the parallelism of the meal preparation.
 */
export interface MealPlan {
  id: string;
  mealId: Reference<"Meal">;
  prepPhases: MealPreparationPhase[];
}

export interface PlanStartNode {
  type: "start";
  nextNode: Exclude<PlanNode, PlanStartNode | JoinStepNode>;
}

export interface PlanEndNode {
  type: "end";
  previousNode: Exclude<PlanNode, PlanEndNode | PlanStepBranchNode>;
}

export interface PlanStepBranchNode {
  type: "branch";
  previousNode: PlanNode;
  branchesTips: PlanNode[];
}

export interface JoinStepNode {
  type: "join";
  joiningNodes: MealPrepStepNode[];
  nextNode: Exclude<PlanNode, PlanStartNode>;
}
export type PlanNode =
  | PlanStepBranchNode
  | MealPrepStepNode
  | JoinStepNode
  | PlanStartNode
  | PlanEndNode;

/**
 * Structure to represent a step in a recipe, including the course and recipe.
 */
export interface MealPrepStepNode {
  type: "stepNode";
  courseIndex: IndexOf<"meal.courses">;
  recipeIndex: IndexOf<"meal.courses.recipes">;
  stepIndex: IndexOf<"meal.courses.recipes.steps">;
  nextStep: PlanNode;
  previousStep: PlanNode;
}

/**
 * A meal preparation phase is a directed graph of step nodes that represent
 * a potentially parallel preparation of a meal.
 */
export interface MealPreparationPhase {
  id: string;
  name: string;
  description?: string;

  firstStep: PlanStartNode;
  lastStep: PlanEndNode;
  defaultStepSequence: MealPrepStepNode[];
}

/**
 * A meal plan provider is responsible for retrieving meal plans that have already been generated
 * from a data source.
 */
export interface MealPlanProvider {
  getMealPlanById: (id: string) => Promise<MealPlan | null>;
  getMealPlansByMealId: (mealId: Reference<"Meal">) => Promise<MealPlan[]>;
}
