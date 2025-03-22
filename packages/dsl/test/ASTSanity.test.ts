import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl } from "../src";
import { CucinalistASTWalker } from "../src/cucinalistASTWalker";

describe("Sanity checks", () => {
  it("You need to walk first", () => {
    const walker = new CucinalistASTWalker();
    expect(() => walker.statements).toThrowError(
      "Walker has not been walked yet",
    );
  });

  it("Should throw on unrecognized input ingredient", () => {
    const dsl = `recipe test
      serves 1
      ingredients
          - butter;
      steps
          - spread oil -[]-> butteredBread;`;
    expect(() => parseCucinalistDsl(dsl)).toThrowError(
      "Unrecognized cooking step ingredient: oil",
    );
  });
});
