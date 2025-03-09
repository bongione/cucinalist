import CucinalistListener from "./__generated__/cucinalistParserListener";
import {
  AmountRangeContext,
  ConditionContext,
  ContextContext,
  CookingStepContext,
  CourseContext,
  CreateContextContext,
  FloatAmountContext,
  IdContext,
  IdListContext,
  IncludeContext,
  IngredientLineContext,
  IngredientsContext,
  IntAmountContext,
  MealContext,
  ProgramContext,
  QuotedStringContext,
  RangeContext,
  RecipeContext,
  RecipeLineContext,
  RecipeStepLineContext,
  ServingContext,
  SingleNumberContext,
  StatementContext,
  StepsContext,
  StringContext,
  StringListContext,
  UnitOfMeasureContext,
  UnquotedStringContext,
  WhenConditionContext,
} from "./__generated__/cucinalistParser";

export interface ParsedToken {
  line: number;
  startCharacter: number;
  length: number;
  tokenType:
    | "keyword"
    | "struct"
    | "type"
    | "variable"
    | "parameter"
    | "property"
    | "label"
    | "function"
    | "method"
    | "operator"
    | "namespace"
    | "class"
    | "interface"
    | "enum"
    | "macro"
    | "decorator"
    | "comment"
    | "string"
    | "number"
    | "regexp";
  tokenModifiers: Array<
    | "declaration"
    | "documentation"
    | "readonly"
    | "static"
    | "abstract"
    | "deprecated"
    | "modification"
    | "async"
  >;
}

/**
 * This walker requires two passes to populate a symbol table on the first
 * pass. It will thereafter populate all the other symbols
 */
export class CucinalistSemanticTokenWalker extends CucinalistListener {
  private _semantiTokens: ParsedToken[] = [];
  private _walked: boolean = false;

  public get semantiTokens() {
    if (!this._walked) {
      throw new Error("Walker has not been walked yet");
    }
    return this._semantiTokens;
  }

  enterProgram = (ctx: ProgramContext) => {
    this._semantiTokens = [];
  };

  exitProgram = (ctx: ProgramContext) => {
    this._walked = true;
  };

  enterContext = (ctx: ContextContext) => {
    const contextCtx = ctx.CONTEXT();
    this._semantiTokens.push({
      line: contextCtx.symbol.line,
      startCharacter: contextCtx.symbol.start,
      length: contextCtx.symbol.stop - contextCtx.symbol.start,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const contextId = ctx._contextId;

    this._semantiTokens.push({
      line: contextId.start.line,
      startCharacter: contextId.start.start,
      length: contextId.stop.stop - contextId.start.start,
      tokenType: "variable",
      tokenModifiers: ["readonly"],
    });
  };

  enterCreateContext = (ctx: CreateContextContext) => {
    const firstToken = ctx.CREATE_CONTEXT();
    const secondToken = ctx.AND_SWITCH() || ctx.CREATE_CONTEXT();
    this._semantiTokens.push({
      line: firstToken.symbol.line,
      startCharacter: firstToken.symbol.start,
      length: secondToken.symbol.stop - firstToken.symbol.start,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const contextId = ctx._contextId;
    this._semantiTokens.push({
      line: contextId.start.line,
      startCharacter: contextId.start.start,
      length: contextId.stop.stop - contextId.start.start,
      tokenType: "variable",
      tokenModifiers: ["readonly"],
    });
    const parentCtx = ctx.PARENT();
    if (parentCtx) {
      this._semantiTokens.push({
        line: parentCtx.symbol.line,
        startCharacter: parentCtx.symbol.start,
        length: parentCtx.symbol.stop - parentCtx.symbol.start,
        tokenType: "keyword",
        tokenModifiers: [],
      });
      const contextId = ctx._contextId;
      this._semantiTokens.push({
        line: contextId.start.line,
        startCharacter: contextId.start.start,
        length: contextId.stop.stop - contextId.start.start,
        tokenType: "variable",
        tokenModifiers: ["readonly"],
      });
    }
  };

  enterRecipe = (ctx: RecipeContext) => {
    const recipeCtx = ctx.RECIPE();
    this._semantiTokens.push({
      line: recipeCtx.symbol.line,
      startCharacter: recipeCtx.symbol.start,
      length: recipeCtx.symbol.stop - recipeCtx.symbol.start,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const recipeId = ctx._reciepeId;
    this._semantiTokens.push({
      line: recipeId.start.line,
      startCharacter: recipeId.start.start,
      length: recipeId.stop.stop - recipeId.start.start,
      tokenType: "variable",
      tokenModifiers: ["readonly"],
    });
    const fullName = ctx.FULLNAME();
    if (fullName) {
      this._semantiTokens.push({
        line: fullName.symbol.line,
        startCharacter: fullName.symbol.start,
        length: fullName.symbol.stop - fullName.symbol.start,
        tokenType: "keyword",
        tokenModifiers: [],
      });
      this._semantiTokens.push({
        line: ctx._fullname.start.line,
        startCharacter: ctx._fullname.start.start,
        length: ctx._fullname.stop.stop - ctx._fullname.start.start,
        tokenType: "label",
        tokenModifiers: [],
      });
    }
  };

  enterIngredients = (ctx: IngredientsContext) => {};

  enterSteps = (ctx: StepsContext) => {};

  enterRecipeStepLine = (ctx: RecipeStepLineContext) => {};

  enterCondition = (ctx: ConditionContext) => {};

  enterWhenCondition = (ctx: WhenConditionContext) => {};

  enterCookingStep = (ctx: CookingStepContext) => {};

  enterServing = (ctx: ServingContext) => {};

  enterIngredientLine = (ctx: IngredientLineContext) => {};

  enterUnitOfMeasure = (ctx: UnitOfMeasureContext) => {};

  enterSingleNumber = (ctx: SingleNumberContext) => {};

  enterIntAmount = (ctx: IntAmountContext) => {};

  enterFloatAmount = (ctx: FloatAmountContext) => {};

  enterAmountRange = (ctx: AmountRangeContext) => {};

  enterRange = (ctx: RangeContext) => {};

  enterQuotedString = (ctx: QuotedStringContext) => {};

  enterUnquotedString = (ctx: UnquotedStringContext) => {};

  enterIdList = (ctx: IdListContext) => {};

  enterRecipeLine = (ctx: RecipeLineContext) => {};

  enterCourse = (ctx: CourseContext) => {};

  enterMeal = (ctx: MealContext) => {};

  enterInclude = (ctx: IncludeContext) => {};

  enterString = (ctx: StringContext) => {};

  enterId = (ctx: IdContext) => {};

  enterStringList = (ctx: StringListContext) => {};
}
