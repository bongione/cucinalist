import { describe, expect, it } from "vitest";
import { Just, Nothing, okAsync, Maybe } from "@cucinalist/fp-types";
import {
  AttentionNeeded,
  CookingTechnique,
  MeasuringFeature,
  Recipe,
  StoreBoughtIngredient,
  UnitOfMeasure,
  Meal,
  validateCookingTechniqueReference,
  validateIngredientReference,
  validateMeasuringFeatureReference,
  validateRecipeReference,
  validateRecipeInternalReferences,
  validateUnitOfMeasureReference,
  MealReferenceValidationDependencies,
  validateMealInternalReferences,
} from "../src";

function createStaticProviders(values: {
  measuringFeatures?: MeasuringFeature[];
  unitsOfMeasure?: UnitOfMeasure[];
  storeBoughtIngredients?: StoreBoughtIngredient[];
  cookingTechniques?: CookingTechnique[];
  recipes?: Recipe[];
  Meals?: Meal[];
}): MealReferenceValidationDependencies {
  const measuringFeatures = values.measuringFeatures || [];
  const unitsOfMeasure = values.unitsOfMeasure || [];
  const storeBoughtIngredients = values.storeBoughtIngredients || [];
  const cookingTechniques = values.cookingTechniques || [];
  const recipes = values.recipes || [];
  const Meals = values.Meals || [];

  return {
    measuringFeatureProvider: {
      getMeasuringFeatureById: (id: string) => {
        return okAsync(
          Maybe.fromNullable(
            measuringFeatures.find((feature) => feature.id === id),
          ),
        );
      },
      getMeasuringFeaturesByName: (name: string) => {
        return okAsync(
          measuringFeatures.filter((feature) => feature.name === name),
        );
      },
    },
    unitOfMeasureProvider: {
      getUnitOfMeasureById: (id: string) => {
        return okAsync(
          Maybe.fromNullable(unitsOfMeasure.find((unit) => unit.id === id)),
        );
      },
      getUnitsOfMeasureByName: (name: string) => {
        return okAsync(unitsOfMeasure.filter((unit) => unit.name === name));
      },
    },
    ingredientProvider: {
      getStoreBoughtIngredientById: async (id: string) => {
        return (
          values.storeBoughtIngredients?.find(
            (ingredient) => ingredient.id === id,
          ) || null
        );
      },
      getStoreBoughtIngredientsByName: async (name: string) => {
        return (
          values.storeBoughtIngredients?.filter(
            (ingredient) => ingredient.name === name,
          ) || []
        );
      },
    },
    cookingTechniqueProvider: {
      getCookingTechniqueById: async (id: string) => {
        return (
          values.cookingTechniques?.find((technique) => technique.id === id) ||
          null
        );
      },
      getCookingTechniquesByName: async (name: string) => {
        return (
          values.cookingTechniques?.filter(
            (technique) => technique.name === name,
          ) || []
        );
      },
    },
    recipeProvider: {
      getRecipeById: async (id: string) => {
        return values.recipes?.find((recipe) => recipe.id === id) || null;
      },
      getRecipesByName: async (name: string) => {
        return values.recipes?.filter((recipe) => recipe.name === name) || [];
      },
      getRecipesByTag: async (tag: string) => {
        return (
          values.recipes?.filter((recipe) => recipe.tags?.includes(tag)) || []
        );
      },
    },
    mealProvider: {
      getMealById: async (id: string) => {
        return values.Meals?.find((meal) => meal.id === id) || null;
      },
      getMealsByName: async (name: string) => {
        return values.Meals?.filter((meal) => meal.name === name) || [];
      },
    },
  };
}

describe("No entities", () => {
  it("should return false for all references", async () => {
    const dependencies = createStaticProviders({});

    const measuringFeatureValid = await validateMeasuringFeatureReference(
      "nonexistent",
      dependencies,
    );
    expect(measuringFeatureValid._unsafeUnwrap()).toBeFalsy();

    const unitOfMeasureValid = await validateUnitOfMeasureReference(
      "nonexistent",
      dependencies,
    );
    expect(unitOfMeasureValid._unsafeUnwrap()).toBeFalsy();

    const ingredientValid = await validateIngredientReference(
      "nonexistent",
      dependencies,
    );
    expect(ingredientValid).toBeFalsy();

    const techniqueValid = await validateCookingTechniqueReference(
      "nonexistent",
      dependencies,
    );
    expect(techniqueValid).toBeFalsy();

    const recipeValid = await validateRecipeReference(
      "nonexistent",
      dependencies,
    );
    expect(recipeValid).toBeFalsy();
  });
});

