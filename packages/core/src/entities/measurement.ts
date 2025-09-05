import { ResultAsync } from "@cucinalist/fp-types";

export interface MeasuringFeature {
  id: string;
  name: string;
}

export interface MeasuringFeatureProvider {
  getMeasuringFeatureById: (
    id: string,
  ) => ResultAsync<MeasuringFeature | null, Error>;
  getMeasuringFeaturesByName: (
    name: string,
  ) => ResultAsync<MeasuringFeature[], Error>;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  defaultSymbol?: string;
  plural?: string;
  synonyms?: string[];
  measuringId?: string;
}

export interface UnitOfMeasureProvider {
  getUnitOfMeasureById: (
    id: string,
  ) => ResultAsync<UnitOfMeasure | null, Error>;
  getUnitsOfMeasureByName: (
    name: string,
  ) => ResultAsync<UnitOfMeasure[], Error>;
}
