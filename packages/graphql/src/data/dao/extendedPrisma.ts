import { PrismaClient as OriginalPrismaClient } from "../../__generated__/prismaClient";

export const prisma = new OriginalPrismaClient().$extends({
  name: "typeField",
  result: {
    recipe: {
      type: {
        compute: () => "Recipe" as const,
      },
    },
    storeBoughtIngredient: {
      type: {
        compute: () => "StoreBoughtIngredient" as const,
      },
    },
    unitOfMeasure: {
      type: {
        compute: () => "UnitOfMeasure" as const,
      },
    },
    cookingTechnique: {
      type: {
        compute: () => "CookingTechnique" as const,
      },
    },
    context: {
      type: {
        compute: () => "Context" as const,
      },
    },
    cookingStep: {
      type: {
        compute: () => "CookingStep" as const,
      },
    },
    recipeIngredient: {
      type: {
        compute: () => "RecipeIngredient" as const,
      },
    },
    stepOutputIngredient: {
      type: {
        compute: () => "StepOutputIngredient" as const,
      },
    },
    stepInputIngredient: {
      type: {
        compute: () => "StepInputIngredient" as const,
      },
    },
    stepInputIngredientType: {
      type: {
        compute: () => "StepInputIngredientType" as const,
      },
    },
    namedEntity: {
      type: {
        compute: () => "NamedEntity" as const,
      },
    },
    ingredient: {
      type: {
        compute: () => "Ingredient" as const,
      },
    },
    stepPrecondition: {
      type: {
        compute: () => "StepPrecondition" as const,
      },
    },
    stepPreconditionInputIngredient: {
      type: {
        compute: () => "StepPreconditionInputIngredient" as const,
      },
    },
    stepPreconditionIngredient: {
      type: {
        compute: () => "StepPreconditionIngredient" as const,
      }
    },
    stepPreconditionType: {
      type: {
        compute: () => "StepPreconditionType" as const,
      },
    },
    meal: {
      type: {
        compute: () => "Meal" as const,
      },
    },
    mealCourse: {
      type: {
        compute: () => "MealCourse" as const,
      },
    },
    courseRecipe: {
      type: {
        compute: () => "CourseRecipe" as const,
      },
    },
  },
});

export type PrismaClient = typeof prisma;
