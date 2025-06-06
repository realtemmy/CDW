-- DropForeignKey
ALTER TABLE "classifieds" DROP CONSTRAINT "classifieds_model_variant_id_fkey";

-- AlterTable
ALTER TABLE "classifieds" ALTER COLUMN "model_variant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "classifieds" ADD CONSTRAINT "classifieds_model_variant_id_fkey" FOREIGN KEY ("model_variant_id") REFERENCES "model_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
