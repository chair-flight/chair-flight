import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { cn } from "../../utils/cn";
import { ButtonIcon } from "../base/button-icon";
import { Markdown } from "../base/markdown";
import { Modal } from "../base/modal";
import { Toaster } from "../base/toaster";
import { Tooltip } from "../base/tooltip";
import { ChevronLeftIcon } from "../icons/chevron-left-icon";
import { ChevronRightIcon } from "../icons/chevron-right-icon";
import { ExternalLinkIcon } from "../icons/external-link-icon";
import { InfoModeIcon } from "../icons/info-mode-icon";
import { LinkIcon } from "../icons/link-icon";
import { LogOutIcon } from "../icons/log-out-icon";
import { NavModeIcon } from "../icons/nav-mode-icon";
import { RefreshIcon } from "../icons/refresh-icon";
import { QuestionAnnexViewer } from "./question-annex-viewer";
import { QuestionMultipleChoice } from "./question-multiple-choice";
import type { LinkProps } from "@tanstack/react-router";
import type { ComponentProps, CSSProperties, FC } from "react";

type PanelView = "info" | "grid";
type PanelStage =
  | "settled"
  | "mounting"
  | "closing"
  | "fadingOut"
  | "swapping"
  | "fadingIn";

const PANEL_MS = 250;
const SWITCH_FADE_MS = PANEL_MS / 2;
const COUNTER_CLASS = cn(
  "w-(--question-counter-width) flex-none text-right font-mono text-xs",
  "font-semibold",
  "whitespace-nowrap text-ink lg:text-sm",
);

