import { Context } from "../__generated__/prismaClient";
import {
  AssignableModels,
  ExecutionContext,
  ExecutionContextManager,
  PrismaInTx,
} from "./dmlTypes";

export async function createAndInitExecutionContextManager(prisma: PrismaInTx) {
  const cm = new ContextManager(prisma);
  await cm.initialize();
  return cm as ExecutionContextManager;
}

function createSymbolsContext(
  prisma: PrismaInTx,
  contextName: string,
  parentContext: ExecutionContext | null
): ExecutionContext {
  return new SymbolTableContext(prisma, contextName, parentContext);
}

class SymbolTableContext implements ExecutionContext {
  private parentCtx: ExecutionContext | null;
  private contextName: string;
  private _prisma: PrismaInTx;

  constructor(
    prisma: PrismaInTx,
    contextName: string,
    parentContext: ExecutionContext | null
  ) {
    this.contextName = contextName;
    this.parentCtx = parentContext;
    this._prisma = prisma;
  }

  public get contextId() {
    return this.contextName;
  }

  public get parentContext() {
    return this.parentCtx;
  }

  public get prisma() {
    return this._prisma;
  }

  private async resolveLocalSymbolName(id: string) {
    let r = await this.prisma.namedEntity.findUnique({
      where: {
        contextId_id: { contextId: this.contextName, id },
      },
    });
    return r || null;
  }

  private async resolveAncestorSymbol(id: string) {
    if (this.parentCtx) {
      const parentModel = await this.parentCtx.resolveSymbol(id);
      return parentModel.type === "UnresolvedId" ? null : parentModel;
    }
    return null;
  }

  async resolveSymbol(id, expectedTypes) {
    let r = await this.localResolveSymbol(id, expectedTypes);
    if (r) {
      return r;
    } else {
      if (this.parentCtx) {
        return this.parentCtx.resolveSymbol(id);
      } else {
        return {
          type: "UnresolvedId" as const,
          id,
        };
      }
    }
  }

  async localResolveSymbol(id, expectedTypes) {
    let r = await this.prisma.namedEntity.findUnique({
      where: {
        contextId_id: { contextId: this.contextName, id },
      },
    });
    if (r) {
      return this.prisma[r.recordType].findUnique({
        where: { id: r.recordId },
      });
    }
    return null;
  }

  async assignSymbol(id, recordType, recordId) {
    if (recordType === "Context") {
      throw new Error("Cannot assign a context as a symbol");
    }
    const localNamedEntity = await this.resolveLocalSymbolName(id);
    if (
      localNamedEntity &&
      localNamedEntity.recordId === recordId &&
      localNamedEntity.recordType === recordType
    ) {
      return id;
    }
    if (
      localNamedEntity &&
      (localNamedEntity.recordType !== recordType ||
        localNamedEntity.recordId !== recordId)
    ) {
      throw new Error(
        `Cannot reassign id ${id} in the same context with different information`
      );
    }
    const parentModel = await this.resolveAncestorSymbol(id);
    if (parentModel && parentModel.type !== recordType) {
      throw new Error(
        `Cannot assign id "${id}" with different type from an ancestor context`
      );
    }
    await this.prisma.namedEntity.create({
      data: {
        contextId: this.contextName,
        id,
        recordType,
        recordId,
      },
    });
    return id;
  }

  async localUnassignSymbol(id) {
    await this.prisma.namedEntity.delete({
      where: {
        contextId_id: { contextId: this.contextName, id },
      },
    });
  }
}

class ContextManager implements ExecutionContextManager {
  private _prisma: PrismaInTx;
  private initialised = false;
  private contextsMap = new Map<
    string,
    {
      contextRecord: Context;
      executionContext: ExecutionContext;
    }
  >();
  private currentContextId: string = "";

  constructor(prisma: PrismaInTx) {
    this._prisma = prisma;
  }

  public async initialize() {
    const baseContexts = await Promise.all([
      this.prisma.context.findUnique({
        where: { id: "root" },
      }),
      this.prisma.context.findUnique({
        where: { id: "public" },
      }),
    ]);
    if (baseContexts.some((c) => !c)) {
      throw new Error(
        "Root and public contexts must be created before executing DML"
      );
    }
    this.contextsMap.set("root", {
      contextRecord: baseContexts[0]!,
      executionContext: createSymbolsContext(this.prisma, "root", null),
    });
    this.contextsMap.set("public", {
      contextRecord: baseContexts[1]!,
      executionContext: createSymbolsContext(
        this.prisma,
        "public",
        this.contextsMap.get("root")!.executionContext
      ),
    });
    this.currentContextId = "public";
    this.initialised = true;
  }

  public get contextId() {
    return this.currentContextId;
  }

  public get currentContext() {
    return this.contextsMap.get(this.currentContextId)!.executionContext;
  }

  public get parentContext() {
    return this.currentContext.parentContext;
  }

  public get prisma() {
    return this._prisma;
  }

  async assignSymbol(id, recordType, recordId) {
    return this.currentContext.assignSymbol(id, recordType, recordId);
  }

  async resolveSymbol<K extends keyof AssignableModels>(id: string, expectedTypes: K[] = []) {
    return this.currentContext.resolveSymbol(id, expectedTypes);
  }

  async localResolveSymbol<K extends keyof AssignableModels>(id: string, expectedTypes: K[] = []) {
    return this.currentContext.localResolveSymbol(id, expectedTypes);
  }

  async localUnassignSymbol(id) {
    return this.currentContext.localUnassignSymbol(id);
  }

  /**
   * Creates a new context, and optionally switches to it. If the ancestors context aren't loaded yet,
   * it first loads them and then adds the new one.
   * @param id
   * @param parentId
   * @param switchToContext
   */
  public async createCucinalistContext(
    id: string,
    parentId: string,
    switchToContext = false
  ) {
    if (!this.initialised) {
      throw new Error("Context manager not initialised");
    }
    const parentContext = await this.getAndPopulateAncestors(parentId);
    if (!parentContext) {
      throw new Error(`Parent context ${parentId} not found`);
    }
    const newContext = await this.prisma.context.findUnique({
      where: { id },
    });
    if (newContext) {
      throw new Error(`Context ${id} already exists`);
    }
    this.contextsMap.set(id, {
      contextRecord: newContext,
      executionContext: createSymbolsContext(
        this.prisma,
        id,
        parentContext.executionContext
      ),
    });
    if (switchToContext) {
      this.currentContextId = id;
    }
    return this as ExecutionContext;
  }

  public async switchToContext(id: string) {
    if (!this.initialised) {
      throw new Error("Context manager not initialised");
    }
    const context = this.contextsMap.get(id);
    if (!context) {
      throw new Error(`Context ${id} not found`);
    }
    this.currentContextId = id;
    return this.currentContext as ExecutionContext;
  }

  private async getAndPopulateAncestors(id: string, i = 0) {
    if (i > 1000) {
      throw new Error("Too many ancestors");
    }
    const context = await this.prisma.context.findUnique({
      where: { id },
    });
    if (!context) {
      throw new Error(`Context ${id} not found`);
    }
    const parentContext = await this.getAndPopulateAncestors(
      context.parentContextId,
      i + 1
    );
    this.contextsMap.set(id, {
      contextRecord: context,
      executionContext: createSymbolsContext(
        this.prisma,
        id,
        parentContext.executionContext
      ),
    });
    return this.contextsMap.get(id)!;
  }
}
