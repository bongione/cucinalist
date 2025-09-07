import { Maybe, Nothing, Just } from "@cucinalist/fp-types";

export type MeasuringFeature =
  | "count"
  | "weight"
  | "volume"
  | "length"
  | "area"
  | "temperature"
  | "time";

export interface UnitOfMeasure {
  name: string;
  symbol: string;
  plural: string;
  synonyms: string[];
  measuringFeature: MeasuringFeature;
}

/**
 * A measurement represents a quantity of something, expressed as an amount and a unit of measure.
 */
export interface Measurement {
  amount: number;
  unit: string;
}

/**
 * Function that provides information about a unit of measure, given a qualifier
 *
 * @param qualifier A name or synonym of the unit of measure
 * @returns Maybe<UnitOfMeasure> - Just(UnitOfMeasure) if found, Nothing if not found
 */
export function unitOfMeasure(qualifier: string): Maybe<UnitOfMeasure> {
  qualifier = qualifier.toLowerCase();
  // Look up the unit of measure in the map
  // Return a copy without the family property
  const uom = unitsOfMeasure().get(qualifier);
  if (!uom) {
    return Nothing;
  }
  return Just(uom);
}

/**
 * Utility function to allow registering additional units of measure families
 * @param uomFamily
 */
export function recordUnitOfMeasureFamily(family: UnitOfMeasureFamily) {
  processUnitOfMeasure(family, family);
  family.variations.forEach((variation) =>
    processUnitOfMeasure(
      { ...variation, measuringFeature: family.measuringFeature },
      family,
    ),
  );
}

/**
 * Convert a measurement to a different unit of measure
 *
 * @param measurement The measurement to convert
 * @param toUnitQualifier A name or synonym of the target unit of measure
 * @returns Maybe<Measurement> - Just(convertedMeasurement) if conversion was successful, Nothing if conversion failed (e.g. incompatible units)
 */
export function convertMeasurement(
  measurement: Measurement,
  toUnitQualifier: string,
): Maybe<Measurement> {
  toUnitQualifier = toUnitQualifier.toLowerCase();
  // Look up the from and to units of measure
  // If either is not found, or they are not of the same measuring feature, return Nothing
  // If they are the same unit, return the original measurement
  // Otherwise, convert to the base unit of the family, then to the target unit
  // Return Just(convertedMeasurement)

  const fromUom = unitsOfMeasure().get(measurement.unit);
  if (!fromUom) {
    return Nothing;
  }
  const toUom = unitsOfMeasure().get(toUnitQualifier);
  if (!toUom) {
    return Nothing;
  }
  if (measurement.amount === 0) {
    return Just({ amount: 0, unit: toUnitQualifier });
  }

  if (fromUom.measuringFeature !== toUom.measuringFeature) {
    return Nothing;
  }
  if (fromUom.name === toUom.name) {
    return Just(measurement);
  }

  // Convert to base unit of the family
  const fromFamily = fromUom.family;
  const toFamily = toUom.family;

  let amountInBaseUnit = measurement.amount;
  if (fromUom.name !== fromFamily.name) {
    // It's a variation, convert to family base unit
    const variation = fromFamily.variations.find(
      (variation) => variation.name.toLowerCase() === toUnitQualifier,
    );
    if (!variation) {
      return Nothing;
    }
    amountInBaseUnit = measurement.amount * variation.factor;
  }

  if (toUom.name === toFamily.name) {
    // Target is the family base unit
    return Just({
      amount: amountInBaseUnit,
      unit: toUom.name,
    });
  } else {
    // Target is a variation, convert from family base unit
    const variation = toFamily.variations.find(
      (variation) => variation.name.toLowerCase() === toUnitQualifier,
    );
    if (!variation) {
      return Nothing;
    }
    return Just({
      amount: amountInBaseUnit / variation.factor,
      unit: toUom.name,
    });
  }
}

// Implementation of standard units of measure

interface UnitOfMeasureFamily extends UnitOfMeasure {
  conversions: Array<{
    toFamilyName: string;
    factor: number;
  }>;
  variations: Array<
    Omit<UnitOfMeasure, "measuringFeature"> & { factor: number }
  >;
}

const metricWeightFamily: UnitOfMeasureFamily = {
  name: "gram",
  symbol: "g",
  synonyms: ["g", "gram", "grams", "gr"],
  conversions: [
    {
      toFamilyName: "ounce",
      factor: 0.03527396, // 1 gram = 0.03527396 ounces
    },
  ],
  measuringFeature: "weight",
  plural: "grams",
  variations: [
    {
      name: "kilogram",
      symbol: "kg",
      plural: "kilograms",
      synonyms: ["kg", "kilogram", "kilograms"],
      factor: 1000,
    },
    {
      name: "milligram",
      plural: "milligrams",
      symbol: "mg",
      synonyms: ["mgs", "milligram", "milligrams"],
      factor: 0.001,
    },
  ],
};

