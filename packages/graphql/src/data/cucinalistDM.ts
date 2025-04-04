import dsl, { BoughtIngredient, Recipe, UnitOfMeasure } from "@cucinalist/dsl";
import { CucinalistModels, ExecutionContext } from "./dmlTypes";
import {
  CookingStep, MealCourse,
  MeasuringFeature,
  Recipe as RecipeRecord,
  RecipeIngredient
} from '../__generated__/prismaClient'

interface RecipeExecutionContext extends ExecutionContext {
  readonly localResolutions: Map<
    Object,
    | CucinalistModels["RecipeIngredient"]
    | CucinalistModels["StepOutputIngredient"]
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
  const existingRecord = await executionContext.localResolveSymbol(recipe.id, [
    "Recipe",
  ]);

  const recipeRecord = await (existingRecord === null
    ? executionContext.prisma().recipe.create({
        data: {
          name: recipe.name,
          description: recipe.name,
          serves: recipe.serves || 1,
          gblId: recipe.id,
        },
      })
    : executionContext.prisma().recipe.update({
        where: { id: existingRecord.id },
        data: {
          name: recipe.name,
          description: recipe.name,
          serves: recipe.serves || 1,
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
  await executionContext.assignSymbol(
    recipe.id,
    completedRecord.type,
    completedRecord.id,
  );
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
    const newIngredient = await executionContext
      .prisma()
      .storeBoughtIngredient.create({
        data: {
          gblId: ingredientId,
          name: ingredientId,
          measuredAs: "unspecified",
        },
      });
    recipeOrStoreBoughtIngredient = {
      type: "StoreBoughtIngredient",
      ...newIngredient,
    };
    await executionContext.assignSymbol(
      ingredientId,
      recipeOrStoreBoughtIngredient.type,
      recipeOrStoreBoughtIngredient.id,
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
    unitOfMeasure = await executionContext.prisma().unitOfMeasure.create({
      data: {
        gblId: unitId,
        name: unitId,
        measuring: "unspecified",
      },
    });
    await executionContext.assignSymbol(
      unitId,
      unitOfMeasure.type,
      unitOfMeasure.id,
    );
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
    technique = await executionContext.prisma().cookingTechnique.create({
      data: {
        gblId: techniqueId,
        name: techniqueId,
        outputFormatString: `${techniqueId}ed {*INGREDIENTS*}`,
      },
    });
    await executionContext.assignSymbol(
      techniqueId,
      technique.type,
      technique.id,
    );
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

    const riRecord = await executionContext.prisma().recipeIngredient.create({
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
        sequence: i + 1,
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
    const stepRecord = await executionContext.prisma().cookingStep.create({
      data: {
        recipeId: recipeRecord.id,
        activeMinutes: step.activeMinutes,
        keepEyeMinutes: step.keepAnEyeMinutes,
        parallelMinutes: step.inactiveMinutes,
        techniqueId: techniqueRecord.id,
        sequence: i + 1,
      },
    });

    // process step input ingredients
    for (let j = 0; j < step.ingredients.length; j++) {
      const inputIngredient = step.ingredients[j];
      const outputOrIng =
        executionContext.localResolutions.get(inputIngredient);
      if (!outputOrIng) {
        throw new Error(`Ingredient ${inputIngredient} not found`);
      }
      if (outputOrIng.type === "RecipeIngredient") {
        await executionContext.prisma().stepInputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            sequence: j,
            recipeIngredientId: outputOrIng.id,
          },
        });
      } else if (outputOrIng.type === "StepOutputIngredient") {
        await executionContext.prisma().stepInputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            sequence: j,
            outputIngredientId: outputOrIng.id,
          },
        });
      }
    }

    // Process step outputs
    for (let j = 0; j < step.produces.length; j++) {
      const outputIngredient = step.produces[j];

      const outputRecord = await executionContext
        .prisma()
        .stepOutputIngredient.create({
          data: {
            cookingStepId: stepRecord.id,
            sequence: j,
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
      const preconditionRecord = await executionContext
        .prisma()
        .stepPrecondition.create({
          data: {
            cookingStepId: stepRecord.id,
            sequence: j + 1,
            description: precondition.conditionDescription || "",
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
          await executionContext.prisma().stepPreconditionIngredient.create({
            data: {
              stepPreconditionId: preconditionRecord.id,
              recipeIngredientId: ingredientRecord.id,
              sequence: k + 1,
            },
          });
        } else if (ingredientRecord.type === "StepOutputIngredient") {
          await executionContext.prisma().stepPreconditionIngredient.create({
            data: {
              stepPreconditionId: preconditionRecord.id,
              outputIngredientId: ingredientRecord.id,
              sequence: k + 1,
            },
          });
        } else {
          throw new Error("Unexpected ingredient type");
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
  const existingUnit = await executionContext.localResolveSymbol(statement.id, [
    "UnitOfMeasure",
  ]);
  if (existingUnit !== null && existingUnit.type !== "UnitOfMeasure") {
    throw new Error(
      `Symbol ${statement.id} already exists and is not a UnitOfMeasure`,
    );
  }

  const p =
    existingUnit === null
      ? executionContext.prisma().unitOfMeasure.create({
          data: {
            gblId: statement.id,
            name: statement.name,
            defaultSymbol: statement.defaultSymbol,
            plural: statement.symbolPlural ? statement.symbolPlural : undefined,
            measuring:
              Object.values(MeasuringFeature).findIndex(
                (f) => statement.measuring === f,
              ) === -1
                ? MeasuringFeature.unspecified
                : (statement.measuring as MeasuringFeature),
          },
        })
      : executionContext.prisma().unitOfMeasure.update({
          where: { id: existingUnit.id },
          data: {
            name: statement.name,
            defaultSymbol: statement.defaultSymbol
              ? statement.defaultSymbol
              : statement.name,
            plural: statement.symbolPlural ? statement.symbolPlural : null,
            synonyms: {
              deleteMany: {},
            },
            measuring:
              Object.values(MeasuringFeature).findIndex(
                (f) => statement.measuring === f,
              ) === -1
                ? MeasuringFeature.unspecified
                : (statement.measuring as MeasuringFeature),
          },
        });

  const unitRecord = await p;
  for (const label of statement.aka ? statement.aka : []) {
    await executionContext.prisma().unitOfMeasureAcceptedLabel.create({
      data: {
        unitOfMeasureId: unitRecord.id,
        label,
      },
    });
  }
  await executionContext.assignSymbol(
    statement.id,
    unitRecord.type,
    unitRecord.id,
  );
  return unitRecord;
}

export async function processBoughtIngredientStatement(
  ingredient: BoughtIngredient,
  executionContext: ExecutionContext,
) {
  const existingIngredient = await executionContext.localResolveSymbol(
    ingredient.id,
    ["StoreBoughtIngredient"],
  );
  const p =
    existingIngredient === null
      ? executionContext.prisma().storeBoughtIngredient.create({
          data: {
            gblId: ingredient.id,
            name: ingredient.name,
            measuredAs: ingredient.measuredAs,
            plural: ingredient.plural,
          },
        })
      : executionContext.prisma().storeBoughtIngredient.update({
          where: { id: existingIngredient.id },
          data: {
            name: ingredient.name,
            measuredAs: ingredient.measuredAs,
            plural: ingredient.plural,
            aka: {
              deleteMany: {},
            },
          },
        });
  const upsertedRecord = {
    ...(await p),
    type: "StoreBoughtIngredient" as const,
  };
  await executionContext.assignSymbol(
    ingredient.id,
    upsertedRecord.type,
    upsertedRecord.id,
  );
  for (const aka of ingredient.aka ? ingredient.aka : []) {
    await executionContext.prisma().storeBoughtIngredientSynonym.create({
      data: {
        storeBoughtIngredientId: upsertedRecord.id,
        synonym: aka,
      },
    });
  }
  return upsertedRecord;
}

export async function processCreateMealStatement(
  meal: dsl.SingleCourseMeal | dsl.MultiCourseMeal,
  executionContext: ExecutionContext,
) {
  let existingMeal: null | CucinalistModels["Meal"] = null;
  if (meal.id) {
    existingMeal = await executionContext.localResolveSymbol(meal.id, ["Meal"]);
    if (existingMeal !== null && existingMeal.type !== "Meal") {
      throw new Error(`Symbol ${meal.id} already exists and is not a Meal`);
    }
  }
  if (existingMeal !== null) {
    await executionContext.prisma().courseRecipe.deleteMany({
      where: {
        course: {
          mealId: existingMeal.id,
        },
      }
    });
    await executionContext.prisma().mealCourse.deleteMany({
      where: {
        mealId: existingMeal.id,
      }
    });
  }
  const p =
    existingMeal === null
      ? executionContext.prisma().meal.create({
          data: {
            gblId: meal.id,
            name: meal.name,
            description: meal.name,
            nDiners: meal.diners
          },
        })
      : executionContext.prisma().meal.update({
          where: { id: existingMeal.id },
          data: {
            gblId: meal.id || null,
            name: meal.name || null,
            description: meal.name || null,
            nDiners: meal.diners,
            courses: {
              deleteMany: {},
            },
          },
        });
  const mealRecord = await p;
  if (mealRecord.gblId) {
    await executionContext.assignSymbol(mealRecord.gblId, mealRecord.type, mealRecord.id);
  }
  const courses: dsl.MealCourse[] = meal.type === "SingleCourseMeal" ? [{
    type: 'MealCourse',
    recipesIds: meal.recipesIds,
    name: undefined,
  }] : meal.courses;

  for ( let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const courseRecord = await executionContext.prisma().mealCourse.create({
        data: {
          mealId: mealRecord.id,
          name: course.name,
          sequence: i + 1
        },
      });
      for (let j = 0; j < course.recipesIds.length; j++) {
        const recipeId = course.recipesIds[j];
        const recipe = await executionContext.localResolveSymbol(recipeId, ["Recipe"]);
        if (recipe === null) {
          throw new Error(`Recipe ${recipeId} not found`);
        }
        if (recipe.type !== "Recipe") {
          throw new TypeError(`The id ${recipeId} is not a Recipe`);
        }
        await executionContext.prisma().courseRecipe.create({
          data: {
            courseId: courseRecord.id,
            recipeId: recipe.id,
            sequence: j + 1
          },
        });
    }
  }
  return mealRecord;
}
