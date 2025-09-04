import { IndexOf, Reference } from "../types/reference";

/**
 * A recipe describes how to prepare a dish, including the ingredients and steps
 * involved.
 *
 * It's the core entity of the Cucinalist domain model, linking ingredients with
 * the process to create them, and how the cooking steps relate to each other.
 */
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  ingredients: IngredientWithQuantity[];
  steps?: CookingStep[];
  tags?: string[];
}

/**
 * Represents an ingredient with a specific quantity and unit of measure.
 */
export interface IngredientWithQuantity {
  ingredientId: Reference<"StoreBoughtIngredient" | "Recipe">;
  quantity: number;
  unitId: Reference<"Unit">;
}

/**
 * Represents the level of attention needed during a cooking step. Full attention
 * means that the process is all consuming, while lower levels indicate that
 * you can step away for a while if not do something completely in parallel.
 */
export enum AttentionNeeded {
  FullAttention = "FullAttention",
  CheckRegularly = "CheckRegularly",
  CheckOccasionally = "CheckOccasionally",
  CanUseTimer = "CanUseTimer",
}

/**
 * The duration of a cooking step, including the level of attention needed.
 */
export interface Duration {
  attention: AttentionNeeded;
  minutes: number;
}

/**
 * A step precondition points to what ingredient or step output is needed before
 * one con proceed with the cooking step. An optional description can be
 * attached to clarify the condition.
 */
export interface StepPrecondition<T extends string> extends IndexOf<T> {
  conditionDescription?: string;
}


/**
 * Represents a cooking step in a recipe, detailing the technique used, duration,
 * inputs, and any dependencies on other ingredients or steps.
 */
export interface CookingStep {
  id: string;
  techniqueId: Reference<"CookingTechnique">;
  duration: Duration;
  description?: string;
  dependsOn: StepPrecondition<"RecipeIngredients" | "RecipeSteps">[];
  inputs: StepInput[];
  produces?: string;
}

/**
 * Represents an input to a cooking step, which can be a portion of an ingredient
 * or a reference to the output to another step in the recipe.
 */
export interface StepInput {
  portion?: number;
  ingredientIndex: IndexOf<"RecipeIngredients" | "RecipeSteps">;
}

/**
 * Represents a recipe provider that can fetch recipes by ID, name or tag.
 */
export interface RecipeProvider {
  getRecipeById: (id: string) => Promise<Recipe | null>;
  getRecipesByName: (name: string) => Promise<Recipe[]>;
  getRecipesByTag: (tag: string) => Promise<Recipe[]>;
}
