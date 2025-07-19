import { describe, expect, it } from "vitest";
import {
  AttentionNeeded,
  CookingTechnique,
  MeasuringFeature,
  Recipe,
  RecipeReferenceValidationDependencies,
  StoreBoughtIngredient,
  UnitOfMeasure,
  validateCookingTechniqueReference,
  validateIngredientReference,
  validateMeasuringFeatureReference,
  validateRecipeReference,
  validateRecipeInternalReferences,
  validateUnitOfMeasureReference,
} from "../src";

function createStaticProviders(values: {
  measuringFeatures?: MeasuringFeature[];
  unitsOfMeasure?: UnitOfMeasure[];
  storeBoughtIngredients?: StoreBoughtIngredient[];
  cookingTechniques?: CookingTechnique[];
  recipes?: Recipe[];
}): RecipeReferenceValidationDependencies {
  return {
    measuringFeatureProvider: {
      getMeasuringFeatureById: async (id: string) => {
        return (
          values.measuringFeatures?.find((feature) => feature.id === id) || null
        );
      },
      getMeasuringFeaturesByName: async (name: string) => {
        return (
          values.measuringFeatures?.filter(
            (feature) => feature.name === name,
          ) || []
        );
      },
    },
    unitOfMeasureProvider: {
      getUnitOfMeasureById: async (id: string) => {
        return values.unitsOfMeasure?.find((unit) => unit.id === id) || null;
      },
      getUnitsOfMeasureByName: async (name: string) => {
        return (
          values.unitsOfMeasure?.filter((unit) => unit.name === name) || []
        );
      },
    },
    storeBoughtIngredientProvider: {
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
  };
}

describe("No entities", () => {
  it("should return false for all references", async () => {
    const dependencies = createStaticProviders({});

    const measuringFeatureValid = await validateMeasuringFeatureReference(
      "nonexistent",
      dependencies,
    );
    expect(measuringFeatureValid).toBeFalsy();

    const unitOfMeasureValid = await validateUnitOfMeasureReference(
      "nonexistent",
      dependencies,
    );
    expect(unitOfMeasureValid).toBeFalsy();

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
                portion: 1
              },
            ],
            produces: 'Out1',
            dependsOn: [],
            description: 'Boil the sugar with water',
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

    const ingredientValid = await validateIngredientReference("si1", dependencies);
    expect(ingredientValid).toBeTruthy();

    const techniqueValid = await validateCookingTechniqueReference("ct1", dependencies);
    expect(techniqueValid).toBeTruthy();

    const recipeValid = await validateRecipeReference("r1", dependencies);
    expect(recipeValid).toBeTruthy();
  });

  it('Validate recipe info', async () => {
    const recipeInfo: Omit<Recipe, 'id'> = {
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
              portion: 1
            },
          ],
          produces: 'Out1',
          dependsOn: [],
          description: 'Boil the sugar with water',
        },
      ],
    }
    expect(await validateRecipeInternalReferences(recipeInfo, dependencies)).toBeTruthy();
  });

  it('Should return false for invalid recipe references', async () => {
    const invalidRecipe: Omit<Recipe, 'id'> = {
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
          produces: 'Out1',
          dependsOn: [],
          description: 'Invalid step',
        },
      ],
    };

    expect(await validateRecipeInternalReferences(invalidRecipe, dependencies)).toBeFalsy();
  })

  it('Should return false on self-reference', async () => {
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
              duration: { attention: AttentionNeeded.FullAttention, minutes: 10 },
              inputs: [
                {
                  ingredientIndex: { type: "RecipeIngredients", index: 0 },
                  portion: 1
                },
              ],
              produces: 'Out1',
              dependsOn: [],
              description: 'Boil the sugar with water',
            },
          ],
        },
      ],
    });

    expect(await validateRecipeReference('r1', dependencies)).toBeFalsy();
  })
});
