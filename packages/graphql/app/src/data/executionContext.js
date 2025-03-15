export async function createAndInitExecutionContextManager(prisma) {
    const cm = new ContextManager(prisma);
    await cm.initialize();
    return cm;
}
function createSymbolsContext(prisma, contextName, parentContext) {
    return new SymbolTableContext(prisma, contextName, parentContext);
}
class SymbolTableContext {
    constructor(prisma, contextName, parentContext) {
        this.contextName = contextName;
        this.parentCtx = parentContext;
        this._prisma = prisma;
    }
    get contextId() {
        return this.contextName;
    }
    get parentContext() {
        return this.parentCtx;
    }
    get prisma() {
        return this._prisma;
    }
    async resolveLocalSymbolName(id) {
        let r = await this.prisma.namedEntity.findUnique({
            where: {
                contextId_id: { contextId: this.contextName, id },
            },
        });
        return r || null;
    }
    async resolveAncestorSymbol(id) {
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
        }
        else {
            if (this.parentCtx) {
                return this.parentCtx.resolveSymbol(id);
            }
            else {
                return {
                    type: "UnresolvedId",
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
        if (localNamedEntity &&
            localNamedEntity.recordId === recordId &&
            localNamedEntity.recordType === recordType) {
            return id;
        }
        if (localNamedEntity &&
            (localNamedEntity.recordType !== recordType ||
                localNamedEntity.recordId !== recordId)) {
            throw new Error(`Cannot reassign id ${id} in the same context with different information`);
        }
        const parentModel = await this.resolveAncestorSymbol(id);
        if (parentModel && parentModel.type !== recordType) {
            throw new Error(`Cannot assign id "${id}" with different type from an ancestor context`);
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
class ContextManager {
    constructor(prisma) {
        this.initialised = false;
        this.contextsMap = new Map();
        this.currentContextId = "";
        this._prisma = prisma;
    }
    async initialize() {
        const baseContexts = await Promise.all([
            this.prisma.context.findUnique({
                where: { id: "root" },
            }),
            this.prisma.context.findUnique({
                where: { id: "public" },
            }),
        ]);
        if (baseContexts.some((c) => !c)) {
            throw new Error("Root and public contexts must be created before executing DML");
        }
        this.contextsMap.set("root", {
            contextRecord: baseContexts[0],
            executionContext: createSymbolsContext(this.prisma, "root", null),
        });
        this.contextsMap.set("public", {
            contextRecord: baseContexts[1],
            executionContext: createSymbolsContext(this.prisma, "public", this.contextsMap.get("root").executionContext),
        });
        this.currentContextId = "public";
        this.initialised = true;
    }
    get contextId() {
        return this.currentContextId;
    }
    get currentContext() {
        return this.contextsMap.get(this.currentContextId).executionContext;
    }
    get parentContext() {
        return this.currentContext.parentContext;
    }
    get prisma() {
        return this._prisma;
    }
    async assignSymbol(id, recordType, recordId) {
        return this.currentContext.assignSymbol(id, recordType, recordId);
    }
    async resolveSymbol(id, expectedTypes = []) {
        return this.currentContext.resolveSymbol(id, expectedTypes);
    }
    async localResolveSymbol(id, expectedTypes = []) {
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
    async createCucinalistContext(id, parentId, switchToContext = false) {
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
            executionContext: createSymbolsContext(this.prisma, id, parentContext.executionContext),
        });
        if (switchToContext) {
            this.currentContextId = id;
        }
        return this;
    }
    async switchToContext(id) {
        if (!this.initialised) {
            throw new Error("Context manager not initialised");
        }
        const context = this.contextsMap.get(id);
        if (!context) {
            throw new Error(`Context ${id} not found`);
        }
        this.currentContextId = id;
        return this.currentContext;
    }
    async getAndPopulateAncestors(id, i = 0) {
        if (i > 1000) {
            throw new Error("Too many ancestors");
        }
        const context = await this.prisma.context.findUnique({
            where: { id },
        });
        if (!context) {
            throw new Error(`Context ${id} not found`);
        }
        const parentContext = await this.getAndPopulateAncestors(context.parentContextId, i + 1);
        this.contextsMap.set(id, {
            contextRecord: context,
            executionContext: createSymbolsContext(this.prisma, id, parentContext.executionContext),
        });
        return this.contextsMap.get(id);
    }
}
