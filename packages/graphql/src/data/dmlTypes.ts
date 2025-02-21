import {
  Context,
  CookingTechnique, PrismaClient,
  Recipe,
  StoreBoughtIngredient,
  UnitOfMeasure
} from '../__generated__/prismaClient'
import * as runtime from '../__generated__/prismaClient/runtime/library'

export type TypedModel<M, T> = M & { type: T };

export type PrismaInTx = Omit<PrismaClient, runtime.ITXClientDenyList>;

export interface CucinalistNamedDBModels {
  Context: TypedModel<Context, "Context">;
  Recipe: TypedModel<Recipe, "Recipe">;
  StoreBoughtIngredient: TypedModel<
    StoreBoughtIngredient,
    "StoreBoughtIngredient"
  >;
  CookingTechnique: TypedModel<CookingTechnique, "CookingTechnique">;
  UnitOfMeasure: TypedModel<UnitOfMeasure, "UnitOfMeasure">;
}

export type CucinalistNamedDBModel =
  CucinalistNamedDBModels[keyof CucinalistNamedDBModels];

export interface UnresolvedId {
  type: "UnresolvedId";
  id: string;
}

export interface ExecutionContext {
  readonly prisma: PrismaInTx;
  readonly contextId: string;
  readonly parentContext: ExecutionContext | null;

  resolveSymbol: (id: string, restrictToLocalCtx?: boolean) => Promise<UnresolvedId | CucinalistNamedDBModel>;

  /** Assigns a symbol to the context, provided there isn't one already assigned in this context,
   * and that an ancestor context doesn't contain an assignment to a different type of model */
  assignSymbol: (
    id: string,
    model: CucinalistNamedDBModel,
  ) => Promise<CucinalistNamedDBModel>;
}

export interface ExecutionContextManager extends ExecutionContext {
  readonly currentContext: ExecutionContext;

  createCucinalistContext(
    id: string,
    parentId: string,
    switchToContext?: boolean,
  ): Promise<ExecutionContext>;

  switchToContext(id: string): Promise<ExecutionContext>;
}
