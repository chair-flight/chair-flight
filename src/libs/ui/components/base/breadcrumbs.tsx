import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronRightIcon } from "../../icons/chevron-right-icon";
import { cn } from "../../utils/cn";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

export type Breadcrumb = {
  label: string;
  mono?: boolean;
  link?: LinkProps;
};

const Ellipsis: FC<{ items: Breadcrumb[] }> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative flex flex-none sm:hidden">
      <button
        type="button"
        aria-label="Show hidden breadcrumbs"
        aria-expanded={open}
        className={cn(
          "cursor-pointer border-0 bg-transparent px-1 text-sm text-ink",
          "hover:text-accent",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        …
      </button>
      {open && (
        <ul
          className={cn(
            "absolute left-0 top-full z-20 m-0 mt-2 flex min-w-40 list-none",
            "flex-col rounded-lg border border-rule bg-paper p-1 shadow-lg",
          )}
        >
          {items.map((item) => (
            <li key={item.label}>
              {item.link ? (
                <Link
                  {...item.link}
                  className={cn(
                    "block rounded px-3 py-2 text-sm text-ink no-underline",
                    "hover:text-accent",
                    item.mono && "font-mono",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "block px-3 py-2 text-sm text-muted",
                    item.mono && "font-mono",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
};

export const Breadcrumbs: FC<{ items: Breadcrumb[] }> = ({ items }) => {
  const collapsedItems = items.slice(1, -2);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-1 items-center gap-1 text-sm"
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1 && !isFirst;
        const isCollapsible = index > 0 && index < items.length - 2;
        const className = cn(
          isFirst && "flex-none font-semibold text-ink",
          !isFirst && !isLast && "min-w-0 truncate text-ink",
          isLast && "min-w-0 truncate text-muted",
          isCollapsible && "max-sm:hidden",
          item.mono && "font-mono",
        );
        return (
          <Fragment key={item.label}>
            {!isFirst && (
              <ChevronRightIcon
                size={14}
                className={cn(
                  "flex-none text-muted",
                  isCollapsible && index !== 1 && "max-sm:hidden",
                )}
              />
            )}
            {index === 1 && collapsedItems.length > 0 && (
              <Ellipsis items={collapsedItems} />
            )}
            {item.link ? (
              <Link
                {...item.link}
                className={cn(
                  className,
                  "no-underline",
                  !isFirst && "hover:text-accent",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={className}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};
