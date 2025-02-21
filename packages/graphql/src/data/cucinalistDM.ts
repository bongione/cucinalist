import { Recipe, UnitOfMeasure } from "@cucinalist/dsl";
import { ExecutionContext, TypedModel } from "./dmlTypes";
import {
  CookingStep,
  MeasuringFeature,
  Recipe as RecipeRecord,
  RecipeIngredient,
  StepOutputIngredient,
} from "../__generated__/prismaClient";

interface RecipeExecutionContext extends ExecutionContext {
  readonly localResolutions: Map<
    Object,
    | TypedModel<RecipeIngredient, "RecipeIngredient">
    | TypedModel<StepOutputIngredient, "StepOutputIngredient">
  >;
}

function recipeContext(
  executionContext: ExecutionContext,
): RecipeExecutionContext {
  let ctx = executionContext as RecipeExecutionContext;
  // @ts-expect-error Violating the readonly property on purpose
  ctx["localResolutions"] = new Map();
  return ctx;
}

export async function processRecipeStatement(
  recipe: Recipe,
  executionContext: ExecutionContext,
) {
  const existingRecord = await executionContext.resolveSymbol(recipe.id, true);

  const recipeRecord = await (existingRecord.type === "UnresolvedId"
    ? executionContext.prisma.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.name,
          serves: recipe.serves,
          gblId: recipe.id,
        },
      })
    : executionContext.prisma.recipe.update({
        where: { id: existingRecord.id },
        data: {
          name: recipe.name,
          description: recipe.name,
          serves: recipe.serves,
          steps: {
            deleteMany: {},
          },
          ingredients: {
            deleteMany: {},
          },
        },
      }));
  const completedRecord = {
    type: "Recipe" as const,
    ...recipeRecord,
  };
  await executionContext.assignSymbol(recipe.id, completedRecord);
  const rContext = recipeContext(executionContext);
  await processRecipeIngredients(rContext, recipe, recipeRecord);
  await processRecipeSteps(rContext, recipe, recipeRecord);
  return completedRecord;
}

async function findOrCreateStoreBoughtIngredient(
  executionContext: RecipeExecutionContext,
  ingredientId: string,
) {
  let recipeOrStoreBoughtIngredient =
    await executionContext.resolveSymbol(ingredientId);
  if (recipeOrStoreBoughtIngredient.type === "UnresolvedId") {
    const newIngredient =
      await executionContext.prisma.storeBoughtIngredient.create({
        data: {
          gblId: ingredientId,
          name: ingredientId,
        },
      });
    recipeOrStoreBoughtIngredient = {
      type: "StoreBoughtIngredient",
      ...newIngredient,
    };
    await executionContext.assignSymbol(
      ingredientId,
      recipeOrStoreBoughtIngredient,
    );
  } else if (
    recipeOrStoreBoughtIngredient.type !== "StoreBoughtIngredient" &&
    recipeOrStoreBoughtIngredient.type !== "Recipe"
  ) {
    throw new TypeError(
      `The id ${ingredientId} is not a store bought ingredient or recipe`,
    );
  }
  return recipeOrStoreBoughtIngredient;
}

async function findOrCreateUnitOfMeasure(
  executionContext: RecipeExecutionContext,
  unitId: string,
) {
  let unitOfMeasure = await executionContext.resolveSymbol(unitId);
  if (unitOfMeasure.type === "UnresolvedId") {
    const newUnitOfMeasure = await executionContext.prisma.unitOfMeasure.create(
      {
        data: {
          gblId: unitId,
          name: unitId,
          measuring: "unspecified",
        },
      },
    );
    unitOfMeasure = { type: "UnitOfMeasure", ...newUnitOfMeasure };
    await executionContext.assignSymbol(unitId, unitOfMeasure);
  } else if (unitOfMeasure.type !== "UnitOfMeasure") {
    throw new TypeError(`The id ${unitId} is not a unit of measure`);
  }
  return unitOfMeasure;
}

async function findOrCreateCookingTechnique(
  executionContext: RecipeExecutionContext,
  techniqueId: string,
) {
  let technique = await executionContext.resolveSymbol(techniqueId);
  if (technique.type === "UnresolvedId") {
    const newTechnique = await executionContext.prisma.cookingTechnique.create({
      data: {
        gblId: techniqueId,
        name: techniqueId,
        outputFormatString: `${techniqueId}ed {*INGREDIENTS*}`,
      },
    });
    technique = { type: "CookingTechnique", ...newTechnique };
    await executionContext.assignSymbol(techniqueId, technique);
  } else if (technique.type !== "CookingTechnique") {
    throw new TypeError(`The id ${techniqueId} is not a cooking technique`);
  }
  return technique;
}

