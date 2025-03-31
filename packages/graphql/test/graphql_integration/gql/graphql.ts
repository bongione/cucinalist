/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type BoughtIngredient = {
  __typename?: 'BoughtIngredient';
  aka: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  measuredAs: Array<MeasuringFeature>;
  name: Scalars['String']['output'];
  ontologyUrls?: Maybe<Array<Scalars['String']['output']>>;
  plural?: Maybe<Scalars['String']['output']>;
  typename: Scalars['String']['output'];
};

export type CookingStep = {
  __typename?: 'CookingStep';
  activeMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  inactiveMinutes: Scalars['Int']['output'];
  preconditions?: Maybe<Array<StepPrecondition>>;
  process: CookingTechnique;
  produces: Array<StepOutputIngredient>;
  requires: Array<StepInputIngredient>;
  semiActiveMinutes: Scalars['Int']['output'];
  typename: Scalars['String']['output'];
};

export type CookingTechnique = {
  __typename?: 'CookingTechnique';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inputPrefixesOrder?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  ontologyUrls?: Maybe<Array<Scalars['String']['output']>>;
  outputFormatString?: Maybe<Scalars['String']['output']>;
  typename: Scalars['String']['output'];
};

export type Ingredient = BoughtIngredient | Recipe;

export type Meal = {
  __typename?: 'Meal';
  courses: Array<MealCourse>;
  description?: Maybe<Scalars['String']['output']>;
  diners: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  typename: Scalars['String']['output'];
};

export type MealCourse = {
  __typename?: 'MealCourse';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  recipes: Array<Recipe>;
  typename: Scalars['String']['output'];
};

export enum MeasuringFeature {
  Count = 'count',
  Length = 'length',
  Portion = 'portion',
  Unspecified = 'unspecified',
  Volume = 'volume',
  Weight = 'weight'
}

export type MergeFactsOutcome = {
  __typename?: 'MergeFactsOutcome';
  mergedElements: Array<MergedElementType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type MergedElementType = BoughtIngredient | CookingTechnique | Meal | Recipe | UnitOfMeasure;

export type Mutation = {
  __typename?: 'Mutation';
  mergeFacts: MergeFactsOutcome;
};


export type MutationMergeFactsArgs = {
  cucinalistDsl: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  qry: Array<Array<MergedElementType>>;
};


export type QueryQryArgs = {
  qryDsl: Scalars['String']['input'];
};

export type Recipe = {
  __typename?: 'Recipe';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ingredients: Array<RecipeIngredient>;
  name: Scalars['String']['output'];
  serves: Scalars['Int']['output'];
  steps: Array<CookingStep>;
  typename: Scalars['String']['output'];
};

export type RecipeIngredient = {
  __typename?: 'RecipeIngredient';
  id: Scalars['ID']['output'];
  ingredient: Ingredient;
  quantity: Scalars['Float']['output'];
  typename: Scalars['String']['output'];
  unit: UnitOfMeasure;
};

export type StepInputIngredient = {
  __typename?: 'StepInputIngredient';
  id: Scalars['ID']['output'];
  ingredient: StepInputIngredientType;
  portionOf?: Maybe<Scalars['Float']['output']>;
  prefix?: Maybe<Scalars['String']['output']>;
  typename: Scalars['String']['output'];
};

export type StepInputIngredientType = RecipeIngredient | StepOutputIngredient;

export type StepOutputIngredient = {
  __typename?: 'StepOutputIngredient';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  typename: Scalars['String']['output'];
};

export type StepPrecondition = {
  __typename?: 'StepPrecondition';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  requiredIngredients: Array<StepInputIngredientType>;
  typename: Scalars['String']['output'];
};

export type UnitOfMeasure = {
  __typename?: 'UnitOfMeasure';
  id: Scalars['ID']['output'];
  measuring: MeasuringFeature;
  name: Scalars['String']['output'];
  ontologyUrls?: Maybe<Array<Scalars['String']['output']>>;
  plural?: Maybe<Scalars['String']['output']>;
  synonyms: Array<Scalars['String']['output']>;
  typename: Scalars['String']['output'];
};

export type ExecuteDmlMutationVariables = Exact<{
  dsl: Scalars['String']['input'];
}>;


export type ExecuteDmlMutation = { __typename?: 'Mutation', mergeFacts: { __typename?: 'MergeFactsOutcome', success: boolean, message?: string | null, mergedElements: Array<{ __typename?: 'BoughtIngredient' } | { __typename?: 'CookingTechnique' } | { __typename?: 'Meal' } | { __typename?: 'Recipe', id: string, name: string, serves: number, ingredients: Array<{ __typename?: 'RecipeIngredient', quantity: number, unit: { __typename?: 'UnitOfMeasure', id: string, name: string, synonyms: Array<string> }, ingredient: { __typename: 'BoughtIngredient', id: string, name: string } | { __typename: 'Recipe', id: string, name: string } }>, steps: Array<{ __typename?: 'CookingStep', activeMinutes: number, inactiveMinutes: number, semiActiveMinutes: number, process: { __typename?: 'CookingTechnique', id: string, name: string }, requires: Array<{ __typename?: 'StepInputIngredient', portionOf?: number | null, ingredient: { __typename?: 'RecipeIngredient', id: string, quantity: number, unit: { __typename?: 'UnitOfMeasure', id: string, name: string }, ingredient: { __typename?: 'BoughtIngredient', id: string, name: string } | { __typename?: 'Recipe', id: string, name: string } } | { __typename?: 'StepOutputIngredient', id: string, name: string } }> }> } | { __typename?: 'UnitOfMeasure' }> } };


export const ExecuteDmlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"executeDML"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dsl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergeFacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cucinalistDsl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dsl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"mergedElements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"serves"}},{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"synonyms"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BoughtIngredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"inactiveMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"semiActiveMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"process"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requires"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"portionOf"}},{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RecipeIngredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BoughtIngredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StepOutputIngredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ExecuteDmlMutation, ExecuteDmlMutationVariables>;