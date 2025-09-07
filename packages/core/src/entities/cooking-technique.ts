import { ResultAsync } from "@cucinalist/fp-types";

/** Represents a process that changes some input ingredients (raw or already partially processed food)
 * into an output food item, and could either be ready to be served or work as an intermediate
 * preparation step. Examples are shallow frying, chopping finely, peeling, washing... */
export interface CookingTechnique {
  id: string;
  name: string;
  synonyms: string[];
  description?: string;
  techniqueOutput: (ingredientName: string) => string; // e.g. "chopped {ingredientName}"
}

export interface CookingTechniqueProvider {
  getCookingTechniqueById(
    id: string,
    language?: string,
  ): ResultAsync<CookingTechnique, Error>;
  getCookingTechniqueByQualifier(
    id: string,
    language?: string,
  ): ResultAsync<CookingTechnique[], Error>;
}
