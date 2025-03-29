import type { PrismaClient } from "./dao/extendedPrisma";
import {
  CreateContext,
  parseCucinalistDsl,
  SwitchToContext,
} from "@cucinalist/dsl";
import { createAndInitExecutionContextManager } from "./executionContext";
import {AssignableModels, CucinalistDMLInterpreter, ExecutionContextManager} from './dmlTypes'
import {
  processBoughtIngredientStatement, processCreateMealStatement,
  processCreateUnitOfMeasureStatement,
  processRecipeStatement
} from './cucinalistDM'
import { prisma  as prismaClient} from "./dao/extendedPrisma";
import {createPrismaProvider} from './dao/PrismaProvider'

let interpreter: CucinalistDMLInterpreter | null = null;

export async function getCucinalistDMLInterpreter() {
  const prismaProvider = createPrismaProvider(prismaClient);
  const executionContext = await createAndInitExecutionContextManager(prismaProvider);
  interpreter = {
    executionContext,
    executeDML: async (dmlStr: string) => {
      const statements = parseCucinalistDsl(dmlStr);
      const newOrUpdatedEntities: AssignableModels[keyof AssignableModels][] = [];

      await prismaProvider.tx(async () => {
        for (const statement of statements) {
          if (statement.type === "CreateContext") {
            await processCreateContextStatement(statement, executionContext);
          } else if (statement.type === "IncludeStatement") {
            throw new Error("Include statements are not supported in this context");
          } else if (statement.type === "SwitchToContext") {
            await executionContext.switchToContext(statement.id)
          } else if (statement.type === "Recipe") {
            const recipe = await processRecipeStatement(
              statement,
              executionContext,
            );
            newOrUpdatedEntities.push(recipe);
          } else if (statement.type === 'UnitOfMeasure') {
            const uom = await processCreateUnitOfMeasureStatement(
              statement,
              executionContext,
            );
            newOrUpdatedEntities.push(uom);
          } else if (statement.type === 'BoughtIngredient') {
            const ingredient = await processBoughtIngredientStatement(statement, executionContext);
            newOrUpdatedEntities.push(ingredient);
          } else if (statement.type === 'SingleCourseMeal' || statement.type === 'MultiCourseMeal') {
            const meal = await processCreateMealStatement(statement, executionContext);
            newOrUpdatedEntities.push(meal);
          } else {
            throw new Error(`Unknown statement type`);
          }
        }
      });
      return newOrUpdatedEntities;
    },
  };
  return interpreter;
}

/**
 * Processes a create context statement.
 *
 * A context is created given a parent and a new id name.
 * If a context with the same id already exists, an error is raised.
 *
 * If the context is created, we also switch to the that context
 */
async function processCreateContextStatement(
  statement: CreateContext,
  executionContext: ExecutionContextManager,
) {
  const parentCtxName = statement.parentContext || 'public';
  const parentContext = await executionContext.prisma().context.findUnique(
    {where: {id: parentCtxName}}
  );
  const newContext = await executionContext.createCucinalistContext(
    statement.id,
    parentContext.id,
  );
  if (statement.switchToContext) {
    await executionContext.switchToContext(statement.id);
  }
  return newContext;
}
