/**
 * This is the abstract syntax model of a recipe, where we provide strings
 * that are not determined to be IDs or not yet.
 *
 */

export interface RecipeIngredient {
  type: "RecipeIngredient";
  /** Could be either a recipe or a store bought ingredient */
  ingredientId: string;
  isOptional?: boolean;
  amount: {
    value: number;
    unit: string;
  };
}

export interface AtIndex<T> {
  type: T;
  atIndex: number;
}

export type StepInput =
  | AtIndex<"RecipeIngredient">
  | (AtIndex<"CookingStep"> & { atOutputIndex: number });

export type StepPrecondition = StepInput & {
  /** Could be either a recipe or a store bought ingredient */
  conditionDescription?: string;
};

export interface CookingStepOutput {
  type: "CookingStepOutput";
  outputId: string;
}

export interface CookingStep {
  type: "CookingStep";
  processId: string;
  preconditions: StepPrecondition[];
  ingredients: StepInput[];
  source?: StepInput;
  target?: StepInput;
  medium?: StepInput;
  activeMinutes: number;
  keepAnEyeMinutes: number;
  inactiveMinutes: number;
  produces: CookingStepOutput[];
  isOptional?: boolean;
}

export interface Recipe {
  type: "Recipe";
  id: string;
  name: string;
  serves: number;
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
}

export function validateASTRecipe(
  recipe: Recipe,
  options: { checkId?: boolean } = {},
): null | string[] {
  const { checkId = false } = options;
  const errors: string[] = [];
  if (
    !(
      recipe &&
      typeof recipe === "object" &&
      typeof recipe.name === "string" &&
      typeof recipe.serves === "number" &&
      Array.isArray(recipe.cookingSteps) &&
      Array.isArray(recipe.ingredients) &&
      recipe.type === "Recipe"
    )
  ) {
    errors.push("invalid type");
    return errors;
  }
  if (checkId) {
    if (!(typeof recipe.id === "string" && recipe.id.trim() !== "")) {
      errors.push("invalid id");
    }
  }
  if (
    !(
      recipe.name &&
      typeof recipe.name === "string" &&
      recipe.name.trim() !== ""
    )
  ) {
    errors.push("name is required");
  }
  if (!(Number.isFinite(recipe.serves) && recipe.serves > 0)) {
    errors.push("number of serves is incorrect");
  }
  if (!(recipe.ingredients && recipe.ingredients.length > 0)) {
    errors.push(`the recipe has no ingredients`);
  }
  if (!(recipe.cookingSteps && recipe.cookingSteps.length > 0)) {
    errors.push(`the recipe has no cookingSteps`);
  }
  for (const cookingStep of recipe.cookingSteps) {
    const stepInputs = [
      cookingStep.source,
      cookingStep.medium,
      cookingStep.target,
      ...cookingStep.ingredients,
      ...cookingStep.preconditions,
    ].filter((i) => Boolean(i));
    for (const stepInput of stepInputs) {
      const maxTargetIndex =
        stepInput.type === "RecipeIngredient"
          ? recipe.ingredients.length - 1
          : stepInput.type === "CookingStep"
            ? recipe.cookingSteps.length - 1
            : -1;
      if (
        !(
          Number.isInteger(stepInput.atIndex) &&
          stepInput.atIndex >= 0 &&
          stepInput.atIndex <= maxTargetIndex
        )
      ) {
        errors.push(`invalid stepInput index`);
      }
    }
  }
  return errors.length > 0 ? errors : null;
}
