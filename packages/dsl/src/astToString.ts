import {
  BoughtIngredient,
  CreateContext,
  CucinalistDMLStatement,
  IncludeStatement,
  Recipe,
  SwitchToContext,
  UnitOfMeasure,
} from "./ASTModel";

export interface AstToStringOptions {
  pretty?: boolean;
}

const defaultOptions: AstToStringOptions = {
  pretty: false,
};

/**
 * Convert a Cucinalist DML AST to a string representation.
 * @param ast one or more Cucinalist DML statements
 * @param options options for formatting the output
 */
export function astToString(
  ast: CucinalistDMLStatement | CucinalistDMLStatement[],
  options = {} as AstToStringOptions,
): string {
  const opts: AstToStringOptions = { ...defaultOptions, ...options };
  let outStrings: string[] = [];
  const statements = Array.isArray(ast) ? ast : [ast];
  for (const statement of statements) {
    if (statement.type === "IncludeStatement") {
      outStrings.push(includeStatementToString(statement));
    } else if (statement.type === "CreateContext") {
      outStrings.push(createContextToString(statement, opts));
    } else if (statement.type === "UnitOfMeasure") {
      outStrings.push(unitOfMeasureToString(statement, opts));
    } else if (statement.type === "SwitchToContext") {
      outStrings.push(switchToContextToString(statement));
    } else if (statement.type === "BoughtIngredient") {
      outStrings.push(ingredientStatementToString(statement, opts));
    } else if (statement.type === "Recipe") {
      outStrings.push(recipeToString(statement, opts));
    }
  }
  return outStrings.length > 0 ? outStrings.join(opts.pretty ? "\n" : "") : "";
}

function includeStatementToString(statement: IncludeStatement): string {
  return `include '${statement.fileToInclude}'\n`;
}

function createContextToString(
  statement: CreateContext,
  opts: AstToStringOptions,
): string {
  let outString = `create context${statement.switchToContext ? " and switch" : ""} ${escapeString(statement.id)}`;
  if (statement.parentContext) {
    outString += `${opts.pretty ? "\n\t" : " "}parent ${escapeString(statement.parentContext)}`;
  }
  outString += "\n";
  return outString;
}

function switchToContextToString(statement: SwitchToContext): string {
  return `context ${escapeString(statement.id)}\n`;
}

function unitOfMeasureToString(
  statement: UnitOfMeasure,
  opts: AstToStringOptions,
): string {
  let outStrings = [`unitOfMeasure ${escapeString(statement.id)}`];
  outStrings.push(`measuring ${escapeString(statement.measuring)}`);
  outStrings.push(`defaultSymbol ${escapeString(statement.defaultSymbol)}`);
  if (statement.symbolPlural) {
    outStrings.push(`plural ${escapeString(statement.symbolPlural)}`);
  }
  if (statement.aka && statement.aka.length > 0) {
    outStrings.push(`aka ${statement.aka.map(escapeString).join(", ")}`);
  }

  return outStrings.join(opts.pretty ? "\n\t" : " ") + "\n";
}

function ingredientStatementToString(
  statement: BoughtIngredient,
  opts: AstToStringOptions,
): string {
  let outStrings = [`ingredient ${escapeString(statement.id)}`];
  if (statement.name !== statement.id) {
    outStrings.push(`fullName ${escapeString(statement.name)}`);
  }
  if (statement.plural) {
    outStrings.push(`plural ${escapeString(statement.plural)}`);
  }
  if (statement.aka && statement.aka.length > 0) {
    outStrings.push(`aka ${statement.aka.map(escapeString).join(", ")}`);
  }
  outStrings.push(`measuredAs ${escapeString(statement.measuredAs)}`);

  return outStrings.join(opts.pretty ? "\n\t" : " ") + "\n";
}

