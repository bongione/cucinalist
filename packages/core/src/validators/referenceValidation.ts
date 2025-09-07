import { Recipe, RecipeProvider } from "../entities/recipe";
import {
  StoreBoughtIngredient,
  StoreBoughtIngredientProvider,
} from "../entities/ingredient";
import {
  MeasuringFeature,
  unitOfMeasure,
  UnitOfMeasure,
} from "../entities/measurement";
import {
  CookingTechnique,
  CookingTechniqueProvider,
} from "../entities/cooking-technique";
import { Meal, MealProvider } from "../entities/meal";
import { ResultAsync, okAsync, Result } from "@cucinalist/fp-types";

export function validateUnitOfMeasureReference(
  qualifier: string,
): Result<boolean, Error> {
  return Result.fromThrowable(
    () => unitOfMeasure(qualifier).isJust(),
    (e) => new Error(String(e)),
  )();
}

export interface ValidateIngredientDependencies {
  ingredientProvider: StoreBoughtIngredientProvider;
}

export function validateIngredient(ingredient: StoreBoughtIngredient) {
  if (!ingredient) {
    return false;
  }
  if (!ingredient.name || ingredient.name.trim() === "") {
    return false;
  }
  return true;
}

export function validateIngredientReference(
  ingredientId: string,
  dependencies: ValidateIngredientDependencies,
): ResultAsync<boolean, Error> {
  return dependencies.ingredientProvider
    .getStoreBoughtIngredientById(ingredientId)
    .map((i) => validateIngredient(i));
}

export interface ValidateCookingTechniqueDependencies {
  cookingTechniqueProvider: CookingTechniqueProvider;
}

export function validateCookingTechniqueReference(
  techniqueId: string,
  dependencies: ValidateCookingTechniqueDependencies,
) {
  return dependencies.cookingTechniqueProvider
    .getCookingTechniqueById(techniqueId)
    .map(validateCookingTechnique);
}

export function validateCookingTechnique(ct: CookingTechnique) {
  if (!ct) {
    return false;
  }
  if (!ct.name || ct.name.trim() === "") {
    return false;
  }
  return true;
}

export interface RecipeReferenceValidationDependencies
  extends ValidateIngredientDependencies,
    ValidateCookingTechniqueDependencies {
  recipeProvider: RecipeProvider;
}

export interface MealReferenceValidationDependencies
  extends RecipeReferenceValidationDependencies {
  mealProvider: MealProvider;
}

export function validateRecipe(
  recipe: Omit<Recipe, "id"> | Recipe,
  dependencies: RecipeReferenceValidationDependencies,
): ResultAsync<boolean, Error> {
  if (!recipe) {
    return okAsync(false);
  }
  if (!recipe.name || recipe.name.trim() === "") {
    return okAsync(false);
  }

  const unitChecks = recipe.ingredients.map((i) =>
    validateUnitOfMeasureReference(i.unit),
  );
  if (unitChecks.some((r) => r.isErr() || r.value === false)) {
    return okAsync(false);
  }

  const ingredientsChecks = recipe.ingredients.map((i) =>
    i.ingredientId.type === "Recipe"
      ? (recipe as Recipe).id
        ? i.ingredientId.id === (recipe as Recipe).id
          ? okAsync(false)
          : validateRecipeReference(i.ingredientId.id, dependencies)
        : okAsync(true)
      : validateIngredientReference(i.ingredientId.id, dependencies),
  );
  // if (ingredientsChecks.some((e) => e.isErr() || e.value === false)) {
  //   return false;
  // }
  const techniquesChecks = recipe.steps.map((step) =>
    validateCookingTechniqueReference(step.techniqueId.id, dependencies),
  );
  return ResultAsync.combine([...ingredientsChecks, ...techniquesChecks]).map(
    (rs) => rs.every((b) => b),
  );
}

export function validateRecipeReference(
  recipeId: string,
  dependencies: RecipeReferenceValidationDependencies,
): ResultAsync<boolean, Error> {
  return dependencies.recipeProvider
    .getRecipeById(recipeId)
    .andThen((r) => validateRecipe(r, dependencies));
}

export function validateMealContents(
  meal: Omit<Meal, "id">,
  dependencies: RecipeReferenceValidationDependencies,
): ResultAsync<boolean, Error> {
  if (!meal) {
    return okAsync(false);
  }
  if (!meal.name || meal.name.trim() === "") {
    return okAsync(false);
  }
  if (!meal.courses || meal.courses.length === 0) {
    return okAsync(false);
  }
  if (meal.courses.some((c) => !c.recipesIds || c.recipesIds.length === 0)) {
    return okAsync(false);
  }
  const recipeChecks: ResultAsync<boolean, Error>[] = [];
  for (const course of meal.courses) {
    recipeChecks.push(
      ...course.recipesIds.map((r) =>
        r.type === "Recipe"
          ? validateRecipeReference(r.id, dependencies)
          : okAsync(false),
      ),
    );
  }
  return ResultAsync.combine(recipeChecks).map((rs) => rs.every((b) => b));
}

export function validateMealReference(
  mealId: string,
  dependencies: MealReferenceValidationDependencies,
): ResultAsync<boolean, Error> {
  return dependencies.mealProvider
    .getMealById(mealId)
    .andThen((m) => validateMealContents(m, dependencies));
}
