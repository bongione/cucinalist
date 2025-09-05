import { describe, expect, it, assert } from "vitest";
import { createMeasurementService } from "../src/data_interface";
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
    await service
      .getMeasuringFeatureById("non-existing-id")
      .andTee((feature) => expect(feature).toBeNull())
      .orTee(() => assert.fail("Error while fetching measuring feature"));
  });

  it("Should return no matching unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service
      .getUnitOfMeasureById("non-existing-id")
      .andTee((unit) => expect(unit).toBeNull())
      .orTee(() => assert.fail("Error while fetching unit of measure"));
  });

  it("Should create a new measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service
      .createMeasuringFeature({
        name: "Test Feature",
      })
      .unwrapOr({ name: "error" });
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
    if (feature.isErr()) {
      assert.fail("Failed to create measuring feature");
    } else {
      const fetchedFeature = await service.getMeasuringFeatureById(
        feature.value.id,
      );
      expect(fetchedFeature).not.toBeNull();
      if (fetchedFeature.isErr()) {
        console.assert(false, "Failed to fetch measuring feature by ID");
      } else {
        expect(fetchedFeature.value.id).toBe(feature.value.id);
        expect(fetchedFeature.value.name).toBe("Test Feature");
        expect(fetchedFeature).toEqual(feature);
      }
    }
  });

  it("Should return an error when entering a measuring feature with an existing name", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service.createMeasuringFeature({ name: "Test Feature" });
    const dupResult = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    expect(dupResult.isErr()).toBe(true);
  });

  it("Should update an existing measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    const feature = await service.createMeasuringFeature({
      name: "Test Feature",
    });
    if (feature.isErr()) {
      assert.fail("Failed to create measuring feature");
    }
    const updatedFeature = await service.updateMeasuringFeature(
      feature.value.id,
      {
        name: "Updated Feature",
      },
    );
    if (updatedFeature.isOk()) {
      expect(updatedFeature.value.name).toBe("Updated Feature");
    } else {
      assert.fail("Failed to update measuring feature");
    }
  });

  it("Should delete an existing measuring feature", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service
      .createMeasuringFeature({
        name: "Test Feature",
      })
      .andTee((feature) => service.deleteMeasuringFeature(feature.id))
      .andThen((feature) => service.getMeasuringFeatureById(feature.id))
      .map((deletedFeature) => expect(deletedFeature).toBeNull())
      .orTee(() =>
        assert.fail("Error while trying to delete measuring feature"),
      );
  });

  it("Should create a new unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service
      .createUnitOfMeasure({ name: "Test Unit" })
      .andTee((unit) => {
        expect(unit).toHaveProperty("id");
        expect(unit.name).toBe("Test Unit");
      })
      .orTee(() => assert.fail("Error while trying to create unit"));
  });

  it("Should update an existing unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service
      .createUnitOfMeasure({ name: "Test Unit" })
      .andThen((unit) =>
        service.updateUnitOfMeasure(unit.id, {
          name: "Updated Unit",
        }),
      )
      .andTee((updatedUnit) => expect(updatedUnit.name).toBe("Updated Unit"))
      .orTee(() => assert.fail("Error while trying to update unit"));
  });

  it("Should delete an existing unit of measure", async () => {
    const service = createMeasurementService(
      createNaiveMeasurementServiceDependencies(),
    );
    await service
      .createUnitOfMeasure({ name: "Test Unit" })
      .andTee((unit) => service.deleteUnitOfMeasure(unit.id))
      .andThen((unit) => service.getUnitOfMeasureById(unit.id))
      .andTee((deletedUnit) => expect(deletedUnit).toBeNull())
      .orTee(() => assert.fail("Error while trying to delete unit"));
  });
});
