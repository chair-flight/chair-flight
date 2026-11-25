import { cn } from "../../utils/cn";
import type { FC } from "react";

export const Logo: FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn("inline-block size-6 flex-none bg-brand", className)}
    style={{
      maskImage: "url(/logo.svg)",
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
    }}
  />
);