const QuestionLinkActions: FC<{ link: LinkProps }> = ({ link }) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const copyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}${router.buildLocation(link).href}`)
      .then(() => {
        setCopied(true);
        Toaster.toast("Link copied");
        window.setTimeout(() => setCopied(false), 600);
      })
      .catch(() => Toaster.error("Could not copy link"));
  };

  return (
    <>
      <Link
        {...link}
        target="_blank"
        rel="noreferrer"
        aria-label="Open in new tab"
        title="Open in new tab"
        className={cn(
          "flex size-8 items-center justify-center rounded-md text-ink",
          "hover:text-accent lg:size-7.5",
        )}
      >
        <ExternalLinkIcon size={16} className="shrink-0" />
      </Link>
      <ButtonIcon
        icon={LinkIcon}
        label="Copy link"
        onClick={copyLink}
        className={cn(
          "lg:size-7.5",
          "[&_svg]:transition-transform [&_svg]:duration-300",
          copied && "text-accent [&_svg]:scale-125",
        )}
      />
    </>
  );
};

const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <h2
    className={cn(
      "m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-muted",
    )}
  >
    {children}
  </h2>
);

export const QuestionViewer: FC<{
  tab: "question" | "explanation";
  onTabChange: (tab: "question" | "explanation") => void;
  question: ComponentProps<typeof QuestionMultipleChoice>;
  annexModal: { open: boolean; onClose: () => void };
  annexViewer: ComponentProps<typeof QuestionAnnexViewer>;
  onAnnexClick?: (href: string) => void;
  goBack?: { onClick: () => void };
  linkToQuestion?: LinkProps;
  shuffle?: {
    onShuffle: () => void;
    count: number;
  };
  navigation?: {
    currentQuestionIndex: number;
    totalQuestions: number;
    statuses?: ("unanswered" | "answered" | "correct" | "wrong")[];
    onNavigation: (target: "previous" | "next" | number) => void;
  };
  information?: {
    explanation?: string;
    variants?: {
      items: {
        variant: number;
        question: string;
        correctText?: string;
      }[];
      selectedVariant: number;
      onVariantChange: (variant: number) => void;
    };
    links?: {
      label: string;
      text?: string;
      link: LinkProps;
    }[];
    relatedQuestions?: {
      label: string;
      text?: string;
      link: LinkProps;
    }[];
    notes?: {
      title: string;
      content: string;
    }[];
  };
}> = ({
  tab,
  onTabChange,
  question,
  annexModal,
  annexViewer,
  onAnnexClick,
  goBack,
  linkToQuestion,
  shuffle,
  navigation,
  information,
}) => {
  const [gridOpen, setGridOpen] = useState(false);
  const shakes = shuffle?.count ?? 0;
  const currentQuestionIndex = navigation?.currentQuestionIndex ?? 0;
  const totalQuestions = navigation?.totalQuestions ?? 0;
  const counter = `${currentQuestionIndex + 1}/${totalQuestions}`;
  const counterCharacters = Math.max(2, String(totalQuestions).length) * 2 + 1;
  const variants = information?.variants;
  const hasQuestionList = Boolean(navigation) && totalQuestions > 1;
  const informationOpen =
    Boolean(information) && tab !== "question" && !gridOpen;
  const targetView: PanelView | null =
    navigation && gridOpen ? "grid" : informationOpen ? "info" : null;
  const [content, setContent] = useState<PanelView | null>(null);
  const [layout, setLayout] = useState<PanelView | null>(null);
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<PanelStage>("settled");
  const targetRef = useRef(targetView);
  const open = layout !== null;
  const switching =
    stage === "fadingOut" || stage === "swapping" || stage === "fadingIn";

  const toggleQuestionList = () => {
    onTabChange("question");
    setGridOpen(!gridOpen);
  };

  const toggleInformation = () => {
    setGridOpen(false);
    onTabChange(informationOpen ? "question" : "explanation");
  };

  const shuffleButton = shuffle && (
    <Tooltip label="Shuffle question" shortcut="r">
      <ButtonIcon
        label="Shuffle question"
        style={{ "--turn": `${shakes * 180}deg` } as CSSProperties}
        className={cn(
          "lg:size-7.5 [&_svg]:rotate-(--turn)",
          "[&_svg]:transition-transform [&_svg]:duration-500",
        )}
        onClick={() => shuffle.onShuffle()}
        icon={RefreshIcon}
      />
    </Tooltip>
  );

  const informationButton = information && (
    <Tooltip label="Info Panel" shortcut="i">
      <ButtonIcon
        label="Info Panel"
        aria-pressed={informationOpen}
        icon={InfoModeIcon}
        className="aria-pressed:text-accent lg:size-7.5"
        onClick={toggleInformation}
      />
    </Tooltip>
  );

  const questionListButton = hasQuestionList && (
    <Tooltip label="Question navigation" shortcut="n">
      <ButtonIcon
        label="Question navigation"
        aria-pressed={gridOpen}
        icon={NavModeIcon}
        className="aria-pressed:text-accent lg:size-7.5"
        onClick={toggleQuestionList}
      />
    </Tooltip>
  );

  const toolbar = (
    <>
      {(goBack || navigation) && (
        <div
          className="flex flex-none items-center lg:gap-1"
          style={
            {
              "--question-counter-width": `calc(${counterCharacters}ch + 1px)`,
            } as CSSProperties
          }
        >
          {goBack && (
            <>
              <ButtonIcon
                icon={LogOutIcon}
                label="Back to search"
                className="max-lg:w-7.75 [&_svg]:-scale-x-100"
                onClick={goBack.onClick}
              />
              <span
                aria-hidden
                className="h-4 w-px flex-none bg-rule-strong lg:mx-1"
              />
            </>
          )}
          {navigation && (
            <>
              <Tooltip label="Previous question" shortcut="←">
                <ButtonIcon
                  label="Previous question"
                  disabled={currentQuestionIndex <= 0}
                  onClick={() => navigation.onNavigation("previous")}
                  icon={ChevronLeftIcon}
                  className="lg:size-7.5"
                />
              </Tooltip>
              <span className={cn(COUNTER_CLASS, "max-[328px]:hidden")}>
                {counter}
              </span>
              <button
                type="button"
                aria-label={`Next question, ${counter}`}
                title="Next question"
                disabled={currentQuestionIndex >= totalQuestions - 1}
                className={cn(
                  COUNTER_CLASS,
                  "h-8 cursor-pointer rounded-md enabled:hover:text-accent",
                  "disabled:cursor-default min-[328px]:hidden",
                )}
                onClick={() => navigation.onNavigation("next")}
              >
                {counter}
              </button>
              <Tooltip
                label="Next question"
                shortcut="→"
                className="max-[328px]:hidden"
              >
                <ButtonIcon
                  label="Next question"
                  disabled={currentQuestionIndex >= totalQuestions - 1}
                  onClick={() => navigation.onNavigation("next")}
                  icon={ChevronRightIcon}
                  className="lg:size-7.5"
                />
              </Tooltip>
            </>
          )}
        </div>
      )}
      <div className="ml-auto flex flex-none items-center lg:gap-1">
        {linkToQuestion && <QuestionLinkActions link={linkToQuestion} />}
        {shuffleButton}
        {informationButton}
        {questionListButton}
      </div>
    </>
  );

  useEffect(() => {
    if (tab !== "question") setGridOpen(false);
  }, [tab]);

  useEffect(() => {
    targetRef.current = targetView;
  }, [targetView]);

  useEffect(() => {
    if (stage !== "settled" || targetView === content) return;
    if (targetView === null) {
      setVisible(false);
      setLayout(null);
      setStage("closing");
    } else if (content === null) {
      setContent(targetView);
      setStage("mounting");
    } else if (visible) {
      setVisible(false);
      setLayout(targetView);
      setStage("fadingOut");
    } else {
      setContent(targetView);
      setStage("swapping");
    }
  }, [stage, targetView, content, visible]);

  useEffect(() => {
    if (stage !== "mounting") return;
    let frame = 0;
    const first = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (targetRef.current === content) {
          setLayout(content);
          setVisible(true);
        }
        setStage("settled");
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(frame);
    };
  }, [stage, content]);

  useEffect(() => {
    if (stage !== "closing") return;
    const timer = window.setTimeout(() => {
      setContent(null);
      setStage("settled");
    }, PANEL_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "fadingOut") return;
    const timer = window.setTimeout(() => {
      const next = targetRef.current;
      if (next === null) {
        setLayout(null);
        setStage("closing");
        return;
      }
      setLayout(next);
      if (next === content) {
        setVisible(true);
        setStage("fadingIn");
        return;
      }
      setContent(next);
      setStage("swapping");
    }, SWITCH_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "swapping") return;
    const frame = requestAnimationFrame(() => {
      if (targetRef.current === content) {
        setVisible(true);
        setStage("fadingIn");
      } else {
        setStage("settled");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  useEffect(() => {
    if (stage !== "fadingIn") return;
    const timer = window.setTimeout(() => {
      setLayout(content);
      setStage("settled");
    }, SWITCH_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [stage, content]);

  useKeyboardShortcuts({
    n: () => {
      if (hasQuestionList) toggleQuestionList();
    },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "relative z-10 flex min-h-8 w-full flex-none flex-wrap items-center",
          "border-0 border-b border-solid border-rule bg-paper px-2",
          "lg:hidden",
        )}
      >
        {toolbar}
      </div>
      <div className="@container min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-1 gap-2 p-2 lg:gap-8 lg:p-4",
            "max-lg:min-h-[calc(100%+1px)] max-lg:content-start",
            "lg:h-full lg:grid-rows-[minmax(0,1fr)]",
            "lg:transition-[grid-template-columns,max-width,column-gap]",
            "lg:duration-250 lg:ease-out motion-reduce:transition-none",
            layout === "grid"
              ? cn("max-w-321 lg:gap-x-8", "lg:grid-cols-[minmax(0,1fr)_21rem]")
              : open
                ? cn(
                    "max-w-screen-2xl lg:gap-x-8",
                    "lg:grid-cols-[minmax(0,1fr)_calc((min(100cqw,96rem)-4rem)/2)]",
                  )
                : cn(
                    "max-w-4xl lg:gap-x-0",
                    "lg:grid-cols-[minmax(0,1fr)_0rem]",
                  ),
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col gap-4 lg:min-h-0",
              open && "max-lg:hidden",
            )}
          >
            <div
              className={cn(
                "relative flex h-10 w-full flex-none items-center gap-1",
                "rounded-lg border border-rule bg-paper px-2 max-lg:hidden",
              )}
            >
              {toolbar}
            </div>
            <div
              className={cn(
                "min-w-0 lg:min-h-0 lg:flex-1",
                "lg:-mx-3 lg:overflow-y-auto lg:overscroll-contain lg:px-3",
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
                <QuestionMultipleChoice {...question} />
              </div>
            </div>
          </div>
          {content !== null && (
            <div
              inert={!visible}
              className={cn(
                "min-w-0 overflow-hidden lg:relative lg:-my-4 lg:min-h-0",
                "lg:before:absolute lg:before:inset-y-4 lg:before:left-0",
                "lg:before:w-px lg:before:bg-rule",
                "lg:transition-opacity lg:ease-out",
                switching ? "lg:duration-125" : "lg:duration-250",
                "motion-reduce:transition-none",
                visible ? "lg:opacity-100" : "max-lg:hidden lg:opacity-0",
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 flex-col gap-4",
                  "lg:h-full lg:flex-none lg:overflow-y-auto",
                  "lg:overscroll-contain lg:py-4",
                  layout === "grid"
                    ? "lg:w-84 lg:pl-3"
                    : "lg:w-[calc((min(100cqw,96rem)-4rem)/2)] lg:pl-8",
                )}
              >
                {navigation && content === "grid" && (
                  <div
                    className={cn(
                      "grid grid-cols-[repeat(auto-fill,1.75rem)]",
                      "max-w-[calc(10*1.75rem+9*0.25rem+0.5rem)] content-start",
                      "gap-1 p-1",
                    )}
                  >
                    {Array.from({ length: totalQuestions }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Question ${index + 1}`}
                        aria-current={index === currentQuestionIndex}
                        className={cn(
                          "flex h-6 cursor-pointer items-center justify-center",
                          "rounded border p-0 font-mono text-xs tabular-nums",
                          navigation.statuses?.[index] === "correct" &&
                            "border-success bg-success-soft text-ink",
                          navigation.statuses?.[index] === "wrong" &&
                            "border-danger bg-danger-soft text-ink",
                          navigation.statuses?.[index] === "answered" &&
                            "border-accent bg-accent-soft text-ink",
                          (!navigation.statuses?.[index] ||
                            navigation.statuses[index] === "unanswered") &&
                            "border-rule bg-paper text-muted hover:border-accent",
                          index === currentQuestionIndex &&
                            "text-ink ring-1 ring-accent",
                        )}
                        onClick={() => {
                          if (
                            !window.matchMedia("(min-width: 1024px)").matches
                          ) {
                            setGridOpen(false);
                          }
                          navigation.onNavigation(index);
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
                {information && content === "info" && (
                  <div className="flex flex-col divide-y divide-rule px-1">
                    <section className="py-6 first:pt-0 last:pb-0">
                      <SectionTitle>Explanation</SectionTitle>
                      {information.explanation ? (
                        <Markdown renderAnnexes onAnnexClick={onAnnexClick}>
                          {information.explanation}
                        </Markdown>
                      ) : (
                        <p className="m-0 text-sm text-muted">
                          No explanation yet.
                        </p>
                      )}
                    </section>
                    {variants && variants.items.length > 1 && (
                      <section className="py-6 first:pt-0 last:pb-0">
                        <SectionTitle>Variants</SectionTitle>
                        <ul className="m-0 flex list-none flex-col gap-2 p-0">
                          {variants.items.map((item) => (
                            <li key={item.variant}>
                              <button
                                type="button"
                                className={cn(
                                  "flex w-full cursor-pointer gap-3 rounded-md",
                                  "border bg-paper p-3 text-left text-sm",
                                  item.variant === variants.selectedVariant
                                    ? "border-accent"
                                    : "border-rule hover:border-accent",
                                )}
                                onClick={() =>
                                  variants.onVariantChange(item.variant)
                                }
                              >
                                <span
                                  className={cn(
                                    "flex-none font-semibold",
                                    item.variant === variants.selectedVariant
                                      ? "text-accent"
                                      : "text-muted",
                                  )}
                                >
                                  v{item.variant}
                                </span>
                                <span className="flex min-w-0 flex-col gap-2">
                                  <span
                                    className={cn(
                                      "font-normal [&_*]:font-normal",
                                      item.variant === variants.selectedVariant
                                        ? "text-ink"
                                        : "text-muted",
                                    )}
                                  >
                                    <Markdown
                                      renderAnnexes
                                      onAnnexClick={onAnnexClick}
                                    >
                                      {item.question.replace(
                                        /!\[[^\]]*\]\([^)]*\)/g,
                                        "",
                                      )}
                                    </Markdown>
                                  </span>
                                  <span
                                    className={cn(
                                      "font-normal",
                                      item.variant === variants.selectedVariant
                                        ? "text-ink"
                                        : "text-muted/60",
                                    )}
                                  >
                                    {item.correctText}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {information.links && information.links.length > 0 && (
                      <section className="py-6 first:pt-0 last:pb-0">
                        <SectionTitle>Links</SectionTitle>
                        <ul
                          className={cn(
                            "m-0 grid list-none grid-cols-[auto_1fr] gap-x-4",
                            "gap-y-2 p-0 text-sm",
                          )}
                        >
                          {information.links.map((item) => (
                            <li
                              key={item.label}
                              className={cn(
                                "col-span-full grid grid-cols-subgrid",
                                "items-baseline",
                              )}
                            >
                              <Link
                                {...item.link}
                                className={cn(
                                  "col-span-full grid grid-cols-subgrid",
                                  "items-baseline text-ink no-underline",
                                  "hover:text-accent",
                                )}
                              >
                                <span className="font-mono text-xs font-semibold">
                                  {item.label}
                                </span>
                                {item.text ? (
                                  <Markdown
                                    renderAnnexes
                                    onAnnexClick={onAnnexClick}
                                  >
                                    {item.text}
                                  </Markdown>
                                ) : (
                                  <span />
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {information.relatedQuestions?.length && (
                      <section className="py-6 first:pt-0 last:pb-0">
                        <SectionTitle>Related questions</SectionTitle>
                        <ul className="m-0 flex list-none flex-col gap-2 p-0">
                          {information.relatedQuestions.map((item) => (
                            <li key={item.label}>
                              <Link
                                {...item.link}
                                className={cn(
                                  "flex w-full gap-3 rounded-md border",
                                  "border-rule bg-paper p-3 text-sm text-ink",
                                  "no-underline hover:border-accent",
                                )}
                              >
                                <span className="flex-none font-semibold text-accent">
                                  {item.label}
                                </span>
                                <span className="min-w-0">
                                  <Markdown
                                    renderAnnexes
                                    onAnnexClick={onAnnexClick}
                                  >
                                    {item.text ?? ""}
                                  </Markdown>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {information.notes?.map((note) => (
                      <section
                        key={note.title}
                        className="py-6 first:pt-0 last:pb-0"
                      >
                        <SectionTitle>{note.title}</SectionTitle>
                        <Markdown renderAnnexes onAnnexClick={onAnnexClick}>
                          {note.content}
                        </Markdown>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal {...annexModal}>
        <QuestionAnnexViewer {...annexViewer} />
      </Modal>
    </div>
  );
};
