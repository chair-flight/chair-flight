import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import type { LinkProps } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";

export const TitlePage: FC<{
  size: "large" | "medium";
  parent?: {
    label: string;
    link: LinkProps;
    back?: boolean;
  };
  caption?: string;
  title?: string;
  items?: string[];
  action?: ReactNode;
}> = ({ size, parent, caption, title, items, action }) => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {parent && (
            <Link
              {...parent.link}
              onClick={(event) => {
                if (!parent.back || !canGoBack) return;
                event.preventDefault();
                router.history.back();
              }}
              className="text-accent no-underline hover:underline"
            >
              {parent.label}
            </Link>
          )}
          {parent && caption && <span className="text-muted">·</span>}
          {caption && <span className="text-muted">{caption}</span>}
        </span>
        <h1
          className={cn(
            "m-0 wrap-break-word whitespace-normal",
            size === "large" && "text-xl font-bold",
            size === "medium" && "text-base leading-snug font-semibold",
          )}
        >
          {title}
        </h1>
        {items && items.length > 0 && (
          <ul className="m-0 mt-1 flex list-disc flex-col gap-0.5 pl-5 text-sm">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      {action}
    </div>
  );
};
