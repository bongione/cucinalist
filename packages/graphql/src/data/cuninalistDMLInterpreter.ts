import { PrismaClient } from "../__generated__/prismaClient";
import {
  CreateContext,
  parseCucinalistDsl,
  SwitchToContext,
} from "@cucinalist/dsl";
import { createAndInitExecutionContextManager } from "./executionContext";
import { CucinalistNamedDBModel, ExecutionContextManager } from "./dmlTypes";
import {processCreateUnitOfMeasureStatement, processRecipeStatement} from './cucinalistDM'

export async function executeDML(prismaClient: PrismaClient, dmlStr: string) {
  const statements = parseCucinalistDsl(dmlStr);
  const newOrUpdatedEntities: CucinalistNamedDBModel[] = [];

  await prismaClient.$transaction(async (prisma) => {
    const executionContext = await createAndInitExecutionContextManager(prisma);
    for (const statement of statements) {
      if (statement.type === "CreateContext") {
        await processCreateContextStatement(statement, executionContext);
      } else if (statement.type === "IncludeStatement") {
        throw new Error("Include statements are not supported in this context");
      } else if (statement.type === "SwitchToContext") {
        await processSwitchToContextStatement(statement, executionContext);
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
      } else if (statement.type === 'SingleCourseMeal' || statement.type === 'MultiCourseMeal') {
        // Skip for now, no op, semantics to be decided
      } else {
        throw new Error(`Unknown statement type`);
      }
    }
  });
  return newOrUpdatedEntities;
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
  const parentContext = await executionContext.resolveSymbol(
    statement.parentContext,
  );
  if (parentContext.type === "UnresolvedId") {
    throw new Error(`Parent context ${statement.parentContext} not found`);
  }
  const newContext = await executionContext.createCucinalistContext(
    statement.id,
    statement.parentContext,
  );
  if (statement.switchToContext) {
    await executionContext.switchToContext(statement.id);
  }
  return newContext;
}

async function processSwitchToContextStatement(
  statement: SwitchToContext,
  executionContext: ExecutionContextManager,
) {
  return executionContext.switchToContext(statement.id);
}
