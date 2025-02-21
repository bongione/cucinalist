import { PrismaClient } from "../src/__generated__/prismaClient";
const prisma = new PrismaClient();

async function main() {
  await prisma.context.upsert({
    where: { id: "root" },
    update: {},
    create: {
      id: "root",
    },
  });
  await prisma.context.upsert({
    where: { id: "public" },
    update: {},
    create: {
      id: "root",
      parentContextId: "root",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
