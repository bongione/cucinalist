import {
  MeasuringFeature,
  UnitOfMeasure,
  UnitOfMeasureProvider,
  MeasuringFeatureProvider,
} from "@cucinalist/core";

export type MeasuringFeatureInfo = Omit<MeasuringFeature, "id">;
export type UnitOfMeasureInfo = Omit<UnitOfMeasure, "id">;

export interface MeasurementService
  extends UnitOfMeasureProvider,
    MeasuringFeatureProvider {
  createMeasuringFeature: (
    measuringFeatureInfo: MeasuringFeatureInfo,
  ) => Promise<MeasuringFeature>;

  updateMeasuringFeature: (
    id: string,
    measuringFeatureInfo: Partial<Omit<MeasuringFeature, "id">>,
  ) => Promise<MeasuringFeature>;

  deleteMeasuringFeature: (id: string) => Promise<void>;

  createUnitOfMeasure: (
    unitOfMeasureInfo: UnitOfMeasureInfo,
  ) => Promise<MeasuringFeature>;

  updateUnitOfMeasure: (
    unitId: string,
    unitOfMeasureInfo: Partial<UnitOfMeasureInfo>,
  ) => Promise<UnitOfMeasure>;

  deleteUnitOfMeasure: (unitId: string) => Promise<void>;
}

export interface MeasurementStorage {
  createMeasuringFeature: (
    measuringFeatureInfo: MeasuringFeatureInfo,
  ) => Promise<MeasuringFeature>;

  updateMeasuringFeature: (
    id: string,
    measuringFeatureInfo: Partial<MeasuringFeatureInfo>,
  ) => Promise<MeasuringFeature>;

  deleteMeasuringFeature: (id: string) => Promise<void>;

  createUnitOfMeasure: (
    unitOfMeasureInfo: UnitOfMeasureInfo,
  ) => Promise<MeasuringFeature>;

  updateUnitOfMeasure: (
    unitId: string,
    unitOfMeasureInfo: Partial<UnitOfMeasureInfo>,
  ) => Promise<UnitOfMeasure>;

  deleteUnitOfMeasure: (unitId: string) => Promise<void>;
}

export interface MeasurementServiceDependencies {
  measuringFeatureProvider: MeasuringFeatureProvider;
  unitOfMeasureProvider: UnitOfMeasureProvider;
  measurementStore: MeasurementStorage;
}

export function createMeasurementService({
                                           measurementStore,
  measuringFeatureProvider,
  unitOfMeasureProvider,
}: MeasurementServiceDependencies): MeasurementService {
  return {
    getMeasuringFeatureById: async (id) => {
      return measuringFeatureProvider.getMeasuringFeatureById(id);
    },

    getMeasuringFeaturesByName: async (name) => {
      return measuringFeatureProvider.getMeasuringFeaturesByName(name);
    },

    getUnitOfMeasureById: async (id) => {
      return unitOfMeasureProvider.getUnitOfMeasureById(id);
    },

    getUnitsOfMeasureByName: async (name) => {
      return unitOfMeasureProvider.getUnitsOfMeasureByName(name);
    },

    createMeasuringFeature: async (measuringFeatureInfo) => {
      const existingFeatures = await measuringFeatureProvider.getMeasuringFeaturesByName(measuringFeatureInfo.name);
      if (existingFeatures.findIndex(f => f.name.toLocaleLowerCase() === measuringFeatureInfo.name.toLocaleLowerCase()) !== -1) {
        throw new Error(
          `Measuring feature with name "${measuringFeatureInfo.name}" already exists.`,
        );
      }
      return measurementStore.createMeasuringFeature(
        measuringFeatureInfo,
      );
    },

    updateMeasuringFeature: async (id, measuringFeatureInfo) => {
      const existingFeature = await measuringFeatureProvider.getMeasuringFeatureById(id);
      if (!existingFeature) {
        throw new Error(`Measuring feature with id "${id}" does not exist.`);
      }
      return measurementStore.updateMeasuringFeature(
        id,
        measuringFeatureInfo,
      );
    },

    deleteMeasuringFeature: async (id) => {
      return measurementStore.deleteMeasuringFeature(id);
    },

    createUnitOfMeasure: async (unitOfMeasureInfo) => {
      const existingUnits = await unitOfMeasureProvider.getUnitsOfMeasureByName(unitOfMeasureInfo.name);
      if (existingUnits.findIndex(u => u.name.toLocaleLowerCase() === unitOfMeasureInfo.name.toLocaleLowerCase()) !== -1) {
        throw new Error(
          `Unit of measure with name "${unitOfMeasureInfo.name}" already exists.`,
        );
      }
      if (unitOfMeasureInfo.measuringId) {
        const measuringFeature = await measuringFeatureProvider.getMeasuringFeatureById(unitOfMeasureInfo.measuringId);
        if (!measuringFeature) {
          throw new Error(
            `Measuring feature with id "${unitOfMeasureInfo.measuringId}" does not exist.`,
          );
        }
      }
      return measurementStore.createUnitOfMeasure(unitOfMeasureInfo);
    },

    updateUnitOfMeasure: async (unitId, unitOfMeasureInfo) => {
      const existingUnit = await unitOfMeasureProvider.getUnitOfMeasureById(unitId);
      if (!existingUnit) {
        throw new Error(`Unit of measure with id "${unitId}" does not exist.`);
      }
      return measurementStore.updateUnitOfMeasure(
        unitId,
        unitOfMeasureInfo,
      );
    },

    deleteUnitOfMeasure: async (unitId) => {
      return measurementStore.deleteUnitOfMeasure(unitId);
    },
  };
}
