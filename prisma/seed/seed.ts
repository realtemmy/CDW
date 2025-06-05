// import { PrismaClient } from "@/generated/prisma"
import { PrismaClient } from "../../src/generated/prisma";
import { seedTaxonomy } from "./taxonomy.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  console.log(Object.keys(prisma)); // should include: make, model, modelVariant
  await seedTaxonomy(prisma);
}

main().catch(e => {
    throw e
}).finally(async () => {
    await prisma.$disconnect();
})