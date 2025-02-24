import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { PrismaClient, UnitOfMeasure, MeasuringFeature } from "../src/__generated__/prismaClient";
import { resetTestDB } from "../src/__generated__/prismaClient/sql";
import { createAndInitExecutionContextManager } from "../src/data/executionContext";
import { TypedModel } from "../src/data/dmlTypes";
const prisma = new PrismaClient();

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
    const model: TypedModel<UnitOfMeasure, "UnitOfMeasure"> = {
      ...(await prisma.unitOfMeasure.create({
        data: {
          name: "test",
          gblId: "test",
          measuring: MeasuringFeature.weight,
        },
      })),
      type: "UnitOfMeasure",
    };
    const result = await ctx.assignSymbol("test", model);
    const retrieved = await ctx.resolveSymbol("test");
    expect((result as UnitOfMeasure).name).toBe("test");
    expect(result).toMatchObject(retrieved);
  });

  it("Reassign symbol on same context should be ok with same id", async () => {
    const ctx = await createAndInitExecutionContextManager(prisma);
    const model: TypedModel<UnitOfMeasure, "UnitOfMeasure"> = {
      ...(await prisma.unitOfMeasure.create({
        data: {
          name: "test",
          gblId: "test",
          measuring: MeasuringFeature.weight,
        },
      })),
      type: "UnitOfMeasure",
    };
    const result = await ctx.assignSymbol("test", model);
    const model2: TypedModel<UnitOfMeasure, "UnitOfMeasure"> = {
      ...(await prisma.unitOfMeasure.update({
        where: { id: model.id },
        data: {
          name: "test2",
        },
      })),
      type: "UnitOfMeasure",
    };
    const result2 = await ctx.assignSymbol("test", model2);
    expect((result2 as UnitOfMeasure).name).toBe("test2");
  });

  it("Reassign symbol on same context should fail with different id", async ({
    expect,
  }) => {
    const ctx = await createAndInitExecutionContextManager(prisma);
    const model: TypedModel<UnitOfMeasure, "UnitOfMeasure"> = {
      ...(await prisma.unitOfMeasure.create({
        data: {
          name: "test",
          gblId: "test",
          measuring: MeasuringFeature.weight,
        },
      })),
      type: "UnitOfMeasure",
    };
    await ctx.assignSymbol("test", model);
    const model3: TypedModel<UnitOfMeasure, "UnitOfMeasure"> = {
      ...(await prisma.unitOfMeasure.create({
        data: {
          name: "test3",
          gblId: "test",
          measuring: MeasuringFeature.weight,
        },
      })),
      type: "UnitOfMeasure",
    };
    const promise = ctx.assignSymbol("test", model3);
    await expect(promise).rejects.toThrow();
  });
});
