import type {EntitiesStorageProvider, EntitiesStorageApi} from '@cucinalist/use-cases/entities-storage';
import { createCookingTechniqueStorage } from "./cookingTechniques.js";

export function createEntitiesStorageProvider(): EntitiesStorageProvider {
  const api: EntitiesStorageApi = {
    ...createCookingTechniqueStorage()
  }
  return {
    tx: (fn) => fn(api),
    task: (fn) => fn(api)
  }
}
