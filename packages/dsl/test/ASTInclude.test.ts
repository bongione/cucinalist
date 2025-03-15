import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl} from "../src";

describe('Include AST', () => {
  it('Simple include', () => {
    const dsl = `include 'inThisFolder.cucinalist'`;
    const expectedAST: CucinalistDslAST = [{
      type: 'IncludeStatement',
      fileToInclude: 'inThisFolder.cucinalist'
    }]
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });
});
