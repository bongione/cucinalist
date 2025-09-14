import { ResultAsync, okAsync, errAsync } from "@cucinalist/fp-types";
import type { CookingTechnique } from "@cucinalist/core";
import type { CookingTechniqueStorage } from "@cucinalist/use-cases/entities-storage";
import { prisma } from "@cucinalist/prisma-entities";

export function createCookingTechniqueStorage(): CookingTechniqueStorage {
  const provider: Pick<
    CookingTechniqueStorage["cookingTechnique"],
    "getCookingTechniqueById" | "getCookingTechniqueByQualifier"
  > = {
    getCookingTechniqueById: (id) => {
      id = id.toLowerCase();
      const builtInTechnique = cookingTechniquesRegistry().get(id);
      if (builtInTechnique) {
        return okAsync(builtInTechnique);
      }
      return ResultAsync.fromThrowable(
        async () => {
          const technique = await prisma().cookingTechnique.findUnique({
            where: { id },
          });
          return new CookingTechniqueFromDbRecord({
            id: technique.id,
            name: technique.name,
            description: technique.description || "",
            strPattern: technique.outputFormatString || "",
          });
        },
        (e) => new Error(String(e)),
      )();
    },
    getCookingTechniqueByQualifier: (qualifier) => {
      const builtInTechnique = cookingTechniquesRegistry().get(
        qualifier.toLowerCase(),
      );
      if (builtInTechnique) {
        return okAsync([builtInTechnique]);
      }
      return ResultAsync.fromThrowable(
        async () => {
          const techniques = await prisma().cookingTechnique.findMany({
            where: { name: qualifier },
          });
          return techniques.map(
            (technique) =>
              new CookingTechniqueFromDbRecord({
                id: technique.id,
                name: technique.name,
                description: technique.description || "",
                strPattern: technique.outputFormatString || "",
              }),
          );
        },
        (e) => new Error(String(e)),
      )();
    },
  };
  return {
    cookingTechnique: {
      ...provider,
      createCookingTechnique: () => errAsync(new Error("Not implemented")),
      updateCookingTechnique: () => errAsync(new Error("Not implemented")),
      deleteCookingTechnique: () => errAsync(new Error("Not implemented")),
    },
  };
}

function recordCookingTechnique(technique: Omit<CookingTechnique, "id">) {
  const variations = new Set([
    technique.name.toLowerCase(),
    ...technique.synonyms.map((s) => s.toLowerCase()),
  ]);
  const r = cookingTechniquesRegistry();
  if (Array.from(variations.values()).some((v) => r.has(v))) {
    throw new Error(
      `Cooking technique with name or synonym "${Array.from(variations).find((v) => r.has(v))}" already exists.`,
    );
  }
  for (const variation of variations) {
    r.set(variation, { ...technique, id: technique.name });
  }
}

class CookingTechniqueFromDbRecord implements CookingTechnique {
  public readonly id: string;
  public readonly name: string;
  public readonly synonyms: string[];
  public readonly description: string;
  private readonly strTemplate: string;

  constructor(info: {
    id: string;
    name: string;
    description?: string;
    strPattern: string;
  }) {
    this.id = info.id;
    this.name = info.name;
    this.description = info.description;
    this.strTemplate = info.strPattern || null;
  }

  public techniqueOutput(ingredientName: string) {
    return this.strTemplate + " " + ingredientName;
  }
}

recordCookingTechnique({
  name: "slice",
  synonyms: ["sliced", "slicing", "cut into slices"],
  description: "Cutting food into thin, flat pieces.",
  techniqueOutput: (ingredientName: string) => `sliced ${ingredientName}`,
});

recordCookingTechnique({
  name: "dice",
  synonyms: ["diced", "dicing", "cut into cubes"],
  description: "Cutting food into small cubes.",
  techniqueOutput: (ingredientName: string) => `diced ${ingredientName}`,
});

recordCookingTechnique({
  name: "chop",
  synonyms: ["chopped", "chopping", "cut into pieces"],
  description: "Cutting food into irregular pieces.",
  techniqueOutput: (ingredientName: string) => `chopped ${ingredientName}`,
});

recordCookingTechnique({
  name: "mince",
  synonyms: ["minced", "mincing", "finely chopped"],
  description: "Cutting food into very small pieces.",
  techniqueOutput: (ingredientName: string) => `minced ${ingredientName}`,
});

recordCookingTechnique({
  name: "peel",
  synonyms: ["peeled", "peeling", "remove skin"],
  description: "Removing the outer skin or layer of food.",
  techniqueOutput: (ingredientName: string) => `peeled ${ingredientName}`,
});

recordCookingTechnique({
  name: "grate",
  synonyms: ["grated", "grating", "shred"],
  description: "Shredding food into small pieces using a grater.",
  techniqueOutput: (ingredientName: string) => `grated ${ingredientName}`,
});

recordCookingTechnique({
  name: "julienne",
  synonyms: ["julienned", "julienning", "cut into thin strips"],
  description: "Cutting food into thin, matchstick-like strips.",
  techniqueOutput: (ingredientName: string) => `julienned ${ingredientName}`,
});

recordCookingTechnique({
  name: "shred",
  synonyms: ["shredded", "shredding", "pull apart"],
  description: "Pulling or cutting food into long, thin pieces.",
  techniqueOutput: (ingredientName: string) => `shredded ${ingredientName}`,
});

recordCookingTechnique({
  name: "wash",
  synonyms: ["washed", "washing", "rinse"],
  description: "Cleaning food with water to remove dirt or impurities.",
  techniqueOutput: (ingredientName: string) => `washed ${ingredientName}`,
});

recordCookingTechnique({
  name: "boil",
  synonyms: ["boiled", "boiling", "cook in boiling water"],
  description: "Cooking food in boiling water or other liquids.",
  techniqueOutput: (ingredientName: string) => `boiled ${ingredientName}`,
});

recordCookingTechnique({
  name: "shallow fry",
  synonyms: [],
  description: "Cook food in a pan with a little fat",
  techniqueOutput: (ingredientName: string) => `fried ${ingredientName}`,
});

recordCookingTechnique({
  name: "deep fry",
  synonyms: [],
  description: "Fully immerse food in hot oil to create a crisp exterior",
  techniqueOutput: (ingredientName: string) => `deep fried ${ingredientName}`,
});

recordCookingTechnique({
  name: "stew",
  synonyms: [],
  description: "Slow cooking of food in a little liquid",
  techniqueOutput: (ingredientName: string) => `stewed ${ingredientName}`,
});

recordCookingTechnique({
  name: "grill",
  synonyms: ["pan fry"],
  description:
    "Medium to fast cooking on a hot pan or grill-pan with a minimal amount of grease",
  techniqueOutput: (ingredientName: string) => `grilled ${ingredientName}`,
});

const _techniquesRegistry: Map<string, CookingTechnique> = new Map();

function cookingTechniquesRegistry(): Map<string, CookingTechnique> {
  return _techniquesRegistry;
}
