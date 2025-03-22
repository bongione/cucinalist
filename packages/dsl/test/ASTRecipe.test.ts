import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl, Recipe } from "../src";

describe("Simple recipes", () => {
  it("One line recipes", () => {
    const dsl = `recipe test
      serves 1
      ingredients
          - butter;
      steps
          - spread butter -[1]-> butteredBread;
      `;
    const expectedAst: CucinalistDslAST = [
      {
        type: "Recipe",
        id: "test",
        name: "test",
        serves: 1,
        ingredients: [
          {
            type: "RecipeIngredient",
            ingredientId: "butter",
            amount: {
              value: 1,
              unit: "item",
            },
          },
        ],
        cookingSteps: [
          {
            type: "CookingStep",
            processId: "spread",
            preconditions: [],
            ingredients: [
              {
                type: "RecipeIngredient",
                ingredientId: "butter",
                amount: {
                  value: 1,
                  unit: "item",
                },
              },
            ],
            activeMinutes: 0,
            keepAnEyeMinutes: 0,
            inactiveMinutes: 1,
            produces: [
              {
                type: "CookingStepOutput",
                outputId: "butteredBread",
              },
            ],
          },
        ],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAst);
  });

  it("Recipe with all possible variations", () => {
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
    const expectedAst: CucinalistDslAST = [
      {
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
            }
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
            activeMinutes: 0,
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
            inactiveMinutes: 0,
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
                ingredientsNeeded: [
                  {
                    type: "CookingStepOutput",
                    outputId: "boiledSaltedWater",
                  },
                ],
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
            keepAnEyeMinutes: 0,
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
                ingredientsNeeded: [
                  {
                    type: "CookingStepOutput",
                    outputId: "cookingPasta",
                  },
                ],
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
                type: 'CookingStepOutput',
                outputId: "step_output_10",
              }
            ],
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
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAst);
  });
});
