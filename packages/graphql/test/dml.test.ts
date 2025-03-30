import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getCucinalistDMLInterpreter } from "../src/data/cuninalistDMLInterpreter";
import { prisma } from "../src/data/dao/extendedPrisma";
import {
  CookingStep,
  CourseRecipe,
  Meal,
  MealCourse,
  Recipe,
  RecipeIngredient,
  StoreBoughtIngredient,
} from "../src/__generated__/prismaClient";
import { cleanupDb } from "./dbUtils";

beforeEach(cleanupDb);

afterAll(cleanupDb);

describe("Initial db state", () => {
  it("should have a root context", async () => {
    const context = await prisma.context.findUnique({
      where: { id: "root" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("root");
    expect(context.parentContextId).toBeNull();
  });
  it("should have a public context", async () => {
    const context = await prisma.context.findUnique({
      where: { id: "public" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("public");
    expect(context.parentContextId).toBe("root");
  });
});

describe("Context dsl", () => {
  it("Create a new context", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testContext`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext");
    expect(context.parentContextId).toBe("public");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "public",
    );
  });

  it("Create a new context with parent", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testContext2 parent root`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext2" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext2");
    expect(context.parentContextId).toBe("root");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "public",
    );
  });

  it("Create a new context with parent and switch", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context and switch testContext3 parent public`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext3" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext3");
    expect(context.parentContextId).toBe("public");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "testContext3",
    );
  });

  it("Switch to an existing context", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testSwitchToContext
    context testSwitchToContext`;
    await interpreter.executeDML(dsl);
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "testSwitchToContext",
    );
  });
});

describe("Unit of mesaure dsl", () => {
  it("Define a unit of measure", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `unitOfMeasure gram 
    measuring weight
    defaultSymbol g
    aka gram, grams
`;
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("gram");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("UnitOfMeasure");
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id: namedEntity.recordId },
      include: {
        synonyms: true,
      },
    });
    expect(unit).toBeDefined();
    expect(unit.gblId).toBe("gram");
    expect(unit).toMatchObject({
      measuring: "weight",
      defaultSymbol: "g",
      name: "gram",
      synonyms: [{ label: "gram" }, { label: "grams" }],
    });
  });

  it("Allow updating an existing unit of measure", async () => {
    const dsl = `unitOfMeasure gram 
    measuring weight
    defaultSymbol g
    aka gram, grams
`;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    const dsl2 = `unitOfMeasure gram
    measuring weight
    defaultSymbol g
    plural g
    aka gram, grams, grammo, grammi
`;
    await interpreter.executeDML(dsl2);
    const namedEntity2 = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    expect(namedEntity2).toMatchObject({
      recordId: namedEntity.recordId,
      recordType: namedEntity.recordType,
      id: namedEntity.id,
      contextId: namedEntity2.contextId,
    });
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id: namedEntity2.recordId },
      include: {
        synonyms: true,
      },
    });
    expect(unit).toBeDefined();
    expect(unit.gblId).toBe("gram");
    expect(unit).toMatchObject({
      measuring: "weight",
      defaultSymbol: "g",
      plural: "g",
      name: "gram",
      synonyms: [
        { label: "gram" },
        { label: "grams" },
        { label: "grammo" },
        { label: "grammi" },
      ],
    });
  });
});

