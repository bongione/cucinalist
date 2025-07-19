import { Recipe, RecipeProvider } from "../entities/recipe";
import { StoreBoughtIngredientProvider } from "../entities/ingredient";
import {
  MeasuringFeatureProvider,
  UnitOfMeasureProvider,
} from "../entities/measurement";
import { CookingTechniqueProvider } from "../entities/cooking-technique";

export interface ValidateMeasuringFeatureDependencies {
  measuringFeatureProvider: MeasuringFeatureProvider;
}

export async function validateMeasuringFeatureReference(
  measuringFeatureId: string,
  dependencies: ValidateMeasuringFeatureDependencies,
): Promise<boolean> {
  const measuringFeature =
    await dependencies.measuringFeatureProvider.getMeasuringFeatureById(
      measuringFeatureId,
    );
  return Boolean(measuringFeature);
}

export interface ValidateUnitOfMeasureDependencies
  extends ValidateMeasuringFeatureDependencies {
  unitOfMeasureProvider: UnitOfMeasureProvider;
}

export async function validateUnitOfMeasureReference(
  unitId: string,
  dependencies: ValidateUnitOfMeasureDependencies,
): Promise<boolean> {
  const unit =
    await dependencies.unitOfMeasureProvider.getUnitOfMeasureById(unitId);
  if (!unit) {
    return false;
  }
  return unit.measuringId
    ? validateMeasuringFeatureReference(unit.measuringId, dependencies)
    : true;
}

export interface ValidateIngredientDependencies {
  storeBoughtIngredientProvider: StoreBoughtIngredientProvider;
}

export async function validateIngredientReference(
  ingredientId: string,
  dependencies: ValidateIngredientDependencies,
): Promise<boolean> {
  const ingredient =
    await dependencies.storeBoughtIngredientProvider.getStoreBoughtIngredientById(
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

export async function validateRecipeInternalReferences(
  recipe: Omit<Recipe, "id">| Recipe,
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
