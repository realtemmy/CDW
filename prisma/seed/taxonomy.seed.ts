import type { PrismaClient } from "@prisma/client";
import { parse } from "csv";
import fs from "node:fs";
import path from "node:path";

type Row = {
  make: string;
  model: string;
  variant: string | undefined;
  yearStart: number;
  yearEnd: number;
};

const BATCH_SIZE = 100;

export async function seedTaxonomy(prisma: PrismaClient) {
  try {
    // Validate Prisma client
    if (!prisma || !prisma.make) {
      throw new Error("Prisma client is not properly initialized");
    }

    // 1. Read and parse CSV file
    const csvPath = path.join(__dirname, "taxonomy.csv");
    const rows = await new Promise<Row[]>((resolve, reject) => {
      const eachRow: Row[] = [];

      fs.createReadStream(csvPath)
        .pipe(parse({ columns: true }))
        .on("data", (row: Record<string, string>) => {
          eachRow.push({
            make: row.Make,
            model: row.Model,
            variant: row.Model_Variant || undefined,
            yearStart: parseInt(row.Year_Start, 10),
            yearEnd: row.Year_End
              ? parseInt(row.Year_End, 10)
              : new Date().getFullYear(),
          });
        })
        .on("error", reject)
        .on("end", () => resolve(eachRow));
    });

    // 2. Transform data structure
    type MakeModelMap = Record<
      string,
      {
        [model: string]: {
          variants: Record<
            string,
            {
              yearStart: number;
              yearEnd: number;
            }
          >;
        };
      }
    >;

    const result: MakeModelMap = {};

    for (const row of rows) {
      if (!result[row.make]) {
        result[row.make] = {};
      }
      if (!result[row.make][row.model]) {
        result[row.make][row.model] = { variants: {} };
      }

      if (row.variant) {
        result[row.make][row.model].variants[row.variant] = {
          yearStart: row.yearStart,
          yearEnd: row.yearEnd,
        };
      }
    }

    // 3. Seed Makes
    console.log("Seeding makes...");
    const makePromises = Object.keys(result).map((name) =>
      prisma.make.upsert({
        where: { name },
        update: {
          name,
          image: generateMakeImageUrl(name),
        },
        create: {
          name,
          image: generateMakeImageUrl(name),
        },
      })
    );

    const makes = await Promise.all(makePromises);
    console.log(`Seeded ${makes.length} makes`);

    // 4. Seed Models
    console.log("Seeding models...");
    const modelPromises: Promise<any>[] = [];

    for (const make of makes) {
      const models = Object.keys(result[make.name]);
      for (const modelName of models) {
        modelPromises.push(
          prisma.model.upsert({
            where: { makeId_name: { makeId: make.id, name: modelName } },
            update: { name: modelName },
            create: {
              name: modelName,
              make: { connect: { id: make.id } },
            },
          })
        );
      }
    }

    await processInBatches(modelPromises, BATCH_SIZE, "models");

    // 5. Seed Variants
    console.log("Seeding variants...");
    const variantPromises: Promise<any>[] = [];

    for (const make of makes) {
      const models = await prisma.model.findMany({
        where: { makeId: make.id },
      });

      for (const model of models) {
        const variants = result[make.name][model.name]?.variants || {};

        for (const [variantName, years] of Object.entries(variants)) {
          variantPromises.push(
            prisma.modelVariant.upsert({
              where: {
                modelId_name: {
                  modelId: model.id,
                  name: variantName,
                },
              },
              update: {
                name: variantName,
                yearStart: years.yearStart,
                yearEnd: years.yearEnd,
              },
              create: {
                name: variantName,
                yearStart: years.yearStart,
                yearEnd: years.yearEnd,
                model: { connect: { id: model.id } },
              },
            })
          );
        }
      }
    }

    await processInBatches(variantPromises, BATCH_SIZE, "variants");

    console.log("Taxonomy seeding completed successfully");
  } catch (error) {
    console.error("Error in seedTaxonomy:", error);
    throw error;
  }
}

// Helper functions
function generateMakeImageUrl(makeName: string): string {
  return `https://vl.imgix.net/img/${makeName
    .replace(/\s+/g, "-")
    .toLowerCase()}-logo.png?auto=format,compress`;
}

async function processInBatches(
  promises: Promise<any>[],
  batchSize: number,
  entityName: string
) {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const results = await Promise.all(batch);
    console.log(`Seeded batch of ${results.length} ${entityName}`);
  }
}
