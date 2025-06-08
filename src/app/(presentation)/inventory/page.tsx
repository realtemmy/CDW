import { ClassifiedList } from "@/components/inventory/classified-list";
import { AwaitedPageProps, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";

const getInventory = async (searchParams: AwaitedPageProps["searchParams"]) => {
  return prisma.classified.findMany({
    include: {
      images: true,
    },
  });
};

const InventoryPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const classifieds = await getInventory(searchParams);
  return (
    <>
      <ClassifiedList classifieds={classifieds} />
    </>
  );
};

export default InventoryPage;
