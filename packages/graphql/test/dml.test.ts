import { describe, it, expect, beforeAll } from "vitest";
import { resetTestDB } from "../src/__generated__/prismaClient/sql";
import { executeDML } from "../src/data/cuninalistDMLInterpreter";
import { prisma } from "../src/data/dao/extendedPrisma";

beforeAll(async () => {
  await prisma.$queryRawTyped(resetTestDB());
});

describe("Initial db state", () => {
  it("should have a root context", async () => {
    const context = await prisma.context.findUnique({
      where: { id: "root" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("root");
    expect(context.parentContextId).toBeNull();
  });
  it("should have a public context", async () => {
    const context = await prisma.context.findUnique({
      where: { id: "public" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("public");
    expect(context.parentContextId).toBe("root");
  });
});

describe("Unit of mesaure dsl", () => {
  it("Define a unit of measure", async () => {
    const dsl = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    aka gram, grams
}`;
    await executeDML(prisma, dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("gram");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("UnitOfMeasure");
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id: namedEntity.recordId },
      include: {
        synonyms: true,
      },
    });
    expect(unit).toBeDefined();
    expect(unit.gblId).toBe("gram");
    expect(unit).toMatchObject({
      measuring: "weight",
      defaultSymbol: "g",
      name: "gram",
      synonyms: [{ label: "gram" }, { label: "grams" }],
    });
  });

  it("Allow updating an existing unit of measure", async () => {
    const dsl = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    aka gram, grams
}`;
    await executeDML(prisma, dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    const dsl2 = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    plural g
    aka gram, grams, grammo, grammi
}`;
    await executeDML(prisma, dsl2);
    const namedEntity2 = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    expect(namedEntity2).toMatchObject({
      recordId: namedEntity.recordId,
      recordType: namedEntity.recordType,
      id: namedEntity.id,
      contextId: namedEntity2.contextId,
    });
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id: namedEntity2.recordId },
      include: {
        synonyms: true,
      },
    });
    expect(unit).toBeDefined();
    expect(unit.gblId).toBe("gram");
    expect(unit).toMatchObject({
      measuring: "weight",
      defaultSymbol: "g",
      plural: "g",
      name: "gram",
      synonyms: [
        { label: "gram" },
        { label: "grams" },
        { label: "grammo" },
        { label: "grammi" },
      ],
    });
  });
});
