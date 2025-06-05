import { PrismaClient } from "@/generated/prisma";
import { seedTaxonomy } from "./taxonomy.seed";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");
    await seedTaxonomy(prisma)
}

main().catch(e => {
    throw e
}).finally(async () => {
    await prisma.$disconnect();
})