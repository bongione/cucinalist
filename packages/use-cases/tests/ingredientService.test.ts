import {it, expect, describe} from "vitest";

import {createIngredientService} from "../src";
import {createNaiveIngredientServiceDependencies} from "./naive_dependencies";

describe("IngredientService", () => {
  it("should create an ingredient service with naive dependencies", () => {
    expect(() =>
      createIngredientService(createNaiveIngredientServiceDependencies()),
    ).not.toThrow();
  });

  it("Should return no matching store bought ingredient", async () => {
    const service = createIngredientService(
      createNaiveIngredientServiceDependencies(),
    );
    const ingredient = await service.getStoreBoughtIngredientById("non-existing-id");
    expect(ingredient).toBeNull();
  });

  it("Should create a new store bought ingredient", async () => {
    const service = createIngredientService(
      createNaiveIngredientServiceDependencies(),
    );
    const ingredient = await service.createStoreBoughtIngredient({
      name: "Test Ingredient",
      measuredAsIds: []
    });
    expect(ingredient).toHaveProperty("id");
    expect(ingredient.name).toBe("Test Ingredient");
    expect(ingredient.measuredAsIds).toEqual([]);
  });

  it("Should get a store bought ingredient by ID", async () => {
    const service = createIngredientService(
      createNaiveIngredientServiceDependencies(),
    );
    const ingredient = await service.createStoreBoughtIngredient({
      name: "Test Ingredient",
      measuredAsIds: []
    });
    const fetchedIngredient = await service.getStoreBoughtIngredientById(ingredient.id);
    expect(fetchedIngredient).toEqual(ingredient);
  });

  it("Should throw an error when entering a store bought ingredient with an existing name", async () => {
    const service = createIngredientService(
      createNaiveIngredientServiceDependencies(),
    );
    await service.createStoreBoughtIngredient({ name: "Test Ingredient", measuredAsIds: [] });
    await expect(
      service.createStoreBoughtIngredient({ name: "Test Ingredient", measuredAsIds: [] }),
    ).rejects.toThrow(
      'Store bought ingredient with name "Test Ingredient" already exists.',
    );
  });

  it("Should update an existing store bought ingredient", async () => {
    const service = createIngredientService(
      createNaiveIngredientServiceDependencies(),
    );
    const ingredient = await service.createStoreBoughtIngredient({
      name: "Test Ingredient",
      measuredAsIds: []
    });

    const updatedIngredient = await service.updateStoreBoughtIngredient(ingredient.id, {
      name: 'Updated Ingredient',
    });
    expect(updatedIngredient).toHaveProperty("id", ingredient.id);
    expect(updatedIngredient.name).toBe("Updated Ingredient");
  });
});
