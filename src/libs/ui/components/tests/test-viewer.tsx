import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useDisclose } from "../../hooks/use-disclose";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { cn } from "../../utils/cn";
import { Button } from "../base/button";
import { ButtonIcon } from "../base/button-icon";
import { Dialog } from "../base/dialog";
import { Markdown } from "../base/markdown";
import { Modal } from "../base/modal";
import { ThemeToggle } from "../base/theme-toggle";
import { QuestionAnnexViewer } from "../elements/question-annex-viewer";
import { QuestionMultipleChoice } from "../elements/question-multiple-choice";
import { ChevronLeftIcon } from "../icons/chevron-left-icon";
import { ChevronRightIcon } from "../icons/chevron-right-icon";
import { FlagIcon } from "../icons/flag-icon";
import { InfoModeIcon } from "../icons/info-mode-icon";
import { LogOutIcon } from "../icons/log-out-icon";
import { NavModeIcon } from "../icons/nav-mode-icon";
import type { ComponentProps, FC } from "react";

type Panel = "information" | "navigation";

type Navigation = {
  currentQuestionIndex: number;
  items: {
    id: string;
    status: "unanswered" | "answered" | "correct" | "wrong";
    flagged?: boolean;
  }[];
  onNavigation: (target: "previous" | "next" | number) => void;
};

const OPTION_KEYS = ["a", "b", "c", "d", "e", "f"];

const QuestionGrid: FC<Navigation> = ({
  currentQuestionIndex,
  items,
  onNavigation,
}) => (
  <div
    data-question-grid
    className={cn(
      "grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))]",
      "content-start gap-2 p-1",
    )}
  >
    {items.map(({ id, status, flagged }, index) => (
      <button
        key={id}
        type="button"
        aria-label={`Question ${index + 1}, ${status}${flagged ? ", flagged" : ""}`}
        aria-current={index === currentQuestionIndex}
        className={cn(
          "relative flex h-9 cursor-pointer items-center justify-center",
          "rounded-md border font-mono text-xs tabular-nums",
          status === "unanswered" && "border-rule bg-paper text-muted",
          status === "answered" && "border-accent bg-accent-soft",
          status === "correct" && "border-success bg-success-soft",
          status === "wrong" && "border-danger bg-danger-soft",
          "hover:border-accent",
          index === currentQuestionIndex && "ring-2 ring-accent",
        )}
        onClick={() => onNavigation(index)}
      >
        {flagged && (
          <span
            aria-hidden="true"
            className="absolute top-1 left-1 size-1.5 rounded-full bg-accent"
          />
        )}
        {index + 1}
      </button>
    ))}
  </div>
);

