/*
 * The get or create cooking technique use case.
 */
import { ResultAsync, okAsync } from "@cucinalist/fp-types";
import type { CookingTechnique } from "@cucinalist/core";
import {
  CookingTechniqueStorage,
  EntitiesStorageProvider,
} from "../entities-storage/index.js";

export type CreatedCookingTechnique = CookingTechnique;
export type CreateCookingTechniqueInfo = Omit<CookingTechnique, "id">;

export function getOrCreateCookingTechnique(
  dataProvider: EntitiesStorageProvider,
  techniqueName: string,
): ResultAsync<CreatedCookingTechnique, Error> {
  return dataProvider.tx((storage) =>
    storage.cookingTechnique
      .getCookingTechniqueByQualifier(techniqueName)
      .andThen((techniques) => {
        if (techniques.length > 0) {
          return okAsync(techniques[0]);
        }
        return storage.cookingTechnique.createCookingTechnique({
          name: techniqueName,
        });
      }),
  );
}
