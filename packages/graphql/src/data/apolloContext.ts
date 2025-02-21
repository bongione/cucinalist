import {PrismaClient} from '../__generated__/prismaClient'
import {ExecutionContext} from './dmlTypes'

export const prisma = new PrismaClient()

export interface ApolloContext {
  prisma: PrismaClient;
  resolverContext: ExecutionContext;
}
