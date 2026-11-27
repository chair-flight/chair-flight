import { cn } from "../../utils/cn";
import { ArrowDownIcon } from "../icons/arrow-down-icon";
import type { FC } from "react";

const ExploreContent: FC<{
  text: string;
  onClick: () => void;
}> = ({ text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "mx-auto mb-6 flex flex-col items-center gap-1 text-sm",
      "lg:motion-safe:animate-nudge",
      "cursor-pointer border-0 bg-transparent font-semibold text-muted",
      "hover:text-accent",
    )}
  >
    {text}
    <ArrowDownIcon size={18} />
  </button>
);

export const LandingPage = {
  ExploreContent,
};
