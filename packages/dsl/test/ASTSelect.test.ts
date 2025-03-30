import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl, SelectStatement } from "../src";

describe("ASTSelect", () => {
  it('Select all recipes', () => {
    const dsl = `select Recipe;`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "Recipe",
      conditions: [],
    } as SelectStatement);
  });

  it('Select all meals', () => {
    const dsl = `select Meal;`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "Meal",
      conditions: [],
    } as SelectStatement);
  });

  it('Select all ingredients', () => {
    const dsl = `select Ingredient;`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "Ingredient",
      conditions: [],
    } as SelectStatement);
  });

  it('Select all units of measure', () => {
    const dsl = `select UnitOfMeasure;`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "UnitOfMeasure",
      conditions: [],
    } as SelectStatement);
  });

  it('Select all recipes with conditions', () => {
    const dsl = `select Recipe if id = pasta and name LIKE 'aglio';`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "Recipe",
      conditions: [
        {
          type: "SelectCondition",
          field: "id",
          operator: "=",
          value: "pasta",
        },
        {
          type: "SelectCondition",
          field: "name",
          operator: "LIKE",
          value: "aglio",
        },
      ],
    } as SelectStatement);
  });

  it('Select all meals with conditions', () => {
    const dsl = `select Meal if name != 'Salad';`;
    const ast = parseCucinalistDsl(dsl) as CucinalistDslAST;
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: "SelectStatement",
      target: "Meal",
      conditions: [
        {
          type: "SelectCondition",
          field: "name",
          operator: "!=",
          value: "Salad",
        },
      ],
    } as SelectStatement);
  });

  it('Errror on unkown target', () => {
    const dsl = `select UnknownType;`;
    expect(() => {
      parseCucinalistDsl(dsl);
    }).toThrowError(`Unknown target type 'UnknownType'`);
  });
});
