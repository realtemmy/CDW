import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeartIcon } from "lucide-react";
import React from "react";

type FavoriteButtonProps = {};

export const FavoriteButton = ({ props: FavoriteButtonProps }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute left-3.5 top-2.5 rounded-full z-10 group !h-6 !w-6 lg:!w-8 lg:!h-8 xl:!h-10 xl:!w-10"
      )}
    >
      <HeartIcon
        className={cn(
          "duration-200 transition-colors ease-in-out w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-6 xl:h-6 text-white"
        )}
      />
    </Button>
  );
};
