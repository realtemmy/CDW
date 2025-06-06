import { AwaitedPageProps, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";

const getInventory = async (searchParams: AwaitedPageProps["searchParams"]) => {
  return [];
};

const InventoryPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const classifieds = await getInventory(searchParams);
  const count = await prisma.classified.count();
//   console.log("Count: ", count);
  return <h1>Hello!!!</h1>;
};

export default InventoryPage;
