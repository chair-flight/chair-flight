import { CheckIcon } from "../../icons/check-icon";
import { CloseIcon } from "../../icons/close-icon";
import { cn } from "../../utils/cn";
import { Markdown } from "../base/markdown";
import { MarkdownImage } from "../base/markdown-image";
import type { FC } from "react";

const OptionMarker: FC<{
  state: "idle" | "selected" | "correct" | "wrong";
}> = ({ state }) => {
  return (
    <span
      className={cn(
        "grid size-4 flex-none place-items-center rounded-full border-2",
        "text-white",
        state === "idle" && "border-ink/40",
        state === "selected" && "border-brand bg-brand",
        state === "correct" && "border-success bg-success",
        state === "wrong" && "border-danger bg-danger",
      )}
    >
      {state === "correct" && <CheckIcon size={10} strokeWidth={3.5} />}
      {state === "wrong" && <CloseIcon size={10} strokeWidth={3.5} />}
    </span>
  );
};

export const QuestionMultipleChoice: FC<{
  title?: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  annexes?: string[];
  selectedOptionId?: string;
  correctOptionId?: string;
  showResult?: boolean;
  disabled?: boolean;
  onOptionClick: (optionId: string) => void;
  onAnnexClick?: (href: string) => void;
}> = ({
  title,
  question,
  options,
  annexes = [],
  selectedOptionId,
  correctOptionId,
  showResult,
  disabled,
  onOptionClick,
  onAnnexClick,
}) => {
  const attachedAnnexes = annexes.filter(
    (href) => !question.includes(`(${href.split("?")[0]}`),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-rule bg-paper px-4 py-3">
        {title && (
          <div className="mb-1 font-mono text-[10px] leading-none text-ink">
            {title}
          </div>
        )}
        <Markdown
          question
          large
          renderAnnexes
          className="text-ink!"
          onAnnexClick={onAnnexClick}
        >
          {question}
        </Markdown>
        {attachedAnnexes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {attachedAnnexes.map((href) => (
              <MarkdownImage key={href} href={href} onClick={onAnnexClick} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          const correct = option.id === correctOptionId;
          const state = !showResult
            ? selected
              ? "selected"
              : "idle"
            : correct
              ? "correct"
              : selected
                ? "wrong"
                : "idle";
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              className={cn(
                "flex min-h-[78px] cursor-pointer items-center gap-2.5",
                "rounded-md border bg-paper px-3 py-2 text-left text-sm",
                "text-ink disabled:cursor-default",
                state === "idle" &&
                  !showResult &&
                  "border-ink/80 hover:border-accent",
                state === "idle" && showResult && "border-ink/20 opacity-50",
                state === "selected" && "border-brand",
                state === "correct" && "border-success",
                state === "correct" && !selected && "border-2",
                state === "wrong" && "border-danger",
              )}
              onClick={() => onOptionClick(option.id)}
            >
              <OptionMarker state={state} />
              <span className="flex-1">{option.text}</span>
              <span className="flex-none text-xs text-muted/70">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
