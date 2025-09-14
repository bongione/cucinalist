import { it, expect, describe } from "vitest";
import { okAsync, errAsync } from "@cucinalist/fp-types";
import {
  createRecordRecipeInteractor,
  type DeepRecipeStorageProvider,
} from "./RecordRecipeInteractor.js";
import {
  RecordRecipeRecordOutputBoundary,
  PresentSavedRecipe,
  RecordRecipeOutputPresenterAction,
} from "./RecordRecipeOutput.js";
import type {
  Recipe,
  StoreBoughtIngredient,
  CookingTechnique,
} from "@cucinalist/core";
import {
  RecipeStorage,
  StoreBoughtIngredientStorage,
  CookingTechniqueStorage,
} from "../../entities-storage/index.js";

describe("RecordRecipeInteractor", () => {
  it("Should not record a new recipe with insufficient data", async () => {
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore(),
      presenter,
    );
    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "Test Recipe",
      name: "Test Recipe",
      serves: 4,
      ingredients: [],
      cookingSteps: [],
    });
    expect(result.isErr()).toBe(true);
  });

  it("Should record a new recipe with new store-bought ingredient successfully", async () => {
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore(),
      presenter,
    );
    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "Test Recipe",
      name: "Test Recipe",
      serves: 4,
      ingredients: [
        {
          type: "RecipeIngredient",
          ingredientId: "Sugar",
          amount: { value: 100, unit: "grams" },
        },
      ],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "present",
          preconditions: [],
          inactiveMinutes: 0,
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          produces: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 0,
            },
          ],
        },
      ],
    });
    expect(result.isOk()).toBe(true);
    const commands = presenter.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("PresentSavedRecipe");
    const { recipe: savedRecipe, storeIngredients } =
      commands[0] as PresentSavedRecipe;
    expect(savedRecipe).toHaveProperty("id");
    expect(savedRecipe.name).toBe("Test Recipe");
    expect(savedRecipe.servings).toBe(4);
    expect(savedRecipe.ingredients.length).toBe(1);
    expect(savedRecipe.ingredients[0].amount).toBe(100);
    expect(savedRecipe.ingredients[0].unit).toBe("grams");
    expect(savedRecipe.ingredients[0].ingredientId.type).toBe(
      "StoreBoughtIngredient",
    );
    expect(savedRecipe.ingredients[0].ingredientId.id).toBeDefined();
    // expect(savedRecipe.steps).toEqual([]);
    expect(storeIngredients.length).toBe(1);
    const newIngredient = storeIngredients[0];
    expect(newIngredient).toHaveProperty("id");
    expect(newIngredient.name).toBe("Sugar");
    expect(newIngredient.measuredAsIds).toEqual([]);
  });

  it("Should record a new recipe with existing store-bought ingredient successfully", async () => {
    const existingIngredient: StoreBoughtIngredient = {
      id: "sbi-1",
      name: "Sugar",
      synonyms: [],
      measuredAsIds: [],
    };
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore({
        storeBoughtIngredients: [existingIngredient],
      }),
      presenter,
    );
    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "Test Recipe",
      name: "Test Recipe",
      serves: 4,
      ingredients: [
        {
          type: "RecipeIngredient",
          ingredientId: "Sugar",
          amount: { value: 100, unit: "grams" },
        },
      ],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "present",
          preconditions: [],
          inactiveMinutes: 0,
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          produces: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 0,
            },
          ],
        },
      ],
    });
    expect(result.isOk()).toBe(true);
    const commands = presenter.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("PresentSavedRecipe");
    const { recipe, storeIngredients } = commands[0] as PresentSavedRecipe;
    expect(recipe.name).toBe("Test Recipe");
    expect(recipe.servings).toBe(4);
    expect(recipe.ingredients.length).toBe(1);
    expect(recipe.ingredients[0].amount).toBe(100);
    expect(recipe.ingredients[0].unit).toBe("grams");
    expect(recipe.ingredients[0].ingredientId.type).toBe(
      "StoreBoughtIngredient",
    );
    expect(recipe.ingredients[0].ingredientId.id).toBe(existingIngredient.id);
    // expect(recipe.steps).toEqual([]);
    expect(storeIngredients.length).toBe(1);
    const usedIngredient = storeIngredients[0];
    expect(usedIngredient).toEqual(existingIngredient);
  });

  it("Should record a new recipe with existing recipe ingredient successfully", async () => {
    const existingRecipe: Recipe = {
      id: "recipe-1",
      name: "Pancake Mix",
      servings: 2,
      ingredients: [],
      steps: [],
    };
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore({
        recipes: [existingRecipe],
      }),
      presenter,
    );
    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "Test Recipe",
      name: "Test Recipe",
      serves: 4,
      ingredients: [
        {
          type: "RecipeIngredient",
          ingredientId: "Pancake Mix",
          amount: { value: 1, unit: "batch" },
        },
      ],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "present",
          preconditions: [],
          inactiveMinutes: 0,
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          produces: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 0,
            },
          ],
        },
      ],
    });
    expect(result.isOk()).toBe(true);
    const commands = presenter.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("PresentSavedRecipe");
    const { recipe, storeIngredients } = commands[0] as PresentSavedRecipe;
    expect(recipe.name).toBe("Test Recipe");
    expect(recipe.servings).toBe(4);
    expect(recipe.ingredients.length).toBe(1);
    expect(recipe.ingredients[0].amount).toBe(1);
    expect(recipe.ingredients[0].unit).toBe("batch");
    expect(recipe.ingredients[0].ingredientId.type).toBe("Recipe");
    expect(recipe.ingredients[0].ingredientId.id).toBe(existingRecipe.id);
    // expect(recipe.steps).toEqual([]);
    expect(storeIngredients.length).toBe(0);
  });

  it("Should record a new recipe with a new cooking technique successfully", async () => {
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore(),
      presenter,
    );
    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "Test Recipe",
      name: "Test Recipe",
      serves: 4,
      ingredients: [
        {
          type: "RecipeIngredient",
          ingredientId: "Pancake Mix",
          amount: { value: 1, unit: "batch" },
        },
      ],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "Chop",
          preconditions: [],
          ingredients: [],
          activeMinutes: 5,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "chopped-ingredient-1",
            },
          ],
        },
      ],
    });
    expect(result.isOk()).toBe(true);
    const commands = presenter.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("PresentSavedRecipe");
    const { recipe, storeIngredients, cookingTechniques } =
      commands[0] as PresentSavedRecipe;
    expect(recipe).toHaveProperty("id");
    expect(recipe.name).toBe("Test Recipe");
    expect(recipe.servings).toBe(4);
    expect(recipe.ingredients.length).toBe(1);
    expect(recipe.steps.length).toBe(1);
    expect(recipe.steps[0].id).toBeDefined();
    expect(recipe.steps[0].produces).toBe("chopped-ingredient-1");
    expect(storeIngredients.length).toBe(1);
    expect(cookingTechniques.length).toBe(1);
    const newTechnique = cookingTechniques[0];
    expect(newTechnique).toHaveProperty("id");
    expect(newTechnique.name).toBe("Chop");
    expect(newTechnique.synonyms).toEqual([]);
    expect(newTechnique.techniqueOutput("test")).toBe("Output of Chop on test");
  });

  it("Should record a new recipe with multiple ingredients and steps depending on each other", async () => {
    const presenter = createTestPresenter();
    const interactor = createRecordRecipeInteractor(
      createTestStore({
        recipes: [],
        storeBoughtIngredients: [
          {
            id: "spaghetti",
            name: "spaghetti",
            measuredAsIds: [],
          },
          {
            id: "extraVirgeOliveOil",
            name: "extra virge olive oil",
            measuredAsIds: [],
          },
          {
            id: "water",
            name: "water",
            measuredAsIds: [],
          },
          {
            id: "salt",
            name: "salt",
            measuredAsIds: [],
          },
          {
            id: "garlicClove",
            name: "garlicClove",
            measuredAsIds: [],
          },
        ],
        cookingTechniques: [
          {
            id: "slice",
            name: "slice",
            synonyms: [],
            techniqueOutput: (ing) => `sliced ${ing}`,
          },
        ],
      }),
      presenter,
    );

    const result = await interactor.requestRecipeRecording({
      type: "Recipe",
      id: "spagettiAglioEOlio",
      name: "Spaghetti aglio e olio",
      serves: 4,
      ingredients: [
        {
          type: "RecipeIngredient",
          ingredientId: "garlic clove",
          amount: { value: 1, unit: "item" },
        },
        {
          type: "RecipeIngredient",
          ingredientId: "water",
          amount: { value: 5, unit: "liter" },
        },
        {
          type: "RecipeIngredient",
          ingredientId: "spaghetti",
          amount: { value: 500, unit: "gram" },
        },
        {
          type: "RecipeIngredient",
          ingredientId: "extra virge olive oil",
          amount: { value: 500, unit: "gram" },
        },
        {
          type: "RecipeIngredient",
          ingredientId: "salt",
          amount: { value: 1, unit: "handful" },
        },
      ],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "slice",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 0,
            },
          ],
          activeMinutes: 5,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "chopped garlic",
            },
          ],
        },
        {
          type: "CookingStep",
          processId: "boil",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 1,
            },
          ],
          activeMinutes: 0,
          inactiveMinutes: 15,
          keepAnEyeMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "boiling water",
            },
          ],
        },
        {
          type: "CookingStep",
          processId: "boil",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              atIndex: 2,
            },
            {
              type: "CookingStep",
              atIndex: 1,
              atOutputIndex: 0,
            },
          ],
          activeMinutes: 0,
          inactiveMinutes: 0,
          keepAnEyeMinutes: 10,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "cooked spaghetti",
            },
          ],
        },
      ],
    });

    expect(result.isOk()).toBe(true);
    const commands = presenter.getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("PresentSavedRecipe");
    const { recipe, storeIngredients, cookingTechniques } =
      commands[0] as PresentSavedRecipe;
    expect(recipe).toHaveProperty("id");
    expect(recipe.name).toBe("Spaghetti aglio e olio");
    expect(recipe.servings).toBe(4);
    expect(recipe.ingredients.length).toBe(5);
    expect(recipe.steps.length).toBe(3);
  });
});

