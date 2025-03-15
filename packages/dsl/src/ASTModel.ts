/**
 * THis is the abstract syntax model of data entered to model meals and recipes
 * in Cucinalist's DSL.
 *
 * Wherever there is an ID field, this refers to a global symbol table, that points
 * to recipes, ingredients, output of cooking steps and units of measure.
 *
 */

export interface UnitOfMeasure {
  type: "UnitOfMeasure";
  id: string;
  name: string;
  defaultSymbol: string;
  symbolPlural?: string;
  measuring: string;
  aka?: string[];
}

export interface RecipeIngredient {
  type: "RecipeIngredient";
  /** Could be either a recipe or a store bought ingredient */
  ingredientId: string;
  isOptional?: boolean;
  amount: {
    value: number;
    unit: string;
  };
}

export type StepInput = RecipeIngredient | CookingStepOutput;

export interface StepPrecondition {
  /** Could be either a recipe or a store bought ingredient */
  ingredientsNeeded: StepInput[];
  conditionDescription?: string;
}

export interface CookingStepOutput {
  type: "CookingStepOutput";
  outputId: string;
}

export interface CookingStep {
  type: "CookingStep";
  processId: string;
  preconditions: StepPrecondition[];
  ingredients: StepInput[];
  source?: StepInput;
  target?: StepInput;
  medium?: StepInput;
  activeMinutes: number;
  keepAnEyeMinutes: number;
  inactiveMinutes: number;
  produces: CookingStepOutput[];
  isOptional?: boolean;
}

export interface Recipe {
  type: "Recipe";
  id: string;
  name: string;
  serves: number;
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
}

interface BaseMeal {
  id: string;
  name: string;
  diners: number;
}

export interface SingleCourseMeal extends BaseMeal {
  type: "SingleCourseMeal";
  recipesIds: string[];
}

export interface MealCourse {
  type: "MealCourse";
  name: string;
  recipesIds: string[];
}

export interface MultiCourseMeal extends BaseMeal {
  type: "MultiCourseMeal";
  courses: MealCourse[];
}

export type Meal = SingleCourseMeal | MultiCourseMeal;

export interface CreateContext {
  type: "CreateContext";
  id: string;
  parentContext: string | null;
  switchToContext: boolean;
}

export interface SwitchToContext {
  type: "SwitchToContext";
  id: string;
}

export interface IncludeStatement {
  type: "IncludeStatement";
  fileToInclude: string;
}

export type CucinalistDMLStatement =
  | UnitOfMeasure
  | Recipe
  | Meal
  | CreateContext
  | IncludeStatement
  | SwitchToContext;


export type CucinalistDslAST = CucinalistDMLStatement[];
