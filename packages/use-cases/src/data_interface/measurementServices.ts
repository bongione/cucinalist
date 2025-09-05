import { ResultAsync, okAsync, errAsync } from "@cucinalist/fp-types";
import type {
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
  ) => ResultAsync<MeasuringFeature, Error>;

  updateMeasuringFeature: (
    id: string,
    measuringFeatureInfo: Partial<Omit<MeasuringFeature, "id">>,
  ) => ResultAsync<MeasuringFeature, Error>;

  deleteMeasuringFeature: (id: string) => ResultAsync<void, Error>;

  createUnitOfMeasure: (
    unitOfMeasureInfo: UnitOfMeasureInfo,
  ) => ResultAsync<MeasuringFeature, Error>;

  updateUnitOfMeasure: (
    unitId: string,
    unitOfMeasureInfo: Partial<UnitOfMeasureInfo>,
  ) => ResultAsync<UnitOfMeasure, Error>;

  deleteUnitOfMeasure: (unitId: string) => ResultAsync<void, Error>;
}

export interface MeasurementStorage {
  createMeasuringFeature: (
    measuringFeatureInfo: MeasuringFeatureInfo,
  ) => ResultAsync<MeasuringFeature, Error>;

  updateMeasuringFeature: (
    id: string,
    measuringFeatureInfo: Partial<MeasuringFeatureInfo>,
  ) => ResultAsync<MeasuringFeature, Error>;

  deleteMeasuringFeature: (id: string) => ResultAsync<void, Error>;

  createUnitOfMeasure: (
    unitOfMeasureInfo: UnitOfMeasureInfo,
  ) => ResultAsync<MeasuringFeature, Error>;

  updateUnitOfMeasure: (
    unitId: string,
    unitOfMeasureInfo: Partial<UnitOfMeasureInfo>,
  ) => ResultAsync<UnitOfMeasure, Error>;

  deleteUnitOfMeasure: (unitId: string) => ResultAsync<void, Error>;
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
    getMeasuringFeatureById: (id) => {
      return measuringFeatureProvider.getMeasuringFeatureById(id);
    },

    getMeasuringFeaturesByName: (name) => {
      return measuringFeatureProvider.getMeasuringFeaturesByName(name);
    },

    getUnitOfMeasureById: (id) => {
      return unitOfMeasureProvider.getUnitOfMeasureById(id);
    },

    getUnitsOfMeasureByName: (name) => {
      return unitOfMeasureProvider.getUnitsOfMeasureByName(name);
    },

    createMeasuringFeature: (measuringFeatureInfo) => {
      return measuringFeatureProvider
        .getMeasuringFeaturesByName(measuringFeatureInfo.name)
        .andThen((records) =>
          records.length === 0
            ? okAsync(true)
            : errAsync(new Error("Measuring feature already exists")),
        )
        .andThen(() =>
          measurementStore.createMeasuringFeature(measuringFeatureInfo),
        );
    },

    updateMeasuringFeature: (id, measuringFeatureInfo) => {
      return measuringFeatureProvider
        .getMeasuringFeatureById(id)
        .andThen((mf) =>
          mf ? okAsync(mf) : errAsync(new Error("Measuring feature not found")),
        )
        .andThen(() =>
          measurementStore.updateMeasuringFeature(id, measuringFeatureInfo),
        );
    },

    deleteMeasuringFeature: (id) => {
      return measurementStore.deleteMeasuringFeature(id);
    },

    createUnitOfMeasure: (unitOfMeasureInfo) => {
      return unitOfMeasureProvider
        .getUnitsOfMeasureByName(unitOfMeasureInfo.name)
        .andThen((units) => {
          if (units.length > 0) {
            return errAsync(
              new Error(
                `Unit of measure with name "${unitOfMeasureInfo.name}" already exists.`,
              ),
            );
          }
          return okAsync(units);
        })
        .andThen(() => {
          if (unitOfMeasureInfo.measuringId) {
            return measuringFeatureProvider
              .getMeasuringFeatureById(unitOfMeasureInfo.measuringId)
              .andThen((mf) =>
                mf
                  ? okAsync(mf)
                  : errAsync(
                      new Error(
                        `Measuring feature with id "${unitOfMeasureInfo.measuringId}" does not exist.`,
                      ),
                    ),
              );
          }
          return okAsync(null);
        })
        .andThen(() => measurementStore.createUnitOfMeasure(unitOfMeasureInfo));
    },

    updateUnitOfMeasure: (unitId, unitOfMeasureInfo) =>
      unitOfMeasureProvider
        .getUnitOfMeasureById(unitId)
        .andThen((u) =>
          u
            ? okAsync(u)
            : errAsync(
                new Error(
                  `Unit of measure with id "${unitId}" does not exist.`,
                ),
              ),
        )
        .andThen(() =>
          measurementStore.updateUnitOfMeasure(unitId, unitOfMeasureInfo),
        ),
    deleteUnitOfMeasure: measurementStore.deleteUnitOfMeasure,
  };
}
