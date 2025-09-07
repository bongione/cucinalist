import { ResultAsync, okAsync } from "@cucinalist/fp-types";
import type { CookingTechnique as CoreCookingTechnique, CookingTechniqueProvider } from "@cucinalist/core";
export type CookingTechnique = CoreCookingTechnique;

export type CookingTechniqueInfo = Omit<CookingTechnique, "id" | "synonyms" | "techniqueOutput"> & Partial<Pick<
  CookingTechnique,
  "synonyms"
>>;

interface CookingTechniqueStorageOps extends CookingTechniqueProvider {
  createCookingTechnique: (
    techniqueInfo: CookingTechniqueInfo,
  ) => ResultAsync<CookingTechnique, Error>;
  updateCookingTechnique: (
    id: string,
    techniqueInfo: Partial<CookingTechniqueInfo>,
  ) => ResultAsync<CookingTechnique, Error>;
  deleteCookingTechnique: (id: string) => ResultAsync<void, Error>;
}

export interface CookingTechniqueStorage {
  cookingTechnique: CookingTechniqueStorageOps;
}

// export function createCookingTechniqueService(
//   dependencies: CookingTechniqueStorage,
// ): CookingTechniqueService {
//   const { cookingTechnique } = dependencies;
//
//   return {
//     ...cookingTechniqueProvider,
//     createCookingTechnique: async (techniqueInfo) => {
//       const existingTechniques =
//         await cookingTechniqueProvider.getCookingTechniquesByName(
//           techniqueInfo.name,
//         );
//       if (
//         existingTechniques.findIndex((t) => t.name === techniqueInfo.name) !==
//         -1
//       ) {
//         throw new Error(
//           `Cooking technique with name "${techniqueInfo.name}" already exists.`,
//         );
//       }
//       return cookingTechniqueStorage.createCookingTechnique(techniqueInfo);
//     },
//     updateCookingTechnique: (id, techniqueInfo) =>
//       cookingTechniqueStorage.updateCookingTechnique(id, techniqueInfo),
//     deleteCookingTechnique: (id) =>
//       cookingTechniqueStorage.deleteCookingTechnique(id),
//   };
// }
