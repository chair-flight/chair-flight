import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

const OUTLINE_POSITIONS = {
  "bottom-right":
    "bottom-8 md:bottom-12 right-4 w-[67%] md:w-[84%] aspect-1020/410",
  bottom: "bottom-4 left-[4%] w-[92%] aspect-326/118",
};

export const QuestionBankPreviewCard: FC<{
  kind: string;
  title: string;
  numberOfQuestions: number;
  Outline: FC<{ className?: string }>;
  outlinePosition: keyof typeof OUTLINE_POSITIONS;
  link: LinkProps;
}> = ({ kind, title, numberOfQuestions, Outline, outlinePosition, link }) => {
  return (
    <Link
      {...link}
      className={cn(
        "group relative isolate flex h-40 flex-col overflow-hidden md:h-64",
        "rounded-xl border border-rule bg-paper/80 p-5 text-ink md:p-6",
        "no-underline backdrop-blur transition-colors",
        "hover:border-brand",
      )}
    >
      <span className="text-xs font-medium tracking-widest text-muted">
        {kind.toUpperCase()}
      </span>
      <span className="mt-1 text-2xl font-semibold tracking-tight">
        {title}
      </span>
      <Outline
        className={cn(
          "pointer-events-none absolute -z-1 text-brand opacity-50",
          "transition-opacity group-hover:opacity-80",
          OUTLINE_POSITIONS[outlinePosition],
        )}
      />
      <span className="mt-auto flex items-center justify-between">
        <span className="text-sm text-muted">
          {numberOfQuestions} questions
        </span>
        <span className="text-sm font-medium text-brand">Open →</span>
      </span>
    </Link>
  );
};
