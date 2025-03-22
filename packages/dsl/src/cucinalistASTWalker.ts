import CucinalistListener from "./__generated__/cucinalistParserListener";
import {
  CucinalistDMLStatement,
  CookingStep,
  MealCourse,
  MultiCourseMeal,
  RecipeIngredient,
  SingleCourseMeal,
  StepPrecondition,
  UnitOfMeasure,
  type Recipe,
  CookingStepOutput,
  CreateContext,
  IncludeStatement,
  SwitchToContext,
  CucinalistDslAST, BoughtIngredient
} from './ASTModel'
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
  IncludeContext, IngredientContext,
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
  StatementContext,
  StepsContext,
  StringContext,
  StringListContext,
  UnitOfMeasureContext,
  UnquotedStringContext,
  WhenConditionContext
} from './__generated__/cucinalistParser'

type TransitionData = Pick<
  CookingStep,
  "activeMinutes" | "inactiveMinutes" | "keepAnEyeMinutes"
>;

/**
 * This walker requires two passes to populate a symbol table on the first
 * pass. It will thereafter populate all the other symbols
 */
export class CucinalistASTWalker extends CucinalistListener {
  private _ctxValues: Map<Object, unknown> = new Map();
  private _ingredientIdPointerMap: Map<
    string,
    RecipeIngredient | CookingStepOutput
  > = new Map();
  private _statements: CucinalistDslAST = [];
  private _walked: boolean = false;

  public get statements() {
    if (!this._walked) {
      throw new Error("Walker has not been walked yet");
    }
    return this._statements;
  }

  private _resolveInputOrOutputId(
    ingOrOutputId: string,
  ): RecipeIngredient | CookingStepOutput {
    const el = this._ingredientIdPointerMap.get(ingOrOutputId);
    if (!el) {
      throw new Error(`Unrecognized cooking step ingredient: ${ingOrOutputId}`);
    }
    return el;
  }

  enterProgram = (ctx: ProgramContext) => {
    this._statements = [];
  };

  exitProgram = (ctx: ProgramContext) => {
    for (const statementCtx of ctx.statement_list()) {
      this._statements.push(
        this._ctxValues.get(statementCtx) as CucinalistDMLStatement,
      );
    }
    this._ctxValues.set(ctx, this._statements);
    this._walked = true;
  };

  exitStatement = (ctx: StatementContext) => {
    this._ctxValues.set(ctx, this._ctxValues.get(ctx.getChild(0)));
  };

  exitContext = (ctx: ContextContext) => {
    const contextStatement: SwitchToContext = {
      type: "SwitchToContext",
      id: this._ctxValues.get(ctx._contextId) as string,
    };
    this._ctxValues.set(ctx, contextStatement);
  };

  exitCreateContext = (ctx: CreateContextContext) => {
    const createContextStatement: CreateContext = {
      type: "CreateContext",
      id: this._ctxValues.get(ctx._contextId) as string,
      parentContext: ctx._parentId
        ? (this._ctxValues.get(ctx._parentId) as string)
        : null,
      switchToContext: !!ctx.AND_SWITCH(),
    };
    this._ctxValues.set(ctx, createContextStatement);
  };

  enterRecipe = (ctx: RecipeContext) => {};

  exitRecipe = (ctx: RecipeContext) => {
    const recipeId = this._ctxValues.get(ctx._reciepeId) as string;
    const recipe: Recipe = {
      type: "Recipe",
      id: recipeId,
      name: ctx._fullname
        ? (this._ctxValues.get(ctx._fullname) as string)
        : recipeId,
      serves: this._ctxValues.get(ctx.serving())! as Recipe["serves"],
      ingredients: this._ctxValues.get(
        ctx.ingredients(),
      )! as Recipe["ingredients"],
      cookingSteps: this._ctxValues.get(ctx.steps())! as Recipe["cookingSteps"],
    };
    // console.log("Adding recipe", JSON.stringify(recipe, null, 2));
    this._ctxValues.set(ctx, recipe);
  };

  exitIngredients = (ctx: IngredientsContext) => {
    const contents: RecipeIngredient[] = [];
    for (const ingredientLineCtx of ctx.ingredientLine_list()) {
      contents.push(
        this._ctxValues.get(ingredientLineCtx)! as RecipeIngredient,
      );
    }
    this._ctxValues.set(ctx, contents);
  };

