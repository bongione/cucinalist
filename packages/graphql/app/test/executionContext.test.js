import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { MeasuringFeature } from "../src/__generated__/prismaClient";
import { resetTestDB } from "../src/__generated__/prismaClient/sql";
import { createAndInitExecutionContextManager } from "../src/data/executionContext";
import { prisma } from "../src/data/dao/extendedPrisma";
beforeAll(async () => {
    await prisma.$queryRawTyped(resetTestDB());
});
beforeEach(async () => {
    await prisma.namedEntity.deleteMany();
    await prisma.unitOfMeasure.deleteMany();
});
describe("With empty name table", () => {
    it("Return unresolved symbol", async () => {
        const ctx = await createAndInitExecutionContextManager(prisma);
        const symbol = await ctx.resolveSymbol("test");
        expect(symbol.type).toBe("UnresolvedId");
    });
    it("Assign symbol", async () => {
        const ctx = await createAndInitExecutionContextManager(prisma);
        const model = await prisma.unitOfMeasure.create({
            data: {
                name: "test",
                gblId: "test",
                measuring: MeasuringFeature.weight,
            },
        });
        const result = await ctx.assignSymbol("testUnit", model.type, model.id);
        const retrieved = await ctx.resolveSymbol("testUnit");
        expect(result).toBe("testUnit");
        expect(retrieved).toMatchObject({
            name: "test",
            gblId: "test",
            measuring: MeasuringFeature.weight,
        });
    });
    it("Reassign symbol on same context should be ok with same id", async () => {
        const ctx = await createAndInitExecutionContextManager(prisma);
        const model = await prisma.unitOfMeasure.create({
            data: {
                name: "test",
                gblId: "test",
                measuring: MeasuringFeature.weight,
            },
        });
        await ctx.assignSymbol("test", model.type, model.id);
        const model2 = await prisma.unitOfMeasure.update({
            where: { id: model.id },
            data: {
                name: "test2",
            },
        });
        const result2 = await ctx.assignSymbol("test", model2.type, model2.id);
        expect(result2).toBe("test");
        const retrieved = await ctx.resolveSymbol("test");
        expect(retrieved).toMatchObject({
            name: "test2",
            gblId: "test",
            measuring: MeasuringFeature.weight,
        });
    });
    it("Reassign symbol on same context should fail with different id", async ({ expect, }) => {
        const ctx = await createAndInitExecutionContextManager(prisma);
        const model = await prisma.unitOfMeasure.create({
            data: {
                name: "test",
                gblId: "test",
                measuring: MeasuringFeature.weight,
            },
        });
        await ctx.assignSymbol("test", model.type, model.id);
        const model3 = await prisma.unitOfMeasure.create({
            data: {
                name: "test3",
                gblId: "test",
                measuring: MeasuringFeature.weight,
            },
        });
        const promise = ctx.assignSymbol("test", model3.type, model3.id);
        await expect(promise).rejects.toThrow();
    });
});