describe("One entity of each type", () => {
  const dependencies = createStaticProviders({
    measuringFeatures: [{ id: "mf1", name: "grams" }],
    unitsOfMeasure: [{ id: "uom1", name: "kilogram", measuringId: "mf1" }],
    storeBoughtIngredients: [
      { id: "si1", name: "sugar", synonyms: [], measuredAsIds: ["uom1"] },
    ],
    cookingTechniques: [{ id: "ct1", name: "boiling" }],
    recipes: [
      {
        id: "r1",
        name: "Sugar Syrup",
        servings: 4,
        ingredients: [
          {
            ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
            quantity: 100,
            unitId: { type: "Unit", id: "uom1" },
          },
        ],
        tags: [],
        steps: [
          {
            id: "step1",
            techniqueId: { type: "CookingTechnique", id: "ct1" },
            duration: { attention: AttentionNeeded.FullAttention, minutes: 10 },
            inputs: [
              {
                ingredientIndex: { type: "RecipeIngredients", index: 0 },
                portion: 1,
              },
            ],
            produces: "Out1",
            dependsOn: [],
            description: "Boil the sugar with water",
          },
        ],
      },
    ],
  });

  it("Validate single entity", async () => {
    const measuringFeatureValid = await validateMeasuringFeatureReference(
      "mf1",
      dependencies,
    );
    expect(measuringFeatureValid).toBeTruthy();

    const unitOfMeasureValid = await validateUnitOfMeasureReference(
      "uom1",
      dependencies,
    );
    expect(unitOfMeasureValid).toBeTruthy();

    const ingredientValid = await validateIngredientReference(
      "si1",
      dependencies,
    );
    expect(ingredientValid).toBeTruthy();

    const techniqueValid = await validateCookingTechniqueReference(
      "ct1",
      dependencies,
    );
    expect(techniqueValid).toBeTruthy();

    const recipeValid = await validateRecipeReference("r1", dependencies);
    expect(recipeValid).toBeTruthy();
  });

  it("Validate recipe info", async () => {
    const recipeInfo: Omit<Recipe, "id"> = {
      name: "Sugar Syrup",
      servings: 4,
      ingredients: [
        {
          ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
          quantity: 100,
          unitId: { type: "Unit", id: "uom1" },
        },
      ],
      tags: [],
      steps: [
        {
          id: "step1",
          techniqueId: { type: "CookingTechnique", id: "ct1" },
          duration: { attention: AttentionNeeded.FullAttention, minutes: 10 },
          inputs: [
            {
              ingredientIndex: { type: "RecipeIngredients", index: 0 },
              portion: 1,
            },
          ],
          produces: "Out1",
          dependsOn: [],
          description: "Boil the sugar with water",
        },
      ],
    };
    expect(
      await validateRecipeInternalReferences(recipeInfo, dependencies),
    ).toBeTruthy();
  });

  it("Should return false for invalid recipe references", async () => {
    const invalidRecipe: Omit<Recipe, "id"> = {
      name: "Invalid Recipe",
      servings: 2,
      ingredients: [
        {
          ingredientId: { type: "StoreBoughtIngredient", id: "nonexistent" },
          quantity: 50,
          unitId: { type: "Unit", id: "uom1" },
        },
      ],
      tags: [],
      steps: [
        {
          id: "step1",
          techniqueId: { type: "CookingTechnique", id: "ct1" },
          duration: { attention: AttentionNeeded.FullAttention, minutes: 5 },
          inputs: [],
          produces: "Out1",
          dependsOn: [],
          description: "Invalid step",
        },
      ],
    };

    expect(
      await validateRecipeInternalReferences(invalidRecipe, dependencies),
    ).toBeFalsy();
  });

  it("Should return false on self-reference", async () => {
    const dependencies = createStaticProviders({
      measuringFeatures: [{ id: "mf1", name: "grams" }],
      unitsOfMeasure: [{ id: "uom1", name: "kilogram", measuringId: "mf1" }],
      storeBoughtIngredients: [
        { id: "si1", name: "sugar", synonyms: [], measuredAsIds: ["uom1"] },
      ],
      cookingTechniques: [{ id: "ct1", name: "boiling" }],
      recipes: [
        {
          id: "r1",
          name: "Sugar Syrup",
          servings: 4,
          ingredients: [
            {
              ingredientId: { type: "Recipe", id: "r1" },
              quantity: 100,
              unitId: { type: "Unit", id: "uom1" },
            },
          ],
          tags: [],
          steps: [
            {
              id: "step1",
              techniqueId: { type: "CookingTechnique", id: "ct1" },
              duration: {
                attention: AttentionNeeded.FullAttention,
                minutes: 10,
              },
              inputs: [
                {
                  ingredientIndex: { type: "RecipeIngredients", index: 0 },
                  portion: 1,
                },
              ],
              produces: "Out1",
              dependsOn: [],
              description: "Boil the sugar with water",
            },
          ],
        },
      ],
    });

    expect(await validateRecipeReference("r1", dependencies)).toBeFalsy();
  });

  it("Should return false on meal with recipe self-reference", async () => {
    const dependencies = createStaticProviders({
      measuringFeatures: [{ id: "mf1", name: "grams" }],
      unitsOfMeasure: [{ id: "uom1", name: "kilogram", measuringId: "mf1" }],
      storeBoughtIngredients: [
        { id: "si1", name: "sugar", synonyms: [], measuredAsIds: ["uom1"] },
      ],
      cookingTechniques: [{ id: "ct1", name: "boiling" }],
      recipes: [
        {
          id: "rc1",
          name: "Recipe with Self Reference",
          servings: 2,
          ingredients: [
            {
              ingredientId: { type: "Recipe", id: "rc1" },
              quantity: 100,
              unitId: { type: "Unit", id: "uom1" },
            },
          ],
          tags: [],
          steps: [
            {
              id: "step1",
              techniqueId: { type: "CookingTechnique", id: "ct1" },
              duration: {
                attention: AttentionNeeded.FullAttention,
                minutes: 10,
              },
              inputs: [
                {
                  ingredientIndex: { type: "RecipeIngredients", index: 0 },
                  portion: 1,
                },
              ],
              produces: "Out1",
              dependsOn: [],
              description: "Cook the recipe with self reference",
            },
          ],
        },
      ],
      Meals: [
        {
          id: "m1",
          name: "Meal with Self Reference",
          diners: 1,
          courses: [
            {
              recipesIds: [{ type: "Recipe", id: "rc1" }],
            },
          ],
        },
      ],
    });

    expect(
      await validateMealInternalReferences(
        {
          name: "Meal with Self Reference",
          courses: [{ recipesIds: [{ type: "Recipe", id: "m1" }] }],
          diners: 1,
        },
        dependencies,
      ),
    ).toBeFalsy();
  });

  it("Should return false on meal with invalid recipe reference", async () => {
    const dependencies = createStaticProviders({
      measuringFeatures: [{ id: "mf1", name: "grams" }],
      unitsOfMeasure: [{ id: "uom1", name: "kilogram", measuringId: "mf1" }],
      storeBoughtIngredients: [
        { id: "si1", name: "sugar", synonyms: [], measuredAsIds: ["uom1"] },
      ],
      cookingTechniques: [{ id: "ct1", name: "boiling" }],
      recipes: [
        {
          id: "rc1",
          name: "Valid Recipe",
          servings: 2,
          ingredients: [
            {
              ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
              quantity: 100,
              unitId: { type: "Unit", id: "uom1" },
            },
          ],
          tags: [],
          steps: [
            {
              id: "step1",
              techniqueId: { type: "CookingTechnique", id: "ct1" },
              duration: {
                attention: AttentionNeeded.FullAttention,
                minutes: 10,
              },
              inputs: [
                {
                  ingredientIndex: { type: "RecipeIngredients", index: 0 },
                  portion: 1,
                },
              ],
              produces: "Out1",
              dependsOn: [],
              description:
                "This is a valid recipe that will be used in the meal.",
            },
          ],
        },
      ],
      Meals: [
        {
          id: "m1",
          name: "Meal with Invalid Recipe Reference",
          diners: 2,
          courses: [
            {
              recipesIds: [{ type: "Recipe", id: "nonexistent" }],
            },
          ],
        },
      ],
    });

    expect(
      await validateMealInternalReferences(
        {
          name: "Meal with Invalid Recipe Reference",
          courses: [{ recipesIds: [{ type: "Recipe", id: "nonexistent" }] }],
          diners: 2,
        },
        dependencies,
      ),
    ).toBeFalsy();
  });

  it("Should return true on valid meal with recipe references", async () => {
    const dependencies = createStaticProviders({
      measuringFeatures: [{ id: "mf1", name: "grams" }],
      unitsOfMeasure: [{ id: "uom1", name: "kilogram", measuringId: "mf1" }],
      storeBoughtIngredients: [
        { id: "si1", name: "sugar", synonyms: [], measuredAsIds: ["uom1"] },
      ],
      cookingTechniques: [{ id: "ct1", name: "boiling" }],
      recipes: [
        {
          id: "rc1",
          name: "Valid Recipe",
          servings: 2,
          ingredients: [
            {
              ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
              quantity: 100,
              unitId: { type: "Unit", id: "uom1" },
            },
          ],
          tags: [],
          steps: [
            {
              id: "step1",
              techniqueId: { type: "CookingTechnique", id: "ct1" },
              duration: {
                attention: AttentionNeeded.FullAttention,
                minutes: 10,
              },
              inputs: [
                {
                  ingredientIndex: { type: "RecipeIngredients", index: 0 },
                  portion: 1,
                },
              ],
              produces: "Out1",
              dependsOn: [],
              description:
                "This is a valid recipe that will be used in the meal.",
            },
          ],
        },
      ],
      Meals: [
        {
          id: "m1",
          name: "Meal with Valid Recipe Reference",
          diners: 2,
          courses: [
            {
              recipesIds: [{ type: "Recipe", id: "rc1" }],
            },
          ],
        },
      ],
    });

    expect(
      await validateMealInternalReferences(
        {
          name: "Meal with Valid Recipe Reference",
          courses: [{ recipesIds: [{ type: "Recipe", id: "rc1" }] }],
          diners: 2,
        },
        dependencies,
      ),
    ).toBeTruthy();
  });
});
