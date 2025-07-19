import { describe, expect, it } from "vitest";
import { createMeasurementService } from "../src";
import { createNaiveMeasurementServiceDependencies } from "./naive_dependencies";

describe("MeasurementService", () => {
  it("should create a measurement service with naive dependencies", () => {
    expect(() =>
      createMeasurementService(createNaiveMeasurementServiceDependencies()),
    ).not.to.throw();
  });

  it("Should return no matching measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.getMeasuringFeatureById("non-existing-id");
    expect(feature).toBeNull();
  });

  it("Should return no matching unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const unit = await service.getUnitOfMeasureById("non-existing-id");
    expect(unit).toBeNull();
  });

  it("Should create a new measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    expect(feature).toHaveProperty("id");
    expect(feature.name).toBe("Test Feature");
  });

  it("Should get a measuring feature by ID", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    const fetchedFeature = await service.getMeasuringFeatureById(feature.id);
    expect(fetchedFeature).toEqual(feature);
  });

  it("Should throw an error when entering a measuring feature with an existing name", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service.createMeasuringFeature({ name: "Test Feature" });
    await expect(
      service.createMeasuringFeature({ name: "Test Feature" }),
    ).rejects.toThrow(
      'Measuring feature with name "Test Feature" already exists.',
    );
  });

  it("Should update an existing measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    const updatedFeature = await service.updateMeasuringFeature(feature.id, {
      name: "Updated Feature",
    });
    expect(updatedFeature.name).toBe("Updated Feature");
  });

  it("Should delete an existing measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    await service.deleteMeasuringFeature(feature.id);
    const deletedFeature = await service.getMeasuringFeatureById(feature.id);
    expect(deletedFeature).toBeNull();
  });

  it("Should create a new unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const unit = await service.createUnitOfMeasure({ name: "Test Unit" });
    expect(unit).toHaveProperty("id");
    expect(unit.name).toBe("Test Unit");
  });

  it("Should update an existing unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const unit = await service.createUnitOfMeasure({ name: "Test Unit" });
    const updatedUnit = await service.updateUnitOfMeasure(unit.id, {
      name: "Updated Unit",
    });
    expect(updatedUnit.name).toBe("Updated Unit");
  });

  it("Should delete an existing unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const unit = await service.createUnitOfMeasure({ name: "Test Unit" });
    await service.deleteUnitOfMeasure(unit.id);
    const deletedUnit = await service.getUnitOfMeasureById(unit.id);
    expect(deletedUnit).toBeNull();
  });
});
