import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { cn } from "../../utils/cn";
import { Highlight } from "../base/highlight";
import { Markdown } from "../base/markdown";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

const ANSWER_CENSOR = cn(
  "text-transparent line-through decoration-rule decoration-[0.8em]",
  "select-none **:bg-transparent! **:text-transparent!",
);

const TableSkeleton: FC = () => (
  <div
    role="status"
    aria-label="Loading Questions"
    className="flex flex-col gap-2 p-3"
  >
    {Array.from({ length: 8 }, (_, position) => (
      <div key={position} className="h-12 animate-pulse rounded bg-rule/60" />
    ))}
  </div>
);

export const QuestionsTable: FC<{
  items: {
    id: string;
    question: string;
    answer: string;
    numberOfVariants: number;
    link?: LinkProps;
  }[];
  highlight?: string | string[];
  filterItems?: string[];
  loading?: boolean;
  showAnswers?: boolean;
  onSelect?: (id: string) => void;
}> = ({
  items,
  highlight,
  filterItems,
  loading = false,
  showAnswers = false,
  onSelect,
}) => {
  const filteredItems = useMemo(() => {
    if (!filterItems) return items;
    const allowedIds = new Set(filterItems);
    return items.filter((item) => allowedIds.has(item.id));
  }, [items, filterItems]);

  return (
    <div
      className={cn(
        "h-full min-h-0 overflow-y-auto rounded-lg border border-rule",
        "bg-paper",
      )}
    >
      <table className="w-full border-collapse text-left text-sm max-md:block">
        <thead className="sticky top-0 z-10 hidden bg-paper text-xs text-muted md:table-header-group">
          <tr>
            <th className="border-b border-rule px-3 py-2 font-semibold">ID</th>
            <th className="border-b border-rule px-3 py-2 font-semibold">
              Question
            </th>
            <th className="border-b border-rule px-3 py-2 text-right font-semibold">
              Variants
            </th>
          </tr>
        </thead>
        {!loading && (
          <tbody className="max-md:block">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                tabIndex={onSelect ? 0 : undefined}
                onClick={() => onSelect?.(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSelect?.(item.id);
                }}
                className={cn(
                  "align-top hover:bg-accent/5",
                  "max-md:block max-md:border-b max-md:border-rule",
                  "max-md:last:border-b-0",
                  onSelect && "cursor-pointer",
                  "focus-visible:bg-accent/5 focus-visible:outline-none",
                )}
              >
                <td
                  className={cn(
                    "px-2 pt-2 font-mono text-xs md:border-b md:border-rule",
                    "md:px-3 md:py-2 max-md:flex max-md:items-baseline max-md:gap-2",
                    "font-semibold whitespace-nowrap text-accent",
                  )}
                >
                  {item.link ? (
                    <Link {...item.link} className="hover:underline">
                      <Highlight highlight={highlight}>{item.id}</Highlight>
                    </Link>
                  ) : (
                    <Highlight highlight={highlight}>{item.id}</Highlight>
                  )}
                  <span className="font-sans font-normal text-muted tabular-nums md:hidden">
                    ({item.numberOfVariants}{" "}
                    {item.numberOfVariants === 1 ? "variant" : "variants"})
                  </span>
                </td>
                <td className="px-2 py-2 max-md:block md:border-b md:border-rule md:px-3">
                  <Markdown highlight={highlight}>{item.question}</Markdown>
                  <div
                    className={cn(
                      "mt-1.5 flex items-baseline gap-1.5 text-[13px] text-accent",
                    )}
                  >
                    <span aria-hidden className="shrink-0">
                      ✅
                    </span>
                    <div
                      inert={!showAnswers}
                      className={cn("min-w-0", !showAnswers && ANSWER_CENSOR)}
                    >
                      <Markdown highlight={highlight}>{item.answer}</Markdown>
                    </div>
                  </div>
                </td>
                <td
                  className={cn(
                    "hidden border-b border-rule px-3 py-2 text-right text-xs",
                    "md:table-cell",
                    "text-muted tabular-nums",
                  )}
                >
                  {item.numberOfVariants}
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {loading && <TableSkeleton />}
      {!loading && filteredItems.length === 0 && (
        <p className="m-0 p-6 text-center text-sm text-muted">
          No questions found
        </p>
      )}
    </div>
  );
};
