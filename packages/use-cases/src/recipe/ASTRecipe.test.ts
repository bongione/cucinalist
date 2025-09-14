import { describe, it, expect } from "vitest";
import { validateASTRecipe } from "./ASTRecipe.js";


describe("Validation of an AST Recipe", () => {
  it("Should return errors with an invalid type of object", () => {
    expect(validateASTRecipe(null)).toContain("invalid type");
    // @ts-expect-error testing incorrect parameter
    expect(validateASTRecipe(2)).toContain("invalid type");
    // @ts-expect-error testing incorrect parameter
    expect(validateASTRecipe(new Date())).toContain("invalid type");

    expect(
      validateASTRecipe(
        {
          // @ts-expect-error testing incorrect parameter
          type: "NotARecipe",
          id: "",
          name: " ",
          serves: -1,
          ingredients: [],
          cookingSteps: [],
        },
        { checkId: true },
      ),
    ).toContain("invalid type");
  });

  it("Should expect messages for all invalid fields", () => {
    const errors = validateASTRecipe(
      {
        type: "Recipe",
        id: "",
        name: " ",
        serves: -1,
        ingredients: [],
        cookingSteps: [],
      },
      { checkId: true },
    );
    expect(errors).toContain("invalid id");
    expect(errors).toContain("name is required");
    expect(errors).toContain("number of serves is incorrect");
    expect(errors).toContain("the recipe has no ingredients");
    expect(errors).toContain("the recipe has no cookingSteps");
  });

  it("Should expect a message for an invalid recipe and step index", () => {
    const errors = validateASTRecipe(
      {
        type: "Recipe",
        id: "test",
        name: "Ham Sandwich",
        serves: -1,
        ingredients: [
          {
            type: "RecipeIngredient",
            ingredientId: "bread",
            amount: {
              value: 2,
              unit: "slice",
            },
          },
          {
            type: "RecipeIngredient",
            ingredientId: "butter",
            amount: {
              value: 1,
              unit: "spoon",
            },
          },
          {
            type: "RecipeIngredient",
            ingredientId: "ham",
            amount: {
              value: 2,
              unit: "slice",
            },
          },
        ],
        cookingSteps: [
          {
            type: "CookingStep",
            processId: "spread",
            ingredients: [{ type: "RecipeIngredient", atIndex: 3 }],
            produces: [
              {
                type: "CookingStepOutput",
                outputId: "buttered bread",
              },
            ],
            keepAnEyeMinutes: 0,
            activeMinutes: 1,
            inactiveMinutes: 0,
            preconditions: [],
          },
          {
            type: "CookingStep",
            processId: "assemble",
            ingredients: [
              { type: "CookingStep", atIndex: 0.2, atOutputIndex: 0 },
            ],
            produces: [
              {
                type: "CookingStepOutput",
                outputId: "ham sandwich",
              },
            ],
            keepAnEyeMinutes: 0,
            activeMinutes: 1,
            inactiveMinutes: 0,
            preconditions: [],
          },
        ],
      },
      { checkId: true },
    );
    expect(errors).toContain("invalid stepInput index");
  });

  it("Should return null for a valid object", () => {
    expect(
      validateASTRecipe(
        {
          type: "Recipe",
          id: "test",
          name: "Ham Sandwich",
          serves: 2.5,
          ingredients: [
            {
              type: "RecipeIngredient",
              ingredientId: "bread",
              amount: {
                value: 2,
                unit: "slice",
              },
            },
            {
              type: "RecipeIngredient",
              ingredientId: "butter",
              amount: {
                value: 1,
                unit: "spoon",
              },
            },
            {
              type: "RecipeIngredient",
              ingredientId: "ham",
              amount: {
                value: 2,
                unit: "slice",
              },
            },
          ],
          cookingSteps: [
            {
              type: "CookingStep",
              processId: "spread",
              ingredients: [
                { type: "RecipeIngredient", atIndex: 0 },
                { type: "RecipeIngredient", atIndex: 1 },
              ],
              produces: [
                {
                  type: "CookingStepOutput",
                  outputId: "buttered bread",
                },
              ],
              keepAnEyeMinutes: 0,
              activeMinutes: 1,
              inactiveMinutes: 0,
              preconditions: [],
            },
            {
              type: "CookingStep",
              processId: "assemble",
              ingredients: [
                { type: "CookingStep", atIndex: 1, atOutputIndex: 0 },
              ],
              produces: [
                {
                  type: "CookingStepOutput",
                  outputId: "ham sandwich",
                },
              ],
              keepAnEyeMinutes: 0,
              activeMinutes: 1,
              inactiveMinutes: 0,
              preconditions: [],
            },
          ],
        },
        { checkId: true },
      ),
    ).toBe(null);
  });
});
