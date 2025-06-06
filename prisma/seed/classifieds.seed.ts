import {
  BodyType,
  ClassifiedStatus,
  Colour,
  CurrencyCode,
  FuelType,
  OdoUnit,
  Transmission,
  ULEZCompliance,
} from "@/generated/prisma";
import { faker, Faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "../../src/generated/prisma";
import slugify from "slugify";

export async function seedClassifieds(prisma: PrismaClient) {
  const makes = await prisma.make.findMany({
    include: {
      models: {
        include: {
          modelVariants: true,
        },
      },
    },
  });

 const classifledData: Prisma.ClassifiedCreateManyInput[] = [];



  for (let i = 0; i < 25; i++) {
    const make = faker.helpers.arrayElement(makes);

    if (!make.models.length) continue;

    const model = faker.helpers.arrayElement(make.models);

    const variant = model.modelVariants.length
      ? faker.helpers.arrayElement(model.modelVariants)
      : null;

    const year = faker.date
      .between({
        from: new Date(1925, 0, 1),
        to: new Date(),
      })
      .getFullYear();

    const title = [year, make.name, model.name, variant?.name]
      .filter(Boolean)
      .join(" ");

    const vrm = faker.vehicle.vrm();
    const baseSlug = slugify(`${title}-${vrm}`);

    classifledData.push({
      year,
      vrm,
      slug: baseSlug,
      makeId: make.id,
      modelId: model.id,
      ...(variant?.id && { modelVariantId: variant.id }),
      title,
      price: faker.number.int({ min: 400000, max: 10000000 }),
      odoReading: faker.number.int({ min: 0, max: 200000 }),
      doors: faker.number.int({ min: 2, max: 6 }),
      seats: faker.number.int({ min: 2, max: 6 }),
      views: faker.number.int({ min: 100, max: 10000 }),
      description: faker.commerce.productDescription(),
      currency: faker.helpers.arrayElement(Object.values(CurrencyCode)),
      odoUnit: faker.helpers.arrayElement(Object.values(OdoUnit)),
      bodyType: faker.helpers.arrayElement(Object.values(BodyType)),
      transmission: faker.helpers.arrayElement(Object.values(Transmission)),
      fuelType: faker.helpers.arrayElement(Object.values(FuelType)),
      colour: faker.helpers.arrayElement(Object.values(Colour)),
      ulezCompliance: faker.helpers.arrayElement(Object.values(ULEZCompliance)),
      status: faker.helpers.arrayElement(Object.values(ClassifiedStatus)),
    });
  }

  const result = await prisma.classified.createMany({
    data: classifledData,
    skipDuplicates: true, // Skip duplicates to avoid errors
  });

  console.log(`Total classifieds created: ${result.count}`);
}
