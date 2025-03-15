import { describe, expect, it } from "vitest";
import { parseCucinalistSemanticTokensDsl, ParsedToken } from "../../src";

describe("recipes", () => {
  it("Simple recipe", () => {
    const dsl = `recipe hamSandwich fullName 'Ham sandwich'
    serves 1
    ingredients
        - 1-2 slices bread;
        - 1 slice ham;
        - butter;
    steps
        - spread butter on bread -1-> butteredBread;
        - put ham on butteredBread -1-> sandwich;
        - serve sandwich -> hamSandwich;`;
    const tokens = parseCucinalistSemanticTokensDsl(dsl);

    const expected: ParsedToken[] = [
      {
        // recipe
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 6,
        tokenModifiers: [],
      },
      {
        // hamSandwich
        tokenType: "type",
        line: 0,
        startCharacter: 7,
        length: 11,
        tokenModifiers: ["declaration"],
      },
      {
        // fullName
        tokenType: "keyword",
        line: 0,
        startCharacter: 19,
        length: 8,
        tokenModifiers: [],
      },
      {
        // 'Ham sandwich'
        tokenType: "label",
        line: 0,
        startCharacter: 29,
        length: 12,
        tokenModifiers: [],
      },
      {
        // serves
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 6,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        line: 1,
        startCharacter: 11,
        length: 1,
        tokenModifiers: [],
      },
      {
        // ingredients
        tokenType: "keyword",
        line: 2,
        startCharacter: 4,
        length: 11,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 3,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // 1
        tokenType: "number",
        line: 3,
        startCharacter: 10,
        length: 1,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 3,
        startCharacter: 11,
        length: 1,
        tokenModifiers: [],
      },
      {
        // 2
        tokenType: "number",
        line: 3,
        startCharacter: 12,
        length: 1,
        tokenModifiers: [],
      },
      {
        // slices
        tokenType: "reference",
        tokenModifiers: ["external", "unitOfMeasure"],
        length: 6,
        line: 3,
        startCharacter: 14,
      },
      {
        // bread
        tokenType: "reference",
        tokenModifiers: ["external", "ingredient"],
        length: 5,
        line: 3,
        startCharacter: 21,
      },
      {
        // -
        tokenType: "operator",
        line: 4,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // 1
        tokenType: "number",
        line: 4,
        startCharacter: 10,
        length: 1,
        tokenModifiers: [],
      },
      {
        // slice
        length: 5,
        line: 4,
        startCharacter: 12,
        tokenType: "reference",
        tokenModifiers: ["external", "unitOfMeasure"],
      },
      {
        // ham
        length: 3,
        line: 4,
        startCharacter: 18,
        tokenType: "reference",
        tokenModifiers: ["external", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        line: 5,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // butter
        length: 6,
        line: 5,
        startCharacter: 10,
        tokenType: "reference",
        tokenModifiers: ["external", "ingredient"],
      },
      {
        // steps
        tokenType: "keyword",
        line: 6,
        startCharacter: 4,
        length: 5,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 7,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // spread
        tokenType: "reference",
        line: 7,
        length: 6,
        startCharacter: 10,
        tokenModifiers: ["external", "cookingMethod"],
      },
      {
        // butter
        tokenType: "reference",
        length: 6,
        line: 7,
        startCharacter: 17,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // on
        tokenType: "keyword",
        length: 2,
        line: 7,
        startCharacter: 24,
        tokenModifiers: [],
      },
      {
        // bread
        tokenType: "reference",
        length: 5,
        line: 7,
        startCharacter: 27,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        length: 1,
        line: 7,
        startCharacter: 33,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        length: 1,
        line: 7,
        startCharacter: 34,
        tokenModifiers: [],
      },
      {
        // ->
        tokenType: "operator",
        length: 2,
        line: 7,
        startCharacter: 35,
        tokenModifiers: [],
      },
      {
        // butteredBread
        tokenType: "variable",
        length: 13,
        line: 7,
        startCharacter: 38,
        tokenModifiers: ["readonly", "declaration", "internal", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        line: 8,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // put
        tokenType: "reference",
        line: 8,
        length: 3,
        startCharacter: 10,
        tokenModifiers: ["external", "cookingMethod"],
      },
      {
        // ham
        tokenType: "reference",
        length: 3,
        line: 8,
        startCharacter: 14,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // on
        tokenType: "keyword",
        length: 2,
        line: 8,
        startCharacter: 18,
        tokenModifiers: [],
      },
      {
        // butteredBread
        tokenType: "reference",
        length: 13,
        line: 8,
        startCharacter: 21,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        length: 1,
        line: 8,
        startCharacter: 35,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        length: 1,
        line: 8,
        startCharacter: 36,
        tokenModifiers: [],
      },
      {
        // ->
        tokenType: "operator",
        length: 2,
        line: 8,
        startCharacter: 37,
        tokenModifiers: [],
      },
      {
        // sandwich
        tokenType: "variable",
        length: 8,
        line: 8,
        startCharacter: 40,
        tokenModifiers: ["readonly", "declaration", "internal", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        line: 9,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // serve
        tokenType: "reference",
        line: 9,
        length: 5,
        startCharacter: 10,
        tokenModifiers: ["external", "cookingMethod"],
      },
      {
        // sandwich
        tokenType: "reference",
        line: 9,
        length: 8,
        startCharacter: 16,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // ->
        tokenType: "operator",
        line: 9,
        length: 2,
        startCharacter: 25,
        tokenModifiers: [],
      },
      {
        // hamSandwich
        tokenType: "variable",
        line: 9,
        length: 11,
        startCharacter: 28,
        tokenModifiers: ["readonly", "declaration", "internal", "ingredient"],
      },
    ];
    expect(tokens).toMatchObject(expected);
  });

  it("Recipe with step of parallel duration", () => {
    const dsl = `recipe test
    serves 1
    ingredients
        - butter;
    steps
        - spread butter -[1]-> butteredBread;
    `;
    const tokens = parseCucinalistSemanticTokensDsl(dsl);
    const expected: ParsedToken[] = [
      {
        // recipe
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 6,
        tokenModifiers: [],
      },
      {
        // test
        tokenType: "type",
        line: 0,
        startCharacter: 7,
        length: 4,
        tokenModifiers: ["declaration"],
      },
      {
        // serves
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 6,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        line: 1,
        startCharacter: 11,
        length: 1,
        tokenModifiers: [],
      },
      {
        // ingredients
        tokenType: "keyword",
        line: 2,
        startCharacter: 4,
        length: 11,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 3,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // butter
        length: 6,
        line: 3,
        startCharacter: 10,
        tokenType: "reference",
        tokenModifiers: ["external", "ingredient"],
      },
      {
        // steps
        tokenType: "keyword",
        line: 4,
        startCharacter: 4,
        length: 5,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 5,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // spread
        tokenType: "reference",
        line: 5,
        length: 6,
        startCharacter: 10,
        tokenModifiers: ["external", "cookingMethod"],
      },
      {
        // butter
        tokenType: "reference",
        length: 6,
        line: 5,
        startCharacter: 17,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // -[
        tokenType: "operator",
        length: 2,
        line: 5,
        startCharacter: 24,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        length: 1,
        line: 5,
        startCharacter: 26,
        tokenModifiers: [],
      },
      {
        // ]->
        tokenType: "operator",
        length: 3,
        line: 5,
        startCharacter: 27,
        tokenModifiers: [],
      },
      {
        // butteredBread
        tokenType: "variable",
        length: 13,
        line: 5,
        startCharacter: 31,
        tokenModifiers: ["readonly", "declaration", "internal", "ingredient"],
      },
    ];

    expect(tokens).toMatchObject(expected);
  });

  it("Recipe with condition and keepEye time", () => {
    const dsl = `
    recipe test
      serves 1
      ingredients
        - butter;
      steps
        - when butter 'soft', butter
          - spread butter -(90)-> butteredBread;
    `;
    const tokens = parseCucinalistSemanticTokensDsl(dsl);
    const expected: ParsedToken[] = [
      {
        // recipe
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 6,
        tokenModifiers: [],
      },
      {
        // test
        tokenType: "type",
        line: 1,
        startCharacter: 11,
        length: 4,
        tokenModifiers: ["declaration"],
      },
      {
        // serves
        tokenType: "keyword",
        line: 2,
        startCharacter: 6,
        length: 6,
        tokenModifiers: [],
      },
      {
        // 1
        tokenType: "number",
        line: 2,
        startCharacter: 13,
        length: 1,
        tokenModifiers: [],
      },
      {
        // ingredients
        tokenType: "keyword",
        line: 3,
        startCharacter: 6,
        length: 11,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 4,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // butter
        length: 6,
        line: 4,
        startCharacter: 10,
        tokenType: "reference",
        tokenModifiers: ["external", "ingredient"],
      },
      {
        // steps
        tokenType: "keyword",
        line: 5,
        startCharacter: 6,
        length: 5,
        tokenModifiers: [],
      },
      {
        // -
        tokenType: "operator",
        line: 6,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // when
        tokenType: "keyword",
        line: 6,
        startCharacter: 10,
        length: 4,
        tokenModifiers: [],
      },
      {
        // butter
        tokenType: "reference",
        length: 6,
        line: 6,
        startCharacter: 15,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // 'soft'
        tokenType: "label",
        length: 4,
        line: 6,
        startCharacter: 23,
        tokenModifiers: [],
      },
      {
        // ,
        tokenType: "operator",
        length: 1,
        line: 6,
        startCharacter: 28,
        tokenModifiers: [],
      },
      {
        // butter
        tokenType: "reference",
        length: 6,
        line: 6,
        startCharacter: 30,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // -
        tokenType: "operator",
        line: 7,
        startCharacter: 10,
        length: 1,
        tokenModifiers: ["declaration"],
      },
      {
        // spread
        tokenType: "reference",
        line: 7,
        length: 6,
        startCharacter: 12,
        tokenModifiers: ["external", "cookingMethod"],
      },
      {
        // butter
        tokenType: "reference",
        length: 6,
        line: 7,
        startCharacter: 19,
        tokenModifiers: ["internal", "ingredient"],
      },
      {
        // -(
        tokenType: "operator",
        length: 2,
        line: 7,
        startCharacter: 26,
        tokenModifiers: [],
      },
      {
        // 90
        tokenType: "number",
        length: 2,
        line: 7,
        startCharacter: 28,
        tokenModifiers: [],
      },
      {
        // )->
        tokenType: "operator",
        length: 3,
        line: 7,
        startCharacter: 30,
        tokenModifiers: [],
      },
      {
        // butteredBread
        tokenType: "variable",
        length: 13,
        line: 7,
        startCharacter: 34,
        tokenModifiers: ["readonly", "declaration", "internal", "ingredient"],
      },
    ];
    expect(tokens).toMatchObject(expected);
  });
});