export const TestViewer: FC<{
  mode: "study" | "exam";
  title: string;
  question: ComponentProps<typeof QuestionMultipleChoice>;
  navigation: Navigation;
  information?: { explanation?: string };
  annexModal: Pick<ComponentProps<typeof Modal>, "open" | "onClose">;
  annexViewer: ComponentProps<typeof QuestionAnnexViewer>;
  timer?: {
    remaining: string;
    warning: boolean;
    expired: boolean;
  };
  onToggleFlag: () => void;
  onFinish: () => void;
}> = ({
  mode,
  title,
  question,
  navigation,
  information,
  annexModal,
  annexViewer,
  timer,
  onToggleFlag,
  onFinish,
}) => {
  const [sidebar, setSidebar] = useState<{ panel: Panel; open: boolean }>({
    panel: "navigation",
    open: false,
  });
  const [optionFocus, setOptionFocus] = useState<number>();
  const exitModal = useDisclose();
  const sidebarRef = useRef<HTMLElement>(null);
  const { currentQuestionIndex, items, onNavigation } = navigation;
  const total = items.length;
  const unanswered = items.filter(
    ({ status }) => status === "unanswered",
  ).length;
  const answered = total - unanswered;
  const complete = total > 0 && answered === total;
  const flagged = items[currentQuestionIndex]?.flagged ?? false;
  const exam = mode === "exam";
  const expired = exam && Boolean(timer?.expired);
  const revealAnswer = !exam && Boolean(question.selectedOptionId);
  const optionsLocked = question.disabled || revealAnswer || expired;
  const showInformation = !exam && Boolean(information);
  const panel =
    sidebar.panel === "information" && !showInformation
      ? "navigation"
      : sidebar.panel;
  const openPanel = sidebar.open ? panel : undefined;
  const lastOption = question.options.length - 1;
  const canFocusOptions =
    exam && !optionsLocked && lastOption >= 0 && !openPanel;
  const focusedOption =
    canFocusOptions && optionFocus !== undefined
      ? Math.min(optionFocus, lastOption)
      : undefined;

  const togglePanel = useCallback((next: Panel) => {
    setSidebar((previous) => ({
      panel: next,
      open: !previous.open || previous.panel !== next,
    }));
  }, []);

  const selectFromSidebar = useCallback<Navigation["onNavigation"]>(
    (target) => {
      onNavigation(target);
      if (!window.matchMedia("(min-width: 1024px)").matches)
        setSidebar((previous) => ({ ...previous, open: false }));
    },
    [onNavigation],
  );

  const selectFromDialog = useCallback<Navigation["onNavigation"]>(
    (target) => {
      onNavigation(target);
      setSidebar((previous) => ({ ...previous, open: false }));
      exitModal.close();
    },
    [exitModal.close, onNavigation],
  );

  const moveInGrid = useCallback(
    (direction: number) => {
      const grid = sidebarRef.current?.querySelector("[data-question-grid]");
      if (!grid) return;
      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const target = currentQuestionIndex + direction * columns;
      onNavigation(Math.min(Math.max(target, 0), total - 1));
    },
    [currentQuestionIndex, onNavigation, total],
  );

  const moveOptionFocus = useCallback(
    (direction: number) => {
      setOptionFocus((previous) => {
        if (previous === undefined) return 0;
        return Math.max(0, Math.min(lastOption, previous + direction));
      });
    },
    [lastOption],
  );

  const selectFocusedOption = useCallback(() => {
    if (focusedOption === undefined) return;
    const option = question.options[focusedOption];
    if (option) question.onOptionClick(option.id);
  }, [focusedOption, question]);

  useLayoutEffect(() => {
    setOptionFocus((previous) => (previous === undefined ? undefined : 0));
  }, [currentQuestionIndex]);

  useKeyboardShortcuts(
    annexModal.open || exitModal.isOpen || expired
      ? {}
      : {
          ...Object.fromEntries(
            OPTION_KEYS.flatMap((key, index) => {
              const option = question.options[index];
              if (!option || optionsLocked) return [];
              const select = () => question.onOptionClick(option.id);
              return [
                [key, select],
                [String(index + 1), select],
              ];
            }),
          ),
          i: showInformation ? () => togglePanel("information") : undefined,
          n: () => togglePanel("navigation"),
          arrowleft: () => onNavigation("previous"),
          arrowright: () => onNavigation("next"),
          arrowup: canFocusOptions
            ? () => moveOptionFocus(-1)
            : openPanel === "navigation"
              ? () => moveInGrid(-1)
              : undefined,
          arrowdown: canFocusOptions
            ? () => moveOptionFocus(1)
            : openPanel === "navigation"
              ? () => moveInGrid(1)
              : undefined,
          enter: focusedOption === undefined ? undefined : selectFocusedOption,
        },
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-10 w-full flex-none bg-paper">
        <div className="border-b border-rule">
          <div
            className={cn(
              "mx-auto flex min-h-10 w-full max-w-7xl items-center pl-1",
              "min-[480px]:px-2 lg:px-4",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="hidden truncate text-sm font-semibold min-[480px]:block">
                {title}
              </span>
              {exam && timer && (
                <span
                  className={cn(
                    "flex-none font-mono text-[11px] font-semibold tabular-nums",
                    "sm:text-xs",
                    timer.warning && "text-danger",
                  )}
                  role="timer"
                  aria-label="Time remaining"
                >
                  {timer.remaining}
                </span>
              )}
            </div>
            <div className="flex flex-none items-center">
              {showInformation && (
                <ButtonIcon
                  icon={InfoModeIcon}
                  label="Info Panel"
                  aria-pressed={openPanel === "information"}
                  className="aria-pressed:text-accent max-[359px]:size-7"
                  onClick={() => togglePanel("information")}
                />
              )}
              <ButtonIcon
                icon={FlagIcon}
                label="Flag question"
                aria-pressed={flagged}
                className="aria-pressed:text-accent max-[359px]:size-7"
                onClick={onToggleFlag}
              />
              <ThemeToggle className="max-[359px]:size-7" />
              <ButtonIcon
                icon={NavModeIcon}
                label="Question navigation"
                aria-pressed={openPanel === "navigation"}
                className="aria-pressed:text-accent max-[359px]:size-7"
                onClick={() => togglePanel("navigation")}
              />
            </div>
            <div className="flex flex-none items-center border-x border-rule">
              <ButtonIcon
                icon={ChevronLeftIcon}
                label="Previous question"
                className="size-10 rounded-none"
                disabled={currentQuestionIndex <= 0}
                onClick={() => onNavigation("previous")}
              />
              <span className="font-mono text-[11px] font-semibold tabular-nums sm:text-xs">
                {currentQuestionIndex + 1}/{total}
              </span>
              <ButtonIcon
                icon={ChevronRightIcon}
                label="Next question"
                className="size-10 rounded-none"
                disabled={currentQuestionIndex >= total - 1}
                onClick={() => onNavigation("next")}
              />
            </div>
            <ButtonIcon
              icon={LogOutIcon}
              label="Exit"
              className={cn(
                "size-10 rounded-none",
                complete &&
                  "text-success! motion-safe:[&_svg]:animate-test-exit-pulse",
              )}
              onClick={exitModal.open}
            />
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Questions answered"
          aria-valuenow={answered}
          aria-valuemax={total || 1}
          aria-valuetext={`${answered} of ${total} answered`}
          className="h-1 overflow-hidden bg-accent-soft"
        >
          <div
            className={cn(
              "h-full transition-[width] duration-300 motion-reduce:transition-none",
              complete
                ? "bg-success motion-safe:animate-test-complete"
                : "bg-accent",
            )}
            style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
          />
        </div>
      </header>
      <main className="@container min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-1 gap-2 p-2 lg:h-full lg:p-4",
            "lg:grid-rows-[minmax(0,1fr)]",
            "lg:transition-[grid-template-columns,max-width,column-gap]",
            "lg:duration-250 lg:ease-out motion-reduce:transition-none",
            openPanel ? "lg:max-w-7xl" : "lg:max-w-4xl",
            openPanel === "navigation" &&
              "lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-x-8",
            openPanel === "information" &&
              cn(
                "lg:gap-x-8",
                "lg:grid-cols-[minmax(0,1fr)_calc((min(100cqw,80rem)-4rem)/2)]",
              ),
            !openPanel && "lg:grid-cols-[minmax(0,1fr)_0rem] lg:gap-x-0",
          )}
        >
          <div
            className={cn(
              "min-w-0 lg:-mx-3 lg:overflow-y-auto lg:overscroll-contain lg:px-3",
              openPanel && "max-lg:hidden",
            )}
          >
            <QuestionMultipleChoice
              {...question}
              focusedOptionIndex={
                exam ? focusedOption : question.focusedOptionIndex
              }
              showResult={revealAnswer}
              disabled={optionsLocked}
            />
          </div>
          <aside
            ref={sidebarRef}
            inert={!openPanel}
            aria-label={panel === "navigation" ? "Questions" : "Explanation"}
            className={cn(
              "min-w-0 overflow-hidden lg:min-h-0 lg:transition-opacity",
              "lg:duration-250 lg:ease-out motion-reduce:transition-none",
              openPanel ? "lg:opacity-100" : "max-lg:hidden lg:opacity-0",
            )}
          >
            <div
              className={cn(
                "lg:h-full lg:overflow-y-auto lg:overscroll-contain",
                "lg:border-l lg:border-rule lg:pl-6",
                panel === "navigation"
                  ? "lg:w-84"
                  : "lg:w-[calc((min(100cqw,80rem)-4rem)/2)]",
              )}
            >
              {panel === "navigation" ? (
                <QuestionGrid
                  {...navigation}
                  onNavigation={selectFromSidebar}
                />
              ) : (
                <>
                  <h2 className="mt-0 text-xs font-semibold uppercase text-muted">
                    Explanation
                  </h2>
                  {revealAnswer && information?.explanation ? (
                    <Markdown
                      renderAnnexes
                      onAnnexClick={question.onAnnexClick}
                    >
                      {information.explanation}
                    </Markdown>
                  ) : (
                    <p className="m-0 text-sm text-muted">
                      {revealAnswer
                        ? "No explanation available."
                        : "Answer the question to see the explanation."}
                    </p>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Modal {...annexModal} open={annexModal.open && !expired}>
        <QuestionAnnexViewer {...annexViewer} />
      </Modal>
      <Modal open={exitModal.isOpen && !expired} onClose={exitModal.close}>
        <Dialog
          title={exam ? "Leave exam" : "Leave study session"}
          size={total > 36 ? "lg" : "md"}
          onClose={exitModal.close}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="medium"
                variant={complete ? "default" : "primary"}
                onClick={exitModal.close}
              >
                Keep going
              </Button>
              <Button
                size="medium"
                variant={complete ? "success" : "danger"}
                onClick={onFinish}
              >
                Finish test
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 p-2 text-sm sm:p-4">
            <p className="m-0">
              {complete
                ? "You have answered all questions."
                : `Finishing this ${exam ? "exam" : "test"} early will mark ${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"} as wrong.`}
            </p>
            <QuestionGrid {...navigation} onNavigation={selectFromDialog} />
            <p className="m-0">Are you sure you want to finish?</p>
          </div>
        </Dialog>
      </Modal>
      <Modal open={expired} onClose={onFinish}>
        <Dialog
          title="Time is up"
          onClose={onFinish}
          footer={
            <div className="flex justify-end">
              <Button size="medium" variant="primary" onClick={onFinish}>
                See results
              </Button>
            </div>
          }
        >
          <p className="m-0 p-2 text-sm sm:p-4">
            The time for this exam has run out.
          </p>
        </Dialog>
      </Modal>
    </div>
  );
};
