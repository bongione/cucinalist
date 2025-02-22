import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../src/__generated__/prismaClient";
import { resetTestDB } from "../src/__generated__/prismaClient/sql";
import { executeDML } from "../src/data/cuninalistDMLInterpreter";

const prisma = new PrismaClient();

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
  it("should have a unit of measure", async () => {
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
    });
    expect(unit).toBeDefined();
    expect(unit.id).toBe("gram");
    expect(unit).toMatchObject({
      measuring: "weight",
      defaultSymbol: "g",
      aka: ["gram", "grams"],
    });
  });
});
