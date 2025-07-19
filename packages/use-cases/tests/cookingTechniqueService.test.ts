import {describe, expect, it} from "vitest";
import {createCookingTechniqueService} from "../src";
import {createNaiveCookingTechniqueServiceDependencies} from './naive_dependencies'

describe("CookingTechniqueService", () => {
  it("should create a cooking technique service with naive dependencies", () => {
    expect(() =>
      createCookingTechniqueService(createNaiveCookingTechniqueServiceDependencies()),
    ).not.toThrow();
  });

  it("Should return no matching cooking technique", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    const technique = await service.getCookingTechniqueById("non-existing-id");
    expect(technique).toBeNull();
  });

  it("Should create a new cooking technique", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    const technique = await service.createCookingTechnique({
      name: "Test Technique",
      description: "A technique for testing",
    });
    expect(technique).toHaveProperty("id");
    expect(technique.name).toBe("Test Technique");
  });

  it("Should get a cooking technique by ID", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    const technique = await service.createCookingTechnique({
      name: "Test Technique",
      description: "A technique for testing",
    });
    const fetchedTechnique = await service.getCookingTechniqueById(technique.id);
    expect(fetchedTechnique).toEqual(technique);
  });

  it("Should throw an error when entering a cooking technique with an existing name", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    await service.createCookingTechnique({ name: "Test Technique" });
    await expect(
      service.createCookingTechnique({ name: "Test Technique" }),
    ).rejects.toThrow(
      'Cooking technique with name "Test Technique" already exists.',
    );
  });

  it("Should update an existing cooking technique", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    const technique = await service.createCookingTechnique({
      name: "Test Technique",
      description: "A technique for testing",
    });
    const updatedTechnique = await service.updateCookingTechnique(technique.id, {
      description: "Updated description",
    });
    expect(updatedTechnique.description).toBe("Updated description");
  });

  it("Should delete an existing cooking technique", async () => {
    const service = createCookingTechniqueService(
      createNaiveCookingTechniqueServiceDependencies(),
    );
    const technique = await service.createCookingTechnique({
      name: "Test Technique",
      description: "A technique for testing",
    });
    await service.deleteCookingTechnique(technique.id);
    const deletedTechnique = await service.getCookingTechniqueById(technique.id);
    expect(deletedTechnique).toBeNull();
  });
})
