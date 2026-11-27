import { Children, isValidElement, useRef } from "react";
import { useDisclose } from "../../hooks/use-disclose";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { cn } from "../../utils/cn";
import { Button } from "../base/button";
import { ButtonIcon } from "../base/button-icon";
import { Dialog } from "../base/dialog";
import { Markdown } from "../base/markdown";
import { Modal } from "../base/modal";
import { ThemeToggle } from "../base/theme-toggle";
import { ChevronLeftIcon } from "../icons/chevron-left-icon";
import { ChevronRightIcon } from "../icons/chevron-right-icon";
import { InfoModeIcon } from "../icons/info-mode-icon";
import { LogOutIcon } from "../icons/log-out-icon";
import { NavModeIcon } from "../icons/nav-mode-icon";
import type { FC, ReactNode } from "react";
import type { IconProps } from "../icons/svg-icon";

type Panel = "information" | "progress";

const Question: FC<{ children: ReactNode }> = ({ children }) => children;

const Information: FC<{
  explanation?: string;
  onAnnexClick?: (href: string) => void;
}> = ({ explanation, onAnnexClick }) => (
  <section className="flex flex-col gap-3 px-1">
    <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-muted">
      Explanation
    </h2>
    {explanation ? (
      <Markdown renderAnnexes onAnnexClick={onAnnexClick}>
        {explanation}
      </Markdown>
    ) : (
      <p className="m-0 text-sm text-muted">No explanation yet.</p>
    )}
  </section>
);

const Progress: FC<{
  items: {
    id: string;
    status: "unanswered" | "answered" | "correct" | "wrong";
  }[];
  current: number;
  onSelect: (index: number) => void;
}> = ({ items, current, onSelect }) => (
  <div
    data-progress-grid
    className={cn(
      "grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))]",
      "content-start gap-2 p-1",
    )}
  >
    {items.map((item, index) => (
      <button
        key={item.id}
        type="button"
        aria-label={`Question ${index + 1}`}
        aria-current={index === current}
        className={cn(
          "flex h-11 cursor-pointer items-center justify-center",
          "rounded-md border font-mono text-sm text-ink",
          item.status === "answered" && "border-accent bg-accent-soft",
          item.status === "correct" && "border-success bg-success-soft",
          item.status === "wrong" && "border-danger bg-danger-soft",
          item.status === "unanswered" &&
            "border-rule bg-paper text-muted hover:border-accent",
          index === current && "ring-2 ring-accent",
        )}
        onClick={() => onSelect(index)}
      >
        {index + 1}
      </button>
    ))}
  </div>
);

const isSlot = (item: ReactNode, slot: FC<never>) =>
  isValidElement(item) &&
  typeof item.type === "function" &&
  item.type.name === slot.name;

const PanelButton: FC<{
  label: string;
  icon: FC<IconProps>;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <ButtonIcon
    label={label}
    icon={icon}
    aria-pressed={active}
    className={cn("size-7.5", active ? "text-accent!" : "text-ink!")}
    onClick={onClick}
  />
);

const ExitDialog: FC<{
  mode: "study" | "exam";
  unanswered: number;
  onClose: () => void;
  onFinish: () => void;
  onContinueLater?: () => void;
  onSeeReview?: () => void;
  onAbort?: () => void;
}> = ({
  mode,
  unanswered,
  onClose,
  onFinish,
  onContinueLater,
  onSeeReview,
  onAbort,
}) => (
  <Dialog
    title={mode === "study" ? "Leave study session" : "Leave exam"}
    onClose={onClose}
    footer={
      <div className="flex justify-end gap-2 p-3">
        <Button onClick={onClose}>Keep going</Button>
        {mode === "exam" ? (
          <>
            {onAbort && (
              <Button variant="danger" onClick={onAbort}>
                Abort
              </Button>
            )}
            <Button variant="primary" onClick={onFinish}>
              Finish
            </Button>
          </>
        ) : (
          <>
            {onContinueLater && (
              <Button onClick={onContinueLater}>Continue later</Button>
            )}
            {onSeeReview && (
              <Button variant="primary" onClick={onSeeReview}>
                See review
              </Button>
            )}
          </>
        )}
      </div>
    }
  >
    <p className="m-0 p-4 text-sm">
      {mode === "study"
        ? "Continue later keeps your answers so you can resume from the question bank. See review ends the session."
        : `Finish ends the exam${unanswered > 0 ? `, and ${unanswered} unanswered questions will be marked wrong` : ""}. Abort erases this exam and its answers.`}
    </p>
  </Dialog>
);