function createTestPresenter(): RecordRecipeRecordOutputBoundary & {
  getCommands: () => RecordRecipeOutputPresenterAction[];
} {
  const commands: RecordRecipeOutputPresenterAction[] = [];
  return {
    getCommands: () => commands,
    execute: (presentCommand: RecordRecipeOutputPresenterAction) =>
      commands.push(presentCommand),
  };
}

function createTestStore(
  data: {
    recipes?: Recipe[];
    storeBoughtIngredients?: StoreBoughtIngredient[];
    cookingTechniques?: CookingTechnique[];
  } = {},
): DeepRecipeStorageProvider {
  const recipes = data.recipes ?? [];
  const storeBoughtIngredients = data.storeBoughtIngredients ?? [];
  const cookingTechniques = data.cookingTechniques ?? [];
  const storeOps: RecipeStorage &
    CookingTechniqueStorage &
    StoreBoughtIngredientStorage = {
    recipe: {
      getRecipesByName: (name: string) =>
        okAsync(recipes.filter((r) => r.name === name)),
      createRecipe: (recipeInfo) => {
        const newRecipe: Recipe = {
          id: `recipe-${recipes.length + 1}`,
          ...recipeInfo,
        };
        recipes.push(newRecipe);
        return okAsync(newRecipe);
      },
      deleteRecipe: (id: string) => {
        const index = recipes.findIndex((r) => r.id === id);
        if (index !== -1) {
          recipes.splice(index, 1);
        }
        return okAsync(undefined);
      },
      updateRecipe: (id: string, recipeInfo) => {
        const index = recipes.findIndex((r) => r.id === id);
        if (index === -1) {
          return errAsync(new Error("Recipe not found"));
        }
      },
      getRecipeById: (id: string) =>
        okAsync(recipes.find((r) => r.id === id) ?? null),
    },
    storeBoughtIngredient: {
      getStoreBoughtIngredientsByName: (name: string) =>
        okAsync(storeBoughtIngredients.filter((s) => s.name === name)),
      createStoreBoughtIngredient: (ingredientInfo) => {
        const newIngredient: StoreBoughtIngredient = {
          id: `sbi-${storeBoughtIngredients.length + 1}`,
          ...ingredientInfo,
        };
        storeBoughtIngredients.push(newIngredient);
        return okAsync(newIngredient);
      },
      deleteStoreBoughtIngredient: (id: string) => {
        const index = storeBoughtIngredients.findIndex((s) => s.id === id);
        if (index !== -1) {
          storeBoughtIngredients.splice(index, 1);
        }
        return okAsync(undefined);
      },
      updateStoreBoughtIngredient: (id: string, ingredientInfo) => {
        const index = storeBoughtIngredients.findIndex((s) => s.id === id);
        if (index === -1) {
          return errAsync(new Error("StoreBoughtIngredient not found"));
        }
        const updatedIngredient = {
          ...storeBoughtIngredients[index],
          ...ingredientInfo,
        };
        storeBoughtIngredients[index] = updatedIngredient;
        return okAsync(updatedIngredient);
      },
      getStoreBoughtIngredientById: (id: string) =>
        okAsync(storeBoughtIngredients.find((s) => s.id === id) ?? null),
    },
    cookingTechnique: {
      getCookingTechniqueById: (id: string) =>
        okAsync(cookingTechniques.find((c) => c.id === id) ?? null),
      getCookingTechniqueByQualifier: (name: string) =>
        okAsync(cookingTechniques.filter((c) => c.name === name)),
      createCookingTechnique: (techniqueInfo) => {
        const newTechnique: CookingTechnique = {
          id: `ct-${cookingTechniques.length + 1}`,
          synonyms: [],
          ...techniqueInfo,
          techniqueOutput: (txt) => `Output of ${techniqueInfo.name} on ${txt}`,
        };
        cookingTechniques.push(newTechnique);
        return okAsync(newTechnique);
      },
      updateCookingTechnique: (id: string, techniqueInfo) => {
        const index = cookingTechniques.findIndex((c) => c.id === id);
        if (index === -1) {
          return errAsync(new Error("CookingTechnique not found"));
        }
        const updatedTechnique = {
          ...cookingTechniques[index],
          ...techniqueInfo,
        };
        cookingTechniques[index] = updatedTechnique;
        return okAsync(updatedTechnique);
      },
      deleteCookingTechnique: (id: string) => {
        const index = cookingTechniques.findIndex((c) => c.id === id);
        if (index !== -1) {
          cookingTechniques.splice(index, 1);
        }
        return okAsync(undefined);
      },
    },
  };
  return {
    tx: (fn) => fn(storeOps),
    task: (fn) => fn(storeOps),
  };
}
