import {PrismaClient} from './extendedPrisma'
import {PrismaInTx, PrismaProvider, PrismaTxProvider} from '../dmlTypes'

export function createPrismaProvider(prisma: PrismaClient): PrismaTxProvider {
  const _prisma = prisma;
  let _prismaInTx: PrismaInTx | null = null;

  return {
    prisma: () => {
      return _prismaInTx || _prisma;
    },
    tx: async <RT>(cb: (prisma: PrismaInTx) => Promise<RT>) => {
      return _prisma.$transaction(async (prisma) => {
        _prismaInTx = prisma;
        try {
          return await cb(prisma);
        } finally {
          _prismaInTx = null;
        }
      })
    },
  }
}
