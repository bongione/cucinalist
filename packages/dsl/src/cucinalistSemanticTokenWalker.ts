import CucinalistListener from "./__generated__/cucinalistParserListener";
import {
  ActiveMinutesTransitionContext,
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
  KeepEyelMinutesTransitionContext,
  MealContext,
  ParallellMinutesTransitionContext,
  ProgramContext,
  QuotedStringContext,
  RangeContext,
  RecipeContext,
  RecipeLineContext,
  RecipeStepLineContext,
  ServingContext,
  SingleMinuteTransitionContext,
  SingleNumberContext,
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
    | "regexp"
    | "reference";
  tokenModifiers: Array<
    | "declaration"
    | "documentation"
    | "readonly"
    | "static"
    | "abstract"
    | "deprecated"
    | "modification"
    | "async"
    | "recipe"
    | "unitOfMeasure"
    | "ingredient"
    | "cookingMethod"
    | "external"
    | "internal"
  >;
}

/**
 * This walker requires two passes to populate a symbol table on the first
 * pass. It will thereafter populate all the other symbols
 */
export class CucinalistSemanticTokenWalker extends CucinalistListener {
  private _semantiTokens: ParsedToken[] = [];
  private _walked: boolean = false;
  private _ctxValues: Map<Object, ParsedToken[]> = new Map();

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
      line: contextCtx.symbol.line - 1,
      startCharacter: contextCtx.symbol.column,
      length: contextCtx.symbol.stop - contextCtx.symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const contextId = ctx._contextId;

