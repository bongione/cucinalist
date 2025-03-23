import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import { join } from "path";
import { cucinalistResolvers } from "./data/cucinalist_resolvers";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createAndInitExecutionContextManager } from "./data/executionContext";
import { getCucinalistDMLInterpreter } from "./data/cuninalistDMLInterpreter";

const typeDefs = readFileSync(join(__dirname, "./cheffie-schema.graphql"), {
  encoding: "utf-8",
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: cucinalistResolvers,
});

async function startServer() {
  const { url } = await startStandaloneServer(apolloServer, {
    context: async () => {
      const dmlInterpreter = await getCucinalistDMLInterpreter();
      return { dmlInterpreter };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
}

startServer();