describe("Ingredient dsl", () => {
  it("Define a simple ingredient", async () => {
    const dsl = `ingredient butter measuredAs weight`;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "butter" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("butter");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("StoreBoughtIngredient");
    const ingredient = await prisma.storeBoughtIngredient.findUnique({
      where: { id: namedEntity.recordId },
    });
    const expectedIngredient: Partial<StoreBoughtIngredient> = {
      gblId: "butter",
      name: "butter",
      measuredAs: "weight",
    };
    expect(ingredient).toMatchObject(expectedIngredient);
  });

  it("Define a complete ingredient", async () => {
    const dsl = `ingredient butter
      fullname 'butter stick'
      plural 'butter sticks'
      aka 'block of butter', 'fat of milk'
      measuredAs weight
      `;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "butter" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("butter");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("StoreBoughtIngredient");
    const ingredient = await prisma.storeBoughtIngredient.findUnique({
      include: { aka: true },
      where: { id: namedEntity.recordId },
    });
    const expectedIngredient: Partial<
      StoreBoughtIngredient & { aka: Array<{ synonym: string }> }
    > = {
      gblId: "butter",
      name: "butter stick",
      measuredAs: "weight",
      plural: "butter sticks",
      aka: [{ synonym: "block of butter" }, { synonym: "fat of milk" }],
    };
    expect(ingredient).toMatchObject(expectedIngredient);
  });

  it('Reassign an existing ingredient', async () => {
    const dsl = `
      ingredient butter
        fullname 'butter on a stick'
        plural 'butters on sticks'
        aka 'blocks of butter', 'fats of milks'
        measuredAs capacity
        
      ingredient butter
        fullname 'butter stick'
        plural 'butter sticks'
        aka 'block of butter', 'fat of milk'
        measuredAs weight
      `;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "butter" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("butter");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("StoreBoughtIngredient");
    const ingredient = await prisma.storeBoughtIngredient.findUnique({
      include: { aka: true },
      where: { id: namedEntity.recordId },
    });
    const expectedIngredient: Partial<
      StoreBoughtIngredient & { aka: Array<{ synonym: string }> }
    > = {
      gblId: "butter",
      name: "butter stick",
      measuredAs: "weight",
      plural: "butter sticks",
      aka: [{ synonym: "block of butter" }, { synonym: "fat of milk" }],
    };
    expect(ingredient).toMatchObject(expectedIngredient);
  })
});

