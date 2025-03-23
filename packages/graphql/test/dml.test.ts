import { describe, it, expect, beforeAll } from "vitest";
import { resetTestDB } from "../src/__generated__/prismaClient/sql";
import { getCucinalistDMLInterpreter } from "../src/data/cuninalistDMLInterpreter";
import { prisma } from "../src/data/dao/extendedPrisma";
import { StoreBoughtIngredient } from "../src/__generated__/prismaClient";

beforeAll(async () => {
  await prisma.stepPreconditionInputIngredient.deleteMany({});
  await prisma.stepPrecondition.deleteMany({});
  await prisma.stepInputIngredient.deleteMany({});
  await prisma.stepOutputIngredient.deleteMany({});
  await prisma.unitOfMeasureAcceptedLabel.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.cookingStep.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.storeBoughtIngredientSynonym.deleteMany({});
  await prisma.storeBoughtIngredient.deleteMany({});
  await prisma.cookingTechnique.deleteMany({});
  await prisma.namedEntity.deleteMany({});
  await prisma.context.deleteMany({
    where: { AND: [{ id: { not: "root" } }, { id: { not: "public" } }] },
  });
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

describe("Context dsl", () => {
  it("Create a new context", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testContext`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext");
    expect(context.parentContextId).toBe("public");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "public",
    );
  });

  it("Create a new context with parent", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testContext2 parent root`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext2" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext2");
    expect(context.parentContextId).toBe("root");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "public",
    );
  });

  it("Create a new context with parent and switch", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context and switch testContext3 parent public`;
    await interpreter.executeDML(dsl);
    const context = await prisma.context.findUnique({
      where: { id: "testContext3" },
    });
    expect(context).toBeDefined();
    expect(context.id).toBe("testContext3");
    expect(context.parentContextId).toBe("public");
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "testContext3",
    );
  });

  it("Switch to an existing context", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `create context testSwitchToContext
    context testSwitchToContext`;
    await interpreter.executeDML(dsl);
    expect(interpreter.executionContext.currentContext.contextId).toBe(
      "testSwitchToContext",
    );
  });
});

describe("Unit of mesaure dsl", () => {
  it("Define a unit of measure", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    const dsl = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    aka gram, grams
}`;
    await interpreter.executeDML(dsl);
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
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "gram" } },
    });
    const dsl2 = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    plural g
    aka gram, grams, grammo, grammi
}`;
    await interpreter.executeDML(dsl2);
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

describe("Ingredient dsl", () => {
  it("Define a simple ingredient", async () => {
    const dsl = `ingredient butter measuredAs weight`;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "butter" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("butter");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("StoreBoughtIngredient");
    const ingredient = await prisma.storeBoughtIngredient.findUnique({
      where: { id: namedEntity.recordId },
    });
    const expectedIngredient: Partial<StoreBoughtIngredient> = {
      gblId: "butter",
      name: "butter",
      measuredAs: "weight",
    };
    expect(ingredient).toMatchObject(expectedIngredient);
  });

  it("Define a complete ingredient", async () => {
    const dsl = `ingredient butter
      fullname 'butter stick'
      plural 'butter sticks'
      aka 'block of butter', 'fat of milk'
      measuredAs weight
      `;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(dsl);
    const namedEntity = await prisma.namedEntity.findUnique({
      where: { contextId_id: { contextId: "public", id: "butter" } },
    });
    expect(namedEntity).toBeDefined();
    expect(namedEntity).not.toBeNull();
    expect(namedEntity.id).toBe("butter");
    expect(namedEntity.contextId).toBe("public");
    expect(namedEntity.recordType).toBe("StoreBoughtIngredient");
    const ingredient = await prisma.storeBoughtIngredient.findUnique({
      include: { aka: true },
      where: { id: namedEntity.recordId },
    });
    const expectedIngredient: Partial<
      StoreBoughtIngredient & { aka: Array<{ synonym: string }> }
    > = {
      gblId: "butter",
      name: "butter stick",
      measuredAs: "weight",
      plural: "butter sticks",
      aka: [{ synonym: "block of butter" }, { synonym: "fat of milk" }],
    };
    expect(ingredient).toMatchObject(expectedIngredient);
  });
});