  exitSteps = (ctx: StepsContext) => {
    const contents: Recipe["cookingSteps"] = [];
    for (const stepCtx of ctx.recipeStepLine_list()) {
      contents.push(this._ctxValues.get(stepCtx)! as Recipe["cookingSteps"][0]);
    }
    this._ctxValues.set(ctx, contents);
  };

  exitRecipeStepLine = (ctx: RecipeStepLineContext) => {
    const step = this._ctxValues.get(
      ctx.cookingStep(),
    )! as Recipe["cookingSteps"][number];
    if (ctx.condition()) {
      step.preconditions = this._ctxValues.get(
        ctx.condition(),
      ) as Recipe["cookingSteps"][number]["preconditions"];
    }
    this._ctxValues.set(ctx, step);
  };

  exitCondition = (ctx: ConditionContext) => {
    const conditions: StepPrecondition[] = [];
    for (const conditionCtx of ctx.whenCondition_list()) {
      conditions.push(this._ctxValues.get(conditionCtx) as StepPrecondition);
    }
    this._ctxValues.set(ctx, conditions);
  };

  exitWhenCondition = (ctx: WhenConditionContext) => {
    const condition: StepPrecondition = {
      ingredientsNeeded: [
        this._resolveInputOrOutputId(this._ctxValues.get(ctx.id()) as string),
      ],
    };
    if (ctx.string_()) {
      condition.conditionDescription = this._ctxValues.get(
        ctx.string_(),
      ) as string;
    }
    this._ctxValues.set(ctx, condition);
  };

  exitCookingStep = (ctx: CookingStepContext) => {
    const produces = (
      (this._ctxValues.get(ctx._outputs) as string[]) || []
    ).map((outputId): CookingStepOutput => {
      const stepOutput: CookingStepOutput = {
        type: "CookingStepOutput",
        outputId,
      };
      this._ingredientIdPointerMap.set(outputId, stepOutput);
      return stepOutput;
    });
    const ingredients = (
      this._ctxValues.get(ctx._sourceIngredients)! as string[]
    ).map((id) => this._resolveInputOrOutputId(id));

    const step: CookingStep = {
      type: "CookingStep",
      processId: this._ctxValues.get(ctx._action) as string,
      ingredients,
      produces,
      preconditions: [],
      activeMinutes: 0,
      keepAnEyeMinutes: 0,
      inactiveMinutes: 0,
    };
    if (ctx.OPTIONAL()) {
      step.isOptional = true;
    }
    if (ctx._sourceOfStep) {
      step.source = this._resolveInputOrOutputId(
        this._ctxValues.get(ctx._sourceOfStep) as string,
      );
      step.ingredients.push(step.source);
    }
    if (ctx._targetOfStep) {
      step.target = this._resolveInputOrOutputId(
        this._ctxValues.get(ctx._targetOfStep) as string,
      );
      step.ingredients.push(step.target);
    }
    if (ctx._mediumOfStep) {
      step.medium = this._resolveInputOrOutputId(
        this._ctxValues.get(ctx._mediumOfStep) as string,
      );
      step.ingredients.push(step.medium);
    }
    if (ctx.transition()) {
      const transitionData = this._ctxValues.get(
        ctx.transition(),
      ) as TransitionData;
      Object.assign(step, transitionData);
    } else {
      step.activeMinutes = 1;
      if (step.produces.length === 0) {
        const stepCtx = ctx.parentCtx.parentCtx;
        const stepLineCtx = ctx.parentCtx;
        const stepIndex = stepCtx.children.indexOf(stepLineCtx);
        step.produces.push({
          type: 'CookingStepOutput',
          outputId: `step_output_${stepIndex+1}`,
        })
      }
    }

    this._ctxValues.set(ctx, step);
  };

  exitActiveMinutesTransition = (ctx: ActiveMinutesTransitionContext) => {
    const transitionData: TransitionData = {
      activeMinutes: ctx._activeMinutes.text && ctx._activeMinutes.start >= 0
        ? parseInt(ctx._activeMinutes.text)
        : 0,
      inactiveMinutes: 0,
      keepAnEyeMinutes: 0,
    };
    this._ctxValues.set(ctx, transitionData);
  };

