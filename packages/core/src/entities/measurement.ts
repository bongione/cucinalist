export interface MeasuringFeature {
  id: string;
  name: string;
}

export interface MeasuringFeatureProvider {
  getMeasuringFeatureById: (id: string) => Promise<MeasuringFeature | null>;
  getMeasuringFeaturesByName: (name: string) => Promise<MeasuringFeature[]>;
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
  getUnitOfMeasureById: (id: string) => Promise<UnitOfMeasure | null>;
  getUnitsOfMeasureByName: (name: string) => Promise<UnitOfMeasure[]>;
}
