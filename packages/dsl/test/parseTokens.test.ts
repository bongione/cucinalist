import { describe, it, expect } from "vitest";
import { parseCucinalistSemanticTokensDsl, ParsedToken } from "../src";

describe("Context tokens", () => {
  it("Use context", () => {
    const dsl = `context test`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(2);
    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 7,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 8,
        length: 4,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });

  it("Two lines", () => {
    const dsl = ` context   test1
    context     test2`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(4);

    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 1,
        length: 7,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 11,
        length: 5,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 7,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 1,
        startCharacter: 16,
        length: 5,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });

  it("Create context no parent and no switch", () => {
    const dsl = `create context test`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(2);
    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 14,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 15,
        length: 4,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });

  it("Create context with parent and no switch", () => {
    const dsl = `create context test PaReNt public`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(4);
    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 14,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 15,
        length: 4,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 20,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 27,
        length: 6,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });

  it("Create context with no parent and switch", () => {
    const dsl = `create context and SWITCH rotten`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(2);
    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 25,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 26,
        length: 6,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });

  it("Create context with parent and switch", () => {
    const dsl = `create context and SWITCH
      rotten
      parent public`;
    const parsed = parseCucinalistSemanticTokensDsl(dsl);
    expect(parsed.length).toBe(4);
    const expected: ParsedToken[] = [
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 25,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 1,
        startCharacter: 6,
        length: 6,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 2,
        startCharacter: 6,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 2,
        startCharacter: 13,
        length: 6,
        tokenModifiers: ["readonly"],
      },
    ];
    expect(parsed).toMatchObject(expected);
  });
});

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
        tokenType: "keyword",
        line: 0,
        startCharacter: 0,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 7,
        length: 11,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 0,
        startCharacter: 19,
        length: 8,
        tokenModifiers: [],
      },
      {
        tokenType: "label",
        line: 0,
        startCharacter: 28,
        length: 14,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "number",
        line: 1,
        startCharacter: 11,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 2,
        startCharacter: 4,
        length: 11,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 3,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'number',
        line: 3,
        startCharacter: 10,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        line: 3,
        startCharacter: 11,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'number',
        line: 3,
        startCharacter: 12,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 3,
        startCharacter: 14,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 5,
        line: 3,
        startCharacter: 21,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 3,
        startCharacter: 26,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 4,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'number',
        line: 4,
        startCharacter: 10,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 5,
        line: 4,
        startCharacter: 12,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 3,
        line: 4,
        startCharacter: 18,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 4,
        startCharacter: 21,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 5,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 5,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 5,
        startCharacter: 16,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 6,
        startCharacter: 4,
        length: 5,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 7,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        line: 7,
        length: 6,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 7,
        startCharacter: 17,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 2,
        line: 7,
        startCharacter: 24,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 5,
        line: 7,
        startCharacter: 27,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'operator',
        length: 1,
        line: 7,
        startCharacter: 33,
        tokenModifiers: [],
      },{
        tokenType: 'number',
        length: 1,
        line: 7,
        startCharacter: 34,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        length: 2,
        line: 7,
        startCharacter: 35,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 13,
        line: 7,
        startCharacter: 38,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 7,
        startCharacter: 51,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 8,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        line: 8,
        length: 3,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 3,
        line: 8,
        startCharacter: 14,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 2,
        line: 8,
        startCharacter: 18,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 13,
        line: 8,
        startCharacter: 21,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'operator',
        length: 1,
        line: 8,
        startCharacter: 35,
        tokenModifiers: [],
      },{
        tokenType: 'number',
        length: 1,
        line: 8,
        startCharacter: 36,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        length: 2,
        line: 8,
        startCharacter: 37,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 8,
        line: 8,
        startCharacter: 40,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 8,
        startCharacter: 48,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 9,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        line: 9,
        length: 5,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        line: 9,
        length: 8,
        startCharacter: 16,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'operator',
        line: 9,
        length: 2,
        startCharacter: 25,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        line: 9,
        length: 11,
        startCharacter: 28,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 9,
        startCharacter: 39,
        tokenModifiers: [],
      }
    ];
    expect(tokens).toMatchObject(expected);
  });

  it('Recipe with step of parallel duration', () => {
    const dsl = `recipe test
    serves 1
    ingredients
        - butter;
    steps
        - spread butter -[1]-> butteredBread;
    `;
    const tokens = parseCucinalistSemanticTokensDsl(dsl);
    const expected: ParsedToken[] = [{
      tokenType: "keyword",
      line: 0,
      startCharacter: 0,
      length: 6,
      tokenModifiers: [],
    },
      {
        tokenType: "variable",
        line: 0,
        startCharacter: 7,
        length: 4,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 1,
        startCharacter: 4,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "number",
        line: 1,
        startCharacter: 11,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 2,
        startCharacter: 4,
        length: 11,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 3,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 3,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 3,
        startCharacter: 16,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 4,
        startCharacter: 4,
        length: 5,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 5,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        line: 5,
        length: 6,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 5,
        startCharacter: 17,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'operator',
        length: 2,
        line: 5,
        startCharacter: 24,
        tokenModifiers: [],
      },{
        tokenType: 'number',
        length: 1,
        line: 5,
        startCharacter: 26,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        length: 3,
        line: 5,
        startCharacter: 27,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 13,
        line: 5,
        startCharacter: 31,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 5,
        startCharacter: 44,
        tokenModifiers: [],
      }
    ];

    expect(tokens).toMatchObject(expected);
  })

  it('Recipe with condition and keepEye time', () => {
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
    const expected: ParsedToken[] = [{
      tokenType: "keyword",
      line: 1,
      startCharacter: 4,
      length: 6,
      tokenModifiers: [],
    },
      {
        tokenType: "variable",
        line: 1,
        startCharacter: 11,
        length: 4,
        tokenModifiers: ["readonly"],
      },
      {
        tokenType: "keyword",
        line: 2,
        startCharacter: 6,
        length: 6,
        tokenModifiers: [],
      },
      {
        tokenType: "number",
        line: 2,
        startCharacter: 13,
        length: 1,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 3,
        startCharacter: 6,
        length: 11,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 4,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 4,
        startCharacter: 10,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 4,
        startCharacter: 16,
        tokenModifiers: [],
      },
      {
        tokenType: "keyword",
        line: 5,
        startCharacter: 6,
        length: 5,
        tokenModifiers: [],
      },
      {
        tokenType: "operator",
        line: 6,
        startCharacter: 8,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: "keyword",
        line: 6,
        startCharacter: 10,
        length: 4,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 6,
        startCharacter: 15,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'label',
        length: 6,
        line: 6,
        startCharacter: 22,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        length: 1,
        line: 6,
        startCharacter: 28,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 6,
        startCharacter: 30,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: "operator",
        line: 7,
        startCharacter: 10,
        length: 1,
        tokenModifiers: ['declaration'],
      },
      {
        tokenType: 'variable',
        line: 7,
        length: 6,
        startCharacter: 12,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'variable',
        length: 6,
        line: 7,
        startCharacter: 19,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'operator',
        length: 2,
        line: 7,
        startCharacter: 26,
        tokenModifiers: [],
      },{
        tokenType: 'number',
        length: 2,
        line: 7,
        startCharacter: 28,
        tokenModifiers: [],
      },
      {
        tokenType: 'operator',
        length: 3,
        line: 7,
        startCharacter: 30,
        tokenModifiers: [],
      },
      {
        tokenType: 'variable',
        length: 13,
        line: 7,
        startCharacter: 34,
        tokenModifiers: ['readonly'],
      },
      {
        tokenType: 'keyword',
        length: 1,
        line: 7,
        startCharacter: 47,
        tokenModifiers: [],
      }
    ];
    expect(tokens).toMatchObject(expected);
  });
});
