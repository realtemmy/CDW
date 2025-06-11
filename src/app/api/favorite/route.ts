import { Favorites } from "@/config/types";
import { redis } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

const validateIdSchema = z.object({ id: z.number().int() });

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { data, error } = validateIdSchema.safeParse(body);

  if (!data) {
    return NextResponse.json({ error: error?.message }, { status: 400 });
  }

  if (!data.id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  //   Get source id from cookies
  const sourceId = await setSourceId();

  //   retrieve the existing favorites from the redis session
  const storedFavorites = await redis.get<Favorites>(sourceId);
  const favorites: Favorites = storedFavorites || { ids: [] };

  if (favorites.ids.includes(data.id)) {
    // add or remove the id based on its presense in the favorites
    // Remove the id if it already exists
    favorites.ids = favorites.ids.filter((id) => id !== data.id);
  } else {
    // Add the id if it does not exist
    favorites.ids.push(data.id);
  }
};
