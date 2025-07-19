import { StoreBoughtIngredient, StoreBoughtIngredientProvider } from "@cucinalist/core";

export type StoreBoughtIngredientInfo = Omit<StoreBoughtIngredient, "id">;

export interface IngredientService extends StoreBoughtIngredientProvider {
  createStoreBoughtIngredient: (
    ingredientInfo: StoreBoughtIngredientInfo,
  ) => Promise<StoreBoughtIngredient>;

  updateStoreBoughtIngredient: (
    id: string,
    ingredientInfo: Partial<StoreBoughtIngredientInfo>,
  ) => Promise<StoreBoughtIngredient>;

  deleteStoreBoughtIngredient: (id: string) => Promise<void>;
}

export interface IngredientStorage {
  createStoreBoughtIngredient: (
    ingredientInfo: StoreBoughtIngredientInfo,
  ) => Promise<StoreBoughtIngredient>;

  updateStoreBoughtIngredient: (
    id: string,
    ingredientInfo: Partial<StoreBoughtIngredientInfo>,
  ) => Promise<StoreBoughtIngredient>;

  deleteStoreBoughtIngredient: (id: string) => Promise<void>;
}

export interface IngredientServiceDependencies {
  ingredientStorage: IngredientStorage;
  ingredientProvider: StoreBoughtIngredientProvider;
}

export function createIngredientService(
  dependencies: IngredientServiceDependencies,
): IngredientService {
  const { ingredientStorage, ingredientProvider } = dependencies;

  return {
    ...ingredientProvider,
    createStoreBoughtIngredient: async (ingredientInfo) => {
      const existingIngredients =
        await ingredientProvider.getStoreBoughtIngredientsByName(
          ingredientInfo.name,
        );
      if (
        existingIngredients.findIndex((i) => i.name === ingredientInfo.name) !==
        -1
      ) {
        throw new Error(
          `Store bought ingredient with name "${ingredientInfo.name}" already exists.`,
        );
      }
      return ingredientStorage.createStoreBoughtIngredient(ingredientInfo);
    },
    updateStoreBoughtIngredient: (id, ingredientInfo) =>
      ingredientStorage.updateStoreBoughtIngredient(id, ingredientInfo),
    deleteStoreBoughtIngredient: (id) =>
      ingredientStorage.deleteStoreBoughtIngredient(id),
  };
}
