import { CookingTechnique, MeasuringFeature, UnitOfMeasure, StoreBoughtIngredient } from "@cucinalist/core";
import { MeasurementServiceDependencies } from "../src/measurementServices";
import { CookingTechniqueServiceDependencies } from "../src/cookingTechinqueService";
import { IngredientServiceDependencies } from "../src";

export function createNaiveMeasurementServiceDependencies(): MeasurementServiceDependencies {
  const features: Map<string, MeasuringFeature> = new Map();
  const units: Map<string, UnitOfMeasure> = new Map();
  return {
    measuringFeatureProvider: {
      getMeasuringFeatureById: async (id: string) => {
        return features.get(id) || null;
      },
      getMeasuringFeaturesByName: async (name: string) => {
        return Array.from(features.values()).filter(
          (feature) => feature.name === name,
        );
      },
    },
    unitOfMeasureProvider: {
      getUnitOfMeasureById: async (id: string) => {
        return units.get(id) || null;
      },
      getUnitsOfMeasureByName: async (name: string) => {
        return Array.from(units.values()).filter((unit) => unit.name === name);
      },
    },
    measurementStore: {
      createMeasuringFeature: async (measuringFeatureInfo) => {
        const id = crypto.randomUUID();
        const feature = { id, ...measuringFeatureInfo };
        features.set(id, feature);
        return feature;
      },
      updateMeasuringFeature: async (id, measuringFeatureInfo) => {
        if (!features.has(id)) throw new Error("Measuring feature not found");
        const updatedFeature = { ...features.get(id), ...measuringFeatureInfo };
        features.set(id, updatedFeature);
        return updatedFeature;
      },
      deleteMeasuringFeature: async (id) => {
        if (!features.has(id)) throw new Error("Measuring feature not found");
        features.delete(id);
      },
      createUnitOfMeasure: async (unitOfMeasureInfo) => {
        const id = crypto.randomUUID();
        const unit = { id, ...unitOfMeasureInfo };
        units.set(id, unit);
        return unit;
      },
      updateUnitOfMeasure: async (unitId, unitOfMeasureInfo) => {
        if (!units.has(unitId)) throw new Error("Unit of measure not found");
        const updatedUnit = { ...units.get(unitId), ...unitOfMeasureInfo };
        units.set(unitId, updatedUnit);
        return updatedUnit;
      },
      deleteUnitOfMeasure: async (unitId) => {
        if (!units.has(unitId)) throw new Error("Unit of measure not found");
        units.delete(unitId);
      },
    },
  };
}

export function createNaiveCookingTechniqueServiceDependencies(): CookingTechniqueServiceDependencies {
  const techniques: Map<string, CookingTechnique> = new Map();
  return {
    cookingTechniqueProvider: {
      getCookingTechniqueById: async (id: string) => {
        return techniques.get(id) || null;
      },
      getCookingTechniquesByName: async (name: string) => {
        return Array.from(techniques.values()).filter(
          (technique) => technique.name === name,
        );
      },
    },
    cookingTechniqueStorage: {
      createCookingTechnique: async (techniqueInfo) => {
        const id = crypto.randomUUID();
        const technique = { id, ...techniqueInfo };
        techniques.set(id, technique);
        return technique;
      },
      updateCookingTechnique: async (id, techniqueInfo) => {
        if (!techniques.has(id)) throw new Error("Cooking technique not found");
        const updatedTechnique = { ...techniques.get(id), ...techniqueInfo };
        techniques.set(id, updatedTechnique);
        return updatedTechnique;
      },
      deleteCookingTechnique: async (id) => {
        if (!techniques.has(id)) throw new Error("Cooking technique not found");
        techniques.delete(id);
      },
    },
  };
}

export function createNaiveIngredientServiceDependencies(): IngredientServiceDependencies {
  const ingredients: Map<string, StoreBoughtIngredient> = new Map();
  return {
    ingredientProvider: {
      getStoreBoughtIngredientById: async (id: string) => {
        return ingredients.get(id) || null;
      },
      getStoreBoughtIngredientsByName: async (name: string) => {
        return Array.from(ingredients.values()).filter(
          (ingredient) => ingredient.name === name,
        );
      },
    },
    ingredientStorage: {
      createStoreBoughtIngredient: async (ingredientInfo) => {
        const id = crypto.randomUUID();
        const ingredient = { id, ...ingredientInfo };
        ingredients.set(id, ingredient);
        return ingredient;
      },
      updateStoreBoughtIngredient: async (id, ingredientInfo) => {
        if (!ingredients.has(id)) throw new Error("Ingredient not found");
        const updatedIngredient = { ...ingredients.get(id), ...ingredientInfo };
        ingredients.set(id, updatedIngredient);
        return updatedIngredient;
      },
      deleteStoreBoughtIngredient: async (id) => {
        if (!ingredients.has(id)) throw new Error("Ingredient not found");
        ingredients.delete(id);
      },
    },
  }
}