function recipeToString(statement: Recipe, opts: AstToStringOptions): string {
  let outStrings = [`recipe ${escapeString(statement.id)}`];
  if (statement.name && statement.name !== statement.id) {
    outStrings.push(`fullName ${escapeString(statement.name)}`);
  }

  outStrings.push(`serves ${statement.serves}`);

  if (statement.ingredients && statement.ingredients.length > 0) {
    outStrings.push("ingredients");
    statement.ingredients.forEach((ingredient) => {
      outStrings.push(
        `${opts.pretty ? "\t" : ""}- ${ingredient.isOptional ? "(optional) " : ""}${ingredient.amount.value} ${ingredient.amount.unit} ${escapeString(ingredient.ingredientId)};`,
      );
    });
  }
  if (statement.cookingSteps && statement.cookingSteps.length > 0) {
    outStrings.push("steps");
    statement.cookingSteps.forEach((step) => {
      const hasPreconditions = step.preconditions.length > 0;
      if (hasPreconditions) {
        const whenConditions = step.preconditions.map((precondition) => {
          return `${
            precondition.ingredientNeeded.type === "RecipeIngredient"
              ? precondition.ingredientNeeded.ingredientId
              : precondition.ingredientNeeded.outputId
          }${precondition.conditionDescription ? ` ${escapeString(precondition.conditionDescription)}` : ""}`;
        });
        outStrings.push(
          `${opts.pretty ? "\t" : ""}- when ${step.preconditions.map((precondition) => `${whenConditions.join(", ")}`)}`,
        );
      }
      const filteredInputs = step.ingredients.filter((i) => {
        if (step.medium && step.medium.type === i.type) {
          if (
            step.medium.type === "RecipeIngredient" &&
            i.type === "RecipeIngredient" &&
            i.ingredientId === step.medium.ingredientId
          ) {
            return false;
          } else if (
            step.medium.type === "CookingStepOutput" &&
            i.type === "CookingStepOutput" &&
            i.outputId === step.medium.outputId
          ) {
            return false;
          }
        }
        if (step.source && step.source.type === i.type) {
          if (
            step.source.type === "RecipeIngredient" &&
            i.type === "RecipeIngredient" &&
            i.ingredientId === step.source.ingredientId
          ) {
            return false;
          } else if (
            step.source.type === "CookingStepOutput" &&
            i.type === "CookingStepOutput" &&
            i.outputId === step.source.outputId
          ) {
            return false;
          }
        }
        if (step.target && step.target.type === i.type) {
          if (
            step.target.type === "RecipeIngredient" &&
            i.type === "RecipeIngredient" &&
            i.ingredientId === step.target.ingredientId
          ) {
            return false;
          } else if (
            step.target.type === "CookingStepOutput" &&
            i.type === "CookingStepOutput" &&
            i.outputId === step.target.outputId
          ) {
            return false;
          }
        }
        return true;
      });
      const inputsIds =
        filteredInputs.length > 0
          ? " " +
            escapeStringList(
              filteredInputs.map((ingredient) => {
                return ingredient.type === "RecipeIngredient"
                  ? ingredient.ingredientId
                  : ingredient.outputId;
              }),
            )
          : "";
      const outputsIds =
        step.produces.length > 0
          ? escapeStringList(step.produces.map((output) => output.outputId))
          : "";
      const fromStr = step.source
        ? ` from ${escapeString(step.source.type === "RecipeIngredient" ? step.source.ingredientId : step.source.outputId)}`
        : "";
      const toStr = step.target
        ? ` to ${escapeString(step.target.type === "RecipeIngredient" ? step.target.ingredientId : step.target.outputId)}`
        : "";
      const mediumStr = step.medium
        ? ` in ${escapeString(step.medium.type === "RecipeIngredient" ? step.medium.ingredientId : step.medium.outputId)}`
        : "";

      let transitionStr =
        step.activeMinutes > 0
          ? step.activeMinutes === 1 && step.produces.length === 0
            ? ""
            : ` -${step.activeMinutes}-> `
          : step.inactiveMinutes > 0
            ? ` -[${step.inactiveMinutes}]-> `
            : step.keepAnEyeMinutes > 0
              ? ` -(${step.keepAnEyeMinutes})-> `
              : "";

      outStrings.push(
        `${opts.pretty ? (hasPreconditions ? "\t\t" : "\t") : ""}-${step.isOptional ? " (optional)" : ""} ${escapeString(step.processId)}${inputsIds}${fromStr}${toStr}${mediumStr}${transitionStr}${outputsIds};`,
      );
    });
  }

  return outStrings.join(opts.pretty ? "\n\t" : " ") + '\n';
}

const spaceRegex = /\s+/g;

function escapeString(str: string): string {
  const outStr = str.replace(/'/g, "\\'");
  return spaceRegex.test(outStr) ? `'${outStr}'` : outStr;
}

function escapeStringList(strs: string[]): string {
  const escapedStrs = strs.map((s) => escapeString(s));
  return escapedStrs.length > 2
    ? strs.slice(0, -1).join(", ") + " and " + strs[strs.length - 1]
    : strs.join(" and ");
}