async function processRecipeIngredients(
  executionContext: RecipeExecutionContext,
  recipe: Recipe,
  recipeRecord: RecipeRecord,
) {
  const recipeIngredientsRecords: RecipeIngredient[] = [];
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ri = recipe.ingredients[i];
    const recipeOrStoreBoughtIngredient =
      await findOrCreateStoreBoughtIngredient(
        executionContext,
        ri.ingredientId,
      );
    let unitOfMeasure = await findOrCreateUnitOfMeasure(
      executionContext,
      ri.amount.unit,
    );

    const riRecord = await executionContext.prisma.recipeIngredient.create({
      data: {
        recipeId: recipeRecord.id,
        storeBoughtIngredientId:
          recipeOrStoreBoughtIngredient.type === "StoreBoughtIngredient"
            ? recipeOrStoreBoughtIngredient.id
            : undefined,
        producedByRecipeId:
          recipeOrStoreBoughtIngredient.type === "Recipe"
            ? recipeOrStoreBoughtIngredient.id
            : undefined,
        amount: ri.amount.value,
        unitOfMeasureId: unitOfMeasure.id,
        nth: i + 1,
      },
    });
    executionContext.localResolutions.set(ri, {
      type: "RecipeIngredient",
      ...riRecord,
    });
    recipeIngredientsRecords.push(riRecord);
  }
  return recipeIngredientsRecords;
}

async function processRecipeSteps(
  executionContext: RecipeExecutionContext,
  recipe: Recipe,
  recipeRecord: RecipeRecord,
) {
  const recipeStepsRecords: CookingStep[] = [];
  for (let i = 0; i < recipe.cookingSteps.length; i++) {
    const step = recipe.cookingSteps[i];
    const techniqueRecord = await findOrCreateCookingTechnique(
      executionContext,
      step.processId,
    );
    const stepRecord = await executionContext.prisma.cookingStep.create({
      data: {
        recipeId: recipeRecord.id,
        activeMinutes: step.activeMinutes,
        keepEyeMinutes: step.keepAnEyeMinutes,
        parallelMinutes: step.inactiveMinutes,
        techniqueId: techniqueRecord.id,
      },
    });

    // process step input ingredients
    for (let j = 0; i < step.ingredients.length; i++) {
      const inputIngredient = step.ingredients[j];
      const outputOrIng =
        executionContext.localResolutions.get(inputIngredient);
      if (!outputOrIng) {
        throw new Error(`Ingredient ${inputIngredient} not found`);
      }
      if (outputOrIng.type === "RecipeIngredient") {
        await executionContext.prisma.stepInputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            nthInput: j,
            recipeIngredientId: outputOrIng.id,
          },
        });
      } else if (outputOrIng.type === "StepOutputIngredient") {
        await executionContext.prisma.stepInputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            nthInput: j,
            outputIngredientId: outputOrIng.id,
          },
        });
      }
    }

    // Process step outputs
    for (let j = 0; i < step.produces.length; i++) {
      const outputIngredient = step.produces[j];

      const outputRecord =
        await executionContext.prisma.stepOutputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            nthOutput: j,
            name: outputIngredient.outputId,
          },
        });
      executionContext.localResolutions.set(outputIngredient, {
        type: "StepOutputIngredient",
        ...outputRecord,
      });
    }

    // Process step preconditions
    for (let j = 0; j < step.preconditions.length; j++) {
      const precondition = step.preconditions[j];
      await executionContext.prisma.stepPrecondition.create({
        data: {
          cookingStepId: stepRecord.id,
          nthPrecondition: j + 1,
          description: precondition.conditionDescription,
        },
      });
      for (let k = 0; k < precondition.ingredientsNeeded.length; k++) {
        const ingredientNeeded = precondition.ingredientsNeeded[k];
        const ingredientRecord =
          executionContext.localResolutions.get(ingredientNeeded);
        if (!ingredientRecord) {
          throw new Error(`Ingredient ${ingredientNeeded} not found`);
        }
        if (ingredientRecord.type === "RecipeIngredient") {
          await executionContext.prisma.stepPreconditionInputIngredient.create({
            data: {
              stepPreconditionId: stepRecord.id,
              recipeIngredientId: ingredientRecord.id,
            },
          });
        } else if (ingredientRecord.type === "StepOutputIngredient") {
          await executionContext.prisma.stepPreconditionInputIngredient.create({
            data: {
              stepPreconditionId: stepRecord.id,
              stepOutputIngredientId: ingredientRecord.id,
            },
          });
        }
      }

      recipeStepsRecords.push(stepRecord);
    }
  }
  return recipeStepsRecords;
}


export async function processCreateUnitOfMeasureStatement(
  statement: UnitOfMeasure,
  executionContext: ExecutionContext,
) {
  const existingUnit = await executionContext.resolveSymbol(statement.id, true);
  if (
    existingUnit.type !== "UnresolvedId" &&
    existingUnit.type !== "UnitOfMeasure"
  ) {
    throw new Error(
      `Symbol ${statement.id} already exists and is not a UnitOfMeasure`,
    );
  }

  const unitRecord = await (existingUnit.type === "UnresolvedId"
    ? executionContext.prisma.unitOfMeasure.create({
        data: {
          gblId: statement.id,
          name: statement.name,
          measuring:
            Object.values(MeasuringFeature).findIndex(
              (f) => statement.measuring === f,
            ) === -1
              ? MeasuringFeature.unspecified
              : (statement.measuring as MeasuringFeature),
        },
      })
    : executionContext.prisma.unitOfMeasure.update({
        where: { id: statement.id },
        data: {
          name: statement.name,
          measuring: Object.values(MeasuringFeature).findIndex(
            (f) => statement.measuring === f,
          ) === -1
            ? MeasuringFeature.unspecified
            : (statement.measuring as MeasuringFeature),
        },
      }));
  const fullRecord = { type: "UnitOfMeasure" as const, ...unitRecord };
  await executionContext.assignSymbol(statement.id, fullRecord);
  return fullRecord;
}
