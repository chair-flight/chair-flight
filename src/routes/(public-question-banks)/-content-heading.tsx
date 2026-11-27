import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

export const ContentHeading: FC<{
  title: string;
  contentId: string;
  subtitle?: string;
}> = ({ title, contentId, subtitle }) => (
  <hgroup className="flex min-w-0 flex-none items-baseline gap-3">
    <h1
      title={title}
      className={cn(
        "m-0 min-w-0 truncate text-lg font-bold sm:text-2xl",
        title === contentId && "font-mono",
      )}
    >
      {title}
    </h1>
    {subtitle && (
      <p
        title={subtitle}
        className="m-0 max-w-3/5 shrink-0 truncate text-sm text-muted sm:text-base"
      >
        {subtitle}
      </p>
    )}
  </hgroup>
);
