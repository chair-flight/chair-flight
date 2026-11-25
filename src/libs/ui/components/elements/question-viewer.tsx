import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "../../icons/chevron-left-icon";
import { ChevronRightIcon } from "../../icons/chevron-right-icon";
import { InfoModeIcon } from "../../icons/info-mode-icon";
import { NavModeIcon } from "../../icons/nav-mode-icon";
import { RefreshIcon } from "../../icons/refresh-icon";
import { cn } from "../../utils/cn";
import { ButtonIcon } from "../base/button-icon";
import { Markdown } from "../base/markdown";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, FC, ReactNode } from "react";

export const QuestionViewer: FC<{
  tab: "question" | "explanation" | "variants";
  onTabChange: (tab: "question" | "explanation" | "variants") => void;
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
  onAnnexClick?: (href: string) => void;
  children: ReactNode;
}> = ({
  tab,
  onTabChange,
  shuffle,
  navigation,
  information,
  onAnnexClick,
  children,
}) => {
  const [gridOpen, setGridOpen] = useState(false);
  const shakes = shuffle?.count ?? 0;

  useEffect(() => {
    if (tab !== "question") setGridOpen(false);
  }, [tab]);

  const informationOpen =
    Boolean(information) && tab !== "question" && !gridOpen;
  const open = informationOpen || gridOpen;
  const currentQuestionIndex = navigation?.currentQuestionIndex ?? 0;
  const totalQuestions = navigation?.totalQuestions ?? 0;
  const counter = `${currentQuestionIndex + 1}/${totalQuestions}`;
  const variants = information?.variants;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "relative z-10 flex h-10 w-full flex-none items-center gap-1",
          "border-0 border-b border-solid border-rule bg-paper",
          "lg:hidden",
        )}
      >
        {navigation && (
          <ButtonIcon
            label="Previous question"
            disabled={currentQuestionIndex <= 0}
            onClick={() => navigation.onNavigation("previous")}
            icon={ChevronLeftIcon}
            className={cn(
              "size-7.5 h-auto! w-10! self-stretch rounded-none!",
              "border-0! border-r! border-solid border-rule",
            )}
          />
        )}
        {navigation && (
          <span
            className="ml-2 text-center font-mono text-sm font-semibold text-ink"
            style={{ width: `${counter.length + 1}ch` }}
          >
            {counter}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {shuffle && (
            <ButtonIcon
              label="Shuffle"
              style={{ "--turn": `${shakes * 180}deg` } as CSSProperties}
              className={cn(
                "[&_svg]:rotate-(--turn)",
                "[&_svg]:transition-transform [&_svg]:duration-500",
              )}
              onClick={() => shuffle.onShuffle()}
              icon={RefreshIcon}
            />
          )}
          {information && (
            <ButtonIcon
              label="Information"
              aria-pressed={informationOpen}
              icon={InfoModeIcon}
              className={cn("size-7.5", informationOpen && "text-accent!")}
              onClick={() => {
                setGridOpen(false);
                onTabChange(informationOpen ? "question" : "explanation");
              }}
            />
          )}
          {navigation && (
            <ButtonIcon
              label="Question list"
              aria-pressed={gridOpen}
              onClick={() => {
                onTabChange("question");
                setGridOpen(!gridOpen);
              }}
              icon={NavModeIcon}
              className={cn("size-7.5", gridOpen && "text-accent!")}
            />
          )}
        </div>
        {navigation && (
          <ButtonIcon
            label="Next question"
            disabled={currentQuestionIndex >= totalQuestions - 1}
            onClick={() => navigation.onNavigation("next")}
            icon={ChevronRightIcon}
            className={cn(
              "size-7.5 h-auto! w-10! self-stretch rounded-none!",
              "border-0! border-l! border-solid border-rule",
            )}
          />
        )}
      </div>
      <div className="@container min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-1 gap-8 p-4",
            "max-lg:min-h-[calc(100%+1px)] max-lg:content-start",
            "lg:h-full lg:grid-rows-[minmax(0,1fr)]",
            "lg:transition-[grid-template-columns,max-width,column-gap]",
            "lg:duration-250 lg:ease-out motion-reduce:transition-none",
            gridOpen
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
              {navigation && (
                <>
                  <ButtonIcon
                    label="Previous question"
                    disabled={currentQuestionIndex <= 0}
                    onClick={() => navigation.onNavigation("previous")}
                    icon={ChevronLeftIcon}
                    className="size-7.5"
                  />
                  <span
                    className="text-center font-mono text-sm font-semibold text-ink"
                    style={{ width: `${counter.length + 1}ch` }}
                  >
                    {counter}
                  </span>
                  <ButtonIcon
                    label="Next question"
                    disabled={currentQuestionIndex >= totalQuestions - 1}
                    onClick={() => navigation.onNavigation("next")}
                    icon={ChevronRightIcon}
                    className="size-7.5"
                  />
                </>
              )}
              <div className="ml-auto flex items-center gap-1">
                {shuffle && (
                  <ButtonIcon
                    label="Shuffle"
                    style={{ "--turn": `${shakes * 180}deg` } as CSSProperties}
                    className={cn(
                      "[&_svg]:rotate-(--turn)",
                      "[&_svg]:transition-transform [&_svg]:duration-500",
                    )}
                    onClick={() => shuffle.onShuffle()}
                    icon={RefreshIcon}
                  />
                )}
                {information && (
                  <ButtonIcon
                    label="Information"
                    aria-pressed={informationOpen}
                    icon={InfoModeIcon}
                    className={cn(
                      "size-7.5",
                      informationOpen && "text-accent!",
                    )}
                    onClick={() => {
                      setGridOpen(false);
                      onTabChange(informationOpen ? "question" : "explanation");
                    }}
                  />
                )}
                {navigation && (
                  <ButtonIcon
                    label="Question list"
                    aria-pressed={gridOpen}
                    onClick={() => {
                      onTabChange("question");
                      setGridOpen(!gridOpen);
                    }}
                    icon={NavModeIcon}
                    className={cn("size-7.5", gridOpen && "text-accent!")}
                  />
                )}
              </div>
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
                {children}
              </div>
            </div>
          </div>
          {(information || navigation) && (
            <div
              inert={!open}
              className={cn(
                "min-w-0 overflow-hidden lg:relative lg:-my-4 lg:min-h-0",
                "lg:before:absolute lg:before:inset-y-4 lg:before:left-0",
                "lg:before:w-px lg:before:bg-rule",
                "lg:transition-opacity lg:duration-250 lg:ease-out",
                "motion-reduce:transition-none",
                open ? "lg:opacity-100" : "max-lg:hidden lg:opacity-0",
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 flex-col gap-4",
                  "lg:h-full lg:flex-none lg:overflow-y-auto",
                  "lg:overscroll-contain lg:py-4",
                  gridOpen
                    ? "lg:w-[21rem] lg:pl-3"
                    : "lg:w-[calc((min(100cqw,96rem)-4rem)/2)] lg:pl-8",
                )}
              >
                {navigation && gridOpen && (
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
                {information && !gridOpen && (
                  <div className="flex flex-col divide-y divide-rule px-1">
                    <section className="py-6 first:pt-0 last:pb-0">
                      <h2
                        className={cn(
                          "m-0 mb-3 text-xs font-semibold uppercase",
                          "tracking-wider text-muted",
                        )}
                      >
                        Explanation
                      </h2>
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
                        <h2
                          className={cn(
                            "m-0 mb-3 text-xs font-semibold uppercase",
                            "tracking-wider text-muted",
                          )}
                        >
                          Variants
                        </h2>
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
                        <h2
                          className={cn(
                            "m-0 mb-3 text-xs font-semibold uppercase",
                            "tracking-wider text-muted",
                          )}
                        >
                          Links
                        </h2>
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
                    {information.relatedQuestions &&
                      information.relatedQuestions.length > 0 && (
                        <section className="py-6 first:pt-0 last:pb-0">
                          <h2
                            className={cn(
                              "m-0 mb-3 text-xs font-semibold uppercase",
                              "tracking-wider text-muted",
                            )}
                          >
                            Related questions
                          </h2>
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
                        <h2
                          className={cn(
                            "m-0 mb-3 text-xs font-semibold uppercase",
                            "tracking-wider text-muted",
                          )}
                        >
                          {note.title}
                        </h2>
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
    </div>
  );
};
