import { PrismaClient } from "./__generated__/prismaClient/client.js";

const _prisma = new PrismaClient()

export function prisma() {
  return _prisma;
}
