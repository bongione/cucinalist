
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
  ) => Promise<StoreBoughtIngredient | null>;
  getStoreBoughtIngredientsByName: (
    name: string,
  ) => Promise<StoreBoughtIngredient[]>;
}

export type StoreBoughtIngredientInfo = Omit<StoreBoughtIngredient, "id">;

export interface StoreBoughtIngredientStorage {
  createStoreBoughtIngredient: (
    ingredientInfo: StoreBoughtIngredientInfo,
  ) => Promise<StoreBoughtIngredient>;

  updateStoreBoughtIngredient: (
    id: string,
    ingredientInfo: Partial<StoreBoughtIngredientInfo>,
  ) => Promise<StoreBoughtIngredient>;

  deleteStoreBoughtIngredient: (id: string) => Promise<void>;
}

export interface IngredientService
  extends StoreBoughtIngredientProvider {
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
  ingredientStorage: StoreBoughtIngredientStorage;
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