const imperialWeightFamily: UnitOfMeasureFamily = {
  name: "ounce",
  symbol: "oz",
  synonyms: ["oz", "ounce", "ounces"],
  conversions: [
    {
      toFamilyName: "gram",
      factor: 28.34952, // 1 ounce = 28.34952 grams
    },
  ],
  measuringFeature: "weight",
  plural: "ounces",
  variations: [
    {
      name: "pound",
      symbol: "lb",
      plural: "pounds",
      synonyms: ["lb", "lbs", "pound", "pounds"],
      factor: 16,
    },
    {
      name: "stone",
      plural: "stones",
      symbol: "st",
      synonyms: ["st", "stone", "stones"],
      factor: 224,
    },
  ],
};

const metricVolumeFamily: UnitOfMeasureFamily = {
  name: "liter",
  measuringFeature: "volume",
  plural: "liters",
  symbol: "l",
  synonyms: ["l", "litre", "litres"],
  conversions: [
    {
      toFamilyName: "gallon",
      factor: 0.264172, // 1 liter = 0.264172 gallons
    },
  ],
  variations: [
    {
      name: "centiliter",
      plural: "centiliters",
      symbol: "cl",
      synonyms: ["cls"],
      factor: 0.001,
    },
    {
      name: "milliliter",
      plural: "milliliters",
      symbol: "mL",
      synonyms: ["ml", "milliliter", "milliliters"],
      factor: 0.001,
    },
  ],
};

const imperialVolumeFamily: UnitOfMeasureFamily = {
  name: "gallon",
  symbol: "gal",
  plural: "gallons",
  synonyms: ["gal", "gallon", "gallons"],
  conversions: [
    {
      toFamilyName: "liter",
      factor: 3.78541, // 1 gallon = 3.78541 liters
    },
  ],
  measuringFeature: "volume",
  variations: [
    {
      name: "quart",
      symbol: "qt",
      plural: "quarts",
      synonyms: ["qt", "quart", "quarts"],
      factor: 0.25,
    },
    {
      name: "pint",
      symbol: "pt",
      plural: "pints",
      synonyms: ["pt", "pint", "pints"],
      factor: 0.125,
    },
    {
      name: "cup",
      symbol: "c",
      plural: "cups",
      synonyms: ["c", "cup", "cups"],
      factor: 0.0625,
    },
    {
      name: "fluid ounce",
      symbol: "fl oz",
      plural: "fluid ounces",
      synonyms: ["fl oz", "fluid ounce", "fluid ounces"],
      factor: 0.0078125,
    },
    {
      name: "tablespoon",
      symbol: "tbsp",
      plural: "tablespoons",
      synonyms: ["tbsp", "tablespoon", "tablespoons"],
      factor: 0.00390625,
    },
    {
      name: "teaspoon",
      symbol: "tsp",
      plural: "teaspoons",
      synonyms: ["tsp", "teaspoon", "teaspoons"],
      factor: 0.00130208333,
    },
  ],
};

const countingUnit: UnitOfMeasureFamily = {
  name: "item",
  symbol: "",
  plural: "items",
  synonyms: ["", "count", "counts", "ct", "item", "items", "unit", "units"],
  measuringFeature: "count",
  variations: [],
  conversions: [],
};

const _unitsOfMeasure: Map<
  string,
  UnitOfMeasure & { family: UnitOfMeasureFamily }
> = new Map();

function unitsOfMeasure(): Map<
  string,
  UnitOfMeasure & { family: UnitOfMeasureFamily }
> {
  return _unitsOfMeasure;
}

function processUnitOfMeasure(
  uom: UnitOfMeasure,
  parentFamily: UnitOfMeasureFamily,
) {
  const names: Set<string> = new Set([
    uom.name.toLowerCase(),
    uom.plural.toLowerCase(),
    uom.symbol.toLowerCase(),
    ...uom.synonyms.map((s) => s.toLowerCase()),
  ]);

  // Ensure no duplicates
  for (const variationName of names.values()) {
    if (unitsOfMeasure().has(variationName)) {
      throw new Error(`Duplicate unit of measure: ${uom.name}`);
    }
    unitsOfMeasure().set(variationName, { ...uom, family: parentFamily });
  }
}

recordUnitOfMeasureFamily(countingUnit);
recordUnitOfMeasureFamily(metricWeightFamily);
recordUnitOfMeasureFamily(metricVolumeFamily);
recordUnitOfMeasureFamily(imperialWeightFamily);
recordUnitOfMeasureFamily(imperialVolumeFamily);
