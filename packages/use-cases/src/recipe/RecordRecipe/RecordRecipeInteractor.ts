import { ResultAsync, Result, err, ok } from "@cucinalist/fp-types";
import type {
  RecordRecipeInputData,
  RecordRecipeInputBoundary,
} from "./RecordRecipeInput.js";
import type {
  RecipeStorage,
  StoreBoughtIngredientStorage,
  CookingTechniqueStorage,
  RecipeInfo,
} from "../../entities-storage/index.js";
import type { RecordRecipeRecordOutputBoundary } from "./RecordRecipeOutput.js";
import { TransactionalStorage } from "../../entities-storage/transactionalStorage.js";
import type {
  StoreBoughtIngredient,
  Recipe as CoreRecipe,
  CookingTechnique,
} from "@cucinalist/core";
import { validateASTRecipe } from "../ASTRecipe.js";

export type DeepRecipeStorageProvider =
  TransactionalStorage<DeepRecipeStorageOps>;

type DeepRecipeStorageOps = RecipeStorage &
  StoreBoughtIngredientStorage &
  CookingTechniqueStorage;

type RecipeReferredData = {
  recipes: Map<string, CoreRecipe>;
  storeIngredients: Map<string, StoreBoughtIngredient>;
  cookingTechniques: Map<string, CookingTechnique>;
};

class RecordRecipeInteractor implements RecordRecipeInputBoundary {
  private dataStore: DeepRecipeStorageProvider;
  private presenter: RecordRecipeRecordOutputBoundary;

  constructor(
    dataStore: DeepRecipeStorageProvider,
    presenter: RecordRecipeRecordOutputBoundary,
  ) {
    this.dataStore = dataStore;
    this.presenter = presenter;
  }

  requestRecipeRecording = (recipeInput: RecordRecipeInputData) =>
    new ResultAsync(
      this.dataStore.tx(async (store) => {
        const errors = validateASTRecipe(recipeInput);
        if (Array.isArray(errors) && errors.length > 0) {
          this.presenter.execute({
            type: 'ReportInvalidInputError',
            validationErrors: errors
          });
          return err(new Error("Invalid input"));
        }
        const recipeInfo: RecipeInfo = {
          name: recipeInput.name,
          servings: recipeInput.serves,
          ingredients: [],
          steps: [],
        };
        const refData: RecipeReferredData = {
          storeIngredients: new Map(),
          recipes: new Map(),
          cookingTechniques: new Map(),
        };

        // Add the ingredients info, checking if we have a recipe or store-bought ingredient
        // with the provided qualifier. If not we create a new store-bought ingredient.
        for (const ing of recipeInput.ingredients) {
          const res = await this.processRecipeIngredientLine(ing, {
            store,
            refData,
            recipeInfo,
          });
          if (res.isErr()) {
            return res;
          }
        }

        // Check the cooking technique of each step. If we don't find it, we create a new one.
        for (const step of recipeInput.cookingSteps) {
          const res = await this.processCookingStepLine(step, {
            store,
            refData,
            recipeInfo,
          });
          if (res.isErr()) {
            return res;
          }
        }

        const existingRecipesRes = await store.recipe
          .getRecipesByName(recipeInfo.name)
          .map((recipes) => (recipes.length > 0 ? recipes[0] : null));
        if (existingRecipesRes.isErr()) {
          this.presenter.execute({
            type: "ReportUnexpectedError",
            error: new Error("Failed while fetching potential existing recipe"),
          });
          return existingRecipesRes;
        }
        const updatedOrNewRecipeRes = await (existingRecipesRes.value
          ? store.recipe.updateRecipe(existingRecipesRes.value.id, recipeInfo)
          : store.recipe.createRecipe(recipeInfo));
        if (updatedOrNewRecipeRes.isErr()) {
          this.presenter.execute({
            type: "ReportUnexpectedError",
            error: new Error("Failed to save recipe"),
          });
          return updatedOrNewRecipeRes;
        }
        this.presenter.execute({
          type: "PresentSavedRecipe",
          recipe: updatedOrNewRecipeRes.value,
          referredRecipes: Array.from(refData.recipes.values()),
          storeIngredients: Array.from(refData.storeIngredients.values()),
          cookingTechniques: Array.from(refData.cookingTechniques.values()),
        });
        return ok(undefined);
      }),
    );

  private processRecipeIngredientLine = async (
    ing: RecordRecipeInputData["ingredients"][number],
    deps: {
      store: DeepRecipeStorageOps;
      refData: RecipeReferredData;
      recipeInfo: RecipeInfo;
    },
  ) => {
    const {
      store,
      refData: { storeIngredients, recipes: referredRecipes },
      recipeInfo,
    } = deps;
    const [ingRes, recRes] = await Promise.all([
      store.storeBoughtIngredient
        .getStoreBoughtIngredientsByName(ing.ingredientId)
        .map((ings) => (ings.length > 0 ? ings[0] : null)),
      store.recipe
        .getRecipesByName(ing.ingredientId)
        .map((recs) => (recs.length > 0 ? recs[0] : null)),
    ]);
    if (ingRes.isErr()) {
      this.presenter.execute({
        type: "ReportUnexpectedError",
        error: new Error("Failed to fetch ingredient reference"),
      });
      return ingRes;
    }
    if (recRes.isErr()) {
      this.presenter.execute({
        type: "ReportUnexpectedError",
        error: new Error("Failed to fetch ingredient reference"),
      });
      return recRes;
    }
    if (ingRes.value) {
      const storeIng = ingRes.value;
      storeIngredients.set(storeIng.id, storeIng);
      recipeInfo.ingredients.push({
        unit: ing.amount.unit,
        amount: ing.amount.value,
        ingredientId: {
          type: "StoreBoughtIngredient",
          id: storeIng.id,
        },
      });
    } else if (recRes.value) {
      const refRec = recRes.value;
      referredRecipes.set(refRec.id, refRec);
      recipeInfo.ingredients.push({
        unit: ing.amount.unit,
        amount: ing.amount.value,
        ingredientId: { type: "Recipe", id: refRec.id },
      });
    } else {
      const newIngredientRes =
        await store.storeBoughtIngredient.createStoreBoughtIngredient({
          name: ing.ingredientId,
          measuredAsIds: [],
        });
      if (newIngredientRes.isErr()) {
        this.presenter.execute({
          type: "ReportUnexpectedError",
          error: new Error("Failed to save new ingredient"),
        });
        return newIngredientRes;
      } else {
        storeIngredients.set(newIngredientRes.value.id, newIngredientRes.value);
        recipeInfo.ingredients.push({
          unit: ing.amount.unit,
          amount: ing.amount.value,
          ingredientId: {
            type: "StoreBoughtIngredient",
            id: newIngredientRes.value.id,
          },
        });
      }
    }
    return ok(undefined);
  };

