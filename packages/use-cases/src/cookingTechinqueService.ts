import { CookingTechnique, CookingTechniqueProvider } from "@cucinalist/core";

export type CookingTechniqueInfo = Omit<CookingTechnique, "id">;

export interface CookingTechniqueService extends CookingTechniqueProvider {
  createCookingTechnique: (
    techniqueInfo: CookingTechniqueInfo,
  ) => Promise<CookingTechnique>;
  updateCookingTechnique: (
    id: string,
    techniqueInfo: Partial<CookingTechniqueInfo>,
  ) => Promise<CookingTechnique>;
  deleteCookingTechnique: (id: string) => Promise<void>;
}

export interface CookingTechniqueStorage {
  createCookingTechnique: (
    techniqueInfo: CookingTechniqueInfo,
  ) => Promise<CookingTechnique>;
  updateCookingTechnique: (
    id: string,
    techniqueInfo: Partial<CookingTechniqueInfo>,
  ) => Promise<CookingTechnique>;
  deleteCookingTechnique: (id: string) => Promise<void>;
}

export interface CookingTechniqueServiceDependencies {
  cookingTechniqueStorage: CookingTechniqueStorage;
  cookingTechniqueProvider: CookingTechniqueProvider;
}

export function createCookingTechniqueService(
  dependencies: CookingTechniqueServiceDependencies,
): CookingTechniqueService {
  const { cookingTechniqueStorage, cookingTechniqueProvider } = dependencies;

  return {
    ...cookingTechniqueProvider,
    createCookingTechnique: async (techniqueInfo) => {
      const existingTechniques =
        await cookingTechniqueProvider.getCookingTechniquesByName(
          techniqueInfo.name,
        );
      if (
        existingTechniques.findIndex((t) => t.name === techniqueInfo.name) !==
        -1
      ) {
        throw new Error(
          `Cooking technique with name "${techniqueInfo.name}" already exists.`,
        );
      }
      return cookingTechniqueStorage.createCookingTechnique(techniqueInfo);
    },
    updateCookingTechnique: (id, techniqueInfo) =>
      cookingTechniqueStorage.updateCookingTechnique(id, techniqueInfo),
    deleteCookingTechnique: (id) =>
      cookingTechniqueStorage.deleteCookingTechnique(id),
  };
}