    this._semantiTokens.push({
      line: contextId.start.line - 1,
      startCharacter: contextId.start.column,
      length: contextId.stop.stop - contextId.start.start + 1,
      tokenType: "variable",
      tokenModifiers: ["readonly"],
    });
  };

  enterCreateContext = (ctx: CreateContextContext) => {
    const firstToken = ctx.CREATE_CONTEXT();
    const secondToken = ctx.AND_SWITCH() || ctx.CREATE_CONTEXT();
    this._semantiTokens.push({
      line: firstToken.symbol.line - 1,
      startCharacter: firstToken.symbol.column,
      length: secondToken.symbol.stop - firstToken.symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const contextId = ctx._contextId;
    this._semantiTokens.push({
      line: contextId.start.line - 1,
      startCharacter: contextId.start.column,
      length: contextId.stop.stop - contextId.start.start + 1,
      tokenType: "variable",
      tokenModifiers: ["readonly"],
    });
    const parentCtx = ctx.PARENT();
    if (parentCtx) {
      this._semantiTokens.push({
        line: parentCtx.symbol.line - 1,
        startCharacter: parentCtx.symbol.column,
        length: parentCtx.symbol.stop - parentCtx.symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
      const contextId = ctx._parentId;
      this._semantiTokens.push({
        line: contextId.start.line - 1,
        startCharacter: contextId.start.column,
        length: contextId.stop.stop - contextId.start.start + 1,
        tokenType: "variable",
        tokenModifiers: ["readonly"],
      });
    }
  };

  exitRecipe = (ctx: RecipeContext) => {
    const recipeCtx = ctx.RECIPE();
    this._semantiTokens.push({
      line: recipeCtx.symbol.line - 1,
      startCharacter: recipeCtx.symbol.column,
      length: recipeCtx.symbol.stop - recipeCtx.symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    const recipeId = ctx._reciepeId;
    this._semantiTokens.push({
      line: recipeId.start.line - 1,
      startCharacter: recipeId.start.column,
      length: recipeId.stop.stop - recipeId.start.start + 1,
      tokenType: "type",
      tokenModifiers: ["declaration"],
    });
    const fullName = ctx.FULLNAME();
    if (fullName) {
      this._semantiTokens.push({
        line: fullName.symbol.line - 1,
        startCharacter: fullName.symbol.column,
        length: fullName.symbol.stop - fullName.symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._fullname) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "label",
          tokenModifiers: [],
        }),
      ),
    );
    this._semantiTokens.push(...(this._ctxValues.get(ctx.serving()) || []));
    this._semantiTokens.push(...(this._ctxValues.get(ctx.ingredients()) || []));
    this._semantiTokens.push(...(this._ctxValues.get(ctx.steps()) || []));
  };

  exitIngredients = (ctx: IngredientsContext) => {
    const tokens: ParsedToken[] = [];
    tokens.push({
      line: ctx.INGREDIENTS().symbol.line - 1,
      startCharacter: ctx.INGREDIENTS().symbol.column,
      length:
        ctx.INGREDIENTS().symbol.stop - ctx.INGREDIENTS().symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    for (const ingredientLine of ctx.ingredientLine_list()) {
      tokens.push(...(this._ctxValues.get(ingredientLine) || []));
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitSteps = (ctx: StepsContext) => {
    const tokens: ParsedToken[] = [];
    tokens.push({
      line: ctx.STEPS().symbol.line - 1,
      startCharacter: ctx.STEPS().symbol.column,
      length: ctx.STEPS().symbol.stop - ctx.STEPS().symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    for (const recipeStepLine of ctx.recipeStepLine_list()) {
      tokens.push(...(this._ctxValues.get(recipeStepLine) || []));
    }
    this._ctxValues.set(ctx, tokens);

  };

  exitRecipeStepLine = (ctx: RecipeStepLineContext) => {
    this._ctxValues.set(
      ctx,
      (this._ctxValues.get(ctx.condition()) || []).concat(
        this._ctxValues.get(ctx.cookingStep()) || [],
      ),
    );
  };

  exitCondition = (ctx: ConditionContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx.DASH()) {
      tokens.push({
        line: ctx.DASH().symbol.line - 1,
        startCharacter: ctx.DASH().symbol.column,
        length: ctx.DASH().symbol.stop - ctx.DASH().symbol.start + 1,
        tokenType: "operator",
        tokenModifiers: ["declaration"],
      });
    }
    if (ctx.WHEN()) {
      tokens.push({
        line: ctx.WHEN().symbol.line - 1,
        startCharacter: ctx.WHEN().symbol.column,
        length: ctx.WHEN().symbol.stop - ctx.WHEN().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    const whens = ctx.whenCondition_list();
    const commas = ctx.COMMA_list();
    for (let i = 0; i < whens.length; i++) {
      const condition = whens[i];
      if (i - 1 >= 0 && i - 1 < commas.length) {
        tokens.push({
          line: commas[i - 1].symbol.line - 1,
          startCharacter: commas[i - 1].symbol.column,
          length: commas[i - 1].symbol.stop - commas[i - 1].symbol.start + 1,
          tokenType: "operator",
          tokenModifiers: [],
        });
      }
      tokens.push(...(this._ctxValues.get(condition) || []));
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitWhenCondition = (ctx: WhenConditionContext) => {
    const tokens: ParsedToken[] = [];
    tokens.push(
      ...(this._ctxValues.get(ctx.id()) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "reference",
          tokenModifiers: ["internal", "ingredient"],
        }),
      ),
    );
    tokens.push(
      ...(this._ctxValues.get(ctx.string_()) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "label",
          tokenModifiers: [],
        }),
      ),
    );
    this._ctxValues.set(ctx, tokens);
  };

  exitCookingStep = (ctx: CookingStepContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx._stepStart) {
      tokens.push({
        line: ctx._stepStart.line - 1,
        startCharacter: ctx._stepStart.column,
        length: ctx._stepStart.stop - ctx._stepStart.start + 1,
        tokenType: "operator",
        tokenModifiers: ["declaration"],
      });
    }
    if (ctx.OPTIONAL()) {
      tokens.push({
        line: ctx.OPTIONAL().symbol.line - 1,
        startCharacter: ctx.OPTIONAL().symbol.column,
        length: ctx.OPTIONAL().symbol.stop - ctx.OPTIONAL().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: ["modification"],
      });
    }
    tokens.push(
      ...(this._ctxValues.get(ctx._action) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "reference",
          tokenModifiers: ["external", "cookingMethod"],
        }),
      ),
    );
    tokens.push(
      ...(this._ctxValues.get(ctx._sourceIngredients) || []).map(
        (t): ParsedToken =>
          t.tokenType === "keyword"
            ? t
            : {
                ...t,
                tokenType: "reference",
                tokenModifiers: ["internal", "ingredient"],
              },
      ),
    );
    if (ctx.FROM()) {
      tokens.push({
        line: ctx.FROM().symbol.line - 1,
        startCharacter: ctx.FROM().symbol.column,
        length: ctx.FROM().symbol.stop - ctx.FROM().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    if (ctx._sourceOfStep) {
      tokens.push(
        ...(this._ctxValues.get(ctx._sourceOfStep) || []).map(
          (t): ParsedToken =>
            t.tokenType === "keyword"
              ? t
              : {
                  ...t,
                  tokenType: "reference",
                  tokenModifiers: ["internal", "ingredient"],
                },
        ),
      );
    }
    if (ctx.TO()) {
      tokens.push({
        line: ctx.TO().symbol.line - 1,
        startCharacter: ctx.TO().symbol.column,
        length: ctx.TO().symbol.stop - ctx.TO().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    if (ctx.ON()) {
      tokens.push({
        line: ctx.ON().symbol.line - 1,
        startCharacter: ctx.ON().symbol.column,
        length: ctx.ON().symbol.stop - ctx.ON().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    if (ctx._targetOfStep) {
      tokens.push(
        ...(this._ctxValues.get(ctx._targetOfStep) || []).map(
          (t): ParsedToken =>
            t.tokenType === "keyword"
              ? t
              : {
                  ...t,
                  tokenType: "reference",
                  tokenModifiers: ["internal", "ingredient"],
                },
        ),
      );
    }
    if (ctx.IN()) {
      tokens.push({
        line: ctx.IN().symbol.line - 1,
        startCharacter: ctx.IN().symbol.column,
        length: ctx.IN().symbol.stop - ctx.IN().symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    }
    if (ctx._mediumOfStep) {
      tokens.push(
        ...(this._ctxValues.get(ctx._targetOfStep) || []).map(
          (t): ParsedToken =>
            t.tokenType === "keyword"
              ? t
              : {
                  ...t,
                  tokenType: "reference",
                  tokenModifiers: ["external", "ingredient"],
                },
        ),
      );
    }
    if (ctx.transition()) {
      tokens.push(...(this._ctxValues.get(ctx.transition()) || []));
    }

    if (ctx._outputs) {
      tokens.push(
        ...(this._ctxValues.get(ctx._outputs) || []).map(
          (t): ParsedToken =>
            t.tokenType === "keyword"
              ? t
              : {
                  ...t,
                  tokenType: "variable",
                  tokenModifiers: [
                    "readonly",
                    "declaration",
                    "internal",
                    "ingredient",
                  ],
                },
        ),
      );
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitActiveMinutesTransition = (ctx: ActiveMinutesTransitionContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx._activeDash) {
      tokens.push({
        line: ctx._activeDash.line - 1,
        startCharacter: ctx._activeDash.column,
        length: ctx._activeDash.stop - ctx._activeDash.start + 1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    if (ctx._activeMinutes) {
      tokens.push({
        line: ctx._activeMinutes.line - 1,
        startCharacter: ctx._activeMinutes.column,
        length: ctx._activeMinutes.stop - ctx._activeMinutes.start + 1,
        tokenType: "number",
        tokenModifiers: [],
      });
    }
    if (ctx.RA()) {
      tokens.push({
        line: ctx.RA().symbol.line - 1,
        startCharacter: ctx.RA().symbol.column,
        length: ctx.RA().symbol.stop - ctx.RA().symbol.start + 1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitSingleMinuteTransition = (ctx: SingleMinuteTransitionContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx.RA()) {
      tokens.push({
        line: ctx.RA().symbol.line - 1,
        startCharacter: ctx.RA().symbol.column,
        length: ctx.RA().symbol.stop - ctx.RA().symbol.start + 1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitParallellMinutesTransition = (ctx: ParallellMinutesTransitionContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx.RA_PARALLEL_TIME_LEFT()) {
      tokens.push({
        line: ctx.RA_PARALLEL_TIME_LEFT().symbol.line - 1,
        startCharacter: ctx.RA_PARALLEL_TIME_LEFT().symbol.column,
        length:
          ctx.RA_PARALLEL_TIME_LEFT().symbol.stop -
          ctx.RA_PARALLEL_TIME_LEFT().symbol.start +
          1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    if (ctx._parallellMinutes) {
      tokens.push({
        line: ctx._parallellMinutes.line - 1,
        startCharacter: ctx._parallellMinutes.column,
        length: ctx._parallellMinutes.stop - ctx._parallellMinutes.start + 1,
        tokenType: "number",
        tokenModifiers: [],
      });
    }
    if (ctx.RA_PARALLEL_TIME_RIGHT()) {
      tokens.push({
        line: ctx.RA_PARALLEL_TIME_RIGHT().symbol.line - 1,
        startCharacter: ctx.RA_PARALLEL_TIME_RIGHT().symbol.column,
        length:
          ctx.RA_PARALLEL_TIME_RIGHT().symbol.stop -
          ctx.RA_PARALLEL_TIME_RIGHT().symbol.start +
          1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitKeepEyelMinutesTransition = (ctx: KeepEyelMinutesTransitionContext) => {
    const tokens: ParsedToken[] = [];
    if (ctx.RA_KEEPYE_TIME_LEFT()) {
      tokens.push({
        line: ctx.RA_KEEPYE_TIME_LEFT().symbol.line - 1,
        startCharacter: ctx.RA_KEEPYE_TIME_LEFT().symbol.column,
        length:
          ctx.RA_KEEPYE_TIME_LEFT().symbol.stop -
          ctx.RA_KEEPYE_TIME_LEFT().symbol.start +
          1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    if (ctx._keepEyelMinutes) {
      tokens.push({
        line: ctx._keepEyelMinutes.line - 1,
        startCharacter: ctx._keepEyelMinutes.column,
        length: ctx._keepEyelMinutes.stop - ctx._keepEyelMinutes.start + 1,
        tokenType: "number",
        tokenModifiers: [],
      });
    }
    if (ctx.RA_KEEPYE_TIME_RIGHT()) {
      tokens.push({
        line: ctx.RA_KEEPYE_TIME_RIGHT().symbol.line - 1,
        startCharacter: ctx.RA_KEEPYE_TIME_RIGHT().symbol.column,
        length:
          ctx.RA_KEEPYE_TIME_RIGHT().symbol.stop -
          ctx.RA_KEEPYE_TIME_RIGHT().symbol.start +
          1,
        tokenType: "operator",
        tokenModifiers: [],
      });
    }
    this._ctxValues.set(ctx, tokens);
  };

  exitServing = (ctx: ServingContext) => {
    const tokens: ParsedToken[] = [];
    tokens.push({
      line: ctx.SERVES().symbol.line - 1,
      startCharacter: ctx.SERVES().symbol.column,
      length: ctx.SERVES().symbol.stop - ctx.SERVES().symbol.start + 1,
      tokenType: "keyword",
      tokenModifiers: [],
    });
    tokens.push({
      line: ctx.INT().symbol.line - 1,
      startCharacter: ctx.INT().symbol.column,
      length: ctx.INT().symbol.stop - ctx.INT().symbol.start + 1,
      tokenType: "number",
      tokenModifiers: [],
    });
    this._ctxValues.set(ctx, tokens);
  };

  exitIngredientLine = (ctx: IngredientLineContext) => {
    const tokens: ParsedToken[] = [];
    const dash = ctx.DASH();
    if (dash) {
      tokens.push({
        line: dash.symbol.line - 1,
        startCharacter: dash.symbol.column,
        length: dash.symbol.stop - dash.symbol.start + 1,
        tokenType: "operator",
        tokenModifiers: ["declaration"],
      });
    }
    const optionalNode = ctx.OPTIONAL();
    if (optionalNode) {
      tokens.push({
        line: optionalNode.symbol.line - 1,
        startCharacter: optionalNode.symbol.column,
        length: optionalNode.symbol.stop - optionalNode.symbol.start + 1,
        tokenType: "keyword",
        tokenModifiers: ["modification"],
      });
    }
    tokens.push(
      ...(this._ctxValues.get(ctx.ingredientAmount()) || []),
    );
    tokens.push(
      ...(this._ctxValues.get(ctx._unitOfMeasureId) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "reference",
          tokenModifiers: ["external", "unitOfMeasure"],
        }),
      ),
    );
    tokens.push(
      ...(this._ctxValues.get(ctx._ingrediendNameId) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "reference",
          tokenModifiers: ["external", "ingredient"],
        }),
      ),
    );
    this._ctxValues.set(ctx, tokens);
  };

  exitUnitOfMeasure = (ctx: UnitOfMeasureContext) => {
    if (ctx.UNITOFMEASURE()) {
      this._semantiTokens.push({
        tokenType: "keyword",
        tokenModifiers: [],
        line: ctx.UNITOFMEASURE().symbol.line - 1,
        startCharacter: ctx.UNITOFMEASURE().symbol.column,
        length:
          ctx.UNITOFMEASURE().symbol.stop -
          ctx.UNITOFMEASURE().symbol.start +
          1,
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._name) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "type",
          tokenModifiers: ["declaration"],
        }),
      ),
    );
    if (ctx.MEASURING()) {
      this._semantiTokens.push({
        tokenType: "keyword",
        tokenModifiers: [],
        line: ctx.MEASURING().symbol.line - 1,
        startCharacter: ctx.MEASURING().symbol.column,
        length: ctx.MEASURING().symbol.stop - ctx.MEASURING().symbol.start + 1,
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._measuring) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "label",
          tokenModifiers: [],
        }),
      ),
    );
    if (ctx.DEFAULTSYMBOL()) {
      this._semantiTokens.push({
        tokenType: "keyword",
        tokenModifiers: [],
        line: ctx.DEFAULTSYMBOL().symbol.line - 1,
        startCharacter: ctx.DEFAULTSYMBOL().symbol.column,
        length:
          ctx.DEFAULTSYMBOL().symbol.stop -
          ctx.DEFAULTSYMBOL().symbol.start +
          1,
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._defaultSymbol) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "label",
          tokenModifiers: [],
        }),
      ),
    );
    if (ctx.PLURAL()) {
      this._semantiTokens.push({
        tokenType: "keyword",
        tokenModifiers: [],
        line: ctx.PLURAL().symbol.line - 1,
        startCharacter: ctx.PLURAL().symbol.column,
        length: ctx.PLURAL().symbol.stop - ctx.PLURAL().symbol.start + 1,
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._plural) || []).map(
        (t): ParsedToken => ({
          ...t,
          tokenType: "label",
          tokenModifiers: [],
        }),
      ),
    );
    if (ctx.AKA()) {
      this._semantiTokens.push({
        tokenType: "keyword",
        tokenModifiers: [],
        line: ctx.AKA().symbol.line - 1,
        startCharacter: ctx.AKA().symbol.column,
        length: ctx.AKA().symbol.stop - ctx.AKA().symbol.start + 1,
      });
    }
    this._semantiTokens.push(
      ...(this._ctxValues.get(ctx._akaList) || []).map(
        (t): ParsedToken =>
          t.tokenType === "keyword"
            ? t
            : {
                ...t,
                tokenType: "label",
                tokenModifiers: [],
              },
      ),
    );
  };

  exitSingleNumber = (ctx: SingleNumberContext) => {
    this._ctxValues.set(ctx, this._ctxValues.get(ctx.number_())!);
  };

  enterIntAmount = (ctx: IntAmountContext) => {
    const token: ParsedToken = {
      line: ctx.INT().symbol.line - 1,
      startCharacter: ctx.INT().symbol.column,
      length: ctx.INT().symbol.stop - ctx.INT().symbol.start + 1,
      tokenType: "number",
      tokenModifiers: [],
    };
    this._ctxValues.set(ctx, [token]);
  };

  enterFloatAmount = (ctx: FloatAmountContext) => {
    const token: ParsedToken = {
      line: ctx.FLOAT().symbol.line - 1,
      startCharacter: ctx.FLOAT().symbol.column,
      length: ctx.FLOAT().symbol.stop - ctx.FLOAT().symbol.start + 1,
      tokenType: "number",
      tokenModifiers: [],
    };
    this._ctxValues.set(ctx, [token]);
  };

  exitAmountRange = (ctx: AmountRangeContext) => {
    this._ctxValues.set(ctx, this._ctxValues.get(ctx.range()));
  };

  exitRange = (ctx: RangeContext) => {
    const upper = this._ctxValues.get(ctx._upperBound);
    const lower = this._ctxValues.get(ctx._lowerBound);
    const tokens: ParsedToken[] = [...(lower || [])];
    const dashCtx = ctx.DASH();
    if (dashCtx) {
      tokens.push({
        tokenType: "operator",
        tokenModifiers: [],
        line: ctx.DASH().symbol.line - 1,
        startCharacter: ctx.DASH().symbol.column,
        length: ctx.DASH().symbol.stop - ctx.DASH().symbol.start + 1,
      });
    }
    tokens.push(...(upper || []));
    this._ctxValues.set(ctx, tokens);
  };

  exitQuotedString = (ctx: QuotedStringContext) => {
    const token: ParsedToken = {
      line: ctx.STRING().symbol.line - 1,
      startCharacter: ctx.STRING().symbol.column + 1,
      length: ctx.STRING().symbol.stop - ctx.STRING().symbol.start - 2 + 1,
      tokenType: "string",
      tokenModifiers: ["readonly"],
    };
    this._ctxValues.set(ctx, [token]);
  };

  exitUnquotedString = (ctx: UnquotedStringContext) => {
    const token: ParsedToken = {
      line: ctx.SINGLE_ID().symbol.line - 1,
      startCharacter: ctx.SINGLE_ID().symbol.column,
      length: ctx.SINGLE_ID().symbol.stop - ctx.SINGLE_ID().symbol.start + 1,
      tokenType: "string",
      tokenModifiers: ["readonly"],
    };
    this._ctxValues.set(ctx, [token]);
  };

  exitIdList = (ctx: IdListContext) => {
    const tokens = ctx
      .id_list()
      .map((id) =>
        this._ctxValues.get(id)!.map(
          (t): ParsedToken => ({
            ...t,
            tokenType: "variable",
            tokenModifiers: ["readonly"],
          }),
        ),
      )
      .flat();
    this._ctxValues.set(ctx, tokens);
  };

  enterRecipeLine = (ctx: RecipeLineContext) => {};

  enterCourse = (ctx: CourseContext) => {};

  enterMeal = (ctx: MealContext) => {};

  enterInclude = (ctx: IncludeContext) => {};

  exitString = (ctx: StringContext) => {
    const tokens =
      (ctx.quotedString()
        ? this._ctxValues.get(ctx.quotedString())
        : this._ctxValues.get(ctx.unquotedString())) || [];
    this._ctxValues.set(ctx, tokens);
  };

  exitId = (ctx: IdContext) => {
    const tokens =
      (ctx.quotedString()
        ? this._ctxValues.get(ctx.quotedString()).map(
            (t): ParsedToken => ({
              ...t,
              tokenType: "variable",
              tokenModifiers: ["readonly"],
            }),
          )
        : this._ctxValues.get(ctx.unquotedString()).map(
            (t): ParsedToken => ({
              ...t,
              tokenType: "variable",
              tokenModifiers: ["readonly"],
            }),
          )) || [];
    this._ctxValues.set(ctx, tokens);
  };

  exitStringList = (ctx: StringListContext) => {
    const tokens = ctx
      .string__list()
      .map((s) => this._ctxValues.get(s))
      .flat();
    this._ctxValues.set(ctx, tokens);
  };
}
