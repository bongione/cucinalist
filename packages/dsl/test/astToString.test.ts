import { describe, expect, it } from "vitest";
import {
  CreateContext,
  IncludeStatement,
  UnitOfMeasure,
  SwitchToContext,
  BoughtIngredient,
  Recipe,
  astToString,
  RecipeIngredient,
} from "../src";

describe("include statement", () => {
  it("Include a file", () => {
    const astInclude: IncludeStatement = {
      type: "IncludeStatement",
      fileToInclude: "test.txt",
    };
    expect(astToString(astInclude)).toBe(`include 'test.txt'\n`);
  });
});

describe("create context statements", () => {
  it("Basing create context", () => {
    const astCreateContext: CreateContext = {
      type: "CreateContext",
      id: "testContext",
      switchToContext: false,
      parentContext: undefined,
    };
    expect(astToString(astCreateContext)).toBe(`create context testContext\n`);
  });

  it("Create context with parent", () => {
    const astCreateContext: CreateContext = {
      type: "CreateContext",
      id: "testContext",
      switchToContext: false,
      parentContext: "parentContext",
    };
    expect(astToString(astCreateContext)).toBe(
      `create context testContext parent parentContext\n`,
    );
  });

  it("Create context and switch", () => {
    const astCreateContext: CreateContext = {
      type: "CreateContext",
      id: "testContext",
      switchToContext: true,
      parentContext: undefined,
    };
    expect(astToString(astCreateContext)).toBe(
      `create context and switch testContext\n`,
    );
  });

  it("Create context with parent and switch", () => {
    const astCreateContext: CreateContext = {
      type: "CreateContext",
      id: "testContext",
      switchToContext: true,
      parentContext: "parentContext",
    };
    expect(astToString(astCreateContext)).toBe(
      `create context and switch testContext parent parentContext\n`,
    );
    expect(astToString(astCreateContext, { pretty: true })).toBe(
      `create context and switch testContext\n\tparent parentContext\n`,
    );
  });
});

describe("Switch context statements", () => {
  it("Switch to context", () => {
    const astSwitchContext: SwitchToContext = {
      type: "SwitchToContext",
      id: "testContext",
    };
    expect(astToString(astSwitchContext)).toBe(`context testContext\n`);
    expect(astToString(astSwitchContext, { pretty: true })).toBe(
      `context testContext\n`,
    );
  });
});

