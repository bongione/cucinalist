import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb } from "./dbUtils";
import { getCucinalistDMLInterpreter } from "../src/data/cuninalistDMLInterpreter";

beforeEach(cleanupDb);

afterAll(cleanupDb);

describe("Retrieving recipes", () => {
  it("Should be empty initially", async () => {
    const dsl = `select Recipe;`;
    const interpreter = await getCucinalistDMLInterpreter();

    const results = await interpreter.executeDQL(dsl);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(0);
  });

  it("Should retrieve a single recipe with only one recipe in the db", async () => {
    const dsl = `select Recipe;`;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(`recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;`);

    const results = await interpreter.executeDQL(dsl);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(1);
    expect(results[0][0]).toMatchObject({
      gblId: "breadSlice",
      serves: 1,
    });
  });

  it("Should retrieve two recipes with only two recipes in the db", async () => {
    const dsl = `select Recipe;`;
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(`recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
    recipe rawPasta
      serves 2
      ingredients
        - 100 g pasta;
      steps
        - serve pasta -> rawPasta;
        `);

    const results = await interpreter.executeDQL(dsl);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(2);
    expect(results[0][0]).toMatchObject({
      gblId: "breadSlice",
      serves: 1,
    });
    expect(results[0][1]).toMatchObject({
      gblId: "rawPasta",
      serves: 2,
    });
  });

  it("Should retrieve a single recipe with only two recipes in the db", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(`recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
    recipe rawPasta
      serves 2
      ingredients
        - 100 g pasta;
      steps
        - serve pasta -> rawPasta;
        `);

    const results = await interpreter.executeDQL(`
      select recipe if id = rawPasta;
    `);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(1);
    expect(results[0][0]).toMatchObject({
      gblId: "rawPasta",
      serves: 2,
    });
  });

  it("Should retrieve a single named recipe with only two recipes in the db", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(`recipe breadSlice fullName 'slice of bread'
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
    recipe rawPasta
      serves 2
      ingredients
        - 100 g pasta;
      steps
        - serve pasta -> rawPasta;
        `);

    const results = await interpreter.executeDQL(`
      select recipe if name = 'slice of bread';
    `);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(1);
    expect(results[0][0]).toMatchObject({
      gblId: "breadSlice",
      serves: 1,
    });
  });

  it("Should retrieve two recipes sharing letter with only two recipes in the db", async () => {
    const interpreter = await getCucinalistDMLInterpreter();
    await interpreter.executeDML(`recipe breadSlice fullName 'slice of bread'
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;
        
    recipe rawPasta
      serves 2
      ingredients
        - 100 g pasta;
      steps
        - serve pasta -> rawPasta;
        `);

    const results = await interpreter.executeDQL(`
      select recipe if name like 'a';
    `);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveLength(2);
  });
});
