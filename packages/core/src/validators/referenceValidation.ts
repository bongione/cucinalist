import { Recipe, RecipeProvider } from "../entities/recipe";
import { StoreBoughtIngredientProvider } from "../entities/ingredient";
import {
  MeasuringFeatureProvider,
  UnitOfMeasure,
  UnitOfMeasureProvider,
} from "../entities/measurement";
import { CookingTechniqueProvider } from "../entities/cooking-technique";
import { Meal, MealProvider } from "../entities/meal";
import { err, errAsync, ResultAsync } from "@cucinalist/fp-types";
import { ok, okAsync } from "neverthrow";

export interface ValidateMeasuringFeatureDependencies {
  measuringFeatureProvider: MeasuringFeatureProvider;
}

export function validateMeasuringFeatureReference(
  measuringFeatureId: string,
  dependencies: ValidateMeasuringFeatureDependencies,
): ResultAsync<boolean, Error> {
  return dependencies.measuringFeatureProvider
    .getMeasuringFeatureById(measuringFeatureId)
    .map((mf) => mf.isJust());
}

export interface ValidateUnitOfMeasureDependencies
  extends ValidateMeasuringFeatureDependencies {
  unitOfMeasureProvider: UnitOfMeasureProvider;
}

export function validateUnitOfMeasureReference(
  unitId: string,
  dependencies: ValidateUnitOfMeasureDependencies,
): ResultAsync<boolean, Error> {
  return dependencies.unitOfMeasureProvider
    .getUnitOfMeasureById(unitId)
    .andThen((md) =>
      md.isJust()
        ? validateUnitOfMeasureContents(md.extract(), dependencies)
        : ok(false),
    );

}

function validateUnitOfMeasureContents(
  uom: UnitOfMeasure,
  dependencies: ValidateUnitOfMeasureDependencies,
): ResultAsync<boolean, Error> {
  if (uom.measuringId) {
    return validateMeasuringFeatureReference(uom.measuringId, dependencies);
  }
  return okAsync(true);
}

export interface ValidateIngredientDependencies {
  ingredientProvider: StoreBoughtIngredientProvider;
}

export async function validateIngredientReference(
  ingredientId: string,
  dependencies: ValidateIngredientDependencies,
): Promise<boolean> {
  const ingredient =
    await dependencies.ingredientProvider.getStoreBoughtIngredientById(
      ingredientId,
    );
  return Boolean(ingredient);
}

export interface ValidateCookingTechniqueDependencies {
  cookingTechniqueProvider: CookingTechniqueProvider;
}

export async function validateCookingTechniqueReference(
  techniqueId: string,
  dependencies: ValidateCookingTechniqueDependencies,
): Promise<boolean> {
  const technique =
    await dependencies.cookingTechniqueProvider.getCookingTechniqueById(
      techniqueId,
    );
  return Boolean(technique);
}

export interface RecipeReferenceValidationDependencies
  extends ValidateUnitOfMeasureDependencies,
    ValidateIngredientDependencies,
    ValidateCookingTechniqueDependencies {
  recipeProvider: RecipeProvider;
}

export interface MealReferenceValidationDependencies
  extends RecipeReferenceValidationDependencies {
  mealProvider: MealProvider;
}

export async function validateRecipeInternalReferences(
  recipe: Omit<Recipe, "id"> | Recipe,
  dependencies: RecipeReferenceValidationDependencies,
) {
  const ingredientsChecks = await Promise.all(
    recipe.ingredients.map((i) =>
      i.ingredientId.type === "Recipe"
        ? (recipe as Recipe).id
          ? i.ingredientId.id === (recipe as Recipe).id
            ? false
            : validateRecipeReference(i.ingredientId.id, dependencies)
          : true
        : validateIngredientReference(i.ingredientId.id, dependencies),
    ),
  );
  if (ingredientsChecks.some((e) => e === false)) {
    return false;
  }
  const unitChecks = await Promise.all(
    recipe.ingredients.map((i) =>
      dependencies.unitOfMeasureProvider.getUnitOfMeasureById(i.unitId.id),
    ),
  );
  if (unitChecks.findIndex((u) => u === null) !== -1) {
    return false;
  }
  const techniquesChecks = await Promise.all(
    recipe.steps.map((step) =>
      validateCookingTechniqueReference(step.techniqueId.id, dependencies),
    ),
  );
  if (techniquesChecks.some((e) => e === false)) {
    return false;
  }
  return true;
}

export async function validateRecipeReference(
  recipeId: string,
  dependencies: RecipeReferenceValidationDependencies,
) {
  const recipe = await dependencies.recipeProvider.getRecipeById(recipeId);
  if (!recipe) {
    return false;
  }
  return validateRecipeInternalReferences(recipe, dependencies);
}

export async function validateMealInternalReferences(
  meal: Omit<Meal, "id">,
  dependencies: RecipeReferenceValidationDependencies,
) {
  for (const course of meal.courses) {
    const recipeChecks = await Promise.all(
      course.recipesIds.map(async (r) =>
        r.type === "Recipe"
          ? validateRecipeReference(r.id, dependencies)
          : false,
      ),
    );
    if (recipeChecks.includes(false)) {
      return false;
    }
  }
  return true;
}

export async function validateMealReference(
  mealId: string,
  dependencies: MealReferenceValidationDependencies,
): Promise<boolean> {
  const meal = await dependencies.mealProvider.getMealById(mealId);
  if (!meal) {
    return false;
  }
  return validateMealInternalReferences(meal, dependencies);
}
