import { Resolvers } from "../__generated__/cucinalist-resolvers-types";
import { executeDML } from "./cuninalistDMLInterpreter";
import {
  Recipe,
  RecipeIngredient,
  StepOutputIngredient,
} from "../__generated__/prismaClient";

export const cucinalistResolvers: Resolvers = {
  Query: {
    allRecipes: async (parent, args, context) => {
      return context.prisma.recipe.findMany();
    },
  },
  Recipe: {
    ingredients: async (parent, args, context) => {
      return context.prisma.recipeIngredient.findMany({
        where: { recipeId: parent.id },
      });
    },
    steps: async (parent, args, context) => {
      return context.prisma.cookingStep.findMany({
        where: { recipeId: parent.id },
      });
    },
    id: (parent) => parent.gblId,
  },
  BoughtIngredient: {
    id: (parent) => parent.gblId,
    units: () => [],
  },
  UnitOfMeasure: {
    id: (parent) => parent.gblId,
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
        return context.prisma.stepOutputIngredient.findUnique({
          where: { id: parent.outputIngredientId },
        });
      } else if (parent.recipeIngredientId) {
        return context.prisma.recipeIngredient.findUnique({
          where: { id: parent.recipeIngredientId },
        });
      } else {
        throw new Error("Expected an output ingredient or recipe ingredient");
      }
    },
  },
  StepInputIngredientType: {
    __resolveType: (parent) =>
      (parent as RecipeIngredient).amount &&
      typeof (parent as RecipeIngredient).amount === "object"
        ? "StepOutputIngredient"
        : "RecipeIngredient",
  },
  StepPrecondition: {
    requiredIngredients: async (parent, args, context) => {
      const linkRecords =
        await context.prisma.stepPreconditionInputIngredient.findMany({
          where: { stepPreconditionId: parent.id },
        });
      const records = await Promise.all(
        linkRecords.map((link) =>
          context.prisma.stepInputIngredient.findUnique({
            where: { id: link.stepInputIngredientId },
          }),
        ),
      );
      return records;
    },
  },
  CookingStep: {
    process: async (parent, args, context) => {
      const technique = await context.resolverContext.resolveSymbol(
        parent.techniqueId,
      );
      if (technique.type !== "CookingTechnique") {
        throw new Error("Expected a cooking technique");
      }
      return technique;
    },
    preconditions: async (parent, args, context) => {
      return context.prisma.stepPrecondition.findMany({
        where: { cookingStepId: parent.id },
      });
    },
    requires: async (parent, args, context) =>
      context.prisma.stepInputIngredient.findMany({
        where: { cookingStepId: parent.id },
      }),
    produces: async (parent, args, context) =>
      context.prisma.stepOutputIngredient.findMany({
        where: { cookingStepId: parent.id },
      }),
  },
  RecipeIngredient: {
    ingredient: async (parent, args, context) => {
      const resolved = await context.resolverContext.resolveSymbol(
        parent.storeBoughtIngredientId || parent.producedByRecipeId,
      );
      if (
        resolved.type === "StoreBoughtIngredient" ||
        resolved.type === "Recipe"
      ) {
        return resolved;
      } else if (resolved.type === "UnresolvedId") {
        throw new Error(
          `Could not resolve ingredient ${String(parent.storeBoughtIngredientId || parent.producedByRecipeId)}`,
        );
      } else {
        throw new Error("Expected a store bought ingredient or a recipe");
      }
    },
    unit: async (parent, args, context) => {
      const uom = await context.resolverContext.resolveSymbol(
        parent.unitOfMeasureId,
      );
      if (uom.type === "UnresolvedId") {
        throw new Error(
          `Could not resolve unit of measure ${parent.unitOfMeasureId}`,
        );
      } else if (uom.type !== "UnitOfMeasure") {
        throw new Error("Expected a unit of measure");
      }
      return uom;
    },
  },
  Mutation: {
    mergeFacts: async (parent, args, ctx) => {
      const { cucinalistDsl } = args;
      try {
        await executeDML(ctx.prisma, cucinalistDsl);
        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false };
      }
    },
  },
};
