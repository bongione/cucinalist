import type { ResultAsync } from "@cucinalist/fp-types";
import type {
  StoreBoughtIngredient,
  StoreBoughtIngredientProvider,
} from "@cucinalist/core";

export type StoreBoughtIngredientInfo = Omit<StoreBoughtIngredient, "id">;

export interface StoreBoughtIngredientStorageOps
  extends StoreBoughtIngredientProvider {
  createStoreBoughtIngredient: (
    ingredientInfo: StoreBoughtIngredientInfo,
  ) => ResultAsync<StoreBoughtIngredient, Error>;

  updateStoreBoughtIngredient: (
    id: string,
    ingredientInfo: Partial<StoreBoughtIngredientInfo>,
  ) => ResultAsync<StoreBoughtIngredient, Error>;

  deleteStoreBoughtIngredient: (id: string) => ResultAsync<void, Error>;
}

export interface StoreBoughtIngredientStorage {
  storeBoughtIngredient: StoreBoughtIngredientStorageOps;
}
