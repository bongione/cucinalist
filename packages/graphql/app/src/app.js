import { ApolloServer } from '@apollo/server';
import { readFileSync } from "fs";
import { join } from "path";
import { cucinalistResolvers } from "./data/cucinalist_resolvers";
import { startStandaloneServer } from "@apollo/server/standalone";
import { prisma } from './data/apolloContext';
import { createAndInitExecutionContextManager } from './data/executionContext';
const typeDefs = readFileSync(join(__dirname, "./cheffie-schema.graphql"), { encoding: "utf-8" });
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers: cucinalistResolvers,
});
async function startServer() {
    const executionContext = await createAndInitExecutionContextManager(prisma);
    const { url } = await startStandaloneServer(apolloServer, {
        context: async () => ({
            prisma, // Inject Prisma Client into context
            resolverContext: executionContext
        }),
    });
    console.log(`🚀 Server ready at ${url}`);
}
startServer();
