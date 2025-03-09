import { describe, it, expect} from "vitest";
import { parseCucinalistDsl, UnitOfMeasure } from "../src";

describe("Simple units of measure", () => {
  it("Grams", () => {
    const dsl = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    aka gram, grams
}`;
    const parsed = parseCucinalistDsl(dsl);
    expect(parsed.length).toBe(1);
    const expectedUnit: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "gram",
      defaultSymbol: "g",
      aka: ["gram", "grams"],
      measuring: "weight",
      name: "gram",
    }
    expect(parsed[0]).toMatchObject(expectedUnit);
  });

  it('All fields filled in', () => {
    const dsl = `unitOfMeasure gram {
    measuring weight
    defaultSymbol g
    plural grams
    aka gram, grams, g
}`;
    const parsed = parseCucinalistDsl(dsl);
    expect(parsed.length).toBe(1);
    const expectedUnit: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "gram",
      defaultSymbol: "g",
      symbolPlural: 'grams',
      aka: ["gram", "grams", "g"],
      measuring: "weight",
      name: "gram",
    }
    expect(parsed[0]).toMatchObject(expectedUnit);
  });

  it("Minimal set of fields", () => {
    const dsl = `unitOfMeasure item {
    measuring count
    defaultSymbol
}`;
    const parsed = parseCucinalistDsl(dsl);
    expect(parsed.length).toBe(1);
    const expectedUnit: UnitOfMeasure = {
      type: "UnitOfMeasure",
      id: "item",
      defaultSymbol: "item",
      measuring: "count",
      name: "item",
    }
    expect(parsed[0]).toMatchObject(expectedUnit);
  });
});
