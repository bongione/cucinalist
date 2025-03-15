import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl } from "../src";

describe("Switch to context", () => {
  it('Switch to public context', () => {
    const dsl = 'context public';
    const expectedAST: CucinalistDslAST = [{
      type: 'SwitchToContext',
      id: 'public',
    }]
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it('Switch to private context', () => {
    const dsl = 'context \'test user\'';
    const expectedAST: CucinalistDslAST = [{
      type: 'SwitchToContext',
      id: 'test user',
    }]
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });
});

describe('Create context', () => {
  it('Minimal version', () => {
    const dsl = `create ConTEXT testContext`;
    const expectedAST: CucinalistDslAST = [{
      type: 'CreateContext',
      id: 'testContext',
      parentContext: null,
      switchToContext: false
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it('With switch', () => {
    const dsl = `create ConTEXT and SWITCH testContext`;
    const expectedAST: CucinalistDslAST = [{
      type: 'CreateContext',
      id: 'testContext',
      parentContext: null,
      switchToContext: true
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it('With parent context', () => {
    const dsl = `create ConTEXT testContext PARENT public`;
    const expectedAST: CucinalistDslAST = [{
      type: 'CreateContext',
      id: 'testContext',
      parentContext: 'public',
      switchToContext: false
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it('With parent context and switch', () => {
    const dsl = `create ConTEXT and SWITCH testContext PARENT public`;
    const expectedAST: CucinalistDslAST = [{
      type: 'CreateContext',
      id: 'testContext',
      parentContext: 'public',
      switchToContext: true
    }];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });
});