describe("Units of Measure", () => {
  it("Create a basic unit of measure", () => {
    const ast: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "testUOM",
      name: "testUOM",
      defaultSymbol: "testUOM",
      measuring: "testMeasuring",
    };
    expect(astToString(ast)).toBe(
      `unitOfMeasure testUOM measuring testMeasuring defaultSymbol testUOM\n`,
    );
  });

  it("Unit of measure with plural", () => {
    const ast: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "testUOM",
      name: "testUOM",
      defaultSymbol: "testUOM",
      measuring: "testMeasuring",
      symbolPlural: "testSymbolPlural",
    };
    expect(astToString(ast)).toBe(
      `unitOfMeasure testUOM measuring testMeasuring defaultSymbol testUOM plural testSymbolPlural\n`,
    );
  });

  it("Unit of measure with aka", () => {
    const ast: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "testUOM",
      name: "testUOM",
      defaultSymbol: "testUOM",
      measuring: "testMeasuring",
      aka: ["aka1", "aka2"],
    };
    expect(astToString(ast)).toBe(
      `unitOfMeasure testUOM measuring testMeasuring defaultSymbol testUOM aka aka1, aka2\n`,
    );
  });

  it("Unit of measure with aka and plural", () => {
    const ast: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "testUOM",
      name: "testUOM",
      defaultSymbol: "test UOM",
      measuring: "testMeasuring",
      aka: ["aka1", "aka2"],
      symbolPlural: "test Symbol Plural",
    };
    expect(astToString(ast)).toBe(
      `unitOfMeasure testUOM measuring testMeasuring defaultSymbol 'test UOM' plural 'test Symbol Plural' aka aka1, aka2\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `unitOfMeasure testUOM\n\tmeasuring testMeasuring\n\tdefaultSymbol 'test UOM'\n\tplural 'test Symbol Plural'\n\taka aka1, aka2\n`,
    );
  });
});

describe("ingredient statements", () => {
  it("Create a basic ingredient", () => {
    const ast: BoughtIngredient = {
      type: "BoughtIngredient",
      id: "testIngredient",
      name: "testIngredient",
      measuredAs: "testMeasuring",
    };
    expect(astToString(ast)).toBe(
      `ingredient testIngredient measuredAs testMeasuring\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `ingredient testIngredient\n\tmeasuredAs testMeasuring\n`,
    );
  });

  it("Create an ingredient with plural", () => {
    const ast: BoughtIngredient = {
      type: "BoughtIngredient",
      id: "testIngredient",
      name: "testIngredient",
      measuredAs: "testMeasuring",
      plural: "testPlural",
    };
    expect(astToString(ast)).toBe(
      `ingredient testIngredient plural testPlural measuredAs testMeasuring\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `ingredient testIngredient\n\tplural testPlural\n\tmeasuredAs testMeasuring\n`,
    );
  });

  it("Create an ingredient with aka", () => {
    const ast: BoughtIngredient = {
      type: "BoughtIngredient",
      id: "testIngredient",
      name: "testIngredient",
      measuredAs: "testMeasuring",
      aka: ["aka1", "aka2"],
    };
    expect(astToString(ast)).toBe(
      `ingredient testIngredient aka aka1, aka2 measuredAs testMeasuring\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `ingredient testIngredient\n\taka aka1, aka2\n\tmeasuredAs testMeasuring\n`,
    );
  });

  it("Create an ingredient with plural and aka", () => {
    const ast: BoughtIngredient = {
      type: "BoughtIngredient",
      id: "testIngredient",
      name: "test ingredient",
      measuredAs: "testMeasuring",
      plural: "testPlural",
      aka: ["aka1", "aka2"],
    };
    expect(astToString(ast)).toBe(
      `ingredient testIngredient fullName 'test ingredient' plural testPlural aka aka1, aka2 measuredAs testMeasuring\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `ingredient testIngredient\n\tfullName 'test ingredient'\n\tplural testPlural\n\taka aka1, aka2\n\tmeasuredAs testMeasuring\n`,
    );
  });
});

describe("Recipe statements", () => {
  it("Create an empty recipe - illegal dsl", () => {
    const ast: Recipe = {
      type: "Recipe",
      id: "testRecipe",
      name: "testRecipe",
      ingredients: [],
      cookingSteps: [],
      serves: 1,
    };
    expect(astToString(ast)).toBe(`recipe testRecipe serves 1\n`);
    expect(astToString(ast, { pretty: true })).toBe(
      `recipe testRecipe\n\tserves 1\n`,
    );
  });

  it("Create a recipe with 1 basic ingredient and 1 basic step", () => {
    const testIngredient: RecipeIngredient = {
      type: "RecipeIngredient",
      ingredientId: "testIngredient",
      amount: {
        unit: "item",
        value: 1,
      },
    };
    const ast: Recipe = {
      type: "Recipe",
      id: "testRecipe",
      name: "testRecipe",
      ingredients: [testIngredient],
      cookingSteps: [
        {
          type: "CookingStep",
          processId: "testStep",
          produces: [],
          ingredients: [testIngredient],
          preconditions: [],
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
        },
      ],
      serves: 1,
    };
    expect(astToString(ast)).toBe(
      `recipe testRecipe serves 1 ingredients - 1 item testIngredient; steps - testStep testIngredient;\n`,
    );
    expect(astToString(ast, { pretty: true })).toBe(
      `recipe testRecipe\n\tserves 1\n\tingredients\n\t\t- 1 item testIngredient;\n\tsteps\n\t\t- testStep testIngredient;\n`,
    );
  });

  it("Recipe with bells and whistles", () => {
    const dslStrs = [
      `recipe SpaghettiAglioOlioEPeperoncino`,
      `fullName 'Spaghetti aglio, olio e peperoncino'`,
      `serves 4`,
      `ingredients`,
      `\t- 500 g spaghetti;`,
      `\t- 4 cloves garlic;`,
      `\t- 0.5 glasses 'extra virge olive oil';`,
      `\t- 2.5 item redHotChilliPeppers;`,
      `\t- 5 grams salt;`,
      `\t- 5 l water;`,
      `\t- (optional) 2 spoons parmesanCheese;`,
      `steps`,
      `\t- 'bring to the boil' salt and water -[15]-> boiledSaltedWater;`,
      `\t- 'chop finely' redHotChilliPeppers -1-> choppedChillies;`,
      `\t- 'chop finely' garlic -(2)-> choppedGarlic;`,
      `\t- shallow-fry choppedChillies and choppedGarlic in 'extra virge olive oil' -[1]-> condiment;`,
      `\t- when boiledSaltedWater`,
      `\t\t- add spaghetti to boiledSaltedWater -(1)-> cookingPasta;`,
      `\t- when cookingPasta 'is tender'`,
      `\t\t- (optional) reserve boiledSaltedWater from cookingPasta -1-> reservedWater;`,
      `\t- drain cookingPasta -1-> cookedPasta;`,
      `\t- combine cookedPasta and condiment -2-> pastaWithCondiment;`,
      `\t- (optional) mix parmesanCheese, pastaWithCondiment and reservedWater -1-> step_9_output;`,
      `\t- serve pastaWithCondiment -1-> SpaghettiAglioOlioEPeperoncino;\n`
    ];
    const ast: Recipe = {
      // recipe SpaghettiAglioOlioEPeperoncino fullName 'Spaghetti aglio, olio e peperoncino
      type: "Recipe",
      id: "SpaghettiAglioOlioEPeperoncino",
      name: "Spaghetti aglio, olio e peperoncino",

      // serves 4
      serves: 4,

      // ingredients
      ingredients: [
        {
          // - 500 g spaghetti;
          type: "RecipeIngredient",
          ingredientId: "spaghetti",
          amount: {
            value: 500,
            unit: "g",
          },
        },
        {
          // - 4 cloves garlic;
          type: "RecipeIngredient",
          ingredientId: "garlic",
          amount: {
            value: 4,
            unit: "cloves",
          },
        },
        {
          // - 0.5 glasses 'extra virge olive oil';
          type: "RecipeIngredient",
          ingredientId: "extra virge olive oil",
          amount: {
            value: 0.5,
            unit: "glasses",
          },
        },
        {
          // - 1-4 redHotChilliPeppers;
          type: "RecipeIngredient",
          ingredientId: "redHotChilliPeppers",
          amount: {
            value: 2.5,
            unit: "item",
          },
        },
        {
          // - 5 grams salt;
          type: "RecipeIngredient",
          ingredientId: "salt",
          amount: {
            value: 5,
            unit: "grams",
          },
        },
        {
          // - 5l water;
          type: "RecipeIngredient",
          ingredientId: "water",
          amount: {
            value: 5,
            unit: "l",
          },
        },
        {
          // - (optional) 2 spoons parmesanCheese;
          type: "RecipeIngredient",
          ingredientId: "parmesanCheese",
          isOptional: true,
          amount: {
            value: 2,
            unit: "spoons",
          },
        },
      ],
      cookingSteps: [
        {
          // - 'bring to the boil' salt and water -[15]-> boiledSaltedWater;
          type: "CookingStep",
          processId: "bring to the boil",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "salt",
              amount: {
                value: 5,
                unit: "grams",
              },
            },
            {
              type: "RecipeIngredient",
              ingredientId: "water",
              amount: {
                value: 5,
                unit: "l",
              },
            },
          ],
          activeMinutes: 0,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 15,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "boiledSaltedWater",
            },
          ],
        },
        {
          // - 'chop finely' redHotChilliPeppers --> choppedChillies;
          type: "CookingStep",
          processId: "chop finely",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "redHotChilliPeppers",
              amount: {
                value: 2.5,
                unit: "item",
              },
            },
          ],
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "choppedChillies",
            },
          ],
        },
        {
          // - 'chop finely' garlic -(2)-> choppedGarlic;
          type: "CookingStep",
          processId: "chop finely",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "garlic",
              amount: {
                value: 4,
                unit: "cloves",
              },
            },
          ],
          activeMinutes: 0,
          keepAnEyeMinutes: 2,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "choppedGarlic",
            },
          ],
        },
        {
          // - 'shallow-fry' choppedChillies and choppedGarlic in 'extra virge olive oil' -[]-> condiment;
          type: "CookingStep",
          processId: "shallow-fry",
          preconditions: [],
          ingredients: [
            {
              type: "CookingStepOutput",
              outputId: "choppedChillies",
            },
            {
              type: "CookingStepOutput",
              outputId: "choppedGarlic",
            },
            {
              type: "RecipeIngredient",
              ingredientId: "extra virge olive oil",
              amount: {
                value: 0.5,
                unit: "glasses",
              },
            },
          ],
          activeMinutes: 0,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 1,
          medium: {
            type: "RecipeIngredient",
            ingredientId: "extra virge olive oil",
            amount: {
              value: 0.5,
              unit: "glasses",
            },
          },
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "condiment",
            },
          ],
        },
        {
          // - when boiledSaltedWater
          //     - add spaghetti to boiledSaltedWater -()-> cookingPasta;
          type: "CookingStep",
          processId: "add",
          preconditions: [
            {
              ingredientNeeded: {
                type: "CookingStepOutput",
                outputId: "boiledSaltedWater",
              },
            },
          ],
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "spaghetti",
              amount: {
                value: 500,
                unit: "g",
              },
            },
            {
              type: "CookingStepOutput",
              outputId: "boiledSaltedWater",
            },
          ],
          target: {
            type: "CookingStepOutput",
            outputId: "boiledSaltedWater",
          },
          activeMinutes: 0,
          keepAnEyeMinutes: 1,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "cookingPasta",
            },
          ],
        },
        {
          // - when cookingPasta 'is tender'
          //     - (optional) reserve boiledSaltedWater from cookingPasta -> reservedWater;
          type: "CookingStep",
          processId: "reserve",
          preconditions: [
            {
              ingredientNeeded: {
                type: "CookingStepOutput",
                outputId: "cookingPasta",
              },
              conditionDescription: "is tender",
            },
          ],
          ingredients: [
            {
              type: "CookingStepOutput",
              outputId: "boiledSaltedWater",
            },
            {
              type: "CookingStepOutput",
              outputId: "cookingPasta",
            },
          ],
          source: {
            type: "CookingStepOutput",
            outputId: "cookingPasta",
          },
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "reservedWater",
            },
          ],
          isOptional: true,
        },
        {
          // - drain cookingPasta -> cookedPasta;
          type: "CookingStep",
          processId: "drain",
          preconditions: [],
          ingredients: [
            {
              type: "CookingStepOutput",
              outputId: "cookingPasta",
            },
          ],
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "cookedPasta",
            },
          ],
        },
        {
          // - combine cookedPasta and condiment -2-> pastaWithCondiment;
          type: "CookingStep",
          processId: "combine",
          preconditions: [],
          ingredients: [
            {
              type: "CookingStepOutput",
              outputId: "cookedPasta",
            },
            {
              type: "CookingStepOutput",
              outputId: "condiment",
            },
          ],
          activeMinutes: 2,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "pastaWithCondiment",
            },
          ],
        },
        {
          // - (optional) mix parmesanCheese, pastaWithCondiment  and reservedWater;
          type: "CookingStep",
          processId: "mix",
          preconditions: [],
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "parmesanCheese",
              amount: {
                value: 2,
                unit: "spoons",
              },
            },
            {
              type: "CookingStepOutput",
              outputId: "pastaWithCondiment",
            },
            {
              type: "CookingStepOutput",
              outputId: "reservedWater",
            },
          ],
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "step_9_output",
            },
          ],
          isOptional: true
        },
        {
          // - serve pastaWithCondiment -> SpaghettiAglioOlioEPeperoncino;
          type: "CookingStep",
          processId: "serve",
          preconditions: [],
          ingredients: [
            {
              type: "CookingStepOutput",
              outputId: "pastaWithCondiment",
            },
          ],
          activeMinutes: 1,
          keepAnEyeMinutes: 0,
          inactiveMinutes: 0,
          produces: [
            {
              type: "CookingStepOutput",
              outputId: "SpaghettiAglioOlioEPeperoncino",
            },
          ],
        },
      ],
    };
    expect(astToString(ast, { pretty: true })).toBe(dslStrs.join("\n\t"));
    expect(astToString(ast)).toBe(dslStrs.map(s => s.trimStart()).join(" "));
  });
});
