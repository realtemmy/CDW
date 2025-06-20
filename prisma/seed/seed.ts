// import { PrismaClient } from "@/generated/prisma"
import { PrismaClient } from "../../src/generated/prisma";
import { seedClassifieds } from "./classifieds.seed";
import { seedImages } from "./images.seed";
import { seedTaxonomy } from "./taxonomy.seed";

const prisma = new PrismaClient();

async function main() {
  // await prisma.$executeRaw`TRUNCATE TABLE "makes", "models" RESTART IDENTITY CASCADE`;
  // await seedTaxonomy(prisma);
  // await seedClassifieds(prisma);
  await seedImages(prisma);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
