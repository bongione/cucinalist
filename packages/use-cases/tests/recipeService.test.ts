import { it, expect, describe } from "vitest";
import { AttentionNeeded } from "@cucinalist/core";
import { createRecipeService } from "../src/data_interface";
import { createNaiveRecipeServiceDependencies } from "./naive_dependencies";

describe("RecipeService", () => {
  describe("createRecipe", () => {
    it("Should return an empty recipe", async () => {
      const service = createRecipeService(
        createNaiveRecipeServiceDependencies(),
      );
      const recipe = await service.createRecipe({
        name: "",
        servings: 1,
        ingredients: [],
        steps: [],
      });
      expect(recipe).toMatchObject({
        name: "",
        servings: 1,
        ingredients: [],
        steps: [],
      });
      expect(recipe.id).toBeDefined();
    });

    it("Should throw an error when creating a recipe with an existing name", async () => {
      const initData = createNaiveRecipeServiceDependencies();
      const service = createRecipeService(initData);
      await service.createRecipe({
        name: "Duplicate Recipe",
        servings: 2,
        ingredients: [],
        steps: [],
      });
      await expect(
        service.createRecipe({
          name: "Duplicate Recipe",
          servings: 2,
          ingredients: [],
          steps: [],
        }),
      ).rejects.toThrow('Recipe with name "Duplicate Recipe" already exists.');
    });

    it("Should create a recipe with valid data", async () => {
      const initData = createNaiveRecipeServiceDependencies({
        measuringFeatures: [{ id: "mf1", name: "grams" }],
        unitsOfMeasure: [{ id: "uom1", name: "grams", measuringId: "mf1" }],
        storeBoughtIngredients: [
          { id: "si1", name: "Sugar", synonyms: [], measuredAsIds: ["uom1"] },
        ],
        cookingTechniques: [{ id: "ct1", name: "Boiling" }],
      });
      const service = createRecipeService(initData);

      const recipe = await service.createRecipe({
        name: "Test Recipe",
        servings: 4,
        ingredients: [
          {
            ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
            quantity: 200,
            unitId: { type: "Unit", id: "uom1" },
          },
        ],
        steps: [
          {
            id: "step1",
            techniqueId: { type: "CookingTechnique", id: "ct1" },
            duration: {
              attention: AttentionNeeded.CheckRegularly,
              minutes: 10,
            },
            dependsOn: [],
            inputs: [],
            description: "Relax",
          },
        ],
      });
      expect(recipe.id).toBeDefined();
      expect(recipe).toMatchObject({
        name: "Test Recipe",
        servings: 4,
        ingredients: [
          {
            ingredientId: { type: "StoreBoughtIngredient", id: "si1" },
            quantity: 200,
            unitId: { type: "Unit", id: "uom1" },
          },
        ],
        steps: [
          {
            id: "step1",
            techniqueId: { type: "CookingTechnique", id: "ct1" },
            duration: {
              attention: AttentionNeeded.CheckRegularly,
              minutes: 10,
            },
            dependsOn: [],
            inputs: [],
            description: "Relax",
          },
        ],
      });
    });
  });

  describe('updateRecipe', () => {
    it("Should update an existing recipe", async () => {
      const initData = createNaiveRecipeServiceDependencies({
        measuringFeatures: [{ id: "mf1", name: "grams" }],
        unitsOfMeasure: [{ id: "uom1", name: "grams", measuringId: "mf1" }],
        storeBoughtIngredients: [
          { id: "si1", name: "Sugar", synonyms: [], measuredAsIds: ["uom1"] },
        ],
        cookingTechniques: [{ id: "ct1", name: "Boiling" }],
      });
      const service = createRecipeService(initData);

      const recipe = await service.createRecipe({
        name: "Original Recipe",
        servings: 2,
        ingredients: [],
        steps: [],
      });

      const updatedRecipe = await service.updateRecipe(recipe.id, {
        name: "Updated Recipe",
        servings: 4,
      });

      expect(updatedRecipe.name).toBe("Updated Recipe");
      expect(updatedRecipe.servings).toBe(4);
    });

    it("Should throw an error when updating a non-existing recipe", async () => {
      const service = createRecipeService(createNaiveRecipeServiceDependencies());
      await expect(
        service.updateRecipe("non-existing-id", { name: "New Name" }),
      ).rejects.toThrow('Recipe with id "non-existing-id" does not exist.');
    });
  });

  describe('deleteRecipe', () => {
    it("Should delete an existing recipe", async () => {
      const initData = createNaiveRecipeServiceDependencies({
        measuringFeatures: [{ id: "mf1", name: "grams" }],
        unitsOfMeasure: [{ id: "uom1", name: "grams", measuringId: "mf1" }],
        storeBoughtIngredients: [
          { id: "si1", name: "Sugar", synonyms: [], measuredAsIds: ["uom1"] },
        ],
        cookingTechniques: [{ id: "ct1", name: "Boiling" }],
      });
      const service = createRecipeService(initData);

      const recipe = await service.createRecipe({
        name: "Recipe to Delete",
        servings: 2,
        ingredients: [],
        steps: [],
      });

      await service.deleteRecipe(recipe.id);
      expect(await service.getRecipeById(recipe.id)).toBeNull();
    });

    it("Should throw an error when deleting a non-existing recipe", async () => {
      const service = createRecipeService(createNaiveRecipeServiceDependencies());
      await expect(service.deleteRecipe("non-existing-id")).rejects.toThrow(
        'Recipe with id "non-existing-id" does not exist.',
      );
    });
  })
});
