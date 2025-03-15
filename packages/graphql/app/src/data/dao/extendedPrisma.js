import { PrismaClient as OriginalPrismaClient } from "../../__generated__/prismaClient";
export const prisma = new OriginalPrismaClient().$extends({
    name: "typeField",
    result: {
        recipe: {
            type: {
                compute: () => "Recipe",
            },
        },
        storeBoughtIngredient: {
            type: {
                compute: () => "StoreBoughtIngredient",
            },
        },
        unitOfMeasure: {
            type: {
                compute: () => "UnitOfMeasure",
            },
        },
        cookingTechnique: {
            type: {
                compute: () => "CookingTechnique",
            },
        },
        context: {
            type: {
                compute: () => "Context",
            },
        },
        cookingStep: {
            type: {
                compute: () => "CookingStep",
            },
        },
        recipeIngredient: {
            type: {
                compute: () => "RecipeIngredient",
            },
        },
        stepOutputIngredient: {
            type: {
                compute: () => "StepOutputIngredient",
            },
        },
        stepInputIngredient: {
            type: {
                compute: () => "StepInputIngredient",
            },
        },
        stepInputIngredientType: {
            type: {
                compute: () => "StepInputIngredientType",
            },
        },
        namedEntity: {
            type: {
                compute: () => "NamedEntity",
            },
        },
        ingredient: {
            type: {
                compute: () => "Ingredient",
            },
        },
        stepPrecondition: {
            type: {
                compute: () => "StepPrecondition",
            },
        },
        stepPreconditionInputIngredient: {
            type: {
                compute: () => "StepPreconditionInputIngredient",
            },
        },
        stepPreconditionType: {
            type: {
                compute: () => "StepPreconditionType",
            },
        },
    },
});
