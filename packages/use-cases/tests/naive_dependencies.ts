import { ResultAsync } from "@cucinalist/fp-types";
import {
  CookingTechnique,
  MeasuringFeature,
  UnitOfMeasure,
  StoreBoughtIngredient,
  Recipe,
  Meal,
} from "@cucinalist/core";
import {
  MeasurementServiceDependencies,
  CookingTechniqueServiceDependencies,
  IngredientServiceDependencies,
  RecipeServiceDependencies,
  MealServiceDependencies,
} from "../src/data_interface";

interface MeasurementServiceData {
  measuringFeatures?: MeasuringFeature[];
  unitsOfMeasure?: UnitOfMeasure[];
}

export function createNaiveMeasurementServiceDependencies({
  measuringFeatures = [],
  unitsOfMeasure = [],
}: MeasurementServiceData = {}): MeasurementServiceDependencies {
  const features: Map<string, MeasuringFeature> = new Map(
    measuringFeatures.map((f) => [f.id, f]),
  );
  const units: Map<string, UnitOfMeasure> = new Map(
    unitsOfMeasure.map((u) => [u.id, u]),
  );
  return {
    measuringFeatureProvider: {
      getMeasuringFeatureById: ResultAsync.fromThrowable(
        async (id: string) => {
          return features.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getMeasuringFeaturesByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(features.values()).filter(
            (feature) => feature.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    unitOfMeasureProvider: {
      getUnitOfMeasureById: ResultAsync.fromThrowable(
        async (id: string) => {
          return units.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getUnitsOfMeasureByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(units.values()).filter(
            (unit) => unit.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    measurementStore: {
      createMeasuringFeature: ResultAsync.fromThrowable(
        async (measuringFeatureInfo) => {
          const id = crypto.randomUUID();
          const feature = { id, ...measuringFeatureInfo };
          features.set(id, feature);
          return feature;
        },
        (e) => new Error(String(e)),
      ),
      updateMeasuringFeature: ResultAsync.fromThrowable(
        async (id, measuringFeatureInfo) => {
          if (!features.has(id)) throw new Error("Measuring feature not found");
          const updatedFeature = {
            ...features.get(id),
            ...measuringFeatureInfo,
          };
          features.set(id, updatedFeature);
          return updatedFeature;
        },
        (e) => new Error(String(e)),
      ),
      deleteMeasuringFeature: ResultAsync.fromThrowable(
        async (id) => {
          if (!features.has(id)) throw new Error("Measuring feature not found");
          features.delete(id);
        },
        (e) => new Error(String(e)),
      ),
      createUnitOfMeasure: ResultAsync.fromThrowable(
        async (unitOfMeasureInfo) => {
          const id = crypto.randomUUID();
          const unit = { id, ...unitOfMeasureInfo };
          units.set(id, unit);
          return unit;
        },
        (e) => new Error(String(e)),
      ),
      updateUnitOfMeasure: ResultAsync.fromThrowable(
        async (unitId, unitOfMeasureInfo) => {
          if (!units.has(unitId)) throw new Error("Unit of measure not found");
          const updatedUnit = { ...units.get(unitId), ...unitOfMeasureInfo };
          units.set(unitId, updatedUnit);
          return updatedUnit;
        },
        (e) => new Error(String(e)),
      ),
      deleteUnitOfMeasure: ResultAsync.fromThrowable(
        async (unitId) => {
          if (!units.has(unitId)) throw new Error("Unit of measure not found");
          units.delete(unitId);
        },
        (e) => new Error(String(e)),
      ),
    },
  };
}

interface CookingTechniqueServiceData {
  cookingTechniques?: CookingTechnique[];
}

export function createNaiveCookingTechniqueServiceDependencies({
  cookingTechniques = [],
}: CookingTechniqueServiceData = {}): CookingTechniqueServiceDependencies {
  const techniques: Map<string, CookingTechnique> = new Map(
    cookingTechniques.map((c) => [c.id, c]),
  );
  return {
    cookingTechniqueProvider: {
      getCookingTechniqueById: ResultAsync.fromThrowable(
        async (id: string) => {
          return techniques.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getCookingTechniquesByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(techniques.values()).filter(
            (technique) => technique.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    cookingTechniqueStorage: {
      createCookingTechnique: async (techniqueInfo) => {
        const id = crypto.randomUUID();
        const technique = { id, ...techniqueInfo };
        techniques.set(id, technique);
        return technique;
      },
      updateCookingTechnique: async (id, techniqueInfo) => {
        if (!techniques.has(id)) throw new Error("Cooking technique not found");
        const updatedTechnique = { ...techniques.get(id), ...techniqueInfo };
        techniques.set(id, updatedTechnique);
        return updatedTechnique;
      },
      deleteCookingTechnique: async (id) => {
        if (!techniques.has(id)) throw new Error("Cooking technique not found");
        techniques.delete(id);
      },
    },
  };
}

interface IngredientServiceData {
  storeBoughtIngredients?: StoreBoughtIngredient[];
}

export function createNaiveIngredientServiceDependencies({
  storeBoughtIngredients = [],
}: IngredientServiceData = {}): IngredientServiceDependencies {
  const ingredients: Map<string, StoreBoughtIngredient> = new Map(
    storeBoughtIngredients.map((i) => [i.id, i]),
  );
  return {
    ingredientProvider: {
      getStoreBoughtIngredientById: ResultAsync.fromThrowable(
        async (id: string) => {
          return ingredients.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getStoreBoughtIngredientsByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(ingredients.values()).filter(
            (ingredient) => ingredient.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    ingredientStorage: {
      createStoreBoughtIngredient: async (ingredientInfo) => {
        const id = crypto.randomUUID();
        const ingredient = { id, ...ingredientInfo };
        ingredients.set(id, ingredient);
        return ingredient;
      },
      updateStoreBoughtIngredient: async (id, ingredientInfo) => {
        if (!ingredients.has(id)) throw new Error("Ingredient not found");
        const updatedIngredient = { ...ingredients.get(id), ...ingredientInfo };
        ingredients.set(id, updatedIngredient);
        return updatedIngredient;
      },
      deleteStoreBoughtIngredient: async (id) => {
        if (!ingredients.has(id)) throw new Error("Ingredient not found");
        ingredients.delete(id);
      },
    },
  };
}

interface RecipeServiceData
  extends IngredientServiceData,
    MeasurementServiceData,
    CookingTechniqueServiceData {
  recipes?: Recipe[]; // Replace 'any' with actual recipe type
}

export function createNaiveRecipeServiceDependencies(
  data: RecipeServiceData = {},
): RecipeServiceDependencies {
  const recipes: Map<string, any> = new Map(
    (data.recipes || []).map((r) => [r.id, r]),
  );
  return {
    ...createNaiveCookingTechniqueServiceDependencies(data),
    ...createNaiveMeasurementServiceDependencies(data),
    ...createNaiveIngredientServiceDependencies(data),
    recipeProvider: {
      getRecipeById: ResultAsync.fromThrowable(
        async (id: string) => {
          return recipes.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getRecipesByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(recipes.values()).filter(
            (recipe) => recipe.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    recipeStorage: {
      createRecipe: async (recipeInfo) => {
        const id = crypto.randomUUID();
        const recipe = { id, ...recipeInfo };
        recipes.set(id, recipe);
        return recipe;
      },
      updateRecipe: async (id, recipeInfo) => {
        if (!recipes.has(id)) throw new Error("Recipe not found");
        const updatedRecipe = { ...recipes.get(id), ...recipeInfo };
        recipes.set(id, updatedRecipe);
        return updatedRecipe;
      },
      deleteRecipe: async (id) => {
        if (!recipes.has(id)) throw new Error("Recipe not found");
        recipes.delete(id);
      },
    },
  };
}

interface MealServiceData extends RecipeServiceData {
  meals?: Meal[]; // Replace 'any' with actual recipe type
}

export function createNaiveMealServiceDependencies(
  data: MealServiceData = {},
): MealServiceDependencies {
  const meals: Map<string, Meal> = new Map(
    data.meals ? data.meals.map((m) => [m.id, m]) : [],
  );
  // Placeholder for meal service dependencies
  return {
    ...createNaiveRecipeServiceDependencies(data),
    mealProvider: {
      getMealById: ResultAsync.fromThrowable(
        async (id: string) => {
          return meals.get(id) || null;
        },
        (e) => new Error(String(e)),
      ),
      getMealsByName: ResultAsync.fromThrowable(
        async (name: string) => {
          return Array.from(meals.values()).filter(
            (meal) => meal.name === name,
          );
        },
        (e) => new Error(String(e)),
      ),
    },
    mealStorage: {
      createMeal: async (mealInfo) => {
        const id = crypto.randomUUID();
        const meal = { id, ...mealInfo };
        meals.set(id, meal);
        return meal;
      },
      updateMeal: async (id, mealInfo) => {
        if (!meals.has(id)) throw new Error("Meal not found");
        const updatedMeal = { ...meals.get(id), ...mealInfo };
        meals.set(id, updatedMeal);
        return updatedMeal;
      },
      deleteMeal: async (id) => {
        if (!meals.has(id)) throw new Error("Meal not found");
        meals.delete(id);
      },
    },
  };
}
