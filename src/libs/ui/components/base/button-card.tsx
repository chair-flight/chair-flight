import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

export const ButtonCard: FC<{
  label?: string;
  title: string;
  subtitle: string;
  link?: LinkProps;
  onSelect?: () => void;
}> = ({ label, title, subtitle, link, onSelect }) => (
  <li
    className={cn(
      "relative flex items-center gap-4 rounded-xl border border-rule",
      "bg-paper/80 p-4 backdrop-blur-sm outline-1 -outline-offset-1",
      "outline-transparent hover:outline-accent",
      "max-md:rounded-none max-md:border-t-0 max-md:first:rounded-t-xl",
      "max-md:first:border-t max-md:last:rounded-b-xl",
    )}
  >
    {label && (
      <span className="font-mono text-xs text-accent tabular-nums">
        {label}
      </span>
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      {link ? (
        <Link
          {...link}
          className={cn(
            "truncate text-sm font-semibold text-ink no-underline",
            "after:absolute after:inset-0 after:content-['']",
          )}
        >
          {title}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "w-full cursor-pointer truncate text-left text-sm font-semibold",
            "text-ink after:absolute after:inset-0 after:content-['']",
          )}
        >
          {title}
        </button>
      )}
      <span className="text-xs text-muted">{subtitle}</span>
    </div>
  </li>
);
