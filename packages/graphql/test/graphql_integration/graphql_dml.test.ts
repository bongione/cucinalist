import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb } from "../dbUtils";
import { readFileSync } from "fs";
import { join } from "path";
import { ApolloServer } from "@apollo/server";
import { cucinalistResolvers } from "../../src/data/cucinalist_resolvers";
import { graphql } from "./gql";
import { getCucinalistDMLInterpreter } from "../../src/data/cuninalistDMLInterpreter";
import { ResolversTypes } from "../../src/__generated__/cucinalist-resolvers-types";
import { MergeFactsOutcome } from "./gql/graphql";

beforeEach(cleanupDb);

afterAll(cleanupDb);

const typeDefs = readFileSync(
  join(__dirname, "../../src/cucinalist-schema.graphql"),
  {
    encoding: "utf-8",
  },
);

function getApollosServer() {
  return new ApolloServer({
    typeDefs,
    resolvers: cucinalistResolvers,
  });
}

describe("Recipes", () => {
  it("Entering a simple recipe", async () => {
    const server = getApollosServer();
    const qry = graphql(/* GraphQL */ `
      mutation executeDML($dsl: String!) {
        mergeFacts(cucinalistDsl: $dsl) {
          success
          message
          mergedElements {
            ... on Recipe {
              id
              name
              serves
              ingredients {
                unit {
                  id
                  name
                  synonyms
                }
                quantity
                ingredient {
                  __typename
                  ... on BoughtIngredient {
                    id
                    name
                  }
                  ... on Recipe {
                    id
                    name
                  }
                }
              }
              steps {
                activeMinutes
                inactiveMinutes
                semiActiveMinutes
                process {
                  id
                  name
                }
                requires {
                  portionOf
                  ingredient {
                    ... on RecipeIngredient {
                      id
                      quantity
                      unit {
                        id
                        name
                      }
                      ingredient {
                        ... on BoughtIngredient {
                          id
                          name
                        }
                        ... on Recipe {
                          id
                          name
                        }
                      }
                    }
                    ... on StepOutputIngredient {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const dmlInterpreter = await getCucinalistDMLInterpreter();
    const results = await server.executeOperation<{
      mergeFacts: MergeFactsOutcome;
    }>(
      {
        query: qry,
        variables: {
          dsl: `recipe breadSlice
      serves 1
      ingredients
        - 1 slice bread;
      steps
        - serve bread;`,
        },
      },
      {
        contextValue: {
          dmlInterpreter,
        },
      },
    );
    expect(results.body.kind).toBe("single");
    if (results.body.kind === "single") {
      expect(results.body.singleResult.errors).toBeUndefined();
      expect(results.body.singleResult.data).toBeDefined();

      expect(results.body.singleResult.data!.mergeFacts.success).toBeTruthy();
      expect(
        results.body.singleResult.data!.mergeFacts.mergedElements.length,
      ).toBe(1);
      expect(
        results.body.singleResult.data!.mergeFacts.mergedElements[0],
      ).toMatchObject({
        id: "breadSlice",
        name: "breadSlice",
        serves: 1,
        ingredients: [{
          ingredient: {
            id: "bread",
            name: "bread",
          },
          quantity: 1,
          unit: {
            id: "slice",
            name: "slice",
            synonyms: [],
          },
        }],
        steps: [
          {
            activeMinutes: 1,
            inactiveMinutes: 0,
            semiActiveMinutes: 0,
            process: {
              id: "serve",
              name: "serve",
            },
            requires: [{
              portionOf: 1,
              ingredient: {
                quantity: 1,
                ingredient: {
                  id: "bread",
                  name: "bread",
                }
              },
            }],
          },
        ],
      });
    }
  });
});
