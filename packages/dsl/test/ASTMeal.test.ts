import { describe, it, expect } from "vitest";
import { CucinalistDslAST, parseCucinalistDsl } from "../src";

describe("ASTMeal", () => {
  it("Minimal single course meal", () => {
    const dsl = `meal
      diners 6
      recipes
      - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "SingleCourseMeal",
        id: undefined,
        name: undefined,
        diners: 6,
        recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it("Meal without courses", () => {
    const dsl = `meal tonight
      diners 6
      recipes
      - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "SingleCourseMeal",
        id: "tonight",
        name: "tonight",
        diners: 6,
        recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it("Meal without courses and fullname", () => {
    const dsl = `meal tonight fullname 'Tonight dinner'
      diners 6
      recipes
      - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "SingleCourseMeal",
        id: "tonight",
        name: "Tonight dinner",
        diners: 6,
        recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });


  it("Minimal meal with courses", () => {
    const dsl = `meal
      diners 3
      course starter
          - hamSandwich;
      course Main
          - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "MultiCourseMeal",
        id: undefined,
        name: undefined,
        diners: 3,
        courses: [
          {
            type: "MealCourse",
            name: "starter",
            recipesIds: ["hamSandwich"],
          },
          {
            type: "MealCourse",
            name: "Main",
            recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
          },
        ],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it("Meal with courses", () => {
    const dsl = `meal tomorrowNight
      diners 3
      course starter
          - hamSandwich;
      course Main
          - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "MultiCourseMeal",
        id: "tomorrowNight",
        name: "tomorrowNight",
        diners: 3,
        courses: [
          {
            type: "MealCourse",
            name: "starter",
            recipesIds: ["hamSandwich"],
          },
          {
            type: "MealCourse",
            name: "Main",
            recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
          },
        ],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });

  it("Meal with courses and fullname", () => {
    const dsl = `meal tomorrowNight fullname 'Tomorrow night dinner'
      diners 3
      course starter
          - hamSandwich;
      course Main
          - SpaghettiAglioOlioEPeperoncino;`;
    const expectedAST: CucinalistDslAST = [
      {
        type: "MultiCourseMeal",
        id: "tomorrowNight",
        name: "Tomorrow night dinner",
        diners: 3,
        courses: [
          {
            type: "MealCourse",
            name: "starter",
            recipesIds: ["hamSandwich"],
          },
          {
            type: "MealCourse",
            name: "Main",
            recipesIds: ["SpaghettiAglioOlioEPeperoncino"],
          },
        ],
      },
    ];
    expect(parseCucinalistDsl(dsl)).toMatchObject(expectedAST);
  });
});
