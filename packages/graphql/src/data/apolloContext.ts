import type {PrismaClient} from './dao/extendedPrisma'
import {ExecutionContext} from './dmlTypes'

export {prisma} from './dao/extendedPrisma';

export interface ApolloContext {
  prisma: PrismaClient;
  resolverContext: ExecutionContext;
}