describe("Recipe dsl", () => {
  it("Minimal recipe with one ingredient and one step", async () => {
    const dsl = `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
    `;
    const expectedRecipe: Partial<
      Recipe & {
        ingredients: Array<
          Partial<RecipeIngredient & { unitOfMeasure: { gblId: string } }>
        >;
        steps: Array<
          Partial<CookingStep & { cookingTechnique: { gblId: string } }>
        >;
      }
    > = {
      gblId: "breadSlice",
      name: "breadSlice",
      serves: 1,
      ingredients: [
        {
          amount: 1,
          unitOfMeasure: { gblId: "slice" },
        },
      ],
      steps: [
        {
          cookingTechnique: { gblId: "serve" },
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "breadSlice" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("breadSlice");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("Recipe");
    const recipe = await prisma.recipe.findUnique({
      include: {
        ingredients: {
          include: {
            unitOfMeasure: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
        steps: {
          include: {
            cookingTechnique: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
      where: { id: namedEntity.recordId },
    });
    expect(recipe).toMatchObject(expectedRecipe);
  });

  it("Reassign minimal recipe with one ingredient and one step", async () => {
    const dsl = `
    recipe breadSlice
      serves 2
      ingredients
        - 2 slices bread;
      steps
        - 'take out from fridge' bread;
        - serve bread;
        
    recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
    `;
    const expectedRecipe: Partial<
      Recipe & {
      ingredients: Array<
        Partial<RecipeIngredient & { unitOfMeasure: { gblId: string } }>
      >;
      steps: Array<
        Partial<CookingStep & { cookingTechnique: { gblId: string } }>
      >;
    }
    > = {
      gblId: "breadSlice",
      name: "breadSlice",
      serves: 1,
      ingredients: [
        {
          amount: 1,
          unitOfMeasure: { gblId: "slice" },
        },
      ],
      steps: [
        {
          cookingTechnique: { gblId: "serve" },
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "breadSlice" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("breadSlice");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("Recipe");
    const recipe = await prisma.recipe.findUnique({
      include: {
        ingredients: {
          include: {
            unitOfMeasure: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
        steps: {
          include: {
            cookingTechnique: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
      where: { id: namedEntity.recordId },
    });
    expect(recipe).toMatchObject(expectedRecipe);
  });

  it("Recipe with multiple ingredients and steps", async () => {
    const dsl = `recipe SpaghettiAglioOlioEPeperoncino fullName 'Spaghetti aglio, olio e peperoncino'
      serves 4
      ingredients
          - 500 g spaghetti;
          - 4 cloves garlic;
          - 0.5 glasses 'extra virge olive oil';
          - 1-4 redHotChilliPeppers;
          - 5 grams salt;
          - 5l water;
          - (optional) 2 spoons parmesanCheese;
      steps
          - 'bring to the boil' salt and water -[15]-> boiledSaltedWater;
          - 'chop finely' redHotChilliPeppers --> choppedChillies;
          - 'chop finely' garlic -(2)-> choppedGarlic;
          - 'shallow-fry' choppedChillies and choppedGarlic in 'extra virge olive oil' -[]-> condiment;
          - when boiledSaltedWater
              - add spaghetti to boiledSaltedWater -()-> cookingPasta;
          - when cookingPasta 'is tender'
              - (optional) reserve boiledSaltedWater from cookingPasta -> reservedWater;
              - drain cookingPasta -> cookedPasta;
          - combine cookedPasta and condiment -2-> pastaWithCondiment;
          - (optional) mix parmesanCheese, pastaWithCondiment  and reservedWater;
          - serve pastaWithCondiment -> SpaghettiAglioOlioEPeperoncino;`;
    const expectedRecipe: Partial<
      Recipe & {
        ingredients: Array<
          Partial<
            RecipeIngredient & {
              unitOfMeasure: { gblId: string };
              storeBoughtIngredient: { gblId: string };
            }
          >
        >;
        steps: Array<
          Partial<
            CookingStep & {
              cookingTechnique: { gblId: string };
              outputIngredients: Array<{ name: string }>;
            }
          >
        >;
      }
    > = {
      gblId: "SpaghettiAglioOlioEPeperoncino",
      name: "Spaghetti aglio, olio e peperoncino",
      serves: 4,
      ingredients: [
        {
          amount: 500,
          unitOfMeasure: { gblId: "g" },
          storeBoughtIngredient: { gblId: "spaghetti" },
        },
        {
          amount: 4,
          unitOfMeasure: { gblId: "cloves" },
          storeBoughtIngredient: { gblId: "garlic" },
        },
        {
          amount: 0.5,
          unitOfMeasure: { gblId: "glasses" },
          storeBoughtIngredient: { gblId: "extra virge olive oil" },
        },
        {
          amount: 2.5,
          unitOfMeasure: { gblId: "item" },
          storeBoughtIngredient: { gblId: "redHotChilliPeppers" },
        },
        {
          amount: 5,
          unitOfMeasure: { gblId: "grams" },
          storeBoughtIngredient: { gblId: "salt" },
        },
        {
          amount: 5,
          unitOfMeasure: { gblId: "l" },
          storeBoughtIngredient: { gblId: "water" },
        },
        {
          amount: 2,
          unitOfMeasure: { gblId: "spoons" },
          storeBoughtIngredient: { gblId: "parmesanCheese" },
        },
      ],
      steps: [
        {
          // - 'bring to the boil' salt and water -[15]-> boiledSaltedWater;
          activeMinutes: 0,
          parallelMinutes: 15,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "bring to the boil" },
          outputIngredients: [{ name: "boiledSaltedWater" }],
        },
        {
          // - 'chop finely' redHotChilliPeppers --> choppedChillies;
          activeMinutes: 1,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "chop finely" },
          outputIngredients: [{ name: "choppedChillies" }],
        },
        {
          // - 'chop finely' garlic -(2)-> choppedGarlic;
          activeMinutes: 0,
          parallelMinutes: 0,
          keepEyeMinutes: 2,
          cookingTechnique: { gblId: "chop finely" },
          outputIngredients: [{ name: "choppedGarlic" }],
        },
        {
          // - 'shallow-fry' choppedChillies and choppedGarlic in 'extra virge olive oil' -[]-> condiment;
          activeMinutes: 0,
          parallelMinutes: 1,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "shallow-fry" },
          outputIngredients: [{ name: "condiment" }],
        },
        {
          // - when boiledSaltedWater
          //     - add spaghetti to boiledSaltedWater -()-> cookingPasta;
          activeMinutes: 0,
          parallelMinutes: 0,
          keepEyeMinutes: 1,
          cookingTechnique: { gblId: "add" },
          outputIngredients: [{ name: "cookingPasta" }],
        },
        {
          // - when cookingPasta 'is tender'
          //     - (optional) reserve boiledSaltedWater from cookingPasta -> reservedWater;
          activeMinutes: 1,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "reserve" },
          outputIngredients: [{ name: "reservedWater" }],
        },
        {
          // - drain cookingPasta -> cookedPasta;
          activeMinutes: 1,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "drain" },
          outputIngredients: [{ name: "cookedPasta" }],
        },
        {
          //  - combine cookedPasta and condiment -2-> pastaWithCondiment;
          activeMinutes: 2,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "combine" },
          outputIngredients: [{ name: "pastaWithCondiment" }],
        },
        {
          // - (optional) mix parmesanCheese, pastaWithCondiment  and reservedWater;
          activeMinutes: 1,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "mix" },
          outputIngredients: [{ name: "step_9_output" }],
        },
        {
          // - serve pastaWithCondiment -> SpaghettiAglioOlioEPeperoncino;
          activeMinutes: 1,
          parallelMinutes: 0,
          keepEyeMinutes: 0,
          cookingTechnique: { gblId: "serve" },
          outputIngredients: [{ name: "SpaghettiAglioOlioEPeperoncino" }],
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: {
        contextId_id: {
          contextId: "public",
          id: "SpaghettiAglioOlioEPeperoncino",
        },
      },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("SpaghettiAglioOlioEPeperoncino");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("Recipe");
    const recipe = await prisma.recipe.findUnique({
      include: {
        ingredients: {
          include: {
            storeBoughtIngredient: true,
            unitOfMeasure: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
        steps: {
          include: {
            cookingTechnique: true,
            outputIngredients: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
      where: { id: namedEntity.recordId },
    });
    const { ingredients, steps, ...recipeWithoutIngredientsAndSteps } = recipe;
    expect(recipe).toMatchObject(recipeWithoutIngredientsAndSteps);
    expect(recipe.ingredients).toHaveLength(expectedRecipe.ingredients.length);
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      expect(ingredient.amount).toBe(expectedRecipe.ingredients[i].amount);
      expect(ingredient.storeBoughtIngredient.gblId).toBe(
        expectedRecipe.ingredients[i].storeBoughtIngredient.gblId,
      );
      expect(ingredient.unitOfMeasure.gblId).toBe(
        expectedRecipe.ingredients[i].unitOfMeasure.gblId,
      );
    }
    expect(recipe.steps.length).toBe(expectedRecipe.steps.length);
    for (let i = 0; i < steps.length; i++) {
      const { cookingTechnique, outputIngredients, ...recordInfo } = steps[i];
      const {
        cookingTechnique: expectedCookingTechnique,
        outputIngredients: expectedOutputIngredients,
        ...expectedRecipeStep
      } = expectedRecipe.steps[i];
      expect(recordInfo, `At record ${i}`).toMatchObject(expectedRecipeStep);
      expect(cookingTechnique.gblId).toBe(expectedCookingTechnique.gblId);
      for (let j = 0; j < outputIngredients.length; j++) {
        expect(
          outputIngredients[j].name,
          `At output ingredient with index ${j}`,
        ).toBe(expectedOutputIngredients[j].name);
      }
    }
  });
});

describe("Single course meals", () => {
  it("Single recipe meal", async () => {
    const dsl = `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
      meal
        diners 1
        recipes
          - breadSlice;
    `;
    const expectedMealRecipe: Partial<
      CourseRecipe & { recipe: { gblId: string } }
    > = {
      recipe: { gblId: "breadSlice" },
      sequence: 1,
    };
    const expectedMeal: Partial<
      Meal & { courses: Array<Partial<MealCourse>> }
    > = {
      nDiners: 1,
      gblId: null,
      courses: [
        {
          sequence: 1,
          name: null,
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    const changes = await interpreter.executeDML(dsl);
    expect(changes.length).toBe(2);
    const meal = await prisma.meal.findFirst({
      where: { id: changes[1].id },
      include: {
        courses: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
    expect(meal).toBeDefined();
    expect(meal).not.toBeNull();
    expect(meal).toMatchObject(expectedMeal);
    const mealCourseId = meal.courses[0].id;
    const courseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: mealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(courseRecipes).toHaveLength(1);
    expect(courseRecipes[0]).toMatchObject(expectedMealRecipe);
  });

  it("Two recipes meal with fullName and id", async () => {
    const dsl = `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
      recipe rawEgg
      serves 1
      ingredients
        - 1 egg;
      steps
        - break egg -> brokenEgg;
        - serve brokenEgg -> rawEgg;
      
      meal tonight fullName 'Scanvenge the fridge'
        diners 1
        recipes
          - breadSlice;
          - rawEgg;
    `;
    const expectedMealRecipes: Array<
      Partial<CourseRecipe & { recipe: { gblId: string } }>
    > = [
      {
        recipe: { gblId: "breadSlice" },
        sequence: 1,
      },
      {
        recipe: { gblId: "rawEgg" },
        sequence: 2,
      },
    ];
    const expectedMeal: Partial<
      Meal & { courses: Array<Partial<MealCourse>> }
    > = {
      nDiners: 1,
      gblId: "tonight",
      name: "Scanvenge the fridge",
      courses: [
        {
          sequence: 1,
          name: null,
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    const changes = await interpreter.executeDML(dsl);
    expect(changes.length).toBe(3);
    const meal = await prisma.meal.findFirst({
      where: { id: changes[2].id },
      include: {
        courses: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
    expect(meal).toBeDefined();
    expect(meal).not.toBeNull();
    expect(meal).toMatchObject(expectedMeal);
    const mealCourseId = meal.courses[0].id;
    const courseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: mealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(courseRecipes).toHaveLength(2);
    expect(courseRecipes).toMatchObject(expectedMealRecipes);
  });

  it("Two courses meal with id", async () => {
    const dsl = `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
      recipe rawEgg
      serves 1
      ingredients
        - 1 egg;
      steps
        - break egg -> brokenEgg;
        - serve brokenEgg -> rawEgg;
      
      meal tonight
        diners 2
        course
          - breadSlice;
        course
          - rawEgg;
    `;
    const expectedMealRecipes: Array<
      Array<Partial<CourseRecipe & { recipe: { gblId: string } }>>
    > = [
      [
        {
          recipe: { gblId: "breadSlice" },
          sequence: 1,
        },
      ],
      [
        {
          recipe: { gblId: "rawEgg" },
          sequence: 1,
        },
      ],
    ];
    const expectedMeal: Partial<
      Meal & { courses: Array<Partial<MealCourse>> }
    > = {
      nDiners: 2,
      gblId: "tonight",
      name: "tonight",
      courses: [
        {
          sequence: 1,
          name: null,
        },
        {
          sequence: 2,
          name: null,
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    const changes = await interpreter.executeDML(dsl);
    expect(changes.length).toBe(3);
    const meal = await prisma.meal.findFirst({
      where: { id: changes[2].id },
      include: {
        courses: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
    expect(meal).toBeDefined();
    expect(meal).not.toBeNull();
    expect(meal).toMatchObject(expectedMeal);
    const firstMealCourseId = meal.courses[0].id;
    const firstCourseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: firstMealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(firstCourseRecipes).toHaveLength(1);
    expect(firstCourseRecipes).toMatchObject(expectedMealRecipes[0]);

    const secondMealCourseId = meal.courses[1].id;
    const secondCourseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: secondMealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(secondCourseRecipes).toHaveLength(1);
    expect(secondCourseRecipes).toMatchObject(expectedMealRecipes[1]);
  });

  it("Reassign two courses meal with id", async () => {
    const dsl = `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
      recipe rawEgg
      serves 1
      ingredients
        - 1 egg;
      steps
        - break egg -> brokenEgg;
        - serve brokenEgg -> rawEgg;
      
      meal tonight
        diners 2
        course
          - breadSlice;
        course
          - rawEgg;
          
      meal tonight fullName 'Scanvenge the fridge'
        diners 3
        course
          - rawEgg;
        course
          - breadSlice;
    `;
    const expectedMealRecipes: Array<
      Array<Partial<CourseRecipe & { recipe: { gblId: string } }>>
    > = [
      [
        {
          recipe: { gblId: "rawEgg" },
          sequence: 1,
        },
      ],
      [
        {
          recipe: { gblId: "breadSlice" },
          sequence: 1,
        },
      ],
    ];
    const expectedMeal: Partial<
      Meal & { courses: Array<Partial<MealCourse>> }
    > = {
      nDiners: 3,
      gblId: "tonight",
      name: "Scanvenge the fridge",
      courses: [
        {
          sequence: 1,
          name: null,
        },
        {
          sequence: 2,
          name: null,
        },
      ],
    };
    const interpreter = await getCucinalistDMLInterpreter();
    const changes = await interpreter.executeDML(dsl);
    expect(changes.length).toBe(4);
    const meal = await prisma.meal.findFirst({
      where: { id: changes[3].id },
      include: {
        courses: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
    expect(meal).toBeDefined();
    expect(meal).not.toBeNull();
    expect(meal).toMatchObject(expectedMeal);
    const firstMealCourseId = meal.courses[0].id;
    const firstCourseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: firstMealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(firstCourseRecipes).toHaveLength(1);
    expect(firstCourseRecipes).toMatchObject(expectedMealRecipes[0]);

    const secondMealCourseId = meal.courses[1].id;
    const secondCourseRecipes = await prisma.courseRecipe.findMany({
      where: { courseId: secondMealCourseId },
      include: {
        recipe: true,
      },
    });
    expect(secondCourseRecipes).toHaveLength(1);
    expect(secondCourseRecipes).toMatchObject(expectedMealRecipes[1]);
  });
});