  private processCookingStepLine = async (
    stepInputLine: RecordRecipeInputData["cookingSteps"][number],
    deps: {
      store: DeepRecipeStorageOps;
      refData: RecipeReferredData;
      recipeInfo: RecipeInfo;
    },
  ) => {
    const {
      store,
      refData: { cookingTechniques },
      recipeInfo,
    } = deps;
    const techniqueRes = await this.findOrCreateCookingTechnique(
      stepInputLine.processId,
      store,
      cookingTechniques,
    );
    if (techniqueRes.isErr()) {
      this.presenter.execute({
        type: "ReportUnexpectedError",
        error: new Error("Failed to fetch cooking techniques"),
      });
      return techniqueRes;
    }
    const technique = techniqueRes.value;

    const stepInput: CoreRecipe["steps"][number] = {
      id: `step-${recipeInfo.steps.length + 1}`,
      dependsOn: [],
      inputs: [],
      produces:
        stepInputLine.produces.length > 0
          ? stepInputLine.produces[0].outputId
          : "",
      techniqueId: { type: "CookingTechnique", id: technique.id },
      duration: {
        minutes:
          stepInputLine.activeMinutes ||
          stepInputLine.inactiveMinutes ||
          stepInputLine.keepAnEyeMinutes,
        attention:
          stepInputLine.activeMinutes > 0
            ? "FullAttention"
            : stepInputLine.keepAnEyeMinutes > 0
              ? "CheckRegularly"
              : stepInputLine.inactiveMinutes > 0
                ? "CanUseTimer"
                : "CheckOccasionally",
      },
    };

    const stepInputs = stepInputLine.ingredients.slice();
    if (stepInputLine.source) {
      stepInputs.push(stepInputLine.source);
    }
    if (stepInputLine.target) {
      stepInputs.push(stepInputLine.target);
    }
    if (stepInputLine.medium) {
      stepInputs.push(stepInputLine.medium);
    }
    for (const precond of stepInputLine.preconditions) {
      stepInputs.push(precond);
    }
    const resInputs = this.processStepInputForInputStepLines(
      stepInput.inputs,
      stepInputs,
    );
    if (resInputs.isErr()) {
      this.presenter.execute({
        type: "ReportInvalidInputError",
        validationErrors: [String(resInputs.error)],
      });
      return resInputs;
    }

    recipeInfo.steps.push(stepInput);
    return ok(recipeInfo);
  };

  private processStepInputForInputStepLines(
    coreStepInputs: CoreRecipe["steps"][number]["inputs"],
    stepInputsAtIndex: Array<
      RecordRecipeInputData["cookingSteps"][number]["ingredients"][number]
    >,
  ) {
    for (const stepInputAtIndex of stepInputsAtIndex) {
      if (stepInputAtIndex.type === "RecipeIngredient") {
        coreStepInputs.push({
          type: "RecipeIngredients",
          index: stepInputAtIndex.atIndex,
        });
      } else if (stepInputAtIndex.type === "CookingStep") {
        coreStepInputs.push({
          type: "RecipeSteps",
          index: stepInputAtIndex.atIndex,
        });
      } else {
        return err(new Error("Unexpected input type"))
      }
    }
    return ok(undefined);
  }

  private findOrCreateCookingTechnique = async (
    techniqueName: string,
    store: DeepRecipeStorageOps,
    cache: Map<string, CookingTechnique>,
  ): Promise<Result<CookingTechnique, Error>> => {
    const cachedTechnique = cache.get(techniqueName);
    if (cachedTechnique) {
      return ok(cachedTechnique);
    }
    const existingTechniquesRes =
      await store.cookingTechnique.getCookingTechniqueByQualifier(
        techniqueName,
      );
    if (existingTechniquesRes.isErr()) {
      return existingTechniquesRes as unknown as Result<
        CookingTechnique,
        Error
      >;
    }
    if (existingTechniquesRes.value.length > 0) {
      const technique = existingTechniquesRes.value[0];
      cache.set(techniqueName, technique);
      return ok(technique);
    }
    const newTechniqueRes = await store.cookingTechnique.createCookingTechnique(
      {
        name: techniqueName,
      },
    );
    if (newTechniqueRes.isErr()) {
      return newTechniqueRes;
    }
    cache.set(techniqueName, newTechniqueRes.value);
    return newTechniqueRes;
  };
}

export function createRecordRecipeInteractor(
  dataStore: DeepRecipeStorageProvider,
  presenter: RecordRecipeRecordOutputBoundary,
): RecordRecipeInputBoundary {
  return new RecordRecipeInteractor(dataStore, presenter);
}
