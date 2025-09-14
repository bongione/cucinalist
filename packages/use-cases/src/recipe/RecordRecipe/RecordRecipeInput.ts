import {ResultAsync} from '@cucinalist/fp-types'
import { Recipe as ASTRecipe } from "../ASTRecipe.js";

export type RecordRecipeInputData = ASTRecipe;


export interface RecordRecipeInputBoundary {
  requestRecipeRecording: (recipeInfo: RecordRecipeInputData) => ResultAsync<void, Error>;
}