const ExpiredDialog: FC<{ onFinish: () => void }> = ({ onFinish }) => (
  <Dialog
    title="Time is up"
    onClose={onFinish}
    footer={
      <div className="flex justify-end p-3">
        <Button variant="primary" onClick={onFinish}>
          See results
        </Button>
      </div>
    }
  >
    <p className="m-0 p-4 text-sm">The time for this exam has run out.</p>
  </Dialog>
);

const Root: FC<{
  mode: "study" | "exam";
  title: string;
  index: number;
  total: number;
  panel?: Panel;
  shakes?: number;
  remaining?: string;
  warning?: boolean;
  expired?: boolean;
  unanswered?: number;
  canFinish?: boolean;
  fullPage?: boolean;
  blocked?: boolean;
  onOptionKey: (optionIndex: number) => void;
  onPanelChange: (panel?: Panel) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onContinueLater?: () => void;
  onSeeReview?: () => void;
  onAbort?: () => void;
  children: ReactNode;
}> = ({
  mode,
  title,
  index,
  total,
  panel,
  shakes = 0,
  remaining,
  warning = false,
  expired = false,
  unanswered = 0,
  canFinish = false,
  fullPage = false,
  blocked = false,
  onOptionKey,
  onPanelChange,
  onNavigate,
  onFinish,
  onContinueLater,
  onSeeReview,
  onAbort,
  children,
}) => {
  const exitModal = useDisclose();
  const asideRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const question = items.find((item) => isSlot(item, Question));
  const information = items.find((item) => isSlot(item, Information));
  const progress = items.find((item) => isSlot(item, Progress));
  const others = items.filter(
    (item) => item !== question && item !== information && item !== progress,
  );
  const exam = mode === "exam";
  const shownPanel = exam && panel === "information" ? undefined : panel;
  const open = shownPanel !== undefined;
  const toggle = (next: Panel) =>
    onPanelChange(shownPanel === next ? undefined : next);

  const moveInMatrix = (direction: 1 | -1) => {
    const grid = asideRef.current?.querySelector("[data-progress-grid]");
    if (!grid) return;
    const columns =
      getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    onNavigate(Math.min(Math.max(index + direction * columns, 0), total - 1));
  };

  const shortcutsEnabled = !blocked && !exitModal.isOpen && !expired;

  useKeyboardShortcuts(
    shortcutsEnabled
      ? {
          ...Object.fromEntries(
            ["a", "b", "c", "d", "e", "f"].map((key, optionIndex) => [
              key,
              () => onOptionKey(optionIndex),
            ]),
          ),
          ...Object.fromEntries(
            ["1", "2", "3", "4", "5", "6"].map((key, optionIndex) => [
              key,
              () => onOptionKey(optionIndex),
            ]),
          ),
          i: exam ? undefined : () => toggle("information"),
          n: () => toggle("progress"),
          arrowleft: () => onNavigate(index - 1),
          arrowright: () => onNavigate(index + 1),
          arrowup:
            shownPanel === "progress" ? () => moveInMatrix(-1) : undefined,
          arrowdown:
            shownPanel === "progress" ? () => moveInMatrix(1) : undefined,
        }
      : {},
  );

  return (
    <div
      className={cn(
        "flex flex-col bg-canvas text-ink",
        fullPage ? "fixed inset-0" : "h-full",
      )}
    >
      <header
        className={cn(
          "z-30 flex h-10 w-full flex-none items-center border-b",
          "border-rule bg-paper max-lg:justify-between",
          "lg:justify-center lg:gap-3 lg:px-3",
        )}
      >
        <ButtonIcon
          label="Previous question"
          icon={ChevronLeftIcon}
          className="size-10 max-lg:rounded-none lg:size-7.5"
          disabled={index === 0}
          onClick={() => onNavigate(index - 1)}
        />
        <div className="h-5 w-px flex-none bg-rule-strong max-lg:h-full" />
        <div
          className={cn(
            "flex min-w-0 items-center gap-3 max-lg:flex-1",
            "max-lg:gap-2 max-lg:pr-2",
          )}
        >
          <span
            className={cn(
              "max-w-48 truncate font-mono text-sm font-semibold",
              "max-md:hidden",
            )}
          >
            {title}
          </span>
          <div className="h-5 w-px flex-none bg-rule-strong max-md:hidden" />
          <div
            className={cn(
              "flex items-center gap-3 max-lg:flex-1",
              "max-lg:justify-around",
            )}
          >
            <span
              className={cn(
                "w-[7ch] flex-none text-center font-mono text-sm",
                "font-semibold tabular-nums",
              )}
            >
              {index + 1}/{total}
            </span>
            {exam && remaining && (
              <span
                role="timer"
                className={cn(
                  "flex-none font-mono text-sm font-semibold tabular-nums",
                  warning ? "text-danger" : "text-ink",
                )}
              >
                {remaining}
              </span>
            )}
          </div>
          <div className="h-5 w-px flex-none bg-rule-strong" />
          <div className="flex flex-none items-center gap-1">
            {!exam && (
              <PanelButton
                label="Information"
                icon={InfoModeIcon}
                active={shownPanel === "information"}
                onClick={() => toggle("information")}
              />
            )}
            <PanelButton
              label="Progress"
              icon={NavModeIcon}
              active={shownPanel === "progress"}
              onClick={() => toggle("progress")}
            />
            <ThemeToggle className="size-7.5" />
            {!exam && canFinish && (
              <Button variant="primary" onClick={onFinish}>
                Finish
              </Button>
            )}
            <ButtonIcon
              label="Exit"
              icon={LogOutIcon}
              className="size-7.5"
              onClick={exitModal.open}
            />
          </div>
        </div>
        <div className="h-5 w-px flex-none bg-rule-strong max-lg:h-full" />
        <ButtonIcon
          label="Next question"
          icon={ChevronRightIcon}
          className="size-10 max-lg:rounded-none lg:size-7.5"
          disabled={index >= total - 1}
          onClick={() => onNavigate(index + 1)}
        />
      </header>
      <div className="@container min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-1 gap-8 p-2 sm:p-4",
            "lg:h-full lg:grid-rows-[minmax(0,1fr)]",
            "lg:transition-[grid-template-columns,max-width,column-gap]",
            "lg:duration-250 lg:ease-out motion-reduce:transition-none",
            open
              ? cn(
                  "max-w-screen-2xl lg:gap-x-8",
                  "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
                )
              : cn(
                  "max-w-4xl lg:gap-x-0",
                  "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)]",
                ),
          )}
        >
          <div
            className={cn(
              "min-w-0 lg:-mx-3 lg:min-h-0 lg:px-3",
              "lg:overflow-y-auto lg:overscroll-contain",
              open && "max-lg:hidden",
            )}
          >
            <div
              key={shakes}
              className={cn(
                "min-w-0",
                shakes > 0 && "motion-safe:animate-shake",
              )}
            >
              {question}
            </div>
          </div>
          <div
            ref={asideRef}
            inert={!open}
            className={cn(
              "min-w-0 overflow-hidden lg:min-h-0",
              "lg:transition-opacity lg:duration-250 lg:ease-out",
              "motion-reduce:transition-none",
              open ? "lg:opacity-100" : "max-lg:hidden lg:opacity-0",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 flex-col lg:h-full lg:flex-none",
                "lg:overflow-y-auto lg:overscroll-contain",
                "lg:border-l lg:border-rule lg:pl-8",
                "lg:w-[calc((min(100cqw,96rem)-4rem)/2)]",
              )}
            >
              {shownPanel === "information" && !exam && information}
              {shownPanel === "progress" && progress}
            </div>
          </div>
          {others}
        </div>
      </div>
      <Modal open={exitModal.isOpen} onClose={exitModal.close}>
        <ExitDialog
          mode={mode}
          unanswered={unanswered}
          onFinish={onFinish}
          onClose={exitModal.close}
          onContinueLater={onContinueLater}
          onSeeReview={onSeeReview}
          onAbort={onAbort}
        />
      </Modal>
      <Modal open={Boolean(expired)} onClose={onFinish}>
        <ExpiredDialog onFinish={onFinish} />
      </Modal>
    </div>
  );
};

export const Test = Object.assign(Root, {
  Question,
  Information,
  Progress,
});
