import { cn } from "../../utils/cn";
import type { ComponentPropsWithRef, FC } from "react";

export const ButtonStat: FC<
  Omit<ComponentPropsWithRef<"a">, "children"> & {
    label: string;
    value: number;
    detail?: string;
  }
> = ({ label, value, detail, className, ...anchorProps }) => (
  <a
    {...anchorProps}
    className={cn(
      "flex h-22 w-full min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg",
      "border border-rule bg-paper px-2.5 pt-5 pb-1 sm:px-4",
      "text-left transition-colors",
      "text-ink no-underline hover:border-accent",
      className,
    )}
  >
    <span className="truncate text-xs text-muted">{label}</span>
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-mono">
      <span className="truncate text-2xl leading-none font-bold tabular-nums">
        {value}
      </span>
      {detail && (
        <span className="truncate font-sans text-xs text-muted">
          ({detail})
        </span>
      )}
    </span>
  </a>
);
