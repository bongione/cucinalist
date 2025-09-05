import { describe, expect, it } from "vitest";
import { okAsync, ResultAsync } from "@cucinalist/fp-types";
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
  validateRecipe,
  validateUnitOfMeasureReference,
  MealReferenceValidationDependencies,
  validateMealContents,
} from "../src";

function createStaticProviders(values: {
  measuringFeatures?: MeasuringFeature[];
  unitsOfMeasure?: UnitOfMeasure[];
  storeBoughtIngredients?: StoreBoughtIngredient[];
  cookingTechniques?: CookingTechnique[];
  recipes?: Recipe[];
  meals?: Meal[];
}): MealReferenceValidationDependencies {
  const measuringFeatures = values.measuringFeatures || [];
  const unitsOfMeasure = values.unitsOfMeasure || [];
  const storeBoughtIngredients = values.storeBoughtIngredients || [];
  const cookingTechniques = values.cookingTechniques || [];
  const recipes = values.recipes || [];
  const meals = values.meals || [];

  return {
    measuringFeatureProvider: {
      getMeasuringFeatureById: ResultAsync.fromThrowable(
        async (id: string) =>
          measuringFeatures.find((feature) => feature.id === id) || null,
        (e) => new Error(String(e)),
      ),
      getMeasuringFeaturesByName: ResultAsync.fromThrowable(
        async (name: string) =>
          measuringFeatures.filter((feature) => feature.name === name),
        (e) => new Error(String(e)),
      ),
    },
    unitOfMeasureProvider: {
      getUnitOfMeasureById: ResultAsync.fromThrowable(
        async (id: string) =>
          unitsOfMeasure.find((unit) => unit.id === id) || null,
        (e) => new Error(String(e)),
      ),
      getUnitsOfMeasureByName: (name: string) => {
        return okAsync(unitsOfMeasure.filter((unit) => unit.name === name));
      },
    },
    ingredientProvider: {
      getStoreBoughtIngredientById: ResultAsync.fromThrowable(
        async (id: string) =>
          storeBoughtIngredients.find((ingredient) => ingredient.id === id) ||
          null,
        (e) => new Error(String(e)),
      ),
      getStoreBoughtIngredientsByName: ResultAsync.fromThrowable(
        async (name: string) =>
          storeBoughtIngredients.filter(
            (ingredient) => ingredient.name === name,
          ) || [],
        (e) => new Error(String(e)),
      ),
    },
    cookingTechniqueProvider: {
      getCookingTechniqueById: ResultAsync.fromThrowable(
        async (id: string) =>
          cookingTechniques?.find((technique) => technique.id === id) || null,
        (e) => new Error(String(e)),
      ),
      getCookingTechniquesByName: ResultAsync.fromThrowable(
        async (name: string) =>
          cookingTechniques.filter((technique) => technique.name === name),
        (e) => new Error(String(e)),
      ),
    },
    recipeProvider: {
      getRecipeById: ResultAsync.fromThrowable(
        async (id: string) =>
          recipes.find((recipe) => recipe.id === id) || null,
        (e) => new Error(String(e)),
      ),
      getRecipesByName: ResultAsync.fromThrowable(
        async (name: string) =>
          recipes.filter((recipe) => recipe.name === name) || [],
        (e) => new Error(String(e)),
      ),
    },
    mealProvider: {
      getMealById: ResultAsync.fromThrowable(
        async (id: string) => meals.find((meal) => meal.id === id) || null,
        (e) => new Error(String(e)),
      ),
      getMealsByName: ResultAsync.fromThrowable(
        async (name: string) =>
          meals.filter((meal) => meal.name === name) || [],
        (e) => new Error(String(e)),
      ),
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
    expect(measuringFeatureValid.unwrapOr(true)).toBeFalsy();

    const unitOfMeasureValid = await validateUnitOfMeasureReference(
      "nonexistent",
      dependencies,
    );
    expect(unitOfMeasureValid.unwrapOr(true)).toBeFalsy();

    const ingredientValid = await validateIngredientReference(
      "nonexistent",
      dependencies,
    );
    expect(ingredientValid.unwrapOr(true)).toBeFalsy();

    const techniqueValid = await validateCookingTechniqueReference(
      "nonexistent",
      dependencies,
    );
    expect(techniqueValid.unwrapOr(true)).toBeFalsy();

    const recipeValid = await validateRecipeReference(
      "nonexistent",
      dependencies,
    );
    expect(recipeValid.unwrapOr(true)).toBeFalsy();
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

  it("Validate single measuring feature", async () => {
    const measuringFeatureValid = await validateMeasuringFeatureReference(
      "mf1",
      dependencies,
    );
    expect(measuringFeatureValid.unwrapOr(false)).toBeTruthy();

    const unitOfMeasureValid = await validateUnitOfMeasureReference(
      "uom1",
      dependencies,
    );
    expect(unitOfMeasureValid.unwrapOr(false)).toBeTruthy();

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
    expect(await validateRecipe(recipeInfo, dependencies)).toBeTruthy();
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
      (await validateRecipe(invalidRecipe, dependencies)).unwrapOr(true),
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

    expect(
      (await validateRecipeReference("r1", dependencies)).unwrapOr(true),
    ).toBeFalsy();
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
      meals: [
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
      (
        await validateMealContents(
          {
            name: "Meal with Self Reference",
            courses: [{ recipesIds: [{ type: "Recipe", id: "m1" }] }],
            diners: 1,
          },
          dependencies,
        )
      ).unwrapOr(true),
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
      meals: [
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
      (
        await validateMealContents(
          {
            name: "Meal with Invalid Recipe Reference",
            courses: [{ recipesIds: [{ type: "Recipe", id: "nonexistent" }] }],
            diners: 2,
          },
          dependencies,
        )
      ).unwrapOr(true),
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
      meals: [
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
      await validateMealContents(
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
