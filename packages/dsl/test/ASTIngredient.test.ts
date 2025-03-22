import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl } from "../src";

describe("ASTIngredient", () => {
  it('Simple ingredient', ()=> {
    const dsl = `ingredient butter measuredAs weight`;
    const expectedAST: CucinalistDslAST = [{
      type: 'BoughtIngredient',
      id: 'butter',
      name: 'butter',
      measuredAs: 'weight',
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it('Ingredient with all fields defined', ()=> {
    const dsl = `ingredient butter fullname 'butter stick'
    plural 'butter sticks'
    aka 'butter sticks', 'fat of milk'
    measuredAs weight`;
    const expectedAST: CucinalistDslAST = [{
      type: 'BoughtIngredient',
      id: 'butter',
      name: 'butter stick',
      plural: 'butter sticks',
      aka: ['butter sticks', 'fat of milk'],
      measuredAs: 'weight',
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });
});
