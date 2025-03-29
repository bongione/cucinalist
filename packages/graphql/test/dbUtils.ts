import { prisma } from "../src/data/dao/extendedPrisma";

export async function cleanupDb() {
  await prisma.courseRecipe.deleteMany({});
  await prisma.mealCourse.deleteMany({});
  await prisma.meal.deleteMany({});
  await prisma.stepPreconditionIngredient.deleteMany({});
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
}
