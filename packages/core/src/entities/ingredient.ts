import type { ResultAsync } from "@cucinalist/fp-types";
export interface StoreBoughtIngredient {
  id: string;
  name: string;
  plural?: string;
  synonyms?: string[];
  measuredAsIds: string[];
}

export interface StoreBoughtIngredientProvider {
  getStoreBoughtIngredientById: (
    id: string,
  ) => ResultAsync<StoreBoughtIngredient | null, Error>;
  getStoreBoughtIngredientsByName: (
    name: string,
  ) => ResultAsync<StoreBoughtIngredient[], Error>;
}
