import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import { Markdown } from "../base/markdown";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

export const QuestionPreviewCard: FC<{
  id: string;
  preview: string;
  numberOfVariants?: number;
  link: LinkProps;
}> = ({ id, preview, numberOfVariants, link }) => (
  <Link
    {...link}
    className={cn(
      "grid gap-x-4 gap-y-1 rounded-lg border border-rule bg-paper",
      "p-3 text-ink no-underline sm:grid-cols-[9rem_1fr]",
      "hover:border-accent",
    )}
  >
    <div className="flex flex-col gap-1 self-start">
      <span className="font-mono text-xs font-semibold text-accent">{id}</span>
      {numberOfVariants !== undefined && (
        <span className="text-xs text-muted">
          {numberOfVariants} {numberOfVariants === 1 ? "variant" : "variants"}
        </span>
      )}
    </div>
    <Markdown className="text-[13px]">{preview}</Markdown>
  </Link>
);
