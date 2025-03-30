import * as runtime from "../__generated__/prismaClient/runtime/library";
import { prisma } from "./dao/extendedPrisma";

type Prisma = typeof prisma;
export type PrismaInTx = Omit<typeof prisma, runtime.ITXClientDenyList>;

export interface PrismaProvider {
  prisma: () => PrismaInTx;
}

export interface PrismaTxProvider extends PrismaProvider {
  tx: <RT>(cb: (prisma: PrismaInTx) => Promise<RT>) => Promise<RT>;
}

export type CucinalistModels = {
  Context: Awaited<ReturnType<Prisma["context"]["findUnique"]>>;
  NamedEntity: Awaited<ReturnType<Prisma["namedEntity"]["findUnique"]>>;
  Recipe: Awaited<ReturnType<Prisma["recipe"]["findUnique"]>>;
  StoreBoughtIngredient: Awaited<
    ReturnType<Prisma["storeBoughtIngredient"]["findUnique"]>
  >;
  RecipeIngredient: Awaited<
    ReturnType<Prisma["recipeIngredient"]["findUnique"]>
  >;
  StepOutputIngredient: Awaited<
    ReturnType<Prisma["stepOutputIngredient"]["findUnique"]>
  >;
  CookingTechnique: Awaited<
    ReturnType<Prisma["cookingTechnique"]["findUnique"]>
  >;
  CookingStep: Awaited<ReturnType<Prisma["cookingStep"]["findUnique"]>>;
  UnitOfMeasure: Awaited<ReturnType<Prisma["unitOfMeasure"]["findUnique"]>>;
  UnitOfMeasureAcceptedLabel: Awaited<
    ReturnType<Prisma["unitOfMeasureAcceptedLabel"]["findUnique"]>
  >;
  StepInputIngredient: Awaited<
    ReturnType<Prisma["stepInputIngredient"]["findUnique"]>
  >;
  StepPrecondition: Awaited<
    ReturnType<Prisma["stepPrecondition"]["findUnique"]>
  >;
  StepPreconditionnIgredient: Awaited<
    ReturnType<Prisma["stepPreconditionIngredient"]["findUnique"]>
  >;
  Meal: Awaited<ReturnType<Prisma["meal"]["findUnique"]>>;
  MealCourse: Awaited<ReturnType<Prisma["mealCourse"]["findUnique"]>>;
  CourseRecipe: Awaited<ReturnType<Prisma["courseRecipe"]["findUnique"]>>;
};

type CucinalistModelName = keyof CucinalistModels;

export type AssignableModels = Pick<
  CucinalistModels,
  "Recipe" | "StoreBoughtIngredient" | "UnitOfMeasure" | "CookingTechnique" | 'Meal'
>;

export interface UnresolvedId {
  type: "UnresolvedId";
  id: string;
}

export interface ExecutionContext extends PrismaProvider {
  readonly contextId: string;
  readonly parentContext: ExecutionContext | null;

  resolveSymbol: <K extends keyof AssignableModels>(
    id: string,
    expectedTypes?: K[]
  ) => Promise<UnresolvedId | AssignableModels[K]>;

  localResolveSymbol: <K extends keyof AssignableModels>(
    id: string,
    expectedTypes?: K[]
  ) => Promise<null | AssignableModels[K]>;

  /** Assigns a symbol to the context, provided there isn't one already assigned in this context,
   * and that an ancestor context doesn't contain an assignment to a different type of model */
  assignSymbol: <M extends keyof AssignableModels>(
    id: string,
    recordType: M,
    recordId: string
  ) => Promise<string>;

  /** Removes an assignment of this context from the namedEntities, if it exists */
  localUnassignSymbol: (id: string) => Promise<void>;
}

export interface ExecutionContextManager extends ExecutionContext {
  readonly currentContext: ExecutionContext;

  createCucinalistContext(
    id: string,
    parentId: string,
    switchToContext?: boolean
  ): Promise<ExecutionContext>;

  switchToContext(id: string): Promise<ExecutionContext>;
}


/**
 * The interpreter understands the DSL and executes it against the database, returning the database
 * models, rather than the semantic models.
 *
 * A separate layer ought to populate the semantic models from the database models.
 *
 */
export interface CucinalistDMLInterpreter {
  /**
   * The execution context tracks what context we are in, and what symbols are assigned to it.
   */
  readonly executionContext: ExecutionContextManager;

  /**
   * Executes the DML statements against the database. All statements are executed in a transaction.
   * We collate all the entities that are created or updated, and return them.
   * The same object may appear multiple times in the result, if it was updated multiple times.
   *
   * @param dslStatements the update dsl statements to execute
   */
  executeDML: (dslStatements: string) => Promise<Array<CucinalistModels[keyof CucinalistModels]>>;

  /**
   * Execute a query dsl statement against the database. The result is an array with the same length
   * as the number of select statements.
   * Each element of this array contains an array with the results of the select statement.
   *
   * @param dslStatements The query dsl statements to execute
   */
  executeDQL: (dslStatements: string) => Promise<Array<Array<CucinalistModels[keyof CucinalistModels]>>>;
}