  exitParallellMinutesTransition = (ctx: ParallellMinutesTransitionContext) => {
    const transitionData: TransitionData = {
      activeMinutes: 0,
      inactiveMinutes: ctx._parallellMinutes && ctx._parallellMinutes.start >= 0
        ? parseInt(ctx._parallellMinutes.text)
        : 0,
      keepAnEyeMinutes: 0,
    };
    this._ctxValues.set(ctx, transitionData);
  };

  exitSingleMinuteTransition = (ctx: SingleMinuteTransitionContext) => {
    const transitionData: TransitionData = {
      activeMinutes: 1,
      inactiveMinutes: 0,
      keepAnEyeMinutes: 0,
    };
    this._ctxValues.set(ctx, transitionData);
  };

  exitKeepEyelMinutesTransition = (ctx: KeepEyelMinutesTransitionContext) => {
    const transitionData: TransitionData = {
      activeMinutes: 0,
      inactiveMinutes: 0,
      keepAnEyeMinutes: ctx._keepEyelMinutes && ctx._keepEyelMinutes.start >= 0
        ? parseInt(ctx._keepEyelMinutes.text)
        : 0,
    };
    this._ctxValues.set(ctx, transitionData);
  };

  exitServing = (ctx: ServingContext) => {
    this._ctxValues.set(ctx, parseInt(ctx.INT().getText()));
  };

  exitIngredientLine = (ctx: IngredientLineContext) => {
    const ingredientId = this._ctxValues.get(ctx._ingrediendNameId) as string;

    const ingredient: RecipeIngredient = {
      type: "RecipeIngredient",
      ingredientId,
      amount: {
        value: (this._ctxValues.get(ctx.ingredientAmount()) as number) || 0,
        unit: ctx._unitOfMeasureId
          ? (this._ctxValues.get(ctx._unitOfMeasureId)! as string)
          : "item",
      },
    };
    if (
      (ingredient.amount.unit === "item" ||
        ingredient.amount.unit === "items") &&
      ingredient.amount.value === 0 &&
      this._ctxValues.get(ctx.ingredientAmount()) === undefined
    ) {
      ingredient.amount.value = 1;
    }
    if (ctx.OPTIONAL()) {
      ingredient.isOptional = true;
    }
    this._ingredientIdPointerMap.set(ingredientId, ingredient);
    this._ctxValues.set(ctx, ingredient);
  };

  exitUnitOfMeasure = (ctx: UnitOfMeasureContext) => {
    const defaultNode = ctx._defaultSymbol;
    const unitOfMeasure: UnitOfMeasure = {
      type: "UnitOfMeasure",
      name: this._ctxValues.get(ctx._name) as string,
      defaultSymbol: defaultNode
        ? (this._ctxValues.get(defaultNode) as string)
        : (this._ctxValues.get(ctx._name) as string),
      id: this._ctxValues.get(ctx._name) as string,
      measuring: this._ctxValues.get(ctx._measuring) as string,
      symbolPlural: ctx._plural
        ? (this._ctxValues.get(ctx._plural) as string)
        : undefined,
      aka: ctx._akaList ? (this._ctxValues.get(ctx._akaList) as string[]) : [],
    };
    this._ctxValues.set(ctx, unitOfMeasure);
  };

  exitSingleNumber = (ctx: SingleNumberContext) => {
    this._ctxValues.set(ctx, this._ctxValues.get(ctx.number_()));
  };

  exitIntAmount = (ctx: IntAmountContext) => {
    this._ctxValues.set(ctx, parseInt(ctx.INT().getText()));
  };

  exitFloatAmount = (ctx: FloatAmountContext) => {
    this._ctxValues.set(ctx, parseFloat(ctx.FLOAT().getText()));
  };

  exitAmountRange = (ctx: AmountRangeContext) => {
    this._ctxValues.set(ctx, this._ctxValues.get(ctx.range()));
  };

  exitRange = (ctx: RangeContext) => {
    const upper = this._ctxValues.get(ctx._upperBound) as number;
    const lower = this._ctxValues.get(ctx._lowerBound) as number;

    this._ctxValues.set(ctx, lower + (upper - lower) / 2);
  };

