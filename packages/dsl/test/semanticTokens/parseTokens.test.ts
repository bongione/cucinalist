import { describe, it, expect } from "vitest";
import { parseCucinalistSemanticTokensDsl, ParsedToken } from "../../src";

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
