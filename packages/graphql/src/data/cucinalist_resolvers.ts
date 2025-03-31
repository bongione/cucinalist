import { Resolvers } from "../__generated__/cucinalist-resolvers-types";
import { Recipe } from "../__generated__/prismaClient";

export const cucinalistResolvers: Resolvers = {
  Query: {
    qry: async (parent, args, context) => {
      const qrysResults = await context.dmlInterpreter.executeDQL(args.qryDsl);
      return qrysResults;
    },
  },
  MergedElementType: {
    __resolveType: (parent) => {
      return parent.type === "StoreBoughtIngredient"
        ? "BoughtIngredient"
        : parent.type;
    },
  },
  Recipe: {
    ingredients: async (parent, args, context) => {
      return context.dmlInterpreter.executionContext
        .prisma()
        .recipeIngredient.findMany({
          where: { recipeId: parent.id },
          orderBy: { sequence: "asc" },
        });
    },
    steps: async (parent, args, context) => {
      return context.dmlInterpreter.executionContext
        .prisma()
        .cookingStep.findMany({
          where: { recipeId: parent.id },
        });
    },
    id: (parent) => parent.gblId,
  },
  BoughtIngredient: {
    id: (parent) => parent.gblId,
  },
  UnitOfMeasure: {
    id: (parent) => parent.gblId,
    synonyms: async (parent, _, ctx) => {
      const records = await ctx.dmlInterpreter.executionContext
        .prisma()
        .unitOfMeasureAcceptedLabel.findMany({
          where: { unitOfMeasureId: parent.id },
        });
      return records.map((record) => record.label);
    },
  },
  Ingredient: {
    __resolveType: (parent) =>
      typeof (parent as Recipe).serves === "number"
        ? "Recipe"
        : "BoughtIngredient",
  },
  StepInputIngredient: {
    ingredient: async (parent, args, context) => {
      if (parent.outputIngredientId) {
        return context.dmlInterpreter.executionContext
          .prisma()
          .stepOutputIngredient.findUnique({
            where: { id: parent.outputIngredientId },
          });
      } else if (parent.recipeIngredientId) {
        return context.dmlInterpreter.executionContext
          .prisma()
          .recipeIngredient.findUnique({
            where: { id: parent.recipeIngredientId },
          });
      } else {
        throw new Error("Expected an output ingredient or recipe ingredient");
      }
    },
    portionOf: (parent) =>
      parent.portionOf !== null &&
      typeof parent.portionOf === "number" &&
      !Number.isNaN(parent.portionOf)
        ? parent.portionOf
        : 1,
  },
  StepInputIngredientType: {
    __resolveType: (parent) => parent.type,
  },
  StepPrecondition: {
    requiredIngredients: async (parent, args, context) => {
      const ings = await context.dmlInterpreter.executionContext
        .prisma()
        .stepPreconditionIngredient.findMany({
          where: { stepPreconditionId: parent.id },
        });
      return ings
        .filter((i) => i.outputIngredientId || i.recipeIngredientId)
        .map((ing) => {
          if (ing.outputIngredientId) {
            return context.dmlInterpreter.executionContext
              .prisma()
              .stepOutputIngredient.findUnique({
                where: { id: ing.outputIngredientId },
              });
          } else {
            return context.dmlInterpreter.executionContext
              .prisma()
              .recipeIngredient.findUnique({
                where: { id: ing.recipeIngredientId },
              });
          }
        });
    },
  },
  CookingTechnique: {
    id: (parent) => parent.gblId,
  },
  CookingStep: {
    process: async (parent, args, context) => {
      return context.dmlInterpreter.executionContext
        .prisma()
        .cookingTechnique.findUnique({
          where: { id: parent.techniqueId },
        });
      // const technique =
      //   await context.dmlInterpreter.executionContext.resolveSymbol(
      //     parent.techniqueId,
      //   );
      // if (technique.type !== "CookingTechnique") {
      //   throw new Error("Expected a cooking technique");
      // }
      // return technique;
    },
    preconditions: async (parent, args, context) => {
      return context.dmlInterpreter.executionContext
        .prisma()
        .stepPrecondition.findMany({
          where: { cookingStepId: parent.id },
        });
    },
    requires: async (parent, args, context) =>
      context.dmlInterpreter.executionContext
        .prisma()
        .stepInputIngredient.findMany({
          where: { cookingStepId: parent.id },
        }),
    produces: async (parent, args, context) =>
      context.dmlInterpreter.executionContext
        .prisma()
        .stepOutputIngredient.findMany({
          where: { cookingStepId: parent.id },
        }),
    activeMinutes: (parent) => parent.activeMinutes || 0,
    inactiveMinutes: (parent) => parent.parallelMinutes || 0,
    semiActiveMinutes: (parent) => parent.keepEyeMinutes || 0,
  },
  RecipeIngredient: {
    ingredient: async (parent, args, context) => {
      if (parent.storeBoughtIngredientId) {
        return context.dmlInterpreter.executionContext
          .prisma()
          .storeBoughtIngredient.findUnique({
            where: { id: parent.storeBoughtIngredientId },
          });
      } else if (parent.producedByRecipeId) {
        return context.dmlInterpreter.executionContext
          .prisma()
          .recipe.findUnique({
            where: { id: parent.producedByRecipeId },
          });
      } else {
        throw new Error("Expected a store bought ingredient or a recipe");
      }
    },
    unit: async (parent, args, context) => {
      if (!parent.unitOfMeasureId) {
        return null;
      }
      return context.dmlInterpreter.executionContext
        .prisma()
        .unitOfMeasure.findUnique({
          where: { id: parent.unitOfMeasureId },
        });
    },
    quantity: (parent) => parent.amount || 0,
  },
  Mutation: {
    mergeFacts: async (parent, args, ctx) => {
      const { cucinalistDsl } = args;
      try {
        const mergedElements =
          await ctx.dmlInterpreter.executeDML(cucinalistDsl);
        return { success: true, mergedElements };
      } catch (e) {
        console.error(e);
        return { success: false, mergedElements: [] };
      }
    },
  },
};