  exitQuotedString = (ctx: QuotedStringContext) => {
    const text = ctx.STRING().getText();
    this._ctxValues.set(ctx, text.substring(1, text.length - 1));
  };

  exitUnquotedString = (ctx: UnquotedStringContext) => {
    this._ctxValues.set(ctx, ctx.SINGLE_ID().getText());
  };

  exitIdList = (ctx: IdListContext) => {
    const ids: string[] = [];
    for (const idCtx of ctx.id_list()) {
      ids.push(this._ctxValues.get(idCtx) as string);
    }
    this._ctxValues.set(ctx, ids);
  };

  exitRecipeLine = (ctx: RecipeLineContext) => {
    const recipeId = this._ctxValues.get(ctx._recipeId) as string;
    this._ctxValues.set(ctx, recipeId);
  };

  exitCourse = (ctx: CourseContext) => {
    const course: MealCourse = {
      type: "MealCourse",
      name: this._ctxValues.get(ctx._courseName) as string,
      recipesIds: ctx
        .recipeLine_list()
        .map((recipeLine) => this._ctxValues.get(recipeLine) as string),
    };
    this._ctxValues.set(ctx, course);
  };

  exitMeal = (ctx: MealContext) => {
    if (ctx.recipeLine_list().length > 0) {
      const meal: SingleCourseMeal = {
        type: "SingleCourseMeal",
        id: this._ctxValues.get(ctx._mealId) as string,
        name: ctx._fullname
          ? (this._ctxValues.get(ctx._fullname) as string)
          : (this._ctxValues.get(ctx._mealId) as string),
        diners: this._ctxValues.get(ctx._nDiners) as number,
        recipesIds: ctx
          .recipeLine_list()
          .map((recipeLine) => this._ctxValues.get(recipeLine) as string),
      };
      this._ctxValues.set(ctx, meal);
    } else {
      const meal: MultiCourseMeal = {
        type: "MultiCourseMeal",
        id: this._ctxValues.get(ctx._mealId) as string,
        name: ctx._fullname
          ? (this._ctxValues.get(ctx._fullname) as string)
          : (this._ctxValues.get(ctx._mealId) as string),
        diners: this._ctxValues.get(ctx._nDiners) as number,
        courses: ctx
          .course_list()
          .map((course) => this._ctxValues.get(course) as MealCourse),
      };
      this._ctxValues.set(ctx, meal);
    }
  };

  exitIngredient = (ctx: IngredientContext) => {
    const ingredient: BoughtIngredient = {
      type: "BoughtIngredient",
      id: this._ctxValues.get(ctx._ingredientId) as string,
      name: (this._ctxValues.get(ctx._fullname) || this._ctxValues.get(ctx._ingredientId)) as string,
      measuredAs: this._ctxValues.get(ctx._measuredAs) as string,
      plural: ctx._plural ? this._ctxValues.get(ctx._plural) as string : undefined,
      aka: ctx._akaList ? this._ctxValues.get(ctx._akaList) as string[] : undefined,
    }
    this._ctxValues.set(ctx, ingredient);
  }

  exitInclude = (ctx: IncludeContext) => {
    const include: IncludeStatement = {
      type: "IncludeStatement",
      fileToInclude: this._ctxValues.get(ctx._fileToInclude) as string,
    };
    this._ctxValues.set(ctx, include);
  };

  exitString = (ctx: StringContext) => {
    const str = ctx.quotedString()
      ? this._ctxValues.get(ctx.quotedString())
      : this._ctxValues.get(ctx.unquotedString());
    this._ctxValues.set(ctx, str);
  };

  exitId = (ctx: IdContext) => {
    const idStr = ctx.quotedString()
      ? this._ctxValues.get(ctx.quotedString())
      : this._ctxValues.get(ctx.unquotedString());
    this._ctxValues.set(ctx, idStr);
  };

  exitStringList = (ctx: StringListContext) => {
    const strings: string[] = [];
    for (const idCtx of ctx.string__list()) {
      strings.push(this._ctxValues.get(idCtx) as string);
    }
    this._ctxValues.set(ctx, strings);
  };
}
